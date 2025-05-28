import { db } from '~/lib/db';
import { eq, desc, asc, count, sql, and, gte, lte } from 'drizzle-orm';
import { clients, teams } from '~/lib/db-schema';
import {
  meetings,
  meetingChecklists,
  meetingNotes,
} from '~/features/calendar/schema';

// 현재 사용자의 기본 정보 조회
export async function getUserInfo(userId: string) {
  try {
    const profile = await db
      .select({
        id: clients.id,
        name: clients.name,
      })
      .from(clients)
      .where(eq(clients.agentId, userId))
      .limit(1);

    return {
      name: profile[0]?.name || '사용자',
    };
  } catch (error) {
    console.error('getUserInfo 오류:', error);
    return {
      name: '사용자',
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

    return {
      stages: pipelineData,
      totalValue,
      monthlyTarget: 8000, // TODO: 실제 목표 설정 시스템 연결
    };
  } catch (error) {
    console.error('getPipelineData 오류:', error);
    return {
      stages: [],
      totalValue: 0,
      monthlyTarget: 8000,
    };
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
export async function getReferralInsights(userId: string) {
  try {
    // 소개자별 통계 조회 (더미 데이터 - 실제로는 복잡한 쿼리 필요)
    const topReferrers = [
      {
        id: '1',
        name: '박지성',
        totalReferrals: 12,
        successfulConversions: 10,
        conversionRate: 83.3,
        lastReferralDate: '2024-01-15',
        rank: 1,
        recentActivity: '김민수님을 통해 새로운 리드 확보',
      },
      {
        id: '2',
        name: '김민지',
        totalReferrals: 8,
        successfulConversions: 6,
        conversionRate: 75.0,
        lastReferralDate: '2024-01-12',
        rank: 2,
        recentActivity: '이영호님 화재보험 계약 성공',
      },
      {
        id: '3',
        name: '정현우',
        totalReferrals: 6,
        successfulConversions: 4,
        conversionRate: 66.7,
        lastReferralDate: '2024-01-10',
        rank: 3,
        recentActivity: '가족 대상 보험 상품 소개 진행',
      },
    ];

    // 네트워크 통계 (더미 데이터)
    const networkStats = {
      totalConnections: 124,
      networkDepth: 4,
      activeReferrers: 23,
      monthlyGrowth: 15.6,
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

// 상위 소개자 데이터만 조회 (기존 함수 유지)
export async function getTopReferrers(userId: string) {
  const insights = await getReferralInsights(userId);
  return insights.topReferrers;
}
