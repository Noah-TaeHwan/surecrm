/**
 * 🎯 API 인증 및 권한 검증 미들웨어
 * 모든 보호된 API 엔드포인트에서 사용할 인증 함수들
 */

import { getCurrentUser } from '~/lib/auth/core.server';
import { db } from '~/lib/core/db.server';
import { profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';
import {
  unauthorized,
  forbidden,
  internalServerError,
  logAPIError,
} from './utils';

// ===== 인증된 사용자 정보 타입 =====
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  isActive: boolean;
  teamId?: string;
  invitationsLeft?: number;
}

// ===== 권한 레벨 정의 =====
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  TEAM_ADMIN: 'team_admin',
  AGENT: 'agent',
  VIEWER: 'viewer',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ===== 권한 계층 정의 =====
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.SYSTEM_ADMIN]: 4,
  [USER_ROLES.TEAM_ADMIN]: 3,
  [USER_ROLES.AGENT]: 2,
  [USER_ROLES.VIEWER]: 1,
};

// ===== 인증 미들웨어 =====

/**
 * 기본 인증 확인 (로그인된 사용자)
 */
export async function requireAuth(
  request: Request
): Promise<AuthenticatedUser | Response> {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized('로그인이 필요합니다.');
    }

    // 사용자 프로필 정보 조회
    const profileData = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileData.length === 0) {
      return unauthorized('사용자 프로필을 찾을 수 없습니다.');
    }

    const profile = profileData[0];

    // 비활성화된 사용자 확인
    if (!profile.isActive) {
      return forbidden('비활성화된 계정입니다.');
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role,
      fullName: profile.fullName,
      isActive: profile.isActive,
      teamId: profile.teamId || undefined,
      invitationsLeft: profile.invitationsLeft || 0,
    };
  } catch (error) {
    logAPIError(request.method, request.url, error as Error);
    return internalServerError('인증 확인 중 오류가 발생했습니다.');
  }
}

/**
 * 특정 권한 레벨 이상 요구
 */
export async function requireRole(
  request: Request,
  requiredRole: UserRole
): Promise<AuthenticatedUser | Response> {
  const authResult = await requireAuth(request);

  if (authResult instanceof Response) {
    return authResult; // 인증 실패
  }

  const userRoleLevel = ROLE_HIERARCHY[authResult.role as UserRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    return forbidden(`이 작업을 수행하려면 ${requiredRole} 권한이 필요합니다.`);
  }

  return authResult;
}

/**
 * 시스템 관리자 권한 요구
 */
export async function requireSystemAdmin(
  request: Request
): Promise<AuthenticatedUser | Response> {
  return requireRole(request, USER_ROLES.SYSTEM_ADMIN);
}

/**
 * 팀 관리자 이상 권한 요구
 */
export async function requireTeamAdmin(
  request: Request
): Promise<AuthenticatedUser | Response> {
  return requireRole(request, USER_ROLES.TEAM_ADMIN);
}

/**
 * 에이전트 이상 권한 요구
 */
export async function requireAgent(
  request: Request
): Promise<AuthenticatedUser | Response> {
  return requireRole(request, USER_ROLES.AGENT);
}

/**
 * 팀 소속 확인
 */
export async function requireTeamMembership(
  request: Request,
  teamId: string
): Promise<AuthenticatedUser | Response> {
  const authResult = await requireAuth(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  // 시스템 관리자는 모든 팀에 접근 가능
  if (authResult.role === USER_ROLES.SYSTEM_ADMIN) {
    return authResult;
  }

  if (authResult.teamId !== teamId) {
    return forbidden('이 팀의 멤버가 아닙니다.');
  }

  return authResult;
}

/**
 * 리소스 소유자 확인
 */
export async function requireResourceOwner(
  request: Request,
  resourceOwnerId: string
): Promise<AuthenticatedUser | Response> {
  const authResult = await requireAuth(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  // 시스템 관리자는 모든 리소스에 접근 가능
  if (authResult.role === USER_ROLES.SYSTEM_ADMIN) {
    return authResult;
  }

  // 본인의 리소스만 접근 가능
  if (authResult.id !== resourceOwnerId) {
    return forbidden('이 리소스에 접근할 권한이 없습니다.');
  }

  return authResult;
}

// ===== 유틸리티 함수 =====

/**
 * 사용자가 특정 권한을 가지고 있는지 확인
 */
export function hasRole(user: AuthenticatedUser, role: UserRole): boolean {
  const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] || 0;
  const roleLevel = ROLE_HIERARCHY[role];
  return userRoleLevel >= roleLevel;
}

/**
 * 사용자가 관리자 권한을 가지고 있는지 확인
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return hasRole(user, USER_ROLES.TEAM_ADMIN);
}

/**
 * 사용자가 시스템 관리자인지 확인
 */
export function isSystemAdmin(user: AuthenticatedUser): boolean {
  return user.role === USER_ROLES.SYSTEM_ADMIN;
}

/**
 * 웹훅 요청 검증 (Supabase)
 */
export function validateWebhookRequest(request: Request): boolean {
  // Supabase 웹훅 시크릿 검증
  const signature = request.headers.get('authorization');

  // 환경변수 안전하게 접근
  let webhookSecret: string | undefined;
  try {
    webhookSecret =
      typeof process !== 'undefined'
        ? process.env.SUPABASE_WEBHOOK_SECRET
        : undefined;
  } catch {
    webhookSecret = undefined;
  }

  if (!webhookSecret) {
    console.warn('SUPABASE_WEBHOOK_SECRET이 설정되지 않았습니다.');
    return false;
  }

  if (!signature) {
    return false;
  }

  // Bearer 토큰 형식 확인
  const bearerToken = signature.replace('Bearer ', '');
  return bearerToken === webhookSecret;
}
