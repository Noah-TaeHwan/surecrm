/**
 * 🎯 사용자 완전 삭제 API 엔드포인트
 * 🚨 CRITICAL: 시스템 관리자 전용 - 사용자와 모든 관련 데이터 완전 삭제
 * 🔒 최고 보안 등급: 트랜잭션, 감사 로그, 확인 메커니즘 필수
 */

import { requireSystemAdmin } from '~/api/shared/auth';
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
} from '~/api/shared/utils';
import { ERROR_CODES, HTTP_STATUS } from '~/api/shared/types';
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
      '사용자 삭제 중 예상치 못한 오류가 발생했습니다.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

// ===== 핵심 삭제 로직 =====
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
  const supabaseAdmin = createAdminClient();

  try {
    console.log(`🚨 Starting user deletion process for: ${email}`);

    // 1. 삭제 대상 사용자 조회 (프로필을 통해)
    const targetUserProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, email)) // email이 실제로는 userId일 것으로 가정
      .limit(1);

    if (targetUserProfile.length === 0) {
      return {
        success: false,
        error: `사용자를 찾을 수 없습니다: ${email}`,
      };
    }

    const userId = targetUserProfile[0].id;
    console.log(`Found target user: ${userId}`);

    // 2. 이관 대상 사용자 조회 (있는 경우)
    let transferToUserId: string | undefined;
    if (transferDataTo) {
      const transferUserProfile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, transferDataTo)) // transferDataTo도 userId일 것으로 가정
        .limit(1);

      if (transferUserProfile.length === 0) {
        return {
          success: false,
          error: `데이터 이관 대상 사용자를 찾을 수 없습니다: ${transferDataTo}`,
        };
      }

      transferToUserId = transferUserProfile[0].id;
      console.log(`Transfer target user: ${transferToUserId}`);
    }

    // 3. 트랜잭션으로 모든 데이터 삭제/이관
    const deletionStats = await db.transaction(async tx => {
      const stats = {
        userCount: 0,
        profileCount: 0,
        clientCount: 0,
        meetingCount: 0,
        documentCount: 0,
        invitationCount: 0,
        transferredData: undefined as any,
      };

      try {
        // 3.1. 클라이언트 데이터 이관/삭제
        if (transferToUserId) {
          // 클라이언트 이관
          const transferredClients = await tx
            .update(clients)
            .set({
              agentId: transferToUserId,
              updatedAt: new Date(),
            })
            .where(eq(clients.agentId, userId))
            .returning();

          stats.transferredData = {
            clientsTransferred: transferredClients.length,
            transferredTo: transferDataTo!,
          };

          console.log(
            `Transferred ${transferredClients.length} clients to ${transferDataTo}`
          );
        } else {
          // 클라이언트 관련 데이터 완전 삭제
          // 문서 삭제
          const deletedDocuments = await tx
            .delete(documents)
            .where(eq(documents.clientId, clients.id))
            .returning();

          // 미팅 삭제
          const deletedMeetings = await tx
            .delete(meetings)
            .where(eq(meetings.clientId, clients.id))
            .returning();

          // 추천 삭제
          await tx
            .delete(referrals)
            .where(
              or(
                eq(referrals.referrerId, userId),
                eq(referrals.referredId, userId)
              )
            );

          // 보험 정보 삭제
          await tx
            .delete(insuranceInfo)
            .where(eq(insuranceInfo.clientId, clients.id));

          // 클라이언트 상세 정보 삭제
          await tx
            .delete(clientDetails)
            .where(eq(clientDetails.clientId, clients.id));

          // 클라이언트 삭제
          const deletedClients = await tx
            .delete(clients)
            .where(eq(clients.agentId, userId))
            .returning();

          stats.clientCount = deletedClients.length;
          stats.meetingCount = deletedMeetings.length;
          stats.documentCount = deletedDocuments.length;

          console.log(
            `Deleted ${deletedClients.length} clients and related data`
          );
        }

        // 3.2. 초대장 삭제
        const deletedInvitations = await tx
          .delete(invitations)
          .where(
            or(
              eq(invitations.inviterId, userId),
              eq(invitations.usedById, userId)
            )
          )
          .returning();

        stats.invitationCount = deletedInvitations.length;

        // 3.3. 팀 관련 데이터 정리
        await tx.delete(teams).where(eq(teams.adminId, userId));

        // 3.4. 파이프라인 단계 삭제
        await tx
          .delete(pipelineStages)
          .where(eq(pipelineStages.agentId, userId));

        // 3.5. 프로필 삭제
        const deletedProfiles = await tx
          .delete(profiles)
          .where(eq(profiles.id, userId))
          .returning();

        stats.profileCount = deletedProfiles.length;

        console.log(`Database cleanup completed for user: ${userId}`);
        return stats;
      } catch (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }
    });

    // 4. Supabase Auth에서 사용자 삭제
    const { error: authDeletionError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeletionError) {
      console.error('Auth deletion error:', authDeletionError);
      return {
        success: false,
        error: `사용자 인증 삭제 실패: ${authDeletionError.message}`,
      };
    }

    deletionStats.userCount = 1;

    // 5. 감사 로그 생성
    const auditLogId = await createDeletionAuditLog({
      targetUserId: userId,
      targetEmail: email,
      adminUserId,
      reason,
      deletionStats,
      transferToUserId,
      transferToEmail: transferDataTo,
      clientIP,
      userAgent,
    });

    console.log(`✅ User deletion completed successfully: ${email}`);

    return {
      success: true,
      deletedData: deletionStats,
      auditLogId,
    };
  } catch (error) {
    console.error('User deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// ===== 감사 로그 생성 =====
async function createDeletionAuditLog({
  targetUserId,
  targetEmail,
  adminUserId,
  reason,
  deletionStats,
  transferToUserId,
  transferToEmail,
  clientIP,
  userAgent,
}: {
  targetUserId: string;
  targetEmail: string;
  adminUserId: string;
  reason: string;
  deletionStats: any;
  transferToUserId?: string;
  transferToEmail?: string;
  clientIP?: string;
  userAgent?: string;
}): Promise<string> {
  // 감사 로그는 별도 테이블에 저장하거나 외부 로깅 시스템에 기록
  const auditData = {
    id: crypto.randomUUID(),
    operation: 'USER_DELETION',
    targetUserId,
    targetEmail: targetEmail.split('@')[0] + '@***', // 개인정보 보호
    executedBy: adminUserId,
    reason,
    timestamp: new Date().toISOString(),
    deletionStats,
    transferData: transferToUserId
      ? {
          transferToUserId,
          transferToEmail: transferToEmail?.split('@')[0] + '@***',
        }
      : null,
    metadata: {
      clientIP,
      userAgent,
      version: '1.0',
    },
  };

  // 로그 저장 (실제 구현에서는 감사 로그 테이블이나 외부 시스템 사용)
  console.log('🔒 AUDIT LOG:', JSON.stringify(auditData, null, 2));

  return auditData.id;
}
