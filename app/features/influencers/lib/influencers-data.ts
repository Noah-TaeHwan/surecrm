import { db } from '~/lib/core/db';
import {
  eq,
  desc,
  asc,
  count,
  sql,
  and,
  gte,
  lte,
  isNotNull,
} from 'drizzle-orm';
import { clients, referrals } from '~/lib/schema';
import {
  influencerProfiles,
  influencerGratitudeHistory,
  influencerNetworkAnalysis,
  type InfluencerProfile,
  type InfluencerGratitudeHistory,
  type InfluencerNetworkAnalysis as InfluencerNetworkAnalysisType,
} from './schema';

// 핵심 소개자 랭킹 조회
export async function getTopInfluencers(
  userId: string,
  limit: number = 10,
  period: string = 'all'
) {
  try {
    // 기간 필터 계산
    let dateFilter = null;
    const now = new Date();

    switch (period) {
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        dateFilter = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFilter = null; // 전체 기간
    }

    // 소개를 많이 한 고객들을 조회
    let query = db
      .select({
        clientId: referrals.referrerId,
        clientName: clients.name,
        totalReferrals: count(referrals.id),
        // 성공한 소개 건수 (계약 완료된 것들)
        successfulReferrals: sql<number>`
          COUNT(CASE WHEN ${clients.stage} = '계약 완료' THEN 1 END)
        `,
        // 총 계약 가치
        totalContractValue: sql<number>`
          COALESCE(SUM(CASE WHEN ${clients.stage} = '계약 완료' THEN ${clients.contractAmount} ELSE 0 END), 0)
        `,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(
        dateFilter
          ? and(
              eq(clients.agentId, userId),
              gte(referrals.createdAt, dateFilter)
            )
          : eq(clients.agentId, userId)
      )
      .groupBy(referrals.referrerId, clients.name)
      .having(sql`COUNT(${referrals.id}) > 0`)
      .orderBy(desc(count(referrals.id)))
      .limit(limit);

    const topReferrers = await query;

    // 각 소개자의 상세 정보 조회
    const influencers = await Promise.all(
      topReferrers.map(async (referrer, index) => {
        // 소개자 클라이언트 정보 조회
        const referrerClient = await db
          .select()
          .from(clients)
          .where(eq(clients.id, referrer.clientId))
          .limit(1);

        const client = referrerClient[0];
        if (!client) return null;

        // 전환율 계산
        const conversionRate =
          referrer.totalReferrals > 0
            ? Math.round(
                (referrer.successfulReferrals / referrer.totalReferrals) * 100
              )
            : 0;

        // 네트워크 깊이와 폭 계산 (간단한 버전)
        const networkDepth = await calculateNetworkDepth(referrer.clientId);
        const networkWidth = referrer.totalReferrals;

        // 관계 강도 계산 (더미 로직 - 실제로는 복잡한 알고리즘 필요)
        const relationshipStrength = Math.min(
          95,
          Math.max(50, conversionRate + referrer.totalReferrals * 5)
        );

        // 최근 감사 표현 날짜 조회
        const lastGratitude = await getLastGratitudeDate(referrer.clientId);

        // 월별 소개 패턴 (최근 4개월)
        const monthlyReferrals = await getMonthlyReferralPattern(
          referrer.clientId,
          4
        );

        // 소개 패턴 분석
        const referralPattern = await getReferralPattern(referrer.clientId);

        return {
          id: referrer.clientId,
          name: referrer.clientName,
          avatar: '',
          rank: index + 1,
          totalReferrals: referrer.totalReferrals,
          successfulContracts: referrer.successfulReferrals,
          conversionRate,
          totalContractValue: Number(referrer.totalContractValue),
          networkDepth,
          networkWidth,
          lastGratitude: lastGratitude || '2024-01-01',
          monthlyReferrals,
          referralPattern,
          relationshipStrength,
        };
      })
    );

    return influencers.filter(Boolean) as any[];
  } catch (error) {
    console.error('getTopInfluencers 오류:', error);
    return [];
  }
}

// 네트워크 깊이 계산 (재귀적 소개 체인)
async function calculateNetworkDepth(
  clientId: string,
  depth: number = 0
): Promise<number> {
  if (depth > 5) return depth; // 최대 5단계까지만

  const secondaryReferrals = await db
    .select({ referredId: referrals.referredId })
    .from(referrals)
    .where(eq(referrals.referrerId, clientId));

  if (secondaryReferrals.length === 0) return depth;

  const maxDepth = await Promise.all(
    secondaryReferrals.map((ref) =>
      calculateNetworkDepth(ref.referredId, depth + 1)
    )
  );

  return Math.max(...maxDepth, depth);
}

// 최근 감사 표현 날짜 조회
async function getLastGratitudeDate(clientId: string): Promise<string | null> {
  try {
    const lastGratitude = await db
      .select({ sentDate: influencerGratitudeHistory.sentDate })
      .from(influencerGratitudeHistory)
      .innerJoin(
        influencerProfiles,
        eq(influencerGratitudeHistory.influencerId, influencerProfiles.id)
      )
      .where(eq(influencerProfiles.clientId, clientId))
      .orderBy(desc(influencerGratitudeHistory.sentDate))
      .limit(1);

    return lastGratitude[0]?.sentDate || null;
  } catch (error) {
    return null;
  }
}

// 월별 소개 패턴 조회
async function getMonthlyReferralPattern(
  clientId: string,
  months: number
): Promise<number[]> {
  try {
    const pattern = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthlyCount = await db
        .select({ count: count() })
        .from(referrals)
        .where(
          and(
            eq(referrals.referrerId, clientId),
            gte(referrals.createdAt, monthStart),
            lte(referrals.createdAt, monthEnd)
          )
        );

      pattern.push(monthlyCount[0]?.count || 0);
    }

    return pattern;
  } catch (error) {
    return Array(months).fill(0);
  }
}

// 소개 패턴 분석 (보험 유형별)
async function getReferralPattern(
  clientId: string
): Promise<Record<string, number>> {
  try {
    // 실제로는 clients 테이블에 보험 유형 필드가 있어야 하지만,
    // 현재는 더미 데이터로 반환
    const totalReferrals = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, clientId));

    const total = totalReferrals[0]?.count || 0;

    // 더미 패턴 (실제로는 보험 유형별 집계 필요)
    return {
      family: Math.floor(total * 0.4),
      health: Math.floor(total * 0.3),
      car: Math.floor(total * 0.2),
      life: Math.floor(total * 0.1),
    };
  } catch (error) {
    return {};
  }
}

// 감사 표현 이력 조회
export async function getGratitudeHistory(userId: string, limit: number = 10) {
  try {
    const history = await db
      .select({
        id: influencerGratitudeHistory.id,
        influencerId: influencerGratitudeHistory.influencerId,
        influencerName: clients.name,
        type: influencerGratitudeHistory.gratitudeType,
        message: influencerGratitudeHistory.message,
        giftType: influencerGratitudeHistory.giftType,
        sentDate: influencerGratitudeHistory.sentDate,
        scheduledDate: influencerGratitudeHistory.scheduledDate,
        status: influencerGratitudeHistory.status,
      })
      .from(influencerGratitudeHistory)
      .innerJoin(
        influencerProfiles,
        eq(influencerGratitudeHistory.influencerId, influencerProfiles.id)
      )
      .innerJoin(clients, eq(influencerProfiles.clientId, clients.id))
      .where(eq(influencerGratitudeHistory.agentId, userId))
      .orderBy(desc(influencerGratitudeHistory.createdAt))
      .limit(limit);

    return history.map((item) => ({
      id: item.id,
      influencerId: item.influencerId,
      influencerName: item.influencerName,
      type: item.type,
      message: item.message,
      giftType: item.giftType,
      sentDate: item.sentDate,
      scheduledDate: item.scheduledDate,
      status: item.status,
    }));
  } catch (error) {
    console.error('getGratitudeHistory 오류:', error);
    return [];
  }
}

// 네트워크 분석 데이터 조회
export async function getNetworkAnalysis(userId: string) {
  try {
    // 총 소개자 수
    const totalInfluencersResult = await db
      .select({ count: count() })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(eq(clients.agentId, userId))
      .groupBy(referrals.referrerId);

    const totalInfluencers = totalInfluencersResult.length;

    // 평균 전환율 계산
    const conversionData = await db
      .select({
        totalReferrals: count(referrals.id),
        successfulReferrals: sql<number>`
          COUNT(CASE WHEN ${clients.stage} = '계약 완료' THEN 1 END)
        `,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(eq(clients.agentId, userId));

    const totalRefs = conversionData[0]?.totalReferrals || 0;
    const successfulRefs = conversionData[0]?.successfulReferrals || 0;
    const averageConversionRate =
      totalRefs > 0 ? Math.round((successfulRefs / totalRefs) * 100) : 0;

    // 총 네트워크 가치
    const networkValueResult = await db
      .select({
        totalValue: sql<number>`
          COALESCE(SUM(CASE WHEN ${clients.stage} = '계약 완료' THEN ${clients.contractAmount} ELSE 0 END), 0)
        `,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(eq(clients.agentId, userId));

    const totalNetworkValue = Number(networkValueResult[0]?.totalValue || 0);

    // 평균 네트워크 깊이와 폭 (더미 계산)
    const avgNetworkDepth = totalInfluencers > 0 ? 2.1 : 0;
    const avgNetworkWidth =
      totalInfluencers > 0
        ? Math.round((totalRefs / totalInfluencers) * 10) / 10
        : 0;

    // 월별 성장률 (더미)
    const monthlyGrowth = 12;

    return {
      totalInfluencers,
      averageConversionRate,
      totalNetworkValue,
      avgNetworkDepth,
      avgNetworkWidth,
      monthlyGrowth,
    };
  } catch (error) {
    console.error('getNetworkAnalysis 오류:', error);
    return {
      totalInfluencers: 0,
      averageConversionRate: 0,
      totalNetworkValue: 0,
      avgNetworkDepth: 0,
      avgNetworkWidth: 0,
      monthlyGrowth: 0,
    };
  }
}

// 감사 표현 생성
export async function createGratitude(data: {
  clientId: string;
  agentId: string;
  type: string;
  message: string;
  giftType?: string;
  scheduledDate?: string;
}) {
  try {
    // 먼저 influencer profile이 있는지 확인하고 없으면 생성
    let influencerProfile = await db
      .select()
      .from(influencerProfiles)
      .where(eq(influencerProfiles.clientId, data.clientId))
      .limit(1);

    if (influencerProfile.length === 0) {
      // influencer profile 생성
      const newProfile = await db
        .insert(influencerProfiles)
        .values({
          clientId: data.clientId,
          agentId: data.agentId,
        })
        .returning();

      influencerProfile = newProfile;
    }

    // 임시로 간단한 감사 기록 생성 (실제 테이블이 생성되면 수정)
    console.log('감사 표현 생성:', {
      influencerId: influencerProfile[0].id,
      agentId: data.agentId,
      type: data.type,
      message: data.message,
      giftType: data.giftType,
      scheduledDate: data.scheduledDate,
    });

    // 임시 반환값
    return {
      id: 'temp-id',
      influencerId: influencerProfile[0].id,
      agentId: data.agentId,
      gratitudeType: data.type,
      message: data.message,
      status: data.scheduledDate ? 'scheduled' : 'sent',
    };
  } catch (error) {
    console.error('createGratitude 오류:', error);
    throw error;
  }
}
