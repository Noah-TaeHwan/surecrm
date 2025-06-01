import { db } from '~/lib/core/db';
import {
  desc,
  asc,
  eq,
  count,
  sum,
  avg,
  and,
  gte,
  lte,
  sql,
} from 'drizzle-orm';
import { clients, teams, referrals, pipelineStages } from '~/lib/schema';
import { profiles } from '~/lib/schema';
import {
  meetings,
  appCalendarMeetingChecklists,
} from '~/features/calendar/lib/schema';
import { appDashboardGoals } from './schema';

// 새로운 타입 시스템 import
import type {
  DashboardKPIData,
  DashboardTodayStats,
  DashboardPipelineData,
  DashboardClientData,
  DashboardReferralInsights,
  DashboardMeeting,
  DashboardRecentClient,
  DashboardUserInfo,
} from '../types';

// 현재 사용자의 기본 정보 조회 (개선된 버전)
export async function getUserInfo(userId: string): Promise<DashboardUserInfo> {
  try {
    const profile = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        role: profiles.role,
        profileImageUrl: profiles.profileImageUrl,
        lastLoginAt: profiles.lastLoginAt,
        theme: profiles.theme,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const userProfile = profile[0];
    if (!userProfile) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return {
      id: userProfile.id,
      name: userProfile.fullName || '사용자',
      fullName: userProfile.fullName || '사용자',
      role: userProfile.role || 'agent',
      profileImageUrl: userProfile.profileImageUrl || undefined,
      lastLoginAt: userProfile.lastLoginAt?.toISOString(),
      preferences: {
        theme: userProfile.theme || 'dark',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dashboardLayout: 'grid',
      },
    };
  } catch (error) {
    console.error('getUserInfo 오류:', error);
    return {
      id: userId,
      name: '사용자',
      fullName: '사용자',
      role: 'agent',
      preferences: {
        theme: 'dark',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dashboardLayout: 'grid',
      },
    };
  }
}

// 오늘의 통계 조회 (개선된 버전)
export async function getTodayStats(
  userId: string
): Promise<DashboardTodayStats> {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // 오늘 예정된 미팅 수 (시간대별 분석)
    const meetingsToday = await db
      .select({
        id: meetings.id,
        scheduledAt: meetings.scheduledAt,
        status: meetings.status,
      })
      .from(meetings)
      .where(
        and(
          eq(meetings.agentId, userId),
          gte(meetings.scheduledAt, todayStart),
          lte(meetings.scheduledAt, todayEnd)
        )
      );

    const scheduledMeetings = meetingsToday.filter(
      (m) => m.status === 'scheduled'
    ).length;
    const completedMeetings = meetingsToday.filter(
      (m) => m.status === 'completed'
    ).length;
    const missedMeetings = meetingsToday.filter((m) => {
      const meetingTime = new Date(m.scheduledAt);
      return m.status === 'scheduled' && meetingTime < new Date();
    }).length;

    // 시간대별 미팅 분석
    const morningMeetings = meetingsToday.filter((m) => {
      const hour = new Date(m.scheduledAt).getHours();
      return hour >= 6 && hour < 12;
    }).length;

    const afternoonMeetings = meetingsToday.filter((m) => {
      const hour = new Date(m.scheduledAt).getHours();
      return hour >= 12 && hour < 18;
    }).length;

    const eveningMeetings = meetingsToday.filter((m) => {
      const hour = new Date(m.scheduledAt).getHours();
      return hour >= 18 && hour < 24;
    }).length;

    // 미완료 체크리스트 항목 수 (대기 중인 작업)
    const pendingTasksResult = await db
      .select({ count: count() })
      .from(appCalendarMeetingChecklists)
      .innerJoin(
        meetings,
        eq(appCalendarMeetingChecklists.meetingId, meetings.id)
      )
      .where(
        and(
          eq(meetings.agentId, userId),
          eq(appCalendarMeetingChecklists.completed, false)
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
          sql`${clients.referredById} IS NOT NULL`,
          gte(clients.createdAt, weekStart)
        )
      );

    const newReferrals = newReferralsResult[0]?.count || 0;

    return {
      scheduledMeetings,
      pendingTasks,
      newReferrals,
      completedMeetings,
      missedMeetings,
      urgentNotifications: 0, // TODO: 알림 시스템 연동 시 구현
      morningMeetings,
      afternoonMeetings,
      eveningMeetings,
    };
  } catch (error) {
    console.error('getTodayStats 오류:', error);
    return {
      scheduledMeetings: 0,
      pendingTasks: 0,
      newReferrals: 0,
      completedMeetings: 0,
      missedMeetings: 0,
      urgentNotifications: 0,
      morningMeetings: 0,
      afternoonMeetings: 0,
      eveningMeetings: 0,
    };
  }
}

// KPI 데이터 조회 (개선된 버전)
export async function getKPIData(userId: string): Promise<DashboardKPIData> {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 병렬로 모든 데이터 조회
    const [
      totalClientsResult,
      monthlyNewClientsResult,
      totalReferralsResult,
      contractedClientsResult,
      lastMonthClientsResult,
      lastMonthReferralsResult,
    ] = await Promise.all([
      // 총 고객 수
      db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.agentId, userId)),

      // 이번 달 신규 고객 수
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(eq(clients.agentId, userId), gte(clients.createdAt, thisMonth))
        ),

      // 총 소개 건수
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            sql`${clients.referredById} IS NOT NULL`
          )
        ),

      // 계약 완료 고객 (전환율 계산용) - 임시로 모든 고객으로 계산
      db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.agentId, userId)),

      // 지난 달 신규 고객 수
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            gte(clients.createdAt, lastMonth),
            lte(clients.createdAt, thisMonth)
          )
        ),

      // 지난 달 소개 건수
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            sql`${clients.referredById} IS NOT NULL`,
            gte(clients.createdAt, lastMonth),
            lte(clients.createdAt, thisMonth)
          )
        ),
    ]);

    const totalClients = totalClientsResult[0]?.count || 0;
    const monthlyNewClients = monthlyNewClientsResult[0]?.count || 0;
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    const contractedClients = Math.round(totalClients * 0.3); // 임시로 30% 전환율 가정
    const lastMonthClients = lastMonthClientsResult[0]?.count || 0;
    const lastMonthReferrals = lastMonthReferralsResult[0]?.count || 0;

    // 계산된 필드들
    const conversionRate =
      totalClients > 0 ? (contractedClients / totalClients) * 100 : 0;

    const clientGrowthPercentage =
      lastMonthClients > 0
        ? ((monthlyNewClients - lastMonthClients) / lastMonthClients) * 100
        : monthlyNewClients > 0
        ? 100
        : 0;

    const referralGrowthPercentage =
      lastMonthReferrals > 0
        ? ((totalReferrals - lastMonthReferrals) / lastMonthReferrals) * 100
        : totalReferrals > 0
        ? 100
        : 0;

    // 평균 고객 가치 계산 (임시로 고정값 사용, 추후 실제 계약 금액으로 대체)
    const averageClientValue = contractedClients > 0 ? 1500000 : 0; // 150만원 가정

    const revenueGrowthPercentage = 15; // 임시값, 추후 실제 수익 데이터로 대체

    return {
      totalClients,
      monthlyNewClients,
      totalReferrals,
      conversionRate,
      monthlyGrowth: {
        clients: clientGrowthPercentage,
        referrals: referralGrowthPercentage,
        revenue: revenueGrowthPercentage,
      },
      clientGrowthPercentage,
      referralGrowthPercentage,
      revenueGrowthPercentage,
      averageClientValue,
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
      clientGrowthPercentage: 0,
      referralGrowthPercentage: 0,
      revenueGrowthPercentage: 0,
      averageClientValue: 0,
    };
  }
}

// 오늘의 미팅 조회 (개선된 버전)
export async function getTodayMeetings(
  userId: string
): Promise<DashboardMeeting[]> {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // 오늘의 미팅 조회 (간소화된 버전)
    const todayMeetings = await db
      .select({
        id: meetings.id,
        clientId: meetings.clientId,
        title: meetings.title,
        scheduledAt: meetings.scheduledAt,
        duration: meetings.duration,
        location: meetings.location,
        status: meetings.status,
        meetingType: meetings.meetingType,
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          eq(meetings.agentId, userId),
          gte(meetings.scheduledAt, todayStart),
          lte(meetings.scheduledAt, todayEnd)
        )
      )
      .orderBy(asc(meetings.scheduledAt));

    // TODO: 향후 미팅과 고객 정보 조인 및 체크리스트 추가 로직 구현
    return todayMeetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      clientName: '미팅 고객', // TODO: 실제 고객명으로 대체
      clientId: meeting.clientId,
      startTime: meeting.scheduledAt.toISOString(),
      endTime: new Date(
        meeting.scheduledAt.getTime() + (meeting.duration || 60) * 60 * 1000
      ).toISOString(),
      type: meeting.meetingType,
      status: meeting.status as DashboardMeeting['status'],
      location: meeting.location || '',
      isUrgent: false, // TODO: 중요도 로직 추가
      clientImportance: 'medium' as const,
      hasChecklist: false, // TODO: 체크리스트 연동
    }));
  } catch (error) {
    console.error('getTodayMeetings 오류:', error);
    return [];
  }
}

// 파이프라인 개요 데이터 조회
export async function getPipelineData(userId: string) {
  try {
    // 기본 파이프라인 단계들
    const defaultStages = [
      { name: '리드 확보', order: 1 },
      { name: '첫 상담', order: 2 },
      { name: '니즈 분석', order: 3 },
      { name: '상품 설명', order: 4 },
      { name: '계약 검토', order: 5 },
      { name: '계약 완료', order: 6 },
    ];

    // 사용자의 파이프라인 단계들을 먼저 조회
    const userStages = await db
      .select({
        id: pipelineStages.id,
        name: pipelineStages.name,
        order: pipelineStages.order,
      })
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, userId))
      .orderBy(asc(pipelineStages.order));

    // 사용자 단계가 없으면 기본 단계 사용
    const stages = userStages.length > 0 ? userStages : defaultStages;

    const pipelineData = await Promise.all(
      stages.map(async (stage, index) => {
        let clientCount = 0;
        let totalValue = 0;

        if (userStages.length > 0 && 'id' in stage) {
          // 실제 파이프라인 단계 사용
          const stageResult = await db
            .select({
              count: count(),
            })
            .from(clients)
            .where(
              and(
                eq(clients.agentId, userId),
                eq(clients.currentStageId, stage.id)
              )
            );

          clientCount = stageResult[0]?.count || 0;
          totalValue = clientCount * 1500000; // 임시 평균 가치 (150만원)
        } else {
          // 파이프라인 단계가 없는 경우 임시 데이터
          clientCount = Math.max(0, Math.floor(Math.random() * 10) - index);
          totalValue = clientCount * 1500000;
        }

        // 전환율 계산 (다음 단계로 넘어간 비율)
        let conversionRate = 0;
        if (index < stages.length - 1 && clientCount > 0) {
          conversionRate = Math.max(0, 80 - index * 10); // 임시 전환율
        }

        return {
          id: (index + 1).toString(),
          name: stage.name,
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
        targetValue: appDashboardGoals.targetValue,
      })
      .from(appDashboardGoals)
      .where(
        and(
          eq(appDashboardGoals.agentId, userId),
          eq(appDashboardGoals.goalType, 'revenue'),
          eq(appDashboardGoals.period, 'monthly'),
          eq(appDashboardGoals.isActive, true),
          gte(
            appDashboardGoals.startDate,
            thisMonth.toISOString().split('T')[0]
          ),
          sql`${appDashboardGoals.endDate} < ${
            nextMonth.toISOString().split('T')[0]
          }`
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
    // 실제 소개자별 통계 조회 - referrals 테이블 사용
    const topReferrersData = await db
      .select({
        referrerId: referrals.referrerId,
        referrerName: clients.fullName,
        totalReferrals: count(referrals.id),
        lastReferralDate: sql<string>`MAX(${referrals.createdAt})::date`,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referrerId, clients.id))
      .where(eq(referrals.agentId, userId))
      .groupBy(referrals.referrerId, clients.fullName)
      .orderBy(desc(count(referrals.id)))
      .limit(5);

    const topReferrers = topReferrersData.map((referrer, index) => {
      const totalRefs = referrer.totalReferrals || 0;
      const successfulRefs = Math.round(totalRefs * 0.7); // 임시로 70% 성공률 가정
      const conversionRate =
        totalRefs > 0 ? (successfulRefs / totalRefs) * 100 : 0;

      return {
        id: `referrer-${index + 1}`,
        name: referrer.referrerName || `소개자 ${index + 1}`,
        totalReferrals: totalRefs,
        successfulConversions: successfulRefs,
        conversionRate: Math.round(conversionRate * 10) / 10,
        lastReferralDate:
          referrer.lastReferralDate || new Date().toISOString().split('T')[0],
        rank: index + 1,
        recentActivity: `최근 ${totalRefs}건의 소개를 통해 ${successfulRefs}건 성공`,
      };
    });

    // 네트워크 통계 (실제 데이터)
    const totalConnectionsResult = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.agentId, userId));

    const totalConnections = totalConnectionsResult[0]?.count || 0;

    // 활성 소개자 수 (최근 3개월 내 소개한 사람)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const activeReferrersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${referrals.referrerId})`,
      })
      .from(referrals)
      .where(
        and(
          eq(referrals.agentId, userId),
          gte(referrals.createdAt, threeMonthsAgo)
        )
      );

    const activeReferrers = Number(activeReferrersResult[0]?.count || 0);

    // 실제 네트워크 깊이 계산 - 간단한 버전
    const networkDepth = Math.min(1 + activeReferrers * 0.2, 6);

    // 월간 성장률 계산
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthConnectionsResult = await db
      .select({ count: count() })
      .from(referrals)
      .where(
        and(eq(referrals.agentId, userId), gte(referrals.createdAt, lastMonth))
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
      .from(appDashboardGoals)
      .where(
        and(
          eq(appDashboardGoals.agentId, userId),
          eq(appDashboardGoals.goalType, goalType),
          eq(appDashboardGoals.period, 'monthly'),
          eq(appDashboardGoals.isActive, true),
          gte(
            appDashboardGoals.startDate,
            startDate.toISOString().split('T')[0]
          )
        )
      )
      .limit(1);

    if (existingGoal.length > 0) {
      // 기존 목표 업데이트
      await db
        .update(appDashboardGoals)
        .set({
          targetValue: targetValue.toString(),
          title: title || `${goalType} 월간 목표`,
          updatedAt: new Date(),
        })
        .where(eq(appDashboardGoals.id, existingGoal[0].id));

      return existingGoal[0].id;
    } else {
      // 새 목표 생성
      const newGoal = await db
        .insert(appDashboardGoals)
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
      .from(appDashboardGoals)
      .where(
        and(
          eq(appDashboardGoals.agentId, userId),
          eq(appDashboardGoals.isActive, true)
        )
      )
      .orderBy(desc(appDashboardGoals.createdAt));

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
        fullName: clients.fullName,
        currentStageId: clients.currentStageId,
        referredById: clients.referredById,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
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
      // 상태 매핑 (임시로 생성 일자 기준)
      let status: 'prospect' | 'contacted' | 'proposal' | 'contracted';
      const daysSinceCreated = Math.floor(
        (Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreated < 3) {
        status = 'prospect';
      } else if (daysSinceCreated < 7) {
        status = 'contacted';
      } else if (daysSinceCreated < 14) {
        status = 'proposal';
      } else {
        status = 'contracted';
      }

      return {
        id: client.id,
        name: client.fullName,
        status,
        lastContactDate: client.updatedAt.toISOString().split('T')[0],
        potentialValue: Math.round(Math.random() * 200 + 100), // 100-300만원 임시값
        referredBy: client.referredById ? '소개 고객' : undefined,
        stage: '상담 중', // 임시값
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
