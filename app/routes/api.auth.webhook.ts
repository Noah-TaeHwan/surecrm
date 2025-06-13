/**
 * 🎯 인증 웹훅 API 엔드포인트
 * Supabase 인증 이벤트 처리 및 프로필 생성
 * 🚨 보안 주의: 웹훅 서명 검증 필수
 */

import {
  createSuccessResponse,
  createErrorResponse,
  methodNotAllowed,
  badRequest,
  unauthorized,
  parseJSON,
  logAPIRequest,
  logAPIError,
} from '~/api/shared/utils';
import { ERROR_CODES, HTTP_STATUS } from '~/api/shared/types';
import { validateWebhookRequest } from '~/api/shared/auth';
import { db } from '~/lib/core/db';
import { profiles, invitations } from '~/lib/schema';
import { eq } from 'drizzle-orm';
import { createInvitationsForUser } from '~/lib/data/business/invitations';

// ===== 웹훅 페이로드 타입 정의 =====
interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  schema: string;
  old_record?: any;
}

interface UserRecord {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    company?: string;
    invitation_code?: string;
  };
}

// ===== Action (POST 요청 처리) =====
export async function action({ request }: { request: Request }) {
  logAPIRequest(request.method, request.url);

  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  // 웹훅 서명 검증
  if (!validateWebhookRequest(request)) {
    logAPIError(
      request.method,
      request.url,
      new Error('Invalid webhook signature'),
      undefined,
      {
        headers: Object.fromEntries(request.headers.entries()),
        ip: request.headers.get('x-forwarded-for'),
      }
    );
    return unauthorized('유효하지 않은 웹훅 요청입니다.');
  }

  try {
    // 페이로드 파싱
    const payload = await parseJSON<SupabaseWebhookPayload>(request);
    if (!payload) {
      return badRequest('유효한 JSON 페이로드가 필요합니다.');
    }

    const { type, table, record, old_record } = payload;

    // 지원하는 이벤트만 처리
    if (table !== 'users' || type !== 'UPDATE') {
      return createSuccessResponse(
        { processed: false },
        '처리하지 않는 이벤트 타입입니다.'
      );
    }

    const user = record as UserRecord;

    // 이메일 확인 완료 이벤트 처리
    if (user.email_confirmed_at && !old_record?.email_confirmed_at) {
      return await handleEmailConfirmation(user);
    }

    return createSuccessResponse(
      { processed: false },
      '처리할 이벤트가 없습니다.'
    );
  } catch (error) {
    logAPIError(request.method, request.url, error as Error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      '웹훅 처리 중 내부 오류가 발생했습니다.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

// ===== 이메일 확인 완료 처리 =====
async function handleEmailConfirmation(user: UserRecord) {
  try {
    console.log('이메일 인증 완료 처리 시작:', user.id);

    const userData = user.user_metadata || {};
    const invitationCode = userData.invitation_code;

    if (!invitationCode) {
      console.error('초대 코드가 없습니다:', user.id);
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        '초대 코드를 찾을 수 없습니다.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 초대장 정보 조회 및 검증
    const invitationData = await db
      .select()
      .from(invitations)
      .where(eq(invitations.code, invitationCode))
      .limit(1);

    if (invitationData.length === 0) {
      console.error('유효하지 않은 초대 코드:', invitationCode);
      return createErrorResponse(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        '유효하지 않은 초대 코드입니다.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const invitation = invitationData[0];

    // 초대장이 이미 사용되었는지 확인
    if (invitation.status === 'used') {
      console.error('이미 사용된 초대 코드:', invitationCode);
      return createErrorResponse(
        ERROR_CODES.BUSINESS_RULE_VIOLATION,
        '이미 사용된 초대 코드입니다.',
        HTTP_STATUS.CONFLICT
      );
    }

    // 초대장 만료 확인
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      console.error('만료된 초대 코드:', invitationCode);
      return createErrorResponse(
        ERROR_CODES.BUSINESS_RULE_VIOLATION,
        '만료된 초대 코드입니다.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 기존 프로필 확인
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    let profile;

    if (existingProfile.length > 0) {
      // 기존 프로필 활성화 및 업데이트
      const updatedProfile = await db
        .update(profiles)
        .set({
          isActive: true,
          fullName: userData.full_name || existingProfile[0].fullName,
          phone: userData.phone || existingProfile[0].phone,
          company: userData.company || existingProfile[0].company,
          invitedById: invitation.inviterId,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id))
        .returning();

      profile = updatedProfile[0];
      console.log('기존 프로필 업데이트 완료:', profile.id);
    } else {
      // 새 프로필 생성
      const newProfile = await db
        .insert(profiles)
        .values({
          id: user.id,
          fullName:
            userData.full_name || user.email?.split('@')[0] || 'Unknown',
          phone: userData.phone,
          company: userData.company,
          invitedById: invitation.inviterId,
          role: 'agent',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      profile = newProfile[0];
      console.log('새 프로필 생성 완료:', profile.id);
    }

    // 트랜잭션으로 초대장 사용 처리 및 새 초대장 생성
    await db.transaction(async tx => {
      // 초대장 사용 처리
      await tx
        .update(invitations)
        .set({
          status: 'used',
          usedById: user.id,
          usedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id));

      console.log('초대장 사용 처리 완료:', invitation.id);
    });

    // 새 사용자에게 초대장 2장 생성 (별도 처리)
    try {
      await createInvitationsForUser(user.id, 2);
      console.log('새 사용자 초대장 생성 완료:', user.id);
    } catch (error) {
      console.error('새 사용자 초대장 생성 실패:', error);
      // 초대장 생성 실패는 전체 프로세스를 중단하지 않음
    }

    return createSuccessResponse(
      {
        profileId: profile.id,
        invitationUsed: invitation.id,
        userActive: true,
      },
      '이메일 인증 후 프로필 생성이 완료되었습니다.'
    );
  } catch (error) {
    console.error('이메일 인증 처리 중 오류:', error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      '이메일 인증 처리 중 오류가 발생했습니다.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
