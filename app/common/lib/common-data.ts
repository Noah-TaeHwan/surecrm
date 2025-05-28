import { db } from '~/lib/db';
import { eq, desc, count, sql, and, gte, lte } from 'drizzle-orm';
import { profiles, invitations } from '~/lib/db-schema';

/**
 * 사용자 프로필 정보 조회
 */
export async function getUserProfile(userId: string) {
  try {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return profile[0] || null;
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return null;
  }
}

/**
 * 초대장 통계 조회 (전체)
 */
export async function getGlobalInvitationStats() {
  try {
    const [totalResult, usedResult, pendingResult] = await Promise.all([
      // 총 초대장 수
      db.select({ count: count() }).from(invitations),

      // 사용된 초대장 수
      db
        .select({ count: count() })
        .from(invitations)
        .where(eq(invitations.status, 'used')),

      // 대기 중인 초대장 수
      db
        .select({ count: count() })
        .from(invitations)
        .where(eq(invitations.status, 'pending')),
    ]);

    const total = totalResult[0]?.count || 0;
    const used = usedResult[0]?.count || 0;
    const pending = pendingResult[0]?.count || 0;

    return {
      totalInvitations: total,
      usedInvitations: used,
      pendingInvitations: pending,
      conversionRate: total > 0 ? Math.round((used / total) * 100) : 0,
    };
  } catch (error) {
    console.error('전체 초대장 통계 조회 오류:', error);
    return {
      totalInvitations: 0,
      usedInvitations: 0,
      pendingInvitations: 0,
      conversionRate: 0,
    };
  }
}

/**
 * 시스템 전체 통계 조회
 */
export async function getSystemStats() {
  try {
    const [usersResult, activeUsersResult] = await Promise.all([
      // 총 사용자 수
      db.select({ count: count() }).from(profiles),

      // 활성 사용자 수 (최근 30일 내 로그인)
      db
        .select({ count: count() })
        .from(profiles)
        .where(
          and(
            eq(profiles.isActive, true),
            gte(
              profiles.lastLoginAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
          )
        ),
    ]);

    return {
      totalUsers: usersResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
    };
  } catch (error) {
    console.error('시스템 통계 조회 오류:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
    };
  }
}

/**
 * 사용자 권한 확인
 */
export async function checkUserPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return false;
    }

    // 시스템 관리자는 모든 권한
    if (profile.role === 'system_admin') {
      return true;
    }

    // 팀 관리자 권한
    if (profile.role === 'team_admin') {
      const teamPermissions = [
        'manage_team',
        'view_team_reports',
        'invite_members',
      ];
      return teamPermissions.includes(permission);
    }

    // 일반 사용자 권한
    const userPermissions = [
      'view_own_data',
      'manage_own_clients',
      'create_invitations',
    ];
    return userPermissions.includes(permission);
  } catch (error) {
    console.error('사용자 권한 확인 오류:', error);
    return false;
  }
}

/**
 * 날짜 범위 유틸리티
 */
export function getDateRange(
  period: 'today' | 'week' | 'month' | 'quarter' | 'year'
) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
      };

    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };

    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      return {
        start: new Date(now.getFullYear(), quarterStart, 1),
        end: new Date(now.getFullYear(), quarterStart + 3, 0, 23, 59, 59),
      };

    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };

    default:
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
  }
}

/**
 * 페이지네이션 유틸리티
 */
export function getPaginationParams(
  page: number = 1,
  pageSize: number = 10
): { offset: number; limit: number } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100); // 최대 100개

  return {
    offset: (validPage - 1) * validPageSize,
    limit: validPageSize,
  };
}

/**
 * 검색 쿼리 정리
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[%_]/g, '\\$&') // SQL LIKE 특수문자 이스케이프
    .substring(0, 100); // 최대 100자
}

/**
 * 성장률 계산
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * 백분율 계산
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100 * 10) / 10;
}
