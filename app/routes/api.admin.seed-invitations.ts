/**
 * 🎯 초대장 시드 데이터 생성 API 엔드포인트
 * 🚨 개발 환경 전용: 프로덕션에서는 완전 비활성화
 * 🧪 테스트 및 개발용 초기 데이터 생성
 */

import { requireSystemAdmin } from '~/api/shared/auth';
import {
  createSuccessResponse,
  createErrorResponse,
  methodNotAllowed,
  badRequest,
  logAPIRequest,
  logAPIError,
  getClientIP,
  getUserAgent,
} from '~/api/shared/utils';
import { ERROR_CODES as EC, HTTP_STATUS as HS } from '~/api/shared/types';
import { db } from '~/lib/core/db';
import { invitations, profiles } from '~/lib/schema';

// ===== 응답 데이터 타입 =====
interface SeedInvitationsResponse {
  success: boolean;
  message: string;
  environment: string;
  seedData?: {
    createdCount: number;
    existingCount: number;
    systemProfileCreated: boolean;
    invitationCodes: string[];
  };
}

// ===== 환경 검증 =====
const isDevelopmentEnvironment = (): boolean => {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  const isDev = nodeEnv === 'development' || nodeEnv === 'dev';
  const isLocalhost =
    process.env.PUBLIC_URL?.includes('localhost') ||
    process.env.PUBLIC_URL?.includes('127.0.0.1');

  return isDev || isLocalhost || process.env.ALLOW_SEED_APIS === 'true';
};

// ===== Action (POST 요청 처리) =====
export async function action({ request }: { request: Request }) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  logAPIRequest(request.method, request.url, undefined, {
    clientIP,
    userAgent,
    operation: 'SEED_INVITATIONS_ATTEMPT',
    environment: process.env.NODE_ENV,
  });

  // 메소드 검증
  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  // 🚨 프로덕션 환경 차단
  if (!isDevelopmentEnvironment()) {
    logAPIError(
      request.method,
      request.url,
      new Error('Seed API called in production environment'),
      undefined,
      {
        clientIP,
        userAgent,
        environment: process.env.NODE_ENV,
        operation: 'PRODUCTION_SEED_BLOCKED',
      }
    );

    return createErrorResponse(
      EC.OPERATION_NOT_ALLOWED,
      '이 API는 개발 환경에서만 사용할 수 있습니다.',
      HS.FORBIDDEN
    );
  }

  // 🔒 시스템 관리자 권한 필수 (개발 환경에서도)
  const authResult = await requireSystemAdmin(request);
  if (authResult instanceof Response) {
    logAPIError(
      request.method,
      request.url,
      new Error('Unauthorized seed API attempt'),
      undefined,
      {
        clientIP,
        userAgent,
        operation: 'UNAUTHORIZED_SEED_ATTEMPT',
      }
    );
    return authResult;
  }

  try {
    console.log('[SEED] 초대장 시드 데이터 추가 시작...');

    // 기존 데이터 확인
    const existingInvitations = await db.select().from(invitations);
    console.log('[SEED] 기존 초대장 수:', existingInvitations.length);

    let systemProfileCreated = false;
    let createdCount = 0;
    let invitationCodes: string[] = [];

    if (existingInvitations.length === 0) {
      // 트랜잭션으로 안전한 데이터 생성
      const seedResult = await db.transaction(async tx => {
        // 시스템 관리자 프로필 생성/확인
        const systemProfile = await tx
          .insert(profiles)
          .values({
            id: '550e8400-e29b-41d4-a716-446655440000', // 고정 UUID
            fullName: '시스템 관리자',
            role: 'system_admin',
            invitationsLeft: 999,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing()
          .returning();

        const wasSystemProfileCreated = systemProfile.length > 0;
        console.log('[SEED] 시스템 프로필 생성/확인 완료');

        // 테스트용 초대장들 생성
        const seedInvitations = [
          {
            code: 'NYMCDZ4F',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '테스트용 초대장입니다.',
            status: 'pending' as const,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          {
            code: 'WELCOME1',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '환영합니다! SureCRM에 가입하세요.',
            status: 'pending' as const,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          {
            code: 'BETA2024',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '베타 테스터 초대장입니다.',
            status: 'pending' as const,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
          {
            code: 'DEV2024',
            inviterId: '550e8400-e29b-41d4-a716-446655440000',
            inviteeEmail: null,
            message: '개발자 전용 초대장입니다.',
            status: 'pending' as const,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        ];

        const createdInvitations = await tx
          .insert(invitations)
          .values(seedInvitations)
          .returning();

        console.log(
          '[SEED] 초대장 생성 완료:',
          createdInvitations.length,
          '개'
        );

        return {
          systemProfileCreated: wasSystemProfileCreated,
          invitations: createdInvitations,
        };
      });

      systemProfileCreated = seedResult.systemProfileCreated;
      createdCount = seedResult.invitations.length;
      invitationCodes = seedResult.invitations.map(inv => inv.code);

      // 성공 로깅
      logAPIRequest(request.method, request.url, authResult.id, {
        clientIP,
        userAgent,
        operation: 'SEED_INVITATIONS_SUCCESS',
        createdCount,
        invitationCodes,
      });

      return createSuccessResponse<SeedInvitationsResponse>({
        success: true,
        message: `시드 데이터 생성이 완료되었습니다. ${createdCount}개의 초대장이 생성되었습니다.`,
        environment: process.env.NODE_ENV || 'development',
        seedData: {
          createdCount,
          existingCount: 0,
          systemProfileCreated,
          invitationCodes,
        },
      });
    } else {
      // 이미 데이터가 있는 경우
      const codes = existingInvitations.map(inv => inv.code);

      return createSuccessResponse<SeedInvitationsResponse>({
        success: true,
        message: `이미 ${existingInvitations.length}개의 초대장이 존재합니다.`,
        environment: process.env.NODE_ENV || 'development',
        seedData: {
          createdCount: 0,
          existingCount: existingInvitations.length,
          systemProfileCreated: false,
          invitationCodes: codes,
        },
      });
    }
  } catch (error) {
    // 시스템 오류 로깅
    logAPIError(request.method, request.url, error as Error, authResult.id, {
      clientIP,
      userAgent,
      operation: 'SEED_INVITATIONS_ERROR',
    });

    console.error('[SEED] 시드 데이터 생성 실패:', error);

    return createErrorResponse(
      EC.INTERNAL_ERROR,
      '시드 데이터 생성 중 오류가 발생했습니다.',
      HS.INTERNAL_SERVER_ERROR
    );
  }
}
