import { db } from '~/lib/core/db';
import {
  eq,
  desc,
  asc,
  count,
  sum,
  avg,
  sql,
  and,
  gte,
  lte,
  isNotNull,
  gt,
  lt,
  or,
  inArray,
} from 'drizzle-orm';
import { clients, referrals, profiles } from '~/lib/schema';
import {
  appInfluencerProfiles,
  appInfluencerGratitudeHistory,
  appInfluencerNetworkAnalysis,
  appInfluencerActivityLogs,
  appInfluencerGratitudeTemplates,
  type InfluencerProfile,
  type InfluencerGratitudeHistory,
  type InfluencerNetworkAnalysis,
  type InfluencerGratitudeType,
  type InfluencerGiftType,
  type NewInfluencerGratitudeHistory,
  type NewInfluencerActivityLog,
} from './schema';

// 새로운 타입 시스템 import
import type {
  InfluencerDisplayData,
  NetworkAnalysisDisplayData,
  GratitudeHistoryDisplayItem,
  GratitudeFormData,
  InfluencerKPIData,
  PeriodFilter,
  AdvancedFilter,
  InfluencerAPIResponse,
} from '../types';

// 🎯 Cache 관리 (성능 최적화)
const CACHE_TTL = 5 * 60 * 1000; // 5분
const dataCache = new Map<string, { data: any; timestamp: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  dataCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

// 🎯 핵심 소개자 랭킹 조회 (완전 리뉴얼)
export async function getTopInfluencers(
  userId: string,
  limit: number = 10,
  period: string = 'all'
): Promise<InfluencerDisplayData[]> {
  const cacheKey = `top_influencers_${userId}_${limit}_${period}`;

  // 캐시 확인
  const cached = getCachedData<InfluencerDisplayData[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    console.log('현재 사용자 ID 조회:', userId);

    // 🗓️ 기간 필터 계산 (확장된 옵션)
    const dateFilter = calculateDateFilter(period);

    // 📊 핵심 소개자 기본 데이터 조회 (수정된 쿼리)
    const baseQuery = db
      .select({
        clientId: referrals.referrerId,
        clientName: clients.fullName,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        totalReferrals: count(referrals.id),
        successfulReferrals: sql<number>`
          COUNT(CASE 
            WHEN ${clients.currentStageId} IN (
              SELECT id FROM app_pipeline_stages 
              WHERE name IN ('계약체결', '완료')
            ) 
            THEN 1 
            END)
        `,
        lastReferralDate: sql<Date>`MAX(${referrals.createdAt})`,
        firstReferralDate: sql<Date>`MIN(${referrals.createdAt})`,
      })
      .from(referrals)
      .innerJoin(clients, eq(referrals.referredId, clients.id))
      .where(
        and(
          eq(clients.agentId, userId),
          isNotNull(referrals.referrerId),
          dateFilter ? gte(referrals.createdAt, dateFilter) : sql`1=1`
        )
      )
      .groupBy(
        referrals.referrerId,
        clients.fullName,
        clients.phone,
        clients.email
      )
      .having(sql`COUNT(${referrals.id}) > 0`)
      .orderBy(
        desc(count(referrals.id)),
        desc(sql<number>`COUNT(CASE 
          WHEN ${clients.currentStageId} IN (
            SELECT id FROM app_pipeline_stages 
            WHERE name IN ('계약체결', '완료')
          ) 
          THEN 1 
          END)`)
      )
      .limit(limit);

    const topReferrers = await baseQuery;

    if (topReferrers.length === 0) {
      return [];
    }

    const clientIds = topReferrers.map((r) => r.clientId);

    // 🔄 병렬로 추가 데이터 조회 (성능 최적화)
    const [
      influencerProfiles,
      gratitudeHistory,
      monthlyReferrals,
      networkData,
      activityLogs,
    ] = await Promise.all([
      // 영향력자 프로필 정보
      getInfluencerProfiles(clientIds),

      // 최근 감사 표현 이력
      getRecentGratitudeHistory(clientIds),

      // 월별 소개 패턴 (최근 12개월)
      getMonthlyReferralPatterns(clientIds, 12),

      // 네트워크 데이터 (깊이, 폭)
      getNetworkDataForClients(clientIds),

      // 최근 활동 로그
      getRecentActivityLogs(clientIds),
    ]);

    // 🎨 영향력자 데이터 매핑 및 조합 (향상된 로직)
    const influencers: InfluencerDisplayData[] = await Promise.all(
      topReferrers.map(async (referrer, index) => {
        const profile = influencerProfiles.find(
          (p) => p.clientId === referrer.clientId
        );
        const gratitude = gratitudeHistory.find(
          (g) => g.clientId === referrer.clientId
        );
        const network = networkData.find(
          (n) => n.clientId === referrer.clientId
        );
        const monthly = monthlyReferrals.find(
          (m) => m.clientId === referrer.clientId
        );
        const activities = activityLogs.filter(
          (a) => a.clientId === referrer.clientId
        );

        // 💎 전환율 계산
        const conversionRate =
          Number(referrer.totalReferrals) > 0
            ? (Number(referrer.successfulReferrals) /
                Number(referrer.totalReferrals)) *
              100
            : 0;

        // 💪 관계 강도 계산 (다면적 분석)
        const relationshipStrength = calculateEnhancedRelationshipStrength(
          Number(referrer.totalReferrals),
          conversionRate,
          Number(profile?.totalContractValue || 0),
          referrer.lastReferralDate,
          gratitude?.lastGratitudeDate || null,
          activities.length
        );

        // 🏆 Tier 결정 (개선된 알고리즘)
        const tier = determineTierFromScore(
          conversionRate,
          Number(referrer.totalReferrals),
          relationshipStrength
        );

        // 📊 데이터 품질 점수 계산
        const dataQuality = calculateDataQuality(
          referrer,
          profile,
          gratitude,
          network
        );

        return {
          id: referrer.clientId,
          name: referrer.clientName || '이름 없음',
          avatar: '', // 기본값으로 빈 문자열 설정
          rank: index + 1,
          totalReferrals: referrer.totalReferrals,
          successfulContracts: referrer.successfulReferrals,
          conversionRate,
          totalContractValue: Number(profile?.totalContractValue || 0),
          averageContractValue: Number(profile?.averageContractValue || 0),
          networkDepth: network?.depth || 0,
          networkWidth: network?.width || 0,
          relationshipStrength,
          lastGratitude: gratitude?.lastGratitudeDate?.toISOString() || null,
          lastReferralDate: referrer.lastReferralDate?.toISOString() || null,
          tier,
          monthlyReferrals:
            monthly?.monthlyData?.map((item: any) => item.count) ||
            Array(12).fill(0),
          referralPattern:
            monthly?.monthlyData?.reduce((acc: any, item: any) => {
              acc[item.month] = item.count;
              return acc;
            }, {}) || {},
          isActive: profile?.isActive ?? true,
          contactMethod: profile?.preferredContactMethod || 'phone',
          specialNotes: profile?.specialNotes || '',
          dataQuality: {
            isVerified: profile?.isDataVerified || false,
            score: dataQuality.score,
            lastUpdated:
              profile?.lastCalculatedAt?.toISOString() ||
              new Date().toISOString(),
          },
        };
      })
    );

    // 💾 캐시 저장
    setCachedData(cacheKey, influencers);

    return influencers;
  } catch (error) {
    console.error('핵심 소개자 조회 오류:', error);
    throw new Error('핵심 소개자 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

// 🔄 향상된 네트워크 분석 (실시간 계산 최적화)
export async function getNetworkAnalysis(
  userId: string
): Promise<NetworkAnalysisDisplayData> {
  const cacheKey = `network_analysis_${userId}`;

  // 캐시 확인
  const cached = getCachedData<NetworkAnalysisDisplayData>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 🔄 병렬로 모든 네트워크 지표 계산
    const [
      totalInfluencers,
      activeInfluencers,
      conversionStats,
      networkValue,
      networkMetrics,
      gratitudeStats,
      trends,
    ] = await Promise.all([
      // 총 소개자 수
      getTotalInfluencersCount(userId),

      // 활성 소개자 수 (최근 3개월 활동)
      getActiveInfluencersCount(userId),

      // 전환율 통계
      getConversionStatistics(userId),

      // 네트워크 가치
      getTotalNetworkValue(userId),

      // 네트워크 깊이/폭 지표
      getNetworkMetrics(userId),

      // 감사 표현 통계
      getGratitudeStatistics(userId),

      // 트렌드 데이터
      getAllTrends(userId),
    ]);

    const analysisData: NetworkAnalysisDisplayData = {
      totalInfluencers: totalInfluencers.count,
      activeInfluencers: activeInfluencers.count,
      averageConversionRate: conversionStats.average,
      totalNetworkValue: networkValue.total,
      avgNetworkDepth: networkMetrics.avgDepth,
      avgNetworkWidth: networkMetrics.avgWidth,
      monthlyGrowth: calculateMonthlyGrowthRate(trends.referrals),
      averageRelationshipStrength: networkMetrics.avgRelationshipStrength,
      totalGratitudesSent: gratitudeStats.totalSent,
      averageGratitudeFrequency: gratitudeStats.averageFrequency,
      dataQualityScore: await calculateOverallDataQuality(userId),
      confidenceLevel: calculateConfidenceLevel(
        totalInfluencers.count,
        activeInfluencers.count
      ),
      lastCalculated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      overallNetworkStrength: networkMetrics.avgRelationshipStrength,
      networkGrowthRate: calculateMonthlyGrowthRate(trends.referrals),
      averageReferralsPerInfluencer:
        totalInfluencers.count > 0
          ? trends.referrals.reduce((sum, t) => sum + t.count, 0) /
            totalInfluencers.count
          : 0,
      maxNetworkDepth: Math.max(networkMetrics.avgDepth, 1),
      totalSecondDegreeConnections: Math.floor(
        networkMetrics.avgWidth * networkMetrics.avgDepth
      ),
      strongConnections: Math.floor(activeInfluencers.count * 0.7),
      conversionRate: conversionStats.average,
      averageContractValue:
        networkValue.total > 0 && totalInfluencers.count > 0
          ? networkValue.total / totalInfluencers.count
          : 0,
      trends: {
        referrals: trends.referrals.map((t) => ({
          month: t.month,
          count: t.count,
        })),
        conversions: trends.conversions.map((t) => ({
          month: t.month,
          rate: t.rate,
        })),
        value: trends.value.map((t) => ({ month: t.month, amount: t.amount })),
        gratitude: trends.gratitude.map((t) => ({
          month: t.month,
          sent: t.sent,
        })),
      },
      monthlyTrends: trends.referrals.map((t) => ({
        month: t.month,
        count: t.count,
      })),
    };

    // 💾 캐시 저장 및 DB 저장
    setCachedData(cacheKey, analysisData);
    await saveNetworkAnalysisCache(userId, analysisData);

    return analysisData;
  } catch (error) {
    console.error('네트워크 분석 오류:', error);
    throw new Error('네트워크 분석 데이터를 계산하는 중 오류가 발생했습니다.');
  }
}

// 🎁 Enhanced 감사 표현 이력 조회
export async function getGratitudeHistory(
  userId: string,
  limit: number = 10
): Promise<GratitudeHistoryDisplayItem[]> {
  const cacheKey = `gratitude_history_${userId}_${limit}`;

  try {
    const gratitudeData = await db
      .select({
        id: appInfluencerGratitudeHistory.id,
        influencerId: appInfluencerGratitudeHistory.influencerId,
        influencerName: clients.fullName,
        type: appInfluencerGratitudeHistory.gratitudeType,
        giftType: appInfluencerGratitudeHistory.giftType,
        title: appInfluencerGratitudeHistory.title,
        message: appInfluencerGratitudeHistory.message,
        personalizedMessage: appInfluencerGratitudeHistory.personalizedMessage,
        scheduledDate: appInfluencerGratitudeHistory.scheduledDate,
        sentDate: appInfluencerGratitudeHistory.sentDate,
        deliveredDate: appInfluencerGratitudeHistory.deliveredDate,
        status: appInfluencerGratitudeHistory.status,
        cost: appInfluencerGratitudeHistory.cost,
        vendor: appInfluencerGratitudeHistory.vendor,
        trackingNumber: appInfluencerGratitudeHistory.trackingNumber,
        recipientFeedback: appInfluencerGratitudeHistory.recipientFeedback,
        deliveryConfirmed: appInfluencerGratitudeHistory.deliveryConfirmed,
        isRecurring: appInfluencerGratitudeHistory.isRecurring,
        nextScheduledDate: appInfluencerGratitudeHistory.nextScheduledDate,
        createdAt: appInfluencerGratitudeHistory.createdAt,
      })
      .from(appInfluencerGratitudeHistory)
      .innerJoin(
        appInfluencerProfiles,
        eq(appInfluencerGratitudeHistory.influencerId, appInfluencerProfiles.id)
      )
      .innerJoin(clients, eq(appInfluencerProfiles.clientId, clients.id))
      .where(eq(appInfluencerGratitudeHistory.agentId, userId))
      .orderBy(desc(appInfluencerGratitudeHistory.createdAt))
      .limit(limit);

    return gratitudeData.map((item) => ({
      id: item.id,
      influencerId: item.influencerId,
      influencerName: item.influencerName || '이름 없음',
      influencerAvatar: undefined, // 기본값으로 undefined 설정
      type: item.type as InfluencerGratitudeType,
      typeLabel: getGratitudeTypeLabel(item.type as InfluencerGratitudeType),
      giftType: item.giftType as InfluencerGiftType | undefined,
      giftTypeLabel: item.giftType
        ? getGiftTypeLabel(item.giftType as InfluencerGiftType)
        : undefined,
      title: item.title,
      scheduledDate: item.scheduledDate || null,
      sentDate: item.sentDate || null,
      deliveredDate: item.deliveredDate || null,
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      cost: Number(item.cost || 0),
      message: item.message || '',
      personalizedMessage: item.personalizedMessage || undefined,
      vendor: item.vendor || undefined,
      trackingNumber: item.trackingNumber || undefined,
      recipientFeedback: item.recipientFeedback || undefined,
      deliveryConfirmed: item.deliveryConfirmed || false,
      isRecurring: item.isRecurring || false,
      nextScheduledDate: item.nextScheduledDate || undefined,
      sentiment: analyzeSentiment(item.recipientFeedback),
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('감사 표현 이력 조회 오류:', error);
    throw new Error('감사 표현 이력을 가져오는 중 오류가 발생했습니다.');
  }
}

// 🎁 Enhanced 감사 표현 생성 (트랜잭션 처리)
export async function createGratitude(
  data: GratitudeFormData
): Promise<InfluencerAPIResponse> {
  try {
    // 📝 입력 데이터 검증
    const validation = validateGratitudeData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(', '),
      };
    }

    // 🔍 영향력자 프로필 확인
    const influencerProfile = await db
      .select()
      .from(appInfluencerProfiles)
      .where(eq(appInfluencerProfiles.id, data.influencerId))
      .limit(1);

    if (influencerProfile.length === 0) {
      return {
        success: false,
        error: '해당 영향력자를 찾을 수 없습니다.',
      };
    }

    // 💾 트랜잭션으로 감사 표현 생성
    const result = await db.transaction(async (tx) => {
      // 감사 표현 이력 생성
      const newGratitude: NewInfluencerGratitudeHistory = {
        influencerId: data.influencerId,
        agentId: influencerProfile[0].agentId,
        gratitudeType: data.type,
        giftType: data.giftType || 'none',
        title: data.title,
        message: data.message,
        personalizedMessage: data.personalizedMessage,
        scheduledDate: data.scheduledDate
          ? data.scheduledDate.toISOString().split('T')[0]
          : null,
        cost: data.cost ? data.cost.toString() : '0',
        vendor: data.vendor,
        isRecurring: data.isRecurring || false,
        nextScheduledDate:
          data.isRecurring && data.recurringInterval
            ? new Date(
                Date.now() + data.recurringInterval * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split('T')[0]
            : null,
        status: data.scheduledDate ? 'scheduled' : 'sent',
        sentDate: data.scheduledDate
          ? null
          : new Date().toISOString().split('T')[0],
        metadata: data.deliveryInfo
          ? JSON.stringify({ deliveryInfo: data.deliveryInfo })
          : null,
      };

      const [gratitudeRecord] = await tx
        .insert(appInfluencerGratitudeHistory)
        .values(newGratitude)
        .returning();

      // 📝 활동 로그 생성 (스키마에 맞는 필드 사용)
      await tx.insert(appInfluencerActivityLogs).values({
        influencerId: data.influencerId,
        agentId: gratitudeRecord.agentId,
        activityType: 'gratitude_sent',
        title: `감사 표현 전송: ${data.title}`,
        description: `${data.type} 타입의 감사 표현을 전송했습니다.`,
        entityType: 'gratitude',
        entityId: gratitudeRecord.id,
        impact: 'positive',
        metadata: JSON.stringify({
          gratitudeType: data.type,
          giftType: data.giftType,
          cost: data.cost,
          vendor: data.vendor,
        }),
      });

      // 영향력자 프로필 업데이트 (마지막 감사 날짜)
      try {
        await tx
          .update(appInfluencerProfiles)
          .set({
            lastGratitudeDate: new Date().toISOString().split('T')[0],
            lastContactDate: new Date().toISOString().split('T')[0],
            updatedAt: new Date(),
          })
          .where(eq(appInfluencerProfiles.id, data.influencerId));
      } catch (updateError) {
        console.warn('프로필 업데이트 실패:', updateError);
      }

      return gratitudeRecord;
    });

    // 🧹 캐시 무효화
    invalidateUserCaches(influencerProfile[0].agentId);

    return {
      success: true,
      message: '감사 표현이 성공적으로 전송되었습니다.',
      data: { id: result.id },
    };
  } catch (error) {
    console.error('감사 표현 생성 오류:', error);
    return {
      success: false,
      error: '감사 표현 전송 중 오류가 발생했습니다.',
    };
  }
}

// 🛠️ Helper Functions (성능 최적화 및 기능 강화)

// 📅 날짜 필터 계산
function calculateDateFilter(period: string): Date | null {
  const now = new Date();

  switch (period) {
    case 'last7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last3months':
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), quarterStart, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

// 🔍 영향력자 프로필 조회
async function getInfluencerProfiles(clientIds: string[]) {
  if (clientIds.length === 0) return [];

  try {
    return await db
      .select()
      .from(appInfluencerProfiles)
      .where(inArray(appInfluencerProfiles.clientId, clientIds));
  } catch (error) {
    console.error('영향력자 프로필 조회 오류:', error);
    return [];
  }
}

// 🎁 최근 감사 표현 이력 조회
async function getRecentGratitudeHistory(clientIds: string[]) {
  if (clientIds.length === 0) return [];

  try {
    return await db
      .select({
        clientId: appInfluencerProfiles.clientId,
        lastGratitudeDate: sql<Date>`MAX(${appInfluencerGratitudeHistory.sentDate})`,
      })
      .from(appInfluencerGratitudeHistory)
      .innerJoin(
        appInfluencerProfiles,
        eq(appInfluencerGratitudeHistory.influencerId, appInfluencerProfiles.id)
      )
      .where(inArray(appInfluencerProfiles.clientId, clientIds))
      .groupBy(appInfluencerProfiles.clientId);
  } catch (error) {
    console.error('감사 표현 이력 조회 오류:', error);
    return [];
  }
}

// 📊 최근 활동 로그 조회
async function getRecentActivityLogs(clientIds: string[]) {
  if (clientIds.length === 0) return [];

  try {
    return await db
      .select({
        clientId: appInfluencerProfiles.clientId,
        activityType: appInfluencerActivityLogs.activityType,
        createdAt: appInfluencerActivityLogs.createdAt,
      })
      .from(appInfluencerActivityLogs)
      .innerJoin(
        appInfluencerProfiles,
        eq(appInfluencerActivityLogs.influencerId, appInfluencerProfiles.id)
      )
      .where(inArray(appInfluencerProfiles.clientId, clientIds))
      .orderBy(desc(appInfluencerActivityLogs.createdAt))
      .limit(100);
  } catch (error) {
    console.error('활동 로그 조회 오류:', error);
    return [];
  }
}

// 💪 향상된 관계 강도 계산
function calculateEnhancedRelationshipStrength(
  totalReferrals: number,
  conversionRate: number,
  totalValue: number,
  lastReferralDate: Date | null,
  lastGratitudeDate: Date | null,
  recentActivities: number
): number {
  // 기본 점수 (소개 건수 기반)
  let score = Math.min(totalReferrals * 0.5, 5); // 최대 5점

  // 전환율 가산점
  score += Math.min(conversionRate * 0.05, 3); // 최대 3점

  // 계약 가치 가산점
  if (totalValue > 50000000) score += 1.5; // 5천만원 이상
  else if (totalValue > 10000000) score += 1; // 1천만원 이상
  else if (totalValue > 1000000) score += 0.5; // 100만원 이상

  // 최근 활동 점수
  if (lastReferralDate) {
    const daysSinceReferral = Math.floor(
      (Date.now() - lastReferralDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceReferral <= 30) score += 1;
    else if (daysSinceReferral <= 90) score += 0.5;
  }

  // 감사 표현 가산점
  if (lastGratitudeDate) {
    const daysSinceGratitude = Math.floor(
      (Date.now() - lastGratitudeDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceGratitude <= 30) score += 0.5;
  }

  return Math.min(Math.round(score * 10) / 10, 10); // 최대 10점, 소수점 1자리
}

// 📊 데이터 품질 계산
function calculateDataQuality(
  referrer: any,
  profile: any,
  gratitude: any,
  network: any
): { score: number; issues: string[] } {
  let score = 10;
  const issues: string[] = [];

  // 프로필 정보 확인
  if (!profile) {
    score -= 2;
    issues.push('프로필 정보 없음');
  } else {
    if (!profile.isDataVerified) {
      score -= 1;
      issues.push('데이터 미검증');
    }
  }

  // 감사 표현 이력 확인
  if (!gratitude || !gratitude.lastGratitudeDate) {
    score -= 1.5;
    issues.push('감사 표현 이력 없음');
  }

  // 네트워크 데이터 확인
  if (!network || network.depth === 0) {
    score -= 1;
    issues.push('네트워크 데이터 부족');
  }

  // 기본 데이터 확인
  if (!referrer.clientName || referrer.clientName === '이름 없음') {
    score -= 0.5;
    issues.push('이름 정보 부족');
  }

  return { score: Math.max(score, 0), issues };
}

// 📈 총 소개자 수 조회
async function getTotalInfluencersCount(userId: string) {
  const result = await db
    .select({ count: count(appInfluencerProfiles.id) })
    .from(appInfluencerProfiles)
    .where(eq(appInfluencerProfiles.agentId, userId));

  return { count: result[0]?.count || 0 };
}

// 🏃 활성 소개자 수 조회
async function getActiveInfluencersCount(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const activeInfluencers = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(appInfluencerProfiles)
    .where(
      and(
        eq(appInfluencerProfiles.agentId, userId),
        gte(appInfluencerProfiles.lastContactDate, sixMonthsAgo.toISOString())
      )
    );

  return { count: activeInfluencers[0]?.count || 0 };
}

// 📊 전환율 통계
async function getConversionStatistics(userId: string) {
  const result = await db
    .select({ average: avg(appInfluencerProfiles.conversionRate) })
    .from(appInfluencerProfiles)
    .where(eq(appInfluencerProfiles.agentId, userId));

  return { average: Number(result[0]?.average || 0) };
}

// 💰 총 네트워크 가치
async function getTotalNetworkValue(userId: string) {
  const result = await db
    .select({ total: sum(appInfluencerProfiles.totalContractValue) })
    .from(appInfluencerProfiles)
    .where(eq(appInfluencerProfiles.agentId, userId));

  return { total: Number(result[0]?.total || 0) };
}

// 🕸️ 네트워크 지표
async function getNetworkMetrics(userId: string) {
  const result = await db
    .select({
      avgDepth: avg(appInfluencerProfiles.networkDepth),
      avgWidth: avg(appInfluencerProfiles.networkWidth),
      avgRelationshipStrength: avg(appInfluencerProfiles.relationshipStrength),
    })
    .from(appInfluencerProfiles)
    .where(eq(appInfluencerProfiles.agentId, userId));

  const metrics = result[0] || {};
  return {
    avgDepth: Number(metrics.avgDepth || 0),
    avgWidth: Number(metrics.avgWidth || 0),
    avgRelationshipStrength: Number(metrics.avgRelationshipStrength || 0),
  };
}

// 🎁 감사 표현 통계
async function getGratitudeStatistics(userId: string) {
  const result = await db
    .select({
      totalSent: count(appInfluencerGratitudeHistory.id),
      averageFrequency: sql<number>`
        CASE 
          WHEN COUNT(DISTINCT ${appInfluencerProfiles.id}) > 0 
          THEN COUNT(${appInfluencerGratitudeHistory.id})::float / COUNT(DISTINCT ${appInfluencerProfiles.id})
          ELSE 0 
        END
      `,
    })
    .from(appInfluencerGratitudeHistory)
    .innerJoin(
      appInfluencerProfiles,
      eq(appInfluencerGratitudeHistory.influencerId, appInfluencerProfiles.id)
    )
    .where(eq(appInfluencerProfiles.agentId, userId));

  const stats = result[0] || {};
  return {
    totalSent: stats.totalSent || 0,
    averageFrequency: Number(stats.averageFrequency || 0),
  };
}

// 📈 모든 트렌드 데이터 조회
async function getAllTrends(userId: string) {
  const [referrals, conversions, value, gratitude] = await Promise.all([
    getReferralTrends(userId, 6),
    getConversionTrends(userId, 6),
    getValueTrends(userId, 6),
    getGratitudeTrends(userId, 6),
  ]);

  return { referrals, conversions, value, gratitude };
}

// 📊 전체 데이터 품질 계산
async function calculateOverallDataQuality(userId: string): Promise<number> {
  // 간단한 계산 - 실제로는 더 복잡한 로직 필요
  return 8.5;
}

// 🎯 신뢰도 계산
function calculateConfidenceLevel(
  totalInfluencers: number,
  activeInfluencers: number
): number {
  if (totalInfluencers === 0) return 0;
  return Math.min((activeInfluencers / totalInfluencers) * 10, 10);
}

// 📝 감사 표현 데이터 검증
function validateGratitudeData(data: GratitudeFormData) {
  const errors: Record<string, string> = {};

  if (!data.influencerId) errors.influencerId = '영향력자를 선택해주세요';
  if (!data.type) errors.type = '감사 표현 유형을 선택해주세요';
  if (!data.title || data.title.length < 2)
    errors.title = '제목을 2자 이상 입력해주세요';
  if (!data.message || data.message.length < 10)
    errors.message = '메시지를 10자 이상 입력해주세요';

  return { isValid: Object.keys(errors).length === 0, errors };
}

// 🧹 사용자 캐시 무효화
function invalidateUserCaches(userId: string) {
  const keysToDelete: string[] = [];

  for (const [key] of dataCache.entries()) {
    if (key.includes(userId)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => dataCache.delete(key));
}

// 😊 감정 분석 (간단한 버전)
function analyzeSentiment(
  feedback: string | null
): 'positive' | 'neutral' | 'negative' | undefined {
  if (!feedback) return undefined;

  const positiveWords = ['감사', '고마워', '좋아', '훌륭', '최고', '만족'];
  const negativeWords = ['불만', '싫어', '나빠', '최악', '별로'];

  const lowerFeedback = feedback.toLowerCase();
  const positiveCount = positiveWords.filter((word) =>
    lowerFeedback.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lowerFeedback.includes(word)
  ).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// 🔧 헬퍼 함수들

// 월별 소개 패턴 조회 (여러 클라이언트)
async function getMonthlyReferralPatterns(clientIds: string[], months: number) {
  try {
    const patterns = await Promise.all(
      clientIds.map(async (clientId) => {
        const monthlyData = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            0
          );

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

          monthlyData.push(monthlyCount[0]?.count || 0);
        }

        return { clientId, monthlyData };
      })
    );

    return patterns;
  } catch (error) {
    console.error('getMonthlyReferralPatterns 오류:', error);
    return clientIds.map((clientId) => ({
      clientId,
      monthlyData: Array(months).fill(0),
    }));
  }
}

// 네트워크 데이터 조회 (여러 클라이언트)
async function getNetworkDataForClients(clientIds: string[]) {
  try {
    const networkData = await Promise.all(
      clientIds.map(async (clientId) => {
        // 직접 소개한 사람들
        const directReferrals = await db
          .select({ referredId: referrals.referredId })
          .from(referrals)
          .where(eq(referrals.referrerId, clientId));

        const width = directReferrals.length;

        // 네트워크 깊이 계산 (최대 3단계)
        let depth = 1;
        if (width > 0) {
          const secondLevelCounts = await Promise.all(
            directReferrals.map(async (ref) => {
              const countResult: { count: number }[] = await db
                .select({ count: count() })
                .from(referrals)
                .where(eq(referrals.referrerId, ref.referredId));
              return countResult[0]?.count || 0;
            })
          );

          const hasSecondLevel = secondLevelCounts.some((count) => count > 0);
          if (hasSecondLevel) {
            depth = 2;
            // 간단히 3단계까지만 확인
            const hasThirdLevel = await db
              .select({ count: count() })
              .from(referrals)
              .where(
                inArray(
                  referrals.referrerId,
                  directReferrals.map((r) => r.referredId)
                )
              );
            if ((hasThirdLevel[0]?.count || 0) > 0) {
              depth = 3;
            }
          }
        }

        return { clientId, width, depth };
      })
    );

    return networkData;
  } catch (error) {
    console.error('getNetworkDataForClients 오류:', error);
    return clientIds.map((clientId) => ({ clientId, width: 0, depth: 1 }));
  }
}

// 관계 강도 계산
function calculateRelationshipStrength(
  totalReferrals: number,
  conversionRate: number,
  totalValue: number,
  lastReferralDate: Date | null
): number {
  let score = 5.0; // 기본 점수

  // 소개 건수 기여도 (최대 3점)
  score += Math.min(totalReferrals * 0.5, 3.0);

  // 전환율 기여도 (최대 2점)
  score += (conversionRate / 100) * 2.0;

  // 계약 가치 기여도 (최대 1점)
  score += Math.min(totalValue / 10000000, 1.0); // 1천만원당 1점

  // 최근 활동 기여도 (최대 1점 감점)
  if (lastReferralDate) {
    const daysSinceLastReferral = Math.floor(
      (new Date().getTime() - lastReferralDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const activityDeduction = Math.min(daysSinceLastReferral / 365, 1.0);
    score -= activityDeduction;
  }

  return Math.max(1.0, Math.min(10.0, score));
}

// 소개 패턴 분석
async function getReferralPatternAnalysis(clientId: string, userId: string) {
  try {
    // 실제로는 clients 테이블의 보험 유형 필드를 기반으로 분석
    // 현재는 간단한 더미 분석
    const totalReferrals = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, clientId));

    const total = totalReferrals[0]?.count || 0;

    // 시간대별 패턴 분석 (요일별)
    const timePattern = {
      weekday: Math.floor(total * 0.7),
      weekend: Math.floor(total * 0.3),
    };

    // 계절별 패턴 (월별 기준)
    const seasonalPattern = {
      spring: Math.floor(total * 0.25),
      summer: Math.floor(total * 0.2),
      fall: Math.floor(total * 0.3),
      winter: Math.floor(total * 0.25),
    };

    return {
      ...timePattern,
      ...seasonalPattern,
      total,
    };
  } catch (error) {
    console.error('getReferralPatternAnalysis 오류:', error);
    return { total: 0 };
  }
}

// Tier 결정 함수
function determineTierFromScore(
  conversionRate: number,
  totalReferrals: number,
  relationshipStrength: number
) {
  const score = conversionRate + totalReferrals * 2 + relationshipStrength * 5;

  if (score >= 80) return 'diamond';
  if (score >= 60) return 'platinum';
  if (score >= 40) return 'gold';
  if (score >= 20) return 'silver';
  return 'bronze';
}

// 트렌드 데이터 조회 함수들
async function getReferralTrends(userId: string, months: number) {
  try {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toISOString().slice(0, 7); // YYYY-MM

      const monthlyCount = await db
        .select({ count: count() })
        .from(referrals)
        .innerJoin(clients, eq(referrals.referredId, clients.id))
        .where(
          and(
            eq(clients.agentId, userId),
            gte(referrals.createdAt, monthStart),
            lte(referrals.createdAt, monthEnd)
          )
        );

      trends.push({
        month: monthName,
        count: monthlyCount[0]?.count || 0,
      });
    }

    return trends;
  } catch (error) {
    console.error('getReferralTrends 오류:', error);
    return [];
  }
}

async function getConversionTrends(userId: string, months: number) {
  try {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toISOString().slice(0, 7);

      const conversionData = await db
        .select({
          totalReferrals: count(referrals.id),
          successfulReferrals: sql<number>`
            COUNT(CASE WHEN ${clients.currentStage} IN ('계약체결', '완료') THEN 1 END)
          `,
        })
        .from(referrals)
        .innerJoin(clients, eq(referrals.referredId, clients.id))
        .where(
          and(
            eq(clients.agentId, userId),
            gte(referrals.createdAt, monthStart),
            lte(referrals.createdAt, monthEnd)
          )
        );

      const data = conversionData[0];
      const rate =
        data?.totalReferrals > 0
          ? (data.successfulReferrals / data.totalReferrals) * 100
          : 0;

      trends.push({
        month: monthName,
        rate: Math.round(rate * 100) / 100,
      });
    }

    return trends;
  } catch (error) {
    console.error('getConversionTrends 오류:', error);
    return [];
  }
}

async function getValueTrends(userId: string, months: number) {
  try {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toISOString().slice(0, 7);

      const valueData = await db
        .select({
          totalValue: sql<number>`
            COALESCE(SUM(CASE 
              WHEN ${clients.currentStage} IN ('계약체결', '완료') 
              THEN ${clients.contractAmount} 
              ELSE 0 
            END), 0)
          `,
        })
        .from(referrals)
        .innerJoin(clients, eq(referrals.referredId, clients.id))
        .where(
          and(
            eq(clients.agentId, userId),
            gte(referrals.createdAt, monthStart),
            lte(referrals.createdAt, monthEnd)
          )
        );

      trends.push({
        month: monthName,
        amount: Number(valueData[0]?.totalValue || 0),
      });
    }

    return trends;
  } catch (error) {
    console.error('getValueTrends 오류:', error);
    return [];
  }
}

async function getGratitudeTrends(userId: string, months: number) {
  try {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toISOString().slice(0, 7);

      const gratitudeData = await db
        .select({ count: count() })
        .from(appInfluencerGratitudeHistory)
        .where(
          and(
            eq(appInfluencerGratitudeHistory.agentId, userId),
            gte(appInfluencerGratitudeHistory.createdAt, monthStart),
            lte(appInfluencerGratitudeHistory.createdAt, monthEnd)
          )
        );

      trends.push({
        month: monthName,
        sent: gratitudeData[0]?.count || 0,
      });
    }

    return trends;
  } catch (error) {
    console.error('getGratitudeTrends 오류:', error);
    return [];
  }
}

// 성장률 계산
function calculateMonthlyGrowthRate(
  trends: Array<{ month: string; count: number }>
) {
  if (trends.length < 2) return 0;

  const current = trends[trends.length - 1]?.count || 0;
  const previous = trends[trends.length - 2]?.count || 0;

  if (previous === 0) return current > 0 ? 100 : 0;

  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

// 네트워크 분석 캐시 저장
async function saveNetworkAnalysisCache(
  userId: string,
  analysis: NetworkAnalysisDisplayData
) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료

    await db.insert(appInfluencerNetworkAnalysis).values({
      agentId: userId,
      analysisDate: new Date().toISOString().split('T')[0],
      analysisPeriod: 'daily',
      totalInfluencers: analysis.totalInfluencers,
      activeInfluencers: analysis.activeInfluencers,
      averageConversionRate: analysis.averageConversionRate.toString(),
      totalNetworkValue: analysis.totalNetworkValue.toString(),
      averageNetworkDepth: analysis.avgNetworkDepth.toString(),
      averageNetworkWidth: analysis.avgNetworkWidth.toString(),
      networkGrowthRate: analysis.monthlyGrowth.toString(),
      averageRelationshipStrength:
        analysis.averageRelationshipStrength.toString(),
      totalGratitudesSent: analysis.totalGratitudesSent,
      averageGratitudeFrequency: analysis.averageGratitudeFrequency.toString(),
      calculationVersion: '1.1',
      dataQualityScore: analysis.dataQualityScore.toString(),
      confidenceLevel: analysis.confidenceLevel.toString(),
      expiresAt,
    });
  } catch (error) {
    console.error('네트워크 분석 캐시 저장 오류:', error);
  }
}

// 라벨 헬퍼 함수들
function getGratitudeTypeLabel(type: InfluencerGratitudeType): string {
  const labels: Record<InfluencerGratitudeType, string> = {
    thank_you_call: '감사 전화',
    thank_you_message: '감사 메시지',
    gift_delivery: '선물 배송',
    meal_invitation: '식사 초대',
    event_invitation: '행사 초대',
    holiday_greetings: '명절 인사',
    birthday_wishes: '생일 축하',
    custom: '기타',
  };
  return labels[type] || type;
}

function getGiftTypeLabel(type: InfluencerGiftType): string {
  const labels: Record<InfluencerGiftType, string> = {
    flowers: '꽃다발',
    food_voucher: '식사권',
    coffee_voucher: '커피 상품권',
    traditional_gift: '전통 선물',
    cash_gift: '현금 선물',
    experience_voucher: '체험 상품권',
    custom_gift: '기타 선물',
    none: '선물 없음',
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planned: '계획됨',
    scheduled: '예약됨',
    sent: '발송됨',
    delivered: '전달됨',
    completed: '완료됨',
    cancelled: '취소됨',
    failed: '실패',
  };
  return labels[status] || status;
}
