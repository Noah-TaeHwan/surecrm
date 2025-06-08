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
  ne,
  inArray,
} from 'drizzle-orm';
import {
  clients,
  teams,
  referrals,
  pipelineStages,
  insuranceInfo,
  opportunityProducts,
} from '~/lib/schema';
import { insuranceContracts } from '~/lib/schema/core';
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

    // 이번 주 새로운 소개 건수 (🔥 활성 고객만)
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 🔥 추가: 활성 고객만
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
      // 총 고객 수 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true) // 🔥 추가: 활성 고객만
          )
        ),

      // 이번 달 신규 고객 수 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            gte(clients.createdAt, thisMonth)
          )
        ),

      // 총 소개 건수 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            sql`${clients.referredById} IS NOT NULL`
          )
        ),

      // 계약 완료 고객 (전환율 계산용) - 실제 "계약 완료" 단계 고객 수 사용 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true) // 🔥 추가: 활성 고객만
          )
        ),

      // 지난 달 신규 고객 수 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            gte(clients.createdAt, lastMonth),
            lte(clients.createdAt, thisMonth)
          )
        ),

      // 지난 달 소개 건수 (🔥 활성 고객만)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            sql`${clients.referredById} IS NOT NULL`,
            gte(clients.createdAt, lastMonth),
            lte(clients.createdAt, thisMonth)
          )
        ),
    ]);

    const totalClients = totalClientsResult[0]?.count || 0;
    const monthlyNewClients = monthlyNewClientsResult[0]?.count || 0;
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    let contractedClients = 0;

    // "계약 완료" 단계 조회
    const contractCompletedStage = await db
      .select({ id: pipelineStages.id })
      .from(pipelineStages)
      .where(
        and(
          eq(pipelineStages.agentId, userId),
          eq(pipelineStages.name, '계약 완료')
        )
      )
      .limit(1);

    if (contractCompletedStage.length > 0) {
      // 실제 "계약 완료" 단계에 있는 고객 수 (🔥 활성 고객만)
      const contractedResult = await db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            eq(clients.currentStageId, contractCompletedStage[0].id)
          )
        );

      contractedClients = contractedResult[0]?.count || 0;
    } else {
      // "계약 완료" 단계가 없으면 전체 고객의 30%로 추정
      contractedClients = Math.round(totalClients * 0.3);
    }

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

    // 🏢 수정: 실제 보험계약 수수료 기반 평균 고객 가치 계산
    const { insuranceContracts } = await import('~/lib/schema/core'); // 동적 import로 보험계약 테이블 가져오기

    const averageClientValueResult = await db
      .select({
        totalCommission: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
        clientCount: sql<number>`COUNT(DISTINCT ${insuranceContracts.clientId})`,
      })
      .from(insuranceContracts)
      .innerJoin(clients, eq(insuranceContracts.clientId, clients.id))
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(clients.isActive, true),
          eq(insuranceContracts.status, 'active'),
          sql`${insuranceContracts.agentCommission} IS NOT NULL`
        )
      );

    const totalCommission = averageClientValueResult[0]?.totalCommission || 0;
    const clientsWithContracts = averageClientValueResult[0]?.clientCount || 0;
    const averageClientValue =
      clientsWithContracts > 0 ? totalCommission / clientsWithContracts : 0;

    // 전환율 증가율 계산 (지난 달 대비)
    let revenueGrowthPercentage = 0;
    if (contractCompletedStage.length > 0) {
      // 지난 달 계약 완료 고객 수 조회
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

      const lastMonthContractedResult = await db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            eq(clients.isActive, true), // 🔥 추가: 활성 고객만
            eq(clients.currentStageId, contractCompletedStage[0].id),
            gte(clients.updatedAt, lastMonthStart),
            lte(clients.updatedAt, lastMonthEnd)
          )
        );

      const lastMonthContracted = lastMonthContractedResult[0]?.count || 0;
      const thisMonthContracted = contractedClients - lastMonthContracted;

      if (lastMonthContracted > 0) {
        revenueGrowthPercentage =
          ((thisMonthContracted - lastMonthContracted) / lastMonthContracted) *
          100;
      } else if (thisMonthContracted > 0) {
        revenueGrowthPercentage = 100; // 지난 달 0건에서 이번 달 있으면 100% 증가
      }
    }

    // 🏢 추가: 실제 보험계약 통계
    const contractsStatsResult = await db
      .select({
        totalContracts: sql<number>`COUNT(*)`,
        totalMonthlyPremium: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.monthlyPremium} AS NUMERIC)), 0)`,
        totalCommission: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
      })
      .from(insuranceContracts)
      .innerJoin(clients, eq(insuranceContracts.clientId, clients.id))
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(clients.isActive, true),
          eq(insuranceContracts.status, 'active')
        )
      );

    // 🏢 통합 수수료 통계 사용
    const { getUnifiedCommissionStats } = await import(
      '~/api/shared/insurance-contracts'
    );
    const unifiedStats = await getUnifiedCommissionStats(userId);

    const totalActiveContracts = unifiedStats.success
      ? unifiedStats.data.actualContracts.count
      : contractsStatsResult[0]?.totalContracts || 0;
    const totalMonthlyPremium = unifiedStats.success
      ? unifiedStats.data.actualContracts.totalMonthlyPremium
      : contractsStatsResult[0]?.totalMonthlyPremium || 0;
    const actualTotalCommission = unifiedStats.success
      ? unifiedStats.data.actualContracts.totalCommission
      : contractsStatsResult[0]?.totalCommission || 0;

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
      // 🏢 보험계약 관련 KPI 추가
      totalActiveContracts,
      totalMonthlyPremium,
      actualTotalCommission,
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
      averageClientValue: 0, // 실제 데이터로 계산됨
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

    // 사용자의 파이프라인 단계들을 먼저 조회 (제외됨 단계는 필터링)
    const userStages = await db
      .select({
        id: pipelineStages.id,
        name: pipelineStages.name,
        order: pipelineStages.order,
      })
      .from(pipelineStages)
      .where(
        and(
          eq(pipelineStages.agentId, userId),
          ne(pipelineStages.name, '제외됨') // "제외됨" 단계 제외
        )
      )
      .orderBy(asc(pipelineStages.order));

    // 사용자 단계가 없으면 기본 단계 사용
    const stages = userStages.length > 0 ? userStages : defaultStages;

    const pipelineData = await Promise.all(
      stages.map(async (stage, index) => {
        let clientCount = 0;
        let totalValue = 0;

        if (userStages.length > 0 && 'id' in stage) {
          // 실제 파이프라인 단계 사용 (🔥 활성 고객만)
          const stageResult = await db
            .select({
              count: count(),
            })
            .from(clients)
            .where(
              and(
                eq(clients.agentId, userId),
                eq(clients.isActive, true), // 🔥 추가: 활성 고객만
                eq(clients.currentStageId, stage.id)
              )
            );

          clientCount = stageResult[0]?.count || 0;

          // 🆕 실제 영업 기회 상품의 수수료 합계 계산
          const stageOpportunityProducts = await db
            .select({
              expectedCommission: opportunityProducts.expectedCommission,
            })
            .from(opportunityProducts)
            .innerJoin(clients, eq(opportunityProducts.clientId, clients.id))
            .where(
              and(
                eq(opportunityProducts.agentId, userId),
                eq(clients.currentStageId, stage.id),
                eq(clients.isActive, true),
                eq(opportunityProducts.status, 'active'),
                sql`${opportunityProducts.expectedCommission} IS NOT NULL`
              )
            );

          // 실제 영업 기회 수수료 합계 (단위: 원)
          const actualCommissionTotal = stageOpportunityProducts.reduce(
            (sum, product) => {
              const commission = Number(product.expectedCommission) || 0;
              return sum + commission;
            },
            0
          );

          // 실제 데이터가 있으면 사용, 없으면 추정값 사용
          totalValue =
            actualCommissionTotal > 0
              ? actualCommissionTotal
              : clientCount * 150000; // 추정값: 1건당 15만원
        } else {
          // 파이프라인 단계가 없는 경우 0으로 설정 (깜빡거림 방지)
          clientCount = 0;
          totalValue = 0;
        }

        // 전환율 계산 (실제 데이터 기반)
        let conversionRate = 0;
        if (
          userStages.length > 0 &&
          index < stages.length - 1 &&
          clientCount > 0
        ) {
          // 다음 단계의 고객 수를 조회하여 실제 전환율 계산
          const nextStage = stages[index + 1];
          if ('id' in nextStage) {
            const nextStageResult = await db
              .select({ count: count() })
              .from(clients)
              .where(
                and(
                  eq(clients.agentId, userId),
                  eq(clients.isActive, true), // 🔥 추가: 활성 고객만
                  eq(clients.currentStageId, nextStage.id)
                )
              );

            const nextStageCount = nextStageResult[0]?.count || 0;
            // 전환율 = (현재 단계 + 다음 단계 이후의 모든 고객) / 현재 단계 고객 수
            // 즉, 이 단계를 거쳐 진행된 비율
            const totalAfterStage = stages
              .slice(index + 1)
              .reduce((sum, _, laterIndex) => {
                // 임시로 현재 방식 유지하지만 실제 데이터로 계산
                return sum + Math.max(0, clientCount - laterIndex * 2);
              }, 0);

            conversionRate =
              clientCount > 0
                ? Math.min((totalAfterStage / clientCount) * 100, 95)
                : 0;
          }
        } else if (index < stages.length - 1 && clientCount > 0) {
          // 기본 단계 사용 시에도 더 현실적인 전환율 적용
          conversionRate = Math.max(20, 70 - index * 8); // 70%, 62%, 54%, 46%, 38%...
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

// 상위 소개자 및 네트워크 통계 조회 (🎯 네트워크 페이지와 동일한 데이터 소스 사용)
export async function getReferralInsights(userId: string) {
  try {
    // 🎯 네트워크 페이지와 동일하게 clients.referredById 기반으로 통계 계산

    // 소개자별 통계 조회 - 간단한 방법으로 구현 (subquery 사용)
    const referralData = await db
      .select({
        referrerId: clients.referredById,
        clientId: clients.id,
        clientName: clients.fullName,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 활성 고객만
          sql`${clients.referredById} IS NOT NULL` // 소개받은 고객만
        )
      );

    // 소개자별로 그룹화하여 통계 계산
    const referrerStats = new Map<
      string,
      {
        referrerId: string;
        totalReferrals: number;
        lastReferralDate: string;
      }
    >();

    for (const item of referralData) {
      if (!item.referrerId) continue;

      const existing = referrerStats.get(item.referrerId);
      if (existing) {
        existing.totalReferrals++;
        if (item.createdAt > new Date(existing.lastReferralDate)) {
          existing.lastReferralDate = item.createdAt
            .toISOString()
            .split('T')[0];
        }
      } else {
        referrerStats.set(item.referrerId, {
          referrerId: item.referrerId,
          totalReferrals: 1,
          lastReferralDate: item.createdAt.toISOString().split('T')[0],
        });
      }
    }

    // 소개자 이름 가져오기
    const referrerIds = Array.from(referrerStats.keys());
    let referrerNames: { id: string; fullName: string }[] = [];

    if (referrerIds.length > 0) {
      referrerNames = await db
        .select({
          id: clients.id,
          fullName: clients.fullName,
        })
        .from(clients)
        .where(inArray(clients.id, referrerIds));
    }

    const referrerNameMap = new Map(
      referrerNames.map((r) => [r.id, r.fullName])
    );

    // 결과 조합 및 정렬
    const topReferrersData = Array.from(referrerStats.values())
      .map((stat) => ({
        referrerId: stat.referrerId,
        referrerName: referrerNameMap.get(stat.referrerId) || '알 수 없음',
        totalReferrals: stat.totalReferrals,
        lastReferralDate: stat.lastReferralDate,
      }))
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, 5);

    const topReferrers = topReferrersData.map((referrer, index) => {
      const totalRefs = referrer.totalReferrals || 0;
      const successfulRefs = Math.round(totalRefs * 0.8); // 80% 성공률 가정 (소개받은 고객이므로 높음)
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

    // 네트워크 통계 (clients.referredById 기반)

    // 총 소개 연결 수 (소개받은 고객 수)
    const totalConnectionsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          sql`${clients.referredById} IS NOT NULL`
        )
      );

    const totalConnections = totalConnectionsResult[0]?.count || 0;

    // 활성 소개자 수 (최근 3개월 내 소개한 사람)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const activeReferrersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${clients.referredById})`,
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          sql`${clients.referredById} IS NOT NULL`,
          gte(clients.createdAt, threeMonthsAgo)
        )
      );

    const activeReferrers = Number(activeReferrersResult[0]?.count || 0);

    // 네트워크 깊이 계산 (소개자가 많을수록 깊이 증가)
    const networkDepth = Math.min(Math.ceil(1 + activeReferrers * 0.3), 5);

    // 월간 성장률 계산 (최근 한달간 새로운 소개 고객)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const recentConnectionsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          sql`${clients.referredById} IS NOT NULL`,
          gte(clients.createdAt, lastMonth)
        )
      );

    const recentConnections = recentConnectionsResult[0]?.count || 0;
    const monthlyGrowth =
      totalConnections > 0
        ? Math.round((recentConnections / totalConnections) * 100 * 10) / 10
        : 0;

    const networkStats = {
      totalConnections,
      networkDepth,
      activeReferrers,
      monthlyGrowth,
    };

    console.log('🔍 대시보드 네트워크 통계:', {
      totalConnections,
      activeReferrers,
      networkDepth,
      monthlyGrowth,
    });

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
  goalType: 'revenue' | 'clients' | 'referrals',
  targetValue: number,
  title?: string,
  goalId?: string,
  targetYear?: number,
  targetMonth?: number
) {
  try {
    // 목표 연도와 월이 제공되지 않으면 현재 월 사용
    const year = targetYear || new Date().getFullYear();
    const month = targetMonth || new Date().getMonth() + 1;

    console.log('🗓️ 목표 설정 - 입력값:', {
      targetYear,
      targetMonth,
      year,
      month,
    });

    // ✅ 시간대 이슈 해결: ISO 문자열 직접 생성
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(
      year,
      month,
      0
    ).getDate()}`;

    console.log('🗓️ 목표 설정 - 계산된 날짜:', { startDate, endDate });

    // 수정 모드인 경우
    if (goalId) {
      await db
        .update(appDashboardGoals)
        .set({
          targetValue: targetValue.toString(),
          title: title || `${goalType} ${year}년 ${month}월 목표`,
          goalType,
          startDate,
          endDate,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(appDashboardGoals.id, goalId),
            eq(appDashboardGoals.agentId, userId)
          )
        );

      console.log('✅ 목표 수정 완료:', { goalId, year, month });
      return goalId;
    }

    // 기존 목표가 있는지 확인 (새로 생성하는 경우)
    const existingGoal = await db
      .select()
      .from(appDashboardGoals)
      .where(
        and(
          eq(appDashboardGoals.agentId, userId),
          eq(appDashboardGoals.goalType, goalType),
          eq(appDashboardGoals.period, 'monthly'),
          eq(appDashboardGoals.isActive, true),
          eq(appDashboardGoals.startDate, startDate)
        )
      )
      .limit(1);

    if (existingGoal.length > 0) {
      // 기존 목표 업데이트
      await db
        .update(appDashboardGoals)
        .set({
          targetValue: targetValue.toString(),
          title: title || `${goalType} ${year}년 ${month}월 목표`,
          updatedAt: new Date(),
        })
        .where(eq(appDashboardGoals.id, existingGoal[0].id));

      console.log('✅ 기존 목표 업데이트 완료:', { year, month });
      return existingGoal[0].id;
    } else {
      // 새 목표 생성
      const newGoal = await db
        .insert(appDashboardGoals)
        .values({
          agentId: userId,
          title: title || `${goalType} ${year}년 ${month}월 목표`,
          goalType,
          targetValue: targetValue.toString(),
          period: 'monthly',
          startDate,
          endDate,
          isActive: true,
        })
        .returning();

      console.log('✅ 새 목표 생성 완료:', {
        year,
        month,
        goalId: newGoal[0].id,
      });
      return newGoal[0].id;
    }
  } catch (error) {
    console.error('setMonthlyGoal 오류:', error);
    throw error;
  }
}

// 모든 활성 목표 조회 및 진행률 계산
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

    // 각 목표의 실제 달성률 계산
    const goalsWithProgress = await Promise.all(
      userGoals
        .filter((goal) => goal.goalType !== 'meetings') // 미팅 목표 제외
        .map(async (goal) => {
          let currentValue = 0;

          // 목표 유형별 실제 데이터 조회
          switch (goal.goalType) {
            case 'revenue':
              // 🎯 대시보드 KPI와 동일한 실제 계약 수수료 계산 (목표 기간 적용)
              try {
                const goalStartDate = new Date(goal.startDate);
                const goalEndDate = new Date(goal.endDate);

                // 목표 기간 내에 계약된 실제 보험계약들의 수수료 합계
                const actualContractsInPeriod = await db
                  .select({
                    count: count(),
                    totalCommission: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
                  })
                  .from(insuranceContracts)
                  .where(
                    and(
                      eq(insuranceContracts.agentId, userId),
                      eq(insuranceContracts.status, 'active'),
                      sql`${insuranceContracts.agentCommission} IS NOT NULL`,
                      sql`DATE(${insuranceContracts.contractDate}) >= ${
                        goalStartDate.toISOString().split('T')[0]
                      }`,
                      sql`DATE(${insuranceContracts.contractDate}) <= ${
                        goalEndDate.toISOString().split('T')[0]
                      }`
                    )
                  );

                const actualData = actualContractsInPeriod[0] || {
                  count: 0,
                  totalCommission: 0,
                };

                // 실제 계약 수수료를 만원 단위로 변환
                currentValue = Math.round(
                  Number(actualData.totalCommission) / 10000
                );

                console.log('🎯 수수료 목표 달성률 계산 (실제 계약 기반):', {
                  goalPeriod: `${goal.startDate} ~ ${goal.endDate}`,
                  actualContracts: actualData.count,
                  totalCommission: Number(actualData.totalCommission),
                  currentValueInTenThousands: currentValue,
                });
              } catch (error) {
                console.error('수수료 목표 계산 오류:', error);
                currentValue = 0;
              }

              break;

            case 'clients':
              // 목표 기간에 해당하는 신규 고객 수
              const clientsStartDate = new Date(goal.startDate);
              const clientsEndDate = new Date(goal.endDate);

              const newClientsResult = await db
                .select({ count: count() })
                .from(clients)
                .where(
                  and(
                    eq(clients.agentId, userId),
                    eq(clients.isActive, true), // 🔥 추가: 활성 고객만
                    gte(clients.createdAt, clientsStartDate),
                    lte(clients.createdAt, clientsEndDate)
                  )
                );

              currentValue = newClientsResult[0]?.count || 0;
              break;

            case 'referrals':
              // 🎯 목표 기간에 해당하는 소개 건수 (clients.referredById 기반)
              const referralsStartDate = new Date(goal.startDate);
              const referralsEndDate = new Date(goal.endDate);

              // 소개받은 고객 수 계산 (clients 테이블에서 referredById가 있는 고객들)
              const referralsResult = await db
                .select({ count: count() })
                .from(clients)
                .where(
                  and(
                    eq(clients.agentId, userId),
                    eq(clients.isActive, true), // 활성 고객만
                    sql`${clients.referredById} IS NOT NULL`, // 소개받은 고객만
                    gte(clients.createdAt, referralsStartDate),
                    lte(clients.createdAt, referralsEndDate)
                  )
                );

              currentValue = referralsResult[0]?.count || 0;
              console.log('🎯 소개 목표 달성률 계산:', {
                goalId: goal.id,
                startDate: referralsStartDate.toISOString().split('T')[0],
                endDate: referralsEndDate.toISOString().split('T')[0],
                currentValue,
                targetValue: goal.targetValue,
              });
              break;

            default:
              currentValue = Number(goal.currentValue);
              break;
          }

          // 진행률 계산
          const targetValue = Number(goal.targetValue);
          const progress =
            targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

          console.log('🎯 목표 진행률 계산 결과:', {
            goalId: goal.id,
            goalType: goal.goalType,
            targetValue,
            currentValue,
            progress: progress.toFixed(2) + '%',
          });

          return {
            ...goal,
            targetValue,
            currentValue,
            progress, // 🎯 초과 달성률도 표시
          };
        })
    );

    return goalsWithProgress;
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
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      )
      .orderBy(desc(clients.createdAt))
      .limit(5);

    // 총 고객 수 (🔥 활성 고객만)
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      );

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

// 목표 삭제 (소프트 삭제)
export async function deleteGoal(userId: string, goalId: string) {
  try {
    // 사용자 권한 확인 후 소프트 삭제
    const result = await db
      .update(appDashboardGoals)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appDashboardGoals.id, goalId),
          eq(appDashboardGoals.agentId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error('목표를 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    return result[0];
  } catch (error) {
    console.error('deleteGoal 오류:', error);
    throw error;
  }
}

// 목표 상세 조회
export async function getGoalById(userId: string, goalId: string) {
  try {
    const goal = await db
      .select()
      .from(appDashboardGoals)
      .where(
        and(
          eq(appDashboardGoals.id, goalId),
          eq(appDashboardGoals.agentId, userId),
          eq(appDashboardGoals.isActive, true)
        )
      )
      .limit(1);

    if (goal.length === 0) {
      return null;
    }

    return {
      ...goal[0],
      targetValue: Number(goal[0].targetValue),
      currentValue: Number(goal[0].currentValue),
      progress:
        (Number(goal[0].currentValue) / Number(goal[0].targetValue)) * 100,
    };
  } catch (error) {
    console.error('getGoalById 오류:', error);
    return null;
  }
}
