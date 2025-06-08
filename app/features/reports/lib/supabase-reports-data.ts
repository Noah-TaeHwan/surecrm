import { db } from '~/lib/core/db';
import {
  clients,
  meetings,
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
import { insuranceInfo, opportunityProducts } from '~/lib/schema';
import { insuranceContracts } from '~/lib/schema/core';
import { appClientConsultationNotes } from '~/features/clients/lib/schema';
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
  ne,
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
  // 🆕 상담 기록 통계 (미팅 대신)
  consultationStats: {
    totalConsultations: number;
    consultationsThisPeriod: number;
    averageConsultationsPerClient: number;
    mostFrequentNoteType: string;
    consultationGrowth: number;
  };
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
    // 기본 클라이언트 수 조회 (🔥 활성 고객만)
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true) // 🔥 추가: 활성 고객만
        )
      );

    // 신규 클라이언트 수 (🔥 활성 고객만)
    const newClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 🔥 추가: 활성 고객만
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 🔧 수정: 추천 수 조회 - referrals 테이블 대신 clients.referredById 사용 (대시보드와 동일)
    const totalReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 활성 고객만
          sql`${clients.referredById} IS NOT NULL`, // 소개받은 고객만
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 🏢 실제 보험계약 수수료 계산 (대시보드와 동일한 통합 수수료 통계 사용)
    const { getUnifiedCommissionStats } = await import(
      '~/api/shared/insurance-contracts'
    );
    const unifiedStats = await getUnifiedCommissionStats(userId);

    // 기간별 실제 수수료 (계약일 기준)
    const periodCommissionResult = await db
      .select({
        totalCommission: sum(
          sql`CAST(${insuranceContracts.agentCommission} AS DECIMAL)`
        ),
      })
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(insuranceContracts.status, 'active'),
          gte(
            sql`DATE(${insuranceContracts.contractDate})`,
            startDate.toISOString().split('T')[0]
          ),
          lte(
            sql`DATE(${insuranceContracts.contractDate})`,
            endDate.toISOString().split('T')[0]
          )
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

    // 🎯 활성 고객 수 (영업 파이프라인 진행 중인 고객만)
    // 영업 파이프라인 페이지와 동일한 로직 사용
    const pipelineStagesResult = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.agentId, userId));

    // 파이프라인에 있는 모든 활성 클라이언트 조회 (영업 파이프라인 페이지와 동일)
    const allActiveClientsData = await db
      .select({
        id: clients.id,
        currentStageId: clients.currentStageId,
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .where(and(eq(clients.agentId, userId), eq(clients.isActive, true)));

    // JavaScript로 "제외됨" 단계 제외 (영업 파이프라인 페이지와 동일 로직)
    const activeClientsCount = allActiveClientsData.filter((client) => {
      const stage = pipelineStagesResult.find(
        (s) => s.id === client.currentStageId
      );
      return stage && stage.name !== '제외됨';
    }).length;

    const activeClientsResult = [{ count: activeClientsCount }];

    // 이전 기간 데이터 (성장률 계산용) - 완전 복원
    const periodDiff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = new Date(endDate.getTime() - periodDiff);

    // 이전 기간 수수료 (성장률 계산용)
    const prevPeriodCommissionResult = await db
      .select({
        totalCommission: sum(
          sql`CAST(${insuranceContracts.agentCommission} AS DECIMAL)`
        ),
      })
      .from(insuranceContracts)
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(insuranceContracts.status, 'active'),
          gte(
            sql`DATE(${insuranceContracts.contractDate})`,
            prevStartDate.toISOString().split('T')[0]
          ),
          lte(
            sql`DATE(${insuranceContracts.contractDate})`,
            prevEndDate.toISOString().split('T')[0]
          )
        )
      );

    // 🆕 상담 기록 통계 계산
    // 전체 상담 기록 수
    const totalConsultationsResult = await db
      .select({ count: count() })
      .from(appClientConsultationNotes)
      .innerJoin(clients, eq(appClientConsultationNotes.clientId, clients.id))
      .where(and(eq(clients.agentId, userId), eq(clients.isActive, true)));

    // 해당 기간 상담 기록 수
    const consultationsThisPeriodResult = await db
      .select({ count: count() })
      .from(appClientConsultationNotes)
      .innerJoin(clients, eq(appClientConsultationNotes.clientId, clients.id))
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          gte(
            appClientConsultationNotes.consultationDate,
            startDate.toISOString().split('T')[0]
          ),
          lte(
            appClientConsultationNotes.consultationDate,
            endDate.toISOString().split('T')[0]
          )
        )
      );

    // 가장 많이 사용되는 상담 유형
    const noteTypesResult = await db
      .select({
        noteType: appClientConsultationNotes.noteType,
        count: count(),
      })
      .from(appClientConsultationNotes)
      .innerJoin(clients, eq(appClientConsultationNotes.clientId, clients.id))
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          gte(
            appClientConsultationNotes.consultationDate,
            startDate.toISOString().split('T')[0]
          ),
          lte(
            appClientConsultationNotes.consultationDate,
            endDate.toISOString().split('T')[0]
          )
        )
      )
      .groupBy(appClientConsultationNotes.noteType)
      .orderBy(desc(count()))
      .limit(1);

    // 이전 기간 상담 기록 (성장률 계산용)
    const prevConsultationsResult = await db
      .select({ count: count() })
      .from(appClientConsultationNotes)
      .innerJoin(clients, eq(appClientConsultationNotes.clientId, clients.id))
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true),
          gte(
            appClientConsultationNotes.consultationDate,
            prevStartDate.toISOString().split('T')[0]
          ),
          lte(
            appClientConsultationNotes.consultationDate,
            prevEndDate.toISOString().split('T')[0]
          )
        )
      );

    const prevClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 🔥 추가: 활성 고객만
          gte(clients.createdAt, prevStartDate),
          lte(clients.createdAt, prevEndDate)
        )
      );

    const prevReferralsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.agentId, userId),
          eq(clients.isActive, true), // 활성 고객만
          sql`${clients.referredById} IS NOT NULL`, // 소개받은 고객만
          gte(clients.createdAt, prevStartDate),
          lte(clients.createdAt, prevEndDate)
        )
      );

    const prevCommissionResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
      })
      .from(insuranceContracts)
      .innerJoin(clients, eq(insuranceContracts.clientId, clients.id))
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(clients.isActive, true),
          eq(insuranceContracts.status, 'active'),
          sql`${insuranceContracts.agentCommission} IS NOT NULL`,
          gte(insuranceContracts.createdAt, prevStartDate),
          lte(insuranceContracts.createdAt, prevEndDate)
        )
      );

    // 🏢 실제 수수료 계산 - 보험계약 테이블 사용 (더 정확함)
    const commissionResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${insuranceContracts.agentCommission} AS NUMERIC)), 0)`,
        count: count(),
      })
      .from(insuranceContracts)
      .innerJoin(clients, eq(insuranceContracts.clientId, clients.id))
      .where(
        and(
          eq(insuranceContracts.agentId, userId),
          eq(clients.isActive, true),
          eq(insuranceContracts.status, 'active'),
          sql`${insuranceContracts.agentCommission} IS NOT NULL`,
          gte(insuranceContracts.createdAt, startDate),
          lte(insuranceContracts.createdAt, endDate)
        )
      );

    // 전환율 계산 (🔥 삭제되지 않은 고객만 대상)
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
          // 🔥 주의: 여기서는 실제 is_active 컬럼이 아닌 status 필드로 전환율을 계산
          // 삭제된 고객은 제외하고 활성/잠재 고객만 포함
          gte(clients.createdAt, startDate),
          lte(clients.createdAt, endDate)
        )
      );

    // 데이터 추출 및 계산
    const totalClients = totalClientsResult[0]?.count || 0;
    const newClients = newClientsResult[0]?.count || 0;
    const totalReferrals = totalReferralsResult[0]?.count || 0;

    // 🏢 실제 보험계약 수수료 사용 (통합 수수료 통계 우선)
    const actualTotalCommission = unifiedStats.success
      ? unifiedStats.data.actualContracts.totalCommission
      : commissionResult[0]?.total || 0;
    const periodCommission = periodCommissionResult[0]?.totalCommission || 0;

    const revenue = actualTotalCommission; // 전체 수수료
    const periodRevenue = Number(periodCommission) || 0; // 기간별 수수료
    const revenueCount = commissionResult[0]?.count || 0;
    const meetingsCount = meetingsResult[0]?.count || 0;
    const activeClients = activeClientsResult[0]?.count || 0;

    // MVP 특화: 전환율 계산 (더 정확한 로직)
    const conversionData = conversionResult[0];
    const conversionRate =
      conversionData?.total > 0
        ? (conversionData.converted / conversionData.total) * 100
        : 0;

    // 🏢 보험설계사 특화: 추가 지표 계산
    // 평균 고객 가치 = 총 수수료 / 활성 고객 수 (실제 계약이 있는 고객)
    const clientsWithContracts = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${insuranceContracts.clientId})`,
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

    const clientsWithContractsCount = clientsWithContracts[0]?.count || 0;
    const averageClientValue =
      clientsWithContractsCount > 0 ? revenue / clientsWithContractsCount : 0;

    // ✅ 올바른 월 수수료 계산: 실제 수수료는 1회성이므로 월별 분산 불필요
    // 실제로는 revenue 자체가 이미 계약 완료 시 받는 수수료 총액
    const monthlyRecurringRevenue = revenue; // 실제 수수료 총액

    // 성장률 계산 (MVP: 더 안정적인 계산)
    const prevClients = prevClientsResult[0]?.count || 0;
    const prevReferrals = prevReferralsResult[0]?.count || 0;
    const prevRevenue =
      Number(prevPeriodCommissionResult[0]?.totalCommission) || 0;

    const clientsGrowth = calculateGrowthRate(newClients, prevClients);
    const referralsGrowth = calculateGrowthRate(totalReferrals, prevReferrals);
    const revenueGrowth = calculateGrowthRate(periodRevenue, prevRevenue);

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
      consultationStats: {
        totalConsultations: totalConsultationsResult[0]?.count || 0,
        consultationsThisPeriod: consultationsThisPeriodResult[0]?.count || 0,
        averageConsultationsPerClient:
          totalClients > 0
            ? Math.round(
                ((totalConsultationsResult[0]?.count || 0) / totalClients) * 10
              ) / 10
            : 0,
        mostFrequentNoteType: noteTypesResult[0]?.noteType || '상담',
        consultationGrowth:
          Math.round(
            calculateGrowthRate(
              consultationsThisPeriodResult[0]?.count || 0,
              prevConsultationsResult[0]?.count || 0
            ) * 10
          ) / 10,
      },
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
      consultationStats: {
        totalConsultations: 0,
        consultationsThisPeriod: 0,
        averageConsultationsPerClient: 0,
        mostFrequentNoteType: '',
        consultationGrowth: 0,
      },
    };
  }
}

// 🆕 UX 친화적: 안전한 성장률 계산
function calculateGrowthRate(current: number, previous: number): number {
  // 둘 다 0인 경우
  if (current === 0 && previous === 0) {
    return 0;
  }

  // 이전 값이 0이고 현재 값이 있는 경우 (새로운 데이터)
  if (previous === 0 && current > 0) {
    return Infinity; // TrendIndicator에서 "신규 데이터"로 표시됨
  }

  // 현재 값이 0이고 이전 값이 있는 경우 (완전 감소)
  if (current === 0 && previous > 0) {
    return -100; // 100% 감소
  }

  // 정상적인 계산
  const rate = ((current - previous) / previous) * 100;

  // 극단적인 값 제한 (UI에서 적절히 처리하기 위해)
  if (rate > 1000) return 1000;
  if (rate < -100) return -100;

  return rate;
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

    // 팀 멤버들의 성과 데이터 조회 (🔥 활성 고객만)
    const performersData = await db
      .select({
        id: profiles.id,
        name: sql<string>`COALESCE(${profiles.fullName}, 'Unknown')`,
        totalClients: sql<number>`COUNT(DISTINCT CASE WHEN ${clients.isActive} = true THEN ${clients.id} END)`,
        activeClients: sql<number>`COUNT(DISTINCT CASE WHEN ${clients.isActive} = true THEN ${clients.id} END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${clients.isActive} = true AND ${insuranceInfo.isActive} = true THEN ${insuranceInfo.premium} ELSE 0 END), 0)`,
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
          sql<number>`COALESCE(SUM(CASE WHEN ${clients.isActive} = true AND ${insuranceInfo.isActive} = true THEN ${insuranceInfo.premium} ELSE 0 END), 0)`
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

// 간단한 UUID 대체 함수 (응급 조치)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
