// 🏥 SureCRM - 고객 관리 API (N+1 쿼리 최적화 버전)
import { db } from '~/lib/core/db';
import {
  clients,
  insuranceInfo,
  pipelineStages,
  type Client,
  type NewClient,
} from '~/lib/schema/core';
import {
  appClientContactHistory,
  appClientFamilyMembers,
  appClientAnalytics,
  appClientMilestones,
  type AppClientContactHistory,
  type AppClientFamilyMember,
  type AppClientAnalytics,
  type AppClientMilestone,
} from '~/features/clients/lib/schema';
import { eq, and, or, desc, count, sql, ilike } from 'drizzle-orm';

// 🎯 고객 프로필 확장 인터페이스
interface ClientProfile extends Client {
  // 계산 필드들 (런타임에서 계산됨)
  referralCount: number;
  insuranceTypes: string[];
  totalPremium: number;
  currentStage: {
    id: string;
    name: string;
    color: string;
  };
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  lastContactDate?: string;
  nextActionDate?: string;
  upcomingMeeting?: {
    id: string;
    title: string;
    date: string;
  };
  referredBy?: {
    id: string;
    name: string;
    relationship: string;
  };
}

interface GetClientsParams {
  agentId: string;
  teamId?: string;
  page?: number;
  limit?: number;
  search?: string;
  stageId?: string;
  importance?: string;
}

interface GetClientsResponse {
  success: boolean;
  data: ClientProfile[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
}

// 🔍 고객 목록 조회 (최적화된 버전)
export async function getClients(
  params: GetClientsParams
): Promise<GetClientsResponse> {
  const {
    agentId,
    teamId,
    page = 1,
    limit = 20,
    search,
    stageId,
    importance,
  } = params;

  const offset = (page - 1) * limit;

  try {
    // WHERE 조건 구성
    const whereConditions = [eq(clients.agentId, agentId)];

    if (teamId) {
      whereConditions.push(eq(clients.teamId, teamId));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(clients.fullName, `%${search}%`),
          ilike(clients.email, `%${search}%`),
          ilike(clients.phone, `%${search}%`)
        )!
      );
    }

    if (stageId) {
      whereConditions.push(eq(clients.currentStageId, stageId));
    }

    if (importance) {
      whereConditions.push(eq(clients.importance, importance as any));
    }

    // 🚀 최적화된 단일 쿼리 - 모든 관련 데이터를 한 번에 조회
    const clientsWithRelations = await db
      .select({
        // 클라이언트 기본 정보
        client: clients,
        stageName: pipelineStages.name,
        stageColor: pipelineStages.color,
        referrerName: sql<string>`ref_client.full_name`,
        
        // 집계 데이터 - SQL 집계 함수 사용
        referralCount: sql<number>`COUNT(DISTINCT referred_clients.id)`.as('referral_count'),
        insuranceCount: sql<number>`COUNT(DISTINCT ${insuranceInfo.id})`.as('insurance_count'),
        totalPremium: sql<number>`COALESCE(SUM(DISTINCT ${insuranceInfo.premium}::numeric), 0)`.as('total_premium'),
        
        // 보험 타입 배열 (PostgreSQL 배열 집계)
        insuranceTypes: sql<string[]>`
          COALESCE(
            array_agg(DISTINCT ${insuranceInfo.insuranceType}) 
            FILTER (WHERE ${insuranceInfo.insuranceType} IS NOT NULL),
            ARRAY[]::text[]
          )
        `.as('insurance_types'),
        
        // 최근 연락 일자
        lastContactDate: sql<Date | null>`MAX(${appClientContactHistory.createdAt})`.as('last_contact_date'),
        
        // 분석 데이터 - 서브쿼리로 가장 최근 데이터 조회
        engagementScore: sql<number>`
          (SELECT engagement_score FROM app_client_analytics 
           WHERE client_id = ${clients.id} 
           ORDER BY updated_at DESC LIMIT 1)
        `.as('engagement_score'),
        conversionProbability: sql<number>`
          (SELECT conversion_probability FROM app_client_analytics 
           WHERE client_id = ${clients.id} 
           ORDER BY updated_at DESC LIMIT 1)
        `.as('conversion_probability'),
        lifetimeValue: sql<number>`
          (SELECT lifetime_value FROM app_client_analytics 
           WHERE client_id = ${clients.id} 
           ORDER BY updated_at DESC LIMIT 1)
        `.as('lifetime_value'),
        nextActionDate: sql<Date | null>`
          (SELECT updated_at FROM app_client_analytics 
           WHERE client_id = ${clients.id} 
           ORDER BY updated_at DESC LIMIT 1)
        `.as('next_action_date'),
      })
      .from(clients)
      .leftJoin(pipelineStages, eq(clients.currentStageId, pipelineStages.id))
      .leftJoin(
        sql`${clients} AS ref_client`,
        eq(clients.referredById, sql`ref_client.id`)
      )
      .leftJoin(
        sql`${clients} AS referred_clients`,
        eq(sql`referred_clients.referred_by_id`, clients.id)
      )
      .leftJoin(
        insuranceInfo,
        and(
          eq(insuranceInfo.clientId, clients.id),
          eq(insuranceInfo.isActive, true)
        )
      )
      .leftJoin(
        appClientContactHistory,
        eq(appClientContactHistory.clientId, clients.id)
      )
      .where(and(...whereConditions))
      .groupBy(
        clients.id,
        pipelineStages.name,
        pipelineStages.color,
        sql`ref_client.full_name`
      )
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset);

    // 총 개수 조회 (별도 쿼리)
    const [totalResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(and(...whereConditions));

    // 결과 포맷팅
    const enrichedClients: ClientProfile[] = clientsWithRelations.map(row => ({
      ...row.client,
      referralCount: Number(row.referralCount) || 0,
      insuranceTypes: row.insuranceTypes || [],
      totalPremium: Number(row.totalPremium) || 0,
      currentStage: {
        id: row.client.currentStageId,
        name: row.stageName || '미설정',
        color: row.stageColor || '#666666',
      },
      engagementScore: Number(row.engagementScore) || 0,
      conversionProbability: Number(row.conversionProbability) || 0,
      lifetimeValue: Number(row.lifetimeValue) || 0,
      lastContactDate: row.lastContactDate?.toISOString(),
      nextActionDate: row.nextActionDate?.toISOString(),
      upcomingMeeting: undefined, // TODO: 미팅 스케줄링 시스템 연동 시 구현
      referredBy: row.referrerName
        ? {
            id: row.client.referredById!,
            name: row.referrerName,
            relationship: '고객 소개',
          }
        : undefined,
    }));

    console.log(`✅ API: ${enrichedClients.length}명의 고객 조회 완료 (최적화된 쿼리)`);

    return {
      success: true,
      data: enrichedClients,
      total: totalResult.count,
      page,
      totalPages: Math.ceil(totalResult.count / limit),
    };
  } catch (error) {
    console.error('고객 목록 조회 실패:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
      message: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// 나머지 함수들은 기존 파일과 동일...
export * from './clients'; // 다른 함수들은 기존 파일에서 가져옴