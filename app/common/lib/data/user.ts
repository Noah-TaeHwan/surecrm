import { db } from '~/lib/core/db';
import { eq, count, and, gte } from 'drizzle-orm';
import { profiles } from '~/lib/schema';

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
