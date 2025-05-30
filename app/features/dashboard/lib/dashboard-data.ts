import { db } from '~/lib/core/db';
import { eq, desc, asc, count, sql, and, gte, lte } from 'drizzle-orm';
import { clients, teams, referrals } from '~/lib/schema';
import { profiles } from '~/lib/schema';
import {
  meetings,
  meetingChecklists,
  meetingNotes,
} from '~/features/calendar/schema';
import { goals } from '~/features/dashboard/schema';

// 현재 사용자의 기본 정보 조회
export async function getUserInfo(userId: string) {
  try {
    const profile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        role: profiles.role,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return {
      name: profile[0]?.fullName || '사용자',
      role: profile[0]?.role || 'agent',
    };
  } catch (error) {
    console.error('getUserInfo 오류:', error);
    return {
      name: '사용자',
      role: 'agent',
    };
  }
}

// 오늘의 통계 조회
export async function getTodayStats(userId: string) {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // 오늘 예정된 미팅 수
    const scheduledMeetingsResult = await db
      .select({ count: count() })
      .from(meetings)
      .where(
        and(
          eq(meetings.agentId, userId),
          gte(meetings.startTime, todayStart),
          lte(meetings.startTime, todayEnd)
        )
      );

    const scheduledMeetings = scheduledMeetingsResult[0]?.count || 0;

    // 미완료 체크리스트 항목 수 (대기 중인 작업)
    const pendingTasksResult = await db
      .select({ count: count() })
      .from(meetingChecklists)
      .innerJoin(meetings, eq(meetingChecklists.meetingId, meetings.id))
      .where(
        and(
          eq(meetings.agentId, userId),
          eq(meetingChecklists.completed, false)
        )
      );

    const pendingTasks = pendingTasksResult[0]?.count || 0;

    // 이번 주 새로운 소개 건수
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          sql`${clients.referredBy} IS NOT NULL`,
          gte(clients.createdAt, weekStart)
        )
      );

    const newReferrals = newReferralsResult[0]?.count || 0;

    return {
      scheduledMeetings,
      pendingTasks,
      newReferrals,
    };
  } catch (error) {
    console.error('getTodayStats 오류:', error);
    return {
      scheduledMeetings: 0,
      pendingTasks: 0,
      newReferrals: 0,
    };
  }
}

// KPI 데이터 조회
export async function getKPIData(userId: string) {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 총 고객 수
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.agentId, userId));

    const totalClients = totalClientsResult[0]?.count || 0;

    // 이번 달 신규 고객 수
    const monthlyNewClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(eq(clients.agentId, userId), gte(clients.createdAt, thisMonth))
      );

    const monthlyNewClients = monthlyNewClientsResult[0]?.count || 0;

    // 총 소개 건수
    const totalReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(eq(clients.agentId, userId), sql`${clients.referredBy} IS NOT NULL`)
      );

    const totalReferrals = totalReferralsResult[0]?.count || 0;

    // 전환율 계산 (계약 완료 / 총 고객)
    const contractedClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(eq(clients.agentId, userId), eq(clients.stage, '계약 완료')));

    const contractedClients = contractedClientsResult[0]?.count || 0;
    const conversionRate =
      totalClients > 0 ? (contractedClients / totalClients) * 100 : 0;

    // 지난 달 데이터 (성장률 계산용)
    const lastMonthClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          gte(clients.createdAt, lastMonth),
          lte(clients.createdAt, thisMonth)
        )
      );

    const lastMonthClients = lastMonthClientsResult[0]?.count || 0;

    const lastMonthReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          sql`${clients.referredBy} IS NOT NULL`,
          gte(clients.createdAt, lastMonth),
          lte(clients.createdAt, thisMonth)
        )
      );

    const lastMonthReferrals = lastMonthReferralsResult[0]?.count || 0;

    // 성장률 계산
    const clientGrowth =
      lastMonthClients > 0
        ? ((monthlyNewClients - lastMonthClients) / lastMonthClients) * 100
        : 0;

    const referralGrowth =
      lastMonthReferrals > 0
        ? ((totalReferrals - lastMonthReferrals) / lastMonthReferrals) * 100
        : 0;

    return {
      totalClients,
      monthlyNewClients,
      totalReferrals,
      conversionRate: Math.round(conversionRate * 10) / 10,
      monthlyGrowth: {
        clients: Math.round(clientGrowth * 10) / 10,
        referrals: Math.round(referralGrowth * 10) / 10,
        revenue: 8.4, // TODO: 실제 수익 데이터 연결 시 계산
      },
    };
  } catch (error) {
    console.error('getKPIData 오류:', error);
    return {
      totalClients: 0,
      monthlyNewClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      monthlyGrowth: {
        clients: 0,
        referrals: 0,
        revenue: 0,
      },
    };
  }
}

// 오늘의 미팅 일정 조회
export async function getTodayMeetings(userId: string) {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayMeetings = await db
      .select({
        id: meetings.id,
        clientId: meetings.clientId,
        title: meetings.title,
        startTime: meetings.startTime,
        endTime: meetings.endTime,
        location: meetings.location,
        meetingType: meetings.meetingType,
        status: meetings.status,
        client: {
          name: clients.name,
        },
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          eq(meetings.agentId, userId),
          gte(meetings.startTime, todayStart),
          lte(meetings.startTime, todayEnd)
        )
      )
      .orderBy(asc(meetings.startTime));

    return todayMeetings.map((meeting) => ({
      id: meeting.id,
      clientName: meeting.client?.name || '미지정',
      time: meeting.startTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: Math.round(
        (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)
      ),
      type: meeting.meetingType || '미팅',
      location: meeting.location || '미지정',
      status: meeting.status as 'upcoming' | 'completed' | 'cancelled',
      reminderSent: true, // TODO: 실제 알림 시스템 연결 시 구현
    }));
  } catch (error) {
    console.error('getTodayMeetings 오류:', error);
    return [];
  }
}

// 파이프라인 개요 데이터 조회
export async function getPipelineData(userId: string) {
  try {
    const stages = [
      '리드 확보',
      '첫 상담',
      '니즈 분석',
      '상품 설명',
      '계약 검토',
      '계약 완료',
    ];

    const pipelineData = await Promise.all(
      stages.map(async (stage, index) => {
        const stageResult = await db
          .select({
            count: count(),
            totalValue: sql<number>`COALESCE(SUM(${clients.contractAmount}), 0)`,
          })
          .from(clients)
          .where(and(eq(clients.agentId, userId), eq(clients.stage, stage)));

        const stageData = stageResult[0];
        const clientCount = stageData?.count || 0;
        const totalValue = Number(stageData?.totalValue || 0);

        // 전환율 계산 (다음 단계로 넘어간 비율)
        let conversionRate = 0;
        if (index < stages.length - 1) {
          const nextStageResult = await db
            .select({ count: count() })
            .from(clients)
            .where(
              and(
                eq(clients.agentId, userId),
                eq(clients.stage, stages[index + 1])
              )
            );

          const nextStageCount = nextStageResult[0]?.count || 0;
          conversionRate =
            clientCount > 0 ? (nextStageCount / clientCount) * 100 : 0;
        }

        return {
          id: (index + 1).toString(),
          name: stage,
          count: clientCount,
          value: Math.round(totalValue / 10000), // 만원 단위
          conversionRate: Math.round(conversionRate),
        };
      })
    );

    const totalValue = pipelineData.reduce(
      (sum, stage) => sum + stage.value,
      0
    );

    // 월간 목표를 실제 goals 테이블에서 조회
    const monthlyTarget = await getMonthlyRevenueGoal(userId);

    return {
      stages: pipelineData,
      totalValue,
      monthlyTarget,
    };
  } catch (error) {
    console.error('getPipelineData 오류:', error);
    return {
      stages: [],
      totalValue: 0,
      monthlyTarget: 8000, // 폴백 값
    };
  }
}

// 월간 매출 목표 조회
export async function getMonthlyRevenueGoal(userId: string): Promise<number> {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const goalResult = await db
      .select({
        targetValue: goals.targetValue,
      })
      .from(goals)
      .where(
        and(
          eq(goals.agentId, userId),
          eq(goals.goalType, 'revenue'),
          eq(goals.period, 'monthly'),
          eq(goals.isActive, true),
          gte(goals.startDate, thisMonth.toISOString().split('T')[0]),
          sql`${goals.endDate} < ${nextMonth.toISOString().split('T')[0]}`
        )
      )
      .limit(1);

    if (goalResult.length > 0) {
      return Math.round(Number(goalResult[0].targetValue) / 10000); // 만원 단위
    }

    // 목표가 없으면 기본값 반환
    return 8000;
  } catch (error) {
    console.error('getMonthlyRevenueGoal 오류:', error);
    return 8000;
  }
}

// 상위 소개자 및 네트워크 통계 조회 (실제 데이터베이스 연결)
export async function getReferralInsights(userId: string) {
  try {
    // 실제 소개자별 통계 조회 - referredBy 필드를 사용
    const topReferrersData = await db
      .select({
        referrerName: clients.referredBy,
        totalReferrals: count(clients.id),
        successfulReferrals: sql<number>`
          COUNT(CASE WHEN ${clients.stage} = '계약 완료' THEN 1 END)
        `,
      })
      .from(clients)
      .where(
        and(eq(clients.agentId, userId), sql`${clients.referredBy} IS NOT NULL`)
      )
      .groupBy(clients.referredBy)
      .orderBy(desc(count(clients.id)))
      .limit(5);

    const topReferrers = topReferrersData.map((referrer, index) => {
      const totalRefs = referrer.totalReferrals || 0;
      const successfulRefs = referrer.successfulReferrals || 0;
      const conversionRate =
        totalRefs > 0 ? (successfulRefs / totalRefs) * 100 : 0;

      return {
        id: `referrer-${index + 1}`,
        name: referrer.referrerName || `소개자 ${index + 1}`,
        totalReferrals: totalRefs,
        successfulConversions: successfulRefs,
        conversionRate: Math.round(conversionRate * 10) / 10,
        lastReferralDate: '2024-01-15', // TODO: 실제 마지막 소개 날짜 조회
        rank: index + 1,
        recentActivity: `최근 ${totalRefs}건의 소개를 통해 ${successfulRefs}건 성공`,
      };
    });

    // 네트워크 통계 (실제 데이터)
    const totalConnectionsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(eq(clients.agentId, userId), sql`${clients.referredBy} IS NOT NULL`)
      );

    const totalConnections = totalConnectionsResult[0]?.count || 0;

    // 활성 소개자 수 (최근 3개월 내 소개한 사람)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const activeReferrersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${clients.referredBy})`,
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          sql`${clients.referredBy} IS NOT NULL`,
          gte(clients.createdAt, threeMonthsAgo)
        )
      );

    const activeReferrers = Number(activeReferrersResult[0]?.count || 0);

    // 최대 네트워크 깊이 계산 (더미 - 실제로는 복잡한 재귀 쿼리 필요)
    const networkDepth = Math.min(Math.floor(totalConnections / 10) + 1, 6);

    // 월간 성장률 계산
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthConnectionsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          sql`${clients.referredBy} IS NOT NULL`,
          gte(clients.createdAt, lastMonth)
        )
      );

    const lastMonthConnections = lastMonthConnectionsResult[0]?.count || 0;
    const monthlyGrowth =
      lastMonthConnections > 0
        ? Math.round(
            ((totalConnections - lastMonthConnections) / lastMonthConnections) *
              100 *
              10
          ) / 10
        : 0;

    const networkStats = {
      totalConnections,
      networkDepth,
      activeReferrers,
      monthlyGrowth,
    };

    return {
      topReferrers,
      networkStats,
    };
  } catch (error) {
    console.error('getReferralInsights 오류:', error);
    return {
      topReferrers: [],
      networkStats: {
        totalConnections: 0,
        networkDepth: 0,
        activeReferrers: 0,
        monthlyGrowth: 0,
      },
    };
  }
}

// 월간 목표 설정
export async function setMonthlyGoal(
  userId: string,
  goalType: 'revenue' | 'clients' | 'meetings' | 'referrals',
  targetValue: number,
  title?: string
) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 기존 목표가 있는지 확인
    const existingGoal = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.agentId, userId),
          eq(goals.goalType, goalType),
          eq(goals.period, 'monthly'),
          eq(goals.isActive, true),
          gte(goals.startDate, startDate.toISOString().split('T')[0])
        )
      )
      .limit(1);

    if (existingGoal.length > 0) {
      // 기존 목표 업데이트
      await db
        .update(goals)
        .set({
          targetValue: targetValue.toString(),
          title: title || `${goalType} 월간 목표`,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, existingGoal[0].id));

      return existingGoal[0].id;
    } else {
      // 새 목표 생성
      const newGoal = await db
        .insert(goals)
        .values({
          agentId: userId,
          title: title || `${goalType} 월간 목표`,
          goalType,
          targetValue: targetValue.toString(),
          period: 'monthly',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          isActive: true,
        })
        .returning();

      return newGoal[0].id;
    }
  } catch (error) {
    console.error('setMonthlyGoal 오류:', error);
    throw error;
  }
}

// 모든 활성 목표 조회
export async function getUserGoals(userId: string) {
  try {
    const userGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.agentId, userId), eq(goals.isActive, true)))
      .orderBy(desc(goals.createdAt));

    return userGoals.map((goal) => ({
      ...goal,
      targetValue: Number(goal.targetValue),
      currentValue: Number(goal.currentValue),
      progress: (Number(goal.currentValue) / Number(goal.targetValue)) * 100,
    }));
  } catch (error) {
    console.error('getUserGoals 오류:', error);
    return [];
  }
}

// 최근 고객 데이터 조회
export async function getRecentClientsData(userId: string) {
  try {
    const recentClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        stage: clients.stage,
        lastContactDate: clients.lastContactDate,
        contractAmount: clients.contractAmount,
        referredBy: clients.referredBy,
        createdAt: clients.createdAt,
        status: clients.status,
      })
      .from(clients)
      .where(eq(clients.agentId, userId))
      .orderBy(desc(clients.createdAt))
      .limit(5);

    // 총 고객 수
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.agentId, userId));

    const totalClients = totalClientsResult[0]?.count || 0;

    const formattedClients = recentClients.map((client) => {
      // 상태 매핑
      let status: 'prospect' | 'contacted' | 'proposal' | 'contracted';
      switch (client.stage) {
        case '계약 완료':
          status = 'contracted';
          break;
        case '계약 검토':
        case '상품 설명':
          status = 'proposal';
          break;
        case '니즈 분석':
        case '첫 상담':
          status = 'contacted';
          break;
        default:
          status = 'prospect';
      }

      return {
        id: client.id,
        name: client.name,
        status,
        lastContactDate:
          client.lastContactDate ||
          client.createdAt.toISOString().split('T')[0],
        potentialValue: Math.round((client.contractAmount || 0) / 10000), // 만원 단위
        referredBy: client.referredBy || undefined,
        stage: client.stage,
      };
    });

    return {
      recentClients: formattedClients,
      totalClients,
    };
  } catch (error) {
    console.error('getRecentClientsData 오류:', error);
    return {
      recentClients: [],
      totalClients: 0,
    };
  }
}

// 상위 소개자 및 네트워크 통계 조회
export async function getTopReferrers(userId: string) {
  const insights = await getReferralInsights(userId);
  return insights.topReferrers;
}
