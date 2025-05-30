import { db } from '~/lib/db';
import { eq, count } from 'drizzle-orm';
import { invitations } from '~/lib/db-schema';

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
