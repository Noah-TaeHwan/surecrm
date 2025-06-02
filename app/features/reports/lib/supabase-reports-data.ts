import { db } from '~/lib/core/db';
import {
  clients,
  meetings,
  referrals,
  profiles,
  teams,
  pipelineStages,
  reportTemplates,
  reportInstances,
  reportDashboards,
  type ReportTemplate,
  type ReportInstance,
  type ReportDashboard,
} from './schema';
import { insuranceInfo } from '~/lib/schema';
import {
  eq,
  and,
  gte,
  lte,
  count,
  sum,
  avg,
  desc,
  asc,
  sql,
  inArray,
} from 'drizzle-orm';

// 성과 데이터 인터페이스 (MVP 특화)
export interface PerformanceData {
  totalClients: number;
  newClients: number;
  totalReferrals: number;
  conversionRate: number;
  revenue: number;
  growth: {
    clients: number;
    referrals: number;
    revenue: number;
  };
  // MVP 추가 지표
  averageClientValue: number;
  meetingsCount: number;
  activeClients: number;
  monthlyRecurringRevenue: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  clients: number;
  conversions: number;
  revenue: number;
  conversionRate: number; // MVP 추가
  efficiency: number; // 시간당 성과 지표
}

export interface ReportStats {
  totalReports: number;
  scheduledReports: number;
  completedReports: number;
  failedReports: number;
  totalDownloads: number;
}

// MVP 특화: 성과 지표 가져오기 (보험설계사 최적화)
export async function getPerformanceData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PerformanceData> {
  try {
    // 기본 클라이언트 수 조회 (가장 단순한 쿼리로 테스트)
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.agentId, userId));

    // 신규 클라이언트 수 (날짜 조건 테스트 - and 함수 사용)
    const newClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 추천 수 조회 (날짜 조건 추가)
    const totalReferralsResult = await db
      .select({ count: count() })
      .from(referrals)
      .where(
        and(
          eq(referrals.agentId, userId),
          gte(referrals.createdAt, startDate),
          lte(referrals.createdAt, endDate)
        )
      );

    // 미팅 수 조회 (날짜 조건 추가)
    const meetingsResult = await db
      .select({ count: count() })
      .from(meetings)
      .where(
        and(
          eq(meetings.agentId, userId),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        )
      );

    // 수익 계산 (날짜 조건 + 활성 보험 조건 추가)
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${insuranceInfo.premium}), 0)`,
        count: count(),
      })
      .from(clients)
      .innerJoin(insuranceInfo, eq(clients.id, insuranceInfo.clientId))
      .where(
        and(
          eq(clients.agentId, userId),
          eq(insuranceInfo.isActive, true),
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 전환율 계산 (isActive 필드 사용)
    const conversionResult = await db
      .select({
        total: count(),
        converted: sql<number>`COUNT(CASE WHEN ${clients.isActive} = true THEN 1 END)`,
        prospects: sql<number>`COUNT(CASE WHEN ${clients.isActive} = false THEN 1 END)`,
      })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 활성 고객 수
    const activeClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(eq(clients.agentId, userId), eq(clients.isActive, true)));

    // 이전 기간 데이터 (성장률 계산용) - 완전 복원
    const periodDiff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = new Date(endDate.getTime() - periodDiff);

    const prevClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          gte(clients.createdAt, prevStartDate),
          lte(clients.createdAt, prevEndDate)
        )
      );

    const prevReferralsResult = await db
      .select({ count: count() })
      .from(referrals)
      .where(
        and(
          eq(referrals.agentId, userId),
          gte(referrals.createdAt, prevStartDate),
          lte(referrals.createdAt, prevEndDate)
        )
      );

    const prevRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${insuranceInfo.premium}), 0)`,
      })
      .from(clients)
      .innerJoin(insuranceInfo, eq(clients.id, insuranceInfo.clientId))
      .where(
        and(
          eq(clients.agentId, userId),
          eq(insuranceInfo.isActive, true),
          gte(clients.createdAt, prevStartDate),
          lte(clients.createdAt, prevEndDate)
        )
      );

    // 데이터 추출 및 계산
    const totalClients = totalClientsResult[0]?.count || 0;
    const newClients = newClientsResult[0]?.count || 0;
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    const revenue = revenueResult[0]?.total || 0;
    const revenueCount = revenueResult[0]?.count || 0;
    const meetingsCount = meetingsResult[0]?.count || 0;
    const activeClients = activeClientsResult[0]?.count || 0;

    // MVP 특화: 전환율 계산 (더 정확한 로직)
    const conversionData = conversionResult[0];
    const conversionRate =
      conversionData?.total > 0
        ? (conversionData.converted / conversionData.total) * 100
        : 0;

    // MVP 특화: 추가 지표 계산
    const averageClientValue = revenueCount > 0 ? revenue / revenueCount : 0;
    const monthlyRecurringRevenue = revenue * 0.1; // 보험료의 10%를 월 수수료로 가정

    // 성장률 계산 (MVP: 더 안정적인 계산)
    const prevClients = prevClientsResult[0]?.count || 0;
    const prevReferrals = prevReferralsResult[0]?.count || 0;
    const prevRevenue = prevRevenueResult[0]?.total || 0;

    const clientsGrowth = calculateGrowthRate(newClients, prevClients);
    const referralsGrowth = calculateGrowthRate(totalReferrals, prevReferrals);
    const revenueGrowth = calculateGrowthRate(revenue, prevRevenue);

    return {
      totalClients,
      newClients,
      totalReferrals,
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenue,
      growth: {
        clients: Math.round(clientsGrowth * 10) / 10,
        referrals: Math.round(referralsGrowth * 10) / 10,
        revenue: Math.round(revenueGrowth * 10) / 10,
      },
      // MVP 추가 지표
      averageClientValue: Math.round(averageClientValue),
      meetingsCount,
      activeClients,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
    };
  } catch (error) {
    console.error('Error fetching performance data:', error);
    // MVP: 안전한 기본값 반환
    return {
      totalClients: 0,
      newClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      revenue: 0,
      growth: {
        clients: 0,
        referrals: 0,
        revenue: 0,
      },
      averageClientValue: 0,
      meetingsCount: 0,
      activeClients: 0,
      monthlyRecurringRevenue: 0,
    };
  }
}

// MVP 헬퍼: 안전한 성장률 계산
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // 이전 값이 0이면 100% 성장 또는 0%
  }
  return ((current - previous) / previous) * 100;
}

// MVP 특화: 최고 성과자 조회 (보험설계사 특화 지표 포함)
export async function getTopPerformers(
  userId: string,
  limit: number = 5
): Promise<TopPerformer[]> {
  try {
    // 팀 내 다른 에이전트들의 성과 조회
    const teamResult = await db
      .select({ teamId: profiles.teamId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!teamResult.length || !teamResult[0].teamId) {
      return []; // 팀이 없으면 빈 배열 반환
    }

    const teamId = teamResult[0].teamId;

    // 팀 멤버들의 성과 데이터 조회
    const performersData = await db
      .select({
        id: profiles.id,
        name: sql<string>`COALESCE(${profiles.fullName}, 'Unknown')`,
        totalClients: sql<number>`COUNT(DISTINCT ${clients.id})`,
        activeClients: sql<number>`COUNT(DISTINCT CASE WHEN ${clients.isActive} = true THEN ${clients.id} END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${insuranceInfo.isActive} = true THEN ${insuranceInfo.premium} ELSE 0 END), 0)`,
        meetingsCount: sql<number>`COUNT(DISTINCT ${meetings.id})`,
      })
      .from(profiles)
      .leftJoin(clients, eq(clients.agentId, profiles.id))
      .leftJoin(meetings, eq(meetings.agentId, profiles.id))
      .leftJoin(insuranceInfo, eq(clients.id, insuranceInfo.clientId))
      .where(eq(profiles.teamId, teamId))
      .groupBy(profiles.id, profiles.fullName)
      .orderBy(
        desc(
          sql<number>`COALESCE(SUM(CASE WHEN ${insuranceInfo.isActive} = true THEN ${insuranceInfo.premium} ELSE 0 END), 0)`
        )
      )
      .limit(limit);

    return performersData.map((performer) => {
      const conversionRate =
        performer.totalClients > 0
          ? (performer.activeClients / performer.totalClients) * 100
          : 0;

      const efficiency =
        performer.meetingsCount > 0
          ? performer.activeClients / performer.meetingsCount
          : 0;

      return {
        id: performer.id,
        name: performer.name,
        clients: performer.totalClients,
        conversions: performer.activeClients,
        revenue: performer.totalRevenue,
        conversionRate: Math.round(conversionRate * 10) / 10,
        efficiency: Math.round(efficiency * 100) / 100, // 미팅당 전환 고객 수
      };
    });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}

// MVP 특화: 보고서 템플릿 조회 (보험설계사 특화)
export async function getReportTemplates(
  userId: string
): Promise<ReportTemplate[]> {
  try {
    return await db
      .select()
      .from(reportTemplates)
      .where(eq(reportTemplates.userId, userId))
      .orderBy(desc(reportTemplates.createdAt));
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return [];
  }
}

// 보고서 인스턴스 조회
export async function getReportInstances(
  userId: string
): Promise<ReportInstance[]> {
  try {
    return await db
      .select()
      .from(reportInstances)
      .where(eq(reportInstances.userId, userId))
      .orderBy(desc(reportInstances.createdAt));
  } catch (error) {
    console.error('Error fetching report instances:', error);
    return [];
  }
}

// 대시보드 조회
export async function getDashboards(
  userId: string
): Promise<ReportDashboard[]> {
  try {
    return await db
      .select()
      .from(reportDashboards)
      .where(eq(reportDashboards.userId, userId))
      .orderBy(desc(reportDashboards.createdAt));
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return [];
  }
}

// MVP 특화: 보고서 통계 (실용적인 지표만)
export async function getReportStats(userId: string): Promise<ReportStats> {
  try {
    const [templatesCount, instancesCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(reportTemplates)
        .where(eq(reportTemplates.userId, userId)),

      db
        .select({
          total: count(),
          completed: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
          failed: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
          downloads: sql<number>`COALESCE(SUM(${reportInstances.downloadCount}), 0)`,
        })
        .from(reportInstances)
        .where(eq(reportInstances.userId, userId)),
    ]);

    const instanceData = instancesCount[0];

    return {
      totalReports: templatesCount[0]?.count || 0,
      scheduledReports: 0, // MVP에서는 단순화
      completedReports: instanceData?.completed || 0,
      failedReports: instanceData?.failed || 0,
      totalDownloads: instanceData?.downloads || 0,
    };
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return {
      totalReports: 0,
      scheduledReports: 0,
      completedReports: 0,
      failedReports: 0,
      totalDownloads: 0,
    };
  }
}

// MVP 특화: 기본 보고서 템플릿 생성 (보험설계사 특화)
export async function createDefaultReportTemplates(
  userId: string
): Promise<void> {
  try {
    // 기존 템플릿 확인
    const existingTemplates = await db
      .select({ count: count() })
      .from(reportTemplates)
      .where(eq(reportTemplates.userId, userId));

    if (existingTemplates[0]?.count > 0) {
      return; // 이미 템플릿이 있으면 생성하지 않음
    }

    // MVP 특화: 보험설계사를 위한 기본 템플릿들
    const defaultTemplates = [
      {
        id: crypto.randomUUID(),
        userId,
        name: '일일 업무 보고서',
        description: '매일 작성하는 기본 업무 보고서',
        type: 'performance' as const,
        category: 'daily',
        config: {
          sections: ['performance', 'activities', 'plans'],
          format: 'kakao',
          autoGenerate: true,
        },
        isDefault: true,
        isPublic: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId,
        name: '주간 성과 요약',
        description: '주간 성과를 요약한 보고서',
        type: 'performance' as const,
        category: 'weekly',
        config: {
          sections: ['performance', 'goals', 'insights'],
          format: 'detailed',
          autoGenerate: false,
        },
        isDefault: true,
        isPublic: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId,
        name: '월간 종합 분석',
        description: '월간 종합 성과 분석 보고서',
        type: 'performance' as const,
        category: 'monthly',
        config: {
          sections: ['performance', 'trends', 'goals', 'recommendations'],
          format: 'comprehensive',
          autoGenerate: false,
        },
        isDefault: true,
        isPublic: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.insert(reportTemplates).values(defaultTemplates);
    console.log(
      `Created ${defaultTemplates.length} default report templates for user ${userId}`
    );
  } catch (error) {
    console.error('Error creating default report templates:', error);
    // MVP: 에러가 발생해도 앱이 중단되지 않도록 처리
  }
}
