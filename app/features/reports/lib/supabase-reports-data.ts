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
} from '../schema';
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
} from 'drizzle-orm';

// 성과 데이터 인터페이스
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
}

export interface TopPerformer {
  id: string;
  name: string;
  clients: number;
  conversions: number;
  revenue: number;
}

export interface ReportStats {
  totalReports: number;
  scheduledReports: number;
  completedReports: number;
  failedReports: number;
  totalDownloads: number;
}

// 성과 지표 가져오기
export async function getPerformanceData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PerformanceData> {
  try {
    // 현재 기간 데이터
    const [
      totalClientsResult,
      newClientsResult,
      totalReferralsResult,
      revenueResult,
      conversionResult,
    ] = await Promise.all([
      // 총 클라이언트 수
      db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.agentId, userId)),

      // 신규 클라이언트 수 (기간 내)
      db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.agentId, userId),
            gte(clients.createdAt, startDate),
            lte(clients.createdAt, endDate)
          )
        ),

      // 총 추천 수
      db
        .select({ count: count() })
        .from(referrals)
        .where(eq(referrals.agentId, userId)),

      // 수익 계산 (보험료 합계)
      db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${clients.insuranceInfo}->>'premium' AS DECIMAL)), 0)`,
        })
        .from(clients)
        .where(eq(clients.agentId, userId)),

      // 전환율 계산 (계약 완료된 클라이언트 비율)
      db
        .select({
          total: count(),
          converted: sql<number>`COUNT(CASE WHEN ${clients.status} = 'active' THEN 1 END)`,
        })
        .from(clients)
        .where(eq(clients.agentId, userId)),
    ]);

    // 이전 기간 데이터 (성장률 계산용)
    const periodDiff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = new Date(endDate.getTime() - periodDiff);

    const [prevClientsResult, prevReferralsResult, prevRevenueResult] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(clients)
          .where(
            and(
              eq(clients.agentId, userId),
              gte(clients.createdAt, prevStartDate),
              lte(clients.createdAt, prevEndDate)
            )
          ),

        db
          .select({ count: count() })
          .from(referrals)
          .where(
            and(
              eq(referrals.agentId, userId),
              gte(referrals.createdAt, prevStartDate),
              lte(referrals.createdAt, prevEndDate)
            )
          ),

        db
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${clients.insuranceInfo}->>'premium' AS DECIMAL)), 0)`,
          })
          .from(clients)
          .where(
            and(
              eq(clients.agentId, userId),
              gte(clients.createdAt, prevStartDate),
              lte(clients.createdAt, prevEndDate)
            )
          ),
      ]);

    const totalClients = totalClientsResult[0]?.count || 0;
    const newClients = newClientsResult[0]?.count || 0;
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    const revenue = revenueResult[0]?.total || 0;

    const conversionData = conversionResult[0];
    const conversionRate = conversionData?.total
      ? (conversionData.converted / conversionData.total) * 100
      : 0;

    // 성장률 계산
    const prevClients = prevClientsResult[0]?.count || 0;
    const prevReferrals = prevReferralsResult[0]?.count || 0;
    const prevRevenue = prevRevenueResult[0]?.total || 0;

    const clientsGrowth =
      prevClients > 0 ? ((newClients - prevClients) / prevClients) * 100 : 0;
    const referralsGrowth =
      prevReferrals > 0
        ? ((totalReferrals - prevReferrals) / prevReferrals) * 100
        : 0;
    const revenueGrowth =
      prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

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
    };
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return {
      totalClients: 0,
      newClients: 0,
      totalReferrals: 0,
      conversionRate: 0,
      revenue: 0,
      growth: { clients: 0, referrals: 0, revenue: 0 },
    };
  }
}

// 최고 성과자 가져오기
export async function getTopPerformers(
  userId: string,
  limit: number = 5
): Promise<TopPerformer[]> {
  try {
    // 팀 멤버들의 성과 데이터 가져오기
    const performersData = await db
      .select({
        id: profiles.id,
        name: profiles.fullName,
        clientCount: sql<number>`COUNT(${clients.id})`,
        conversions: sql<number>`COUNT(CASE WHEN ${clients.status} = 'active' THEN 1 END)`,
        revenue: sql<number>`COALESCE(SUM(CAST(${clients.insuranceInfo}->>'premium' AS DECIMAL)), 0)`,
      })
      .from(profiles)
      .leftJoin(clients, eq(clients.agentId, profiles.id))
      .where(
        and(
          eq(
            profiles.teamId,
            sql`(SELECT team_id FROM profiles WHERE id = ${userId})`
          ),
          eq(profiles.role, 'agent')
        )
      )
      .groupBy(profiles.id, profiles.fullName)
      .orderBy(
        desc(
          sql`COALESCE(SUM(CAST(${clients.insuranceInfo}->>'premium' AS DECIMAL)), 0)`
        )
      )
      .limit(limit);

    return performersData.map((performer) => ({
      id: performer.id,
      name: performer.name || '이름 없음',
      clients: performer.clientCount || 0,
      conversions: performer.conversions || 0,
      revenue: performer.revenue || 0,
    }));
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}

// 리포트 템플릿 가져오기
export async function getReportTemplates(
  userId: string
): Promise<ReportTemplate[]> {
  try {
    const templates = await db
      .select()
      .from(reportTemplates)
      .where(
        and(
          eq(reportTemplates.userId, userId),
          eq(reportTemplates.isPublic, true)
        )
      )
      .orderBy(desc(reportTemplates.usageCount));

    return templates;
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return [];
  }
}

// 리포트 인스턴스 가져오기
export async function getReportInstances(
  userId: string
): Promise<ReportInstance[]> {
  try {
    const instances = await db
      .select()
      .from(reportInstances)
      .where(eq(reportInstances.userId, userId))
      .orderBy(desc(reportInstances.createdAt))
      .limit(10);

    return instances;
  } catch (error) {
    console.error('Error fetching report instances:', error);
    return [];
  }
}

// 대시보드 가져오기
export async function getDashboards(
  userId: string
): Promise<ReportDashboard[]> {
  try {
    const dashboards = await db
      .select()
      .from(reportDashboards)
      .where(eq(reportDashboards.userId, userId))
      .orderBy(desc(reportDashboards.lastViewed));

    return dashboards;
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return [];
  }
}

// 리포트 통계 가져오기
export async function getReportStats(userId: string): Promise<ReportStats> {
  try {
    const [
      totalReportsResult,
      completedReportsResult,
      failedReportsResult,
      downloadsResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(reportInstances)
        .where(eq(reportInstances.userId, userId)),

      db
        .select({ count: count() })
        .from(reportInstances)
        .where(
          and(
            eq(reportInstances.userId, userId),
            eq(reportInstances.status, 'completed')
          )
        ),

      db
        .select({ count: count() })
        .from(reportInstances)
        .where(
          and(
            eq(reportInstances.userId, userId),
            eq(reportInstances.status, 'failed')
          )
        ),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${reportInstances.downloadCount}), 0)`,
        })
        .from(reportInstances)
        .where(eq(reportInstances.userId, userId)),
    ]);

    return {
      totalReports: totalReportsResult[0]?.count || 0,
      scheduledReports: 0, // TODO: 스케줄된 리포트 계산
      completedReports: completedReportsResult[0]?.count || 0,
      failedReports: failedReportsResult[0]?.count || 0,
      totalDownloads: downloadsResult[0]?.total || 0,
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

// 기본 리포트 템플릿 생성
export async function createDefaultReportTemplates(
  userId: string
): Promise<void> {
  try {
    const existingTemplates = await db
      .select({ count: count() })
      .from(reportTemplates)
      .where(eq(reportTemplates.userId, userId));

    if (existingTemplates[0]?.count > 0) {
      return; // 이미 템플릿이 있으면 생성하지 않음
    }

    const defaultTemplates = [
      {
        userId,
        name: '월간 성과 리포트',
        description: '월간 비즈니스 성과 요약',
        type: 'performance' as const,
        category: 'sales',
        config: {
          title: '월간 성과 리포트',
          dateRange: { type: 'last_month' },
          metrics: ['totalClients', 'newClients', 'revenue', 'conversionRate'],
        },
        isDefault: true,
        isPublic: true,
      },
      {
        userId,
        name: '파이프라인 분석',
        description: '영업 파이프라인 현황 분석',
        type: 'pipeline' as const,
        category: 'analytics',
        config: {
          title: '파이프라인 분석',
          dateRange: { type: 'last_quarter' },
          metrics: ['pipelineValue', 'stageConversion', 'averageDealSize'],
        },
        isDefault: true,
        isPublic: true,
      },
    ];

    await db.insert(reportTemplates).values(defaultTemplates);
  } catch (error) {
    console.error('Error creating default report templates:', error);
  }
}
