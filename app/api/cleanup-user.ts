/**
 * 🎯 사용자 완전 삭제 API 엔드포인트
 * 🚨 CRITICAL: 시스템 관리자 전용 - 사용자와 모든 관련 데이터 완전 삭제
 * 🔒 최고 보안 등급: 트랜잭션, 감사 로그, 확인 메커니즘 필수
 */

import { requireSystemAdmin } from './shared/auth';
import {
  createSuccessResponse,
  createErrorResponse,
  methodNotAllowed,
  badRequest,
  parseJSON,
  logAPIRequest,
  logAPIError,
  validateRequiredFields,
  validateEmail,
  getClientIP,
  getUserAgent,
} from './shared/utils';
import { ERROR_CODES, HTTP_STATUS } from './shared/types';
import { createAdminClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db';
import {
  profiles,
  clients,
  clientDetails,
  insuranceInfo,
  meetings,
  referrals,
  documents,
  invitations,
  teams,
  pipelineStages,
} from '~/lib/schema';
import { eq, and, or } from 'drizzle-orm';

// ===== 요청 데이터 타입 =====
interface UserCleanupRequest {
  email: string;
  confirmationCode: string; // 추가 안전장치
  reason: string; // 삭제 사유 필수
  transferDataTo?: string; // 데이터 이관 대상 (선택사항)
}

// ===== 응답 데이터 타입 =====
interface UserCleanupResponse {
  success: boolean;
  message: string;
  deletedData?: {
    userCount: number;
    profileCount: number;
    clientCount: number;
    meetingCount: number;
    documentCount: number;
    invitationCount: number;
    transferredData?: {
      clientsTransferred: number;
      transferredTo: string;
    };
  };
  auditLogId?: string;
}

// ===== 보안 상수 =====
const REQUIRED_CONFIRMATION_CODE = 'DELETE_USER_PERMANENT';
const MAX_REASON_LENGTH = 500;
const MIN_REASON_LENGTH = 10;

// ===== Action (POST 요청 처리) =====
export async function action({ request }: { request: Request }) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  logAPIRequest(request.method, request.url, undefined, {
    clientIP,
    userAgent,
    operation: 'USER_CLEANUP_ATTEMPT',
  });

  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  // 🚨 시스템 관리자 권한 필수
  const authResult = await requireSystemAdmin(request);
  if (authResult instanceof Response) {
    // 권한 없는 접근 시도 로깅
    logAPIError(
      request.method,
      request.url,
      new Error('Unauthorized user cleanup attempt'),
      undefined,
      {
        clientIP,
        userAgent,
        operation: 'UNAUTHORIZED_CLEANUP_ATTEMPT',
      }
    );
    return authResult;
  }

  try {
    // JSON 데이터 파싱
    const body = await parseJSON<UserCleanupRequest>(request);
    if (!body) {
      return badRequest('유효한 JSON 데이터가 필요합니다.');
    }

    const { email, confirmationCode, reason, transferDataTo } = body;

    // 필수 필드 검증
    const validation = validateRequiredFields(
      { email, confirmationCode, reason },
      ['email', 'confirmationCode', 'reason']
    );
    if (!validation.isValid) {
      return badRequest('필수 필드가 누락되었습니다.', {
        missingFields: validation.missingFields,
      });
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      return badRequest('올바른 이메일 형식이 아닙니다.');
    }

    // 확인 코드 검증
    if (confirmationCode !== REQUIRED_CONFIRMATION_CODE) {
      logAPIError(
        request.method,
        request.url,
        new Error('Invalid confirmation code for user cleanup'),
        authResult.id,
        {
          clientIP,
          userAgent,
          targetEmail: email.split('@')[0] + '@***',
          providedCode: confirmationCode.substring(0, 5) + '***',
        }
      );

      return badRequest('올바른 확인 코드가 아닙니다.', {
        requiredFormat: 'DELETE_USER_PERMANENT',
      });
    }

    // 삭제 사유 검증
    if (
      reason.length < MIN_REASON_LENGTH ||
      reason.length > MAX_REASON_LENGTH
    ) {
      return badRequest(
        `삭제 사유는 ${MIN_REASON_LENGTH}자 이상 ${MAX_REASON_LENGTH}자 이하여야 합니다.`
      );
    }

    // 이관 대상 검증 (있는 경우)
    if (transferDataTo && !validateEmail(transferDataTo)) {
      return badRequest('데이터 이관 대상 이메일이 올바르지 않습니다.');
    }

    // 🔒 사용자 삭제 실행 (트랜잭션)
    const deletionResult = await executeUserDeletion(
      email,
      authResult.id,
      reason,
      transferDataTo,
      clientIP,
      userAgent
    );

    if (!deletionResult.success) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        deletionResult.error || '사용자 삭제 중 오류가 발생했습니다.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // 성공 로깅
    logAPIRequest(request.method, request.url, authResult.id, {
      clientIP,
      userAgent,
      operation: 'USER_CLEANUP_SUCCESS',
      targetEmail: email.split('@')[0] + '@***',
      deletedData: deletionResult.deletedData,
      reason: reason.substring(0, 50) + '...',
    });

    return createSuccessResponse<UserCleanupResponse>({
      success: true,
      message: `사용자 ${email}과(와) 모든 관련 데이터가 안전하게 삭제되었습니다.`,
      deletedData: deletionResult.deletedData,
      auditLogId: deletionResult.auditLogId,
    });
  } catch (error) {
    // 시스템 오류 로깅
    logAPIError(request.method, request.url, error as Error, authResult.id, {
      clientIP,
      userAgent,
      operation: 'USER_CLEANUP_ERROR',
    });

    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      '사용자 삭제 중 시스템 오류가 발생했습니다.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

// ===== 핵심 삭제 로직 =====

/**
 * 사용자와 모든 관련 데이터 안전 삭제
 * 트랜잭션으로 데이터 정합성 보장
 */
async function executeUserDeletion(
  email: string,
  adminUserId: string,
  reason: string,
  transferDataTo?: string,
  clientIP?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  error?: string;
  deletedData?: any;
  auditLogId?: string;
}> {
  const auditLogId = `cleanup_${Date.now()}_${adminUserId.substring(0, 8)}`;

  try {
    // 1. 대상 사용자 조회
    const supabaseAdmin = createAdminClient();
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('사용자 목록 조회 실패:', listError);
      return { success: false, error: '사용자 조회에 실패했습니다.' };
    }

    const targetUsers = users.users.filter(user => user.email === email);

    if (targetUsers.length === 0) {
      return {
        success: true,
        deletedData: {
          userCount: 0,
          profileCount: 0,
          clientCount: 0,
          meetingCount: 0,
          documentCount: 0,
          invitationCount: 0,
        },
      };
    }

    // 2. 이관 대상 사용자 검증 (필요한 경우)
    let transferTargetUserId: string | undefined;
    if (transferDataTo) {
      const transferTargetUsers = users.users.filter(
        user => user.email === transferDataTo
      );
      if (transferTargetUsers.length === 0) {
        return {
          success: false,
          error: '데이터 이관 대상 사용자를 찾을 수 없습니다.',
        };
      }
      transferTargetUserId = transferTargetUsers[0].id;
    }

    // 3. 트랜잭션으로 모든 데이터 삭제
    const deletionCounts = await db.transaction(async tx => {
      const counts = {
        userCount: targetUsers.length,
        profileCount: 0,
        clientCount: 0,
        meetingCount: 0,
        documentCount: 0,
        invitationCount: 0,
        transferredData: transferTargetUserId
          ? {
              clientsTransferred: 0,
              transferredTo: transferDataTo!,
            }
          : undefined,
      };

      for (const user of targetUsers) {
        console.log(`[${auditLogId}] 사용자 삭제 시작:`, user.id);

        // 3-1. 클라이언트 이관 또는 삭제
        if (transferTargetUserId) {
          // 클라이언트 데이터 이관
          const transferResult = await tx
            .update(clients)
            .set({ agentId: transferTargetUserId })
            .where(eq(clients.agentId, user.id))
            .returning();

          counts.transferredData!.clientsTransferred += transferResult.length;
          console.log(
            `[${auditLogId}] 클라이언트 ${transferResult.length}개 이관 완료`
          );
        } else {
          // 관련 데이터 순차 삭제 (외래 키 제약 조건 순서 중요)

          // Documents 삭제
          const deletedDocuments = await tx
            .delete(documents)
            .where(eq(documents.agentId, user.id))
            .returning();
          counts.documentCount += deletedDocuments.length;

          // Insurance Info 삭제 (clients 삭제 전)
          const userClients = await tx
            .select({ id: clients.id })
            .from(clients)
            .where(eq(clients.agentId, user.id));

          for (const client of userClients) {
            await tx
              .delete(insuranceInfo)
              .where(eq(insuranceInfo.clientId, client.id));
            await tx
              .delete(clientDetails)
              .where(eq(clientDetails.clientId, client.id));
          }

          // Meetings 삭제
          const deletedMeetings = await tx
            .delete(meetings)
            .where(eq(meetings.agentId, user.id))
            .returning();
          counts.meetingCount += deletedMeetings.length;

          // Referrals 삭제
          await tx.delete(referrals).where(eq(referrals.agentId, user.id));

          // Clients 삭제
          const deletedClients = await tx
            .delete(clients)
            .where(eq(clients.agentId, user.id))
            .returning();
          counts.clientCount += deletedClients.length;
        }

        // 3-2. Pipeline Stages 삭제
        await tx
          .delete(pipelineStages)
          .where(eq(pipelineStages.agentId, user.id));

        // 3-3. Invitations 처리
        const deletedInvitations = await tx
          .delete(invitations)
          .where(
            or(
              eq(invitations.inviterId, user.id),
              eq(invitations.usedById, user.id)
            )
          )
          .returning();
        counts.invitationCount += deletedInvitations.length;

        // 3-4. Teams에서 admin인 경우 처리 (다른 관리자로 이관 또는 팀 비활성화)
        await tx
          .update(teams)
          .set({ isActive: false })
          .where(eq(teams.adminId, user.id));

        // 3-5. 다른 사용자의 invitedById 참조 제거
        await tx
          .update(profiles)
          .set({ invitedById: null })
          .where(eq(profiles.invitedById, user.id));

        // 3-6. Profile 삭제
        const deletedProfiles = await tx
          .delete(profiles)
          .where(eq(profiles.id, user.id))
          .returning();
        counts.profileCount += deletedProfiles.length;

        console.log(`[${auditLogId}] 프로필 삭제 완료:`, user.id);
      }

      return counts;
    });

    // 4. Supabase Auth에서 사용자 삭제
    for (const user of targetUsers) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`[${auditLogId}] Auth 사용자 삭제 완료:`, user.id);
      } catch (authError) {
        console.error(
          `[${auditLogId}] Auth 사용자 삭제 실패:`,
          user.id,
          authError
        );
        // Auth 삭제 실패는 전체 실패로 처리하지 않음 (이미 DB에서 삭제됨)
      }
    }

    // 5. 감사 로그 기록
    console.log(
      `[${auditLogId}] 삭제 완료 - 관리자: ${adminUserId}, 대상: ${email}, 사유: ${reason}`
    );

    return {
      success: true,
      deletedData: deletionCounts,
      auditLogId,
    };
  } catch (error) {
    console.error(`[${auditLogId}] 사용자 삭제 실패:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
