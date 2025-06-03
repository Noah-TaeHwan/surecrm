// 🌟 Influencers 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_influencer_ 사용 (완전 통일)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  referrals,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type NewClient,
  type Referral,
  type NewReferral,
  type UserRole,
  type Importance,
  type ReferralStatus,
} from '~/lib/schema/core';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  date,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  profiles,
  teams,
  clients,
  referrals,
  type Client,
} from '~/lib/schema/core';

// 📌 Influencers 특화 Enum (완전한 app_influencer_ prefix 통일)
export const appInfluencerGratitudeTypeEnum = pgEnum(
  'app_influencer_gratitude_type_enum',
  [
    'thank_you_call',
    'thank_you_message',
    'gift_delivery',
    'meal_invitation',
    'event_invitation',
    'holiday_greetings',
    'birthday_wishes',
    'custom',
  ]
);

export const appInfluencerGratitudeStatusEnum = pgEnum(
  'app_influencer_gratitude_status_enum',
  [
    'planned',
    'scheduled',
    'sent',
    'delivered',
    'completed',
    'cancelled',
    'failed',
  ]
);

export const appInfluencerGiftTypeEnum = pgEnum(
  'app_influencer_gift_type_enum',
  [
    'flowers',
    'food_voucher',
    'coffee_voucher',
    'traditional_gift',
    'cash_gift',
    'experience_voucher',
    'custom_gift',
    'none',
  ]
);

export const appInfluencerTierEnum = pgEnum('app_influencer_tier_enum', [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);

export const appInfluencerContactMethodEnum = pgEnum(
  'app_influencer_contact_method_enum',
  ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call', 'letter']
);

export const appInfluencerActivityTypeEnum = pgEnum(
  'app_influencer_activity_type_enum',
  [
    'new_referral',
    'referral_converted',
    'gratitude_sent',
    'meeting_scheduled',
    'tier_upgraded',
    'network_expanded',
    'relationship_strengthened',
  ]
);

export const appInfluencerDataSourceEnum = pgEnum(
  'app_influencer_data_source_enum',
  ['direct_input', 'auto_calculated', 'imported', 'api_sync']
);

// 🏷️ Influencers 특화 테이블들 (완전한 app_influencer_ prefix 통일)

// Influencer Profiles 테이블 (영향력 지표 관리) - prefix 통일
export const appInfluencerProfiles = pgTable('app_influencer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  tier: appInfluencerTierEnum('tier').default('bronze').notNull(),
  totalReferrals: integer('total_referrals').default(0).notNull(),
  successfulReferrals: integer('successful_referrals').default(0).notNull(),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 })
    .default('0')
    .notNull(),
  totalContractValue: decimal('total_contract_value', {
    precision: 15,
    scale: 2,
  })
    .default('0')
    .notNull(),
  averageContractValue: decimal('average_contract_value', {
    precision: 12,
    scale: 2,
  })
    .default('0')
    .notNull(),
  networkDepth: integer('network_depth').default(0).notNull(), // 소개 체인의 깊이
  networkWidth: integer('network_width').default(0).notNull(), // 직접 소개한 사람 수
  relationshipStrength: decimal('relationship_strength', {
    precision: 3,
    scale: 2,
  })
    .default('0')
    .notNull(), // 0-10 점수
  lastReferralDate: date('last_referral_date'),
  lastGratitudeDate: date('last_gratitude_date'),
  lastContactDate: date('last_contact_date'),
  preferredContactMethod: appInfluencerContactMethodEnum(
    'preferred_contact_method'
  ),
  specialNotes: text('special_notes'), // 특별 메모 (선호도, 주의사항 등)
  isActive: boolean('is_active').default(true).notNull(),
  // 🔒 데이터 품질 보장 필드
  dataSource: appInfluencerDataSourceEnum('data_source')
    .default('auto_calculated')
    .notNull(),
  dataVersion: integer('data_version').default(1).notNull(),
  lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  isDataVerified: boolean('is_data_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Influencer Gratitude History 테이블 (감사 표현 이력) - prefix 통일
export const appInfluencerGratitudeHistory = pgTable(
  'app_influencer_gratitude_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => appInfluencerProfiles.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    referralId: uuid('referral_id').references(() => referrals.id), // 특정 소개에 대한 감사
    gratitudeType: appInfluencerGratitudeTypeEnum('gratitude_type').notNull(),
    giftType: appInfluencerGiftTypeEnum('gift_type').default('none').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    personalizedMessage: text('personalized_message'), // 개인화된 메시지
    scheduledDate: date('scheduled_date'),
    sentDate: date('sent_date'),
    deliveredDate: date('delivered_date'),
    status: appInfluencerGratitudeStatusEnum('status')
      .default('planned')
      .notNull(),
    cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),
    vendor: text('vendor'), // 선물 업체 정보
    trackingNumber: text('tracking_number'), // 배송 추적번호
    recipientFeedback: text('recipient_feedback'), // 수령자 피드백
    internalNotes: text('internal_notes'), // 내부 메모
    isRecurring: boolean('is_recurring').default(false).notNull(), // 정기적 감사 표현 여부
    recurringInterval: integer('recurring_interval'), // 반복 간격 (일 단위)
    nextScheduledDate: date('next_scheduled_date'), // 다음 예정일
    metadata: jsonb('metadata'), // 추가 정보 (주소, 연락처 등)
    // 🔒 품질 관리 필드
    isAutoGenerated: boolean('is_auto_generated').default(false).notNull(),
    templateId: text('template_id'), // 사용된 템플릿 ID
    sentiment: text('sentiment'), // 'positive', 'neutral', 'negative'
    deliveryConfirmed: boolean('delivery_confirmed').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Influencer Network Analysis 테이블 (네트워크 분석 결과 캐시) - prefix 통일
export const appInfluencerNetworkAnalysis = pgTable(
  'app_influencer_network_analysis',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    teamId: uuid('team_id').references(() => teams.id),
    analysisDate: date('analysis_date').notNull(),
    analysisPeriod: text('analysis_period').notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
    totalInfluencers: integer('total_influencers').default(0).notNull(),
    activeInfluencers: integer('active_influencers').default(0).notNull(),
    averageConversionRate: decimal('average_conversion_rate', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalNetworkValue: decimal('total_network_value', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageNetworkDepth: decimal('average_network_depth', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageNetworkWidth: decimal('average_network_width', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    topInfluencerIds: text('top_influencer_ids').array(), // 상위 영향력자 ID 배열
    networkGrowthRate: decimal('network_growth_rate', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageRelationshipStrength: decimal('average_relationship_strength', {
      precision: 3,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalGratitudesSent: integer('total_gratitudes_sent').default(0).notNull(),
    averageGratitudeFrequency: decimal('average_gratitude_frequency', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    // 🔒 분석 품질 관리
    calculationVersion: text('calculation_version').default('1.0').notNull(),
    dataQualityScore: decimal('data_quality_score', { precision: 3, scale: 2 })
      .default('0')
      .notNull(), // 0-10 점수
    missingDataFields: text('missing_data_fields').array(), // 누락된 데이터 필드 목록
    confidenceLevel: decimal('confidence_level', { precision: 3, scale: 2 })
      .default('0')
      .notNull(), // 분석 신뢰도 0-10
    calculatedAt: timestamp('calculated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Influencer Activity Logs 테이블 (활동 추적) - prefix 통일 및 신규 추가
export const appInfluencerActivityLogs = pgTable(
  'app_influencer_activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => appInfluencerProfiles.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    activityType: appInfluencerActivityTypeEnum('activity_type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    entityType: text('entity_type'), // 'referral', 'gratitude', 'meeting' 등
    entityId: uuid('entity_id'),
    impact: text('impact'), // 'positive', 'neutral', 'negative'
    valueChange: decimal('value_change', { precision: 12, scale: 2 }), // 수치 변화량
    previousValue: decimal('previous_value', { precision: 12, scale: 2 }),
    newValue: decimal('new_value', { precision: 12, scale: 2 }),
    metadata: jsonb('metadata'), // 추가 상세 정보
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Influencer Gratitude Templates 테이블 (감사 표현 템플릿) - 신규 추가
export const appInfluencerGratitudeTemplates = pgTable(
  'app_influencer_gratitude_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    name: text('name').notNull(),
    gratitudeType: appInfluencerGratitudeTypeEnum('gratitude_type').notNull(),
    giftType: appInfluencerGiftTypeEnum('gift_type').default('none').notNull(),
    title: text('title').notNull(),
    messageTemplate: text('message_template').notNull(),
    placeholders: text('placeholders').array(), // 치환 가능한 변수들
    isDefault: boolean('is_default').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsed: timestamp('last_used', { withTimezone: true }),
    metadata: jsonb('metadata'), // 추가 설정
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 🔗 Relations (관계 정의) - 새로운 테이블들 포함
export const appInfluencerProfilesRelations = relations(
  appInfluencerProfiles,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [appInfluencerProfiles.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [appInfluencerProfiles.agentId],
      references: [profiles.id],
    }),
    gratitudeHistory: many(appInfluencerGratitudeHistory),
    activityLogs: many(appInfluencerActivityLogs),
  })
);

export const appInfluencerGratitudeHistoryRelations = relations(
  appInfluencerGratitudeHistory,
  ({ one }) => ({
    influencer: one(appInfluencerProfiles, {
      fields: [appInfluencerGratitudeHistory.influencerId],
      references: [appInfluencerProfiles.id],
    }),
    agent: one(profiles, {
      fields: [appInfluencerGratitudeHistory.agentId],
      references: [profiles.id],
    }),
    referral: one(referrals, {
      fields: [appInfluencerGratitudeHistory.referralId],
      references: [referrals.id],
    }),
  })
);

export const appInfluencerNetworkAnalysisRelations = relations(
  appInfluencerNetworkAnalysis,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appInfluencerNetworkAnalysis.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appInfluencerNetworkAnalysis.teamId],
      references: [teams.id],
    }),
  })
);

export const appInfluencerActivityLogsRelations = relations(
  appInfluencerActivityLogs,
  ({ one }) => ({
    influencer: one(appInfluencerProfiles, {
      fields: [appInfluencerActivityLogs.influencerId],
      references: [appInfluencerProfiles.id],
    }),
    agent: one(profiles, {
      fields: [appInfluencerActivityLogs.agentId],
      references: [profiles.id],
    }),
  })
);

export const appInfluencerGratitudeTemplatesRelations = relations(
  appInfluencerGratitudeTemplates,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appInfluencerGratitudeTemplates.agentId],
      references: [profiles.id],
    }),
  })
);

// 📝 Influencers 특화 타입들 (완전한 app_influencer_ prefix 반영)
export type InfluencerProfile = typeof appInfluencerProfiles.$inferSelect;
export type NewInfluencerProfile = typeof appInfluencerProfiles.$inferInsert;
export type InfluencerGratitudeHistory =
  typeof appInfluencerGratitudeHistory.$inferSelect;
export type NewInfluencerGratitudeHistory =
  typeof appInfluencerGratitudeHistory.$inferInsert;
export type InfluencerNetworkAnalysis =
  typeof appInfluencerNetworkAnalysis.$inferSelect;
export type NewInfluencerNetworkAnalysis =
  typeof appInfluencerNetworkAnalysis.$inferInsert;
export type InfluencerActivityLog =
  typeof appInfluencerActivityLogs.$inferSelect;
export type NewInfluencerActivityLog =
  typeof appInfluencerActivityLogs.$inferInsert;
export type InfluencerGratitudeTemplate =
  typeof appInfluencerGratitudeTemplates.$inferSelect;
export type NewInfluencerGratitudeTemplate =
  typeof appInfluencerGratitudeTemplates.$inferInsert;

// Enum 타입들
export type InfluencerGratitudeType =
  (typeof appInfluencerGratitudeTypeEnum.enumValues)[number];
export type InfluencerGratitudeStatus =
  (typeof appInfluencerGratitudeStatusEnum.enumValues)[number];
export type InfluencerGiftType =
  (typeof appInfluencerGiftTypeEnum.enumValues)[number];
export type InfluencerTier = (typeof appInfluencerTierEnum.enumValues)[number];
export type InfluencerContactMethod =
  (typeof appInfluencerContactMethodEnum.enumValues)[number];
export type InfluencerActivityType =
  (typeof appInfluencerActivityTypeEnum.enumValues)[number];
export type InfluencerDataSource =
  (typeof appInfluencerDataSourceEnum.enumValues)[number];

// 🎯 Influencers 특화 인터페이스 (향상된 버전)
export interface InfluencerOverview {
  profile: InfluencerProfile;
  client: Client;
  recentGratitude: InfluencerGratitudeHistory[];
  networkStats: {
    directReferrals: number;
    chainLength: number;
    totalValue: number;
    conversionRate: number;
    averageContractValue: number;
    relationshipStrength: number;
  };
  upcomingGratitude: InfluencerGratitudeHistory[];
  recentActivities: InfluencerActivityLog[];
}

export interface InfluencerFilter {
  tiers?: InfluencerTier[];
  minReferrals?: number;
  maxReferrals?: number;
  minConversionRate?: number;
  maxConversionRate?: number;
  minContractValue?: number;
  maxContractValue?: number;
  lastReferralDays?: number;
  lastGratitudeDays?: number;
  relationshipStrengthMin?: number;
  relationshipStrengthMax?: number;
  isActive?: boolean;
  hasRecentActivity?: boolean;
  searchQuery?: string;
}

export interface InfluencerNetworkMap {
  nodes: Array<{
    id: string;
    name: string;
    tier: InfluencerTier;
    totalReferrals: number;
    conversionRate: number;
    contractValue: number;
    relationshipStrength: number;
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    referralCount: number;
    contractValue: number;
    strength: number;
    type: 'direct' | 'indirect';
  }>;
  metadata: {
    totalNodes: number;
    totalEdges: number;
    averageConnections: number;
    networkDensity: number;
    clusters: Array<{
      id: string;
      nodes: string[];
      centralNode: string;
      totalValue: number;
    }>;
  };
}

export interface InfluencerRankingData {
  current: Array<{
    rank: number;
    influencer: InfluencerProfile;
    client: Client;
    score: number;
    change: number; // 순위 변화
    trend: 'up' | 'down' | 'stable';
    monthlyData: Array<{
      month: string;
      referrals: number;
      conversions: number;
      value: number;
    }>;
  }>;
  historical: Array<{
    period: string;
    rankings: Array<{
      rank: number;
      clientId: string;
      score: number;
    }>;
  }>;
}

export interface InfluencerAnalytics {
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  overview: {
    totalInfluencers: number;
    activeInfluencers: number;
    newInfluencers: number;
    avgConversionRate: number;
    totalNetworkValue: number;
    growthRate: number;
  };
  performance: {
    topPerformers: InfluencerProfile[];
    mostImproved: InfluencerProfile[];
    atRisk: InfluencerProfile[];
    tierDistribution: Record<InfluencerTier, number>;
  };
  gratitude: {
    totalSent: number;
    averageFrequency: number;
    typeDistribution: Record<InfluencerGratitudeType, number>;
    responseRate: number;
    satisfaction: number;
  };
  network: {
    depth: number;
    width: number;
    density: number;
    centralNodes: string[];
    clusters: number;
    efficiency: number;
  };
  trends: {
    referralTrend: Array<{ date: string; count: number }>;
    conversionTrend: Array<{ date: string; rate: number }>;
    valueTrend: Array<{ date: string; amount: number }>;
    gratitudeTrend: Array<{ date: string; sent: number; received: number }>;
  };
}

// 🛠️ Influencers 고급 유틸리티 함수들 (THINK DEEP 적용)

/**
 * 소개자 등급(Tier) 계산 로직
 * 총 소개 건수, 전환율, 총 계약 가치를 종합적으로 고려
 */
export function calculateInfluencerTier(
  totalReferrals: number,
  conversionRate: number,
  totalContractValue: number,
  relationshipStrength: number
): InfluencerTier {
  // 점수 계산 (0-100점)
  const referralScore = Math.min(totalReferrals * 2, 30); // 최대 30점
  const conversionScore = Math.min(conversionRate, 25); // 최대 25점
  const valueScore = Math.min(totalContractValue / 1000000, 25); // 100만원당 1점, 최대 25점
  const relationshipScore = Math.min(relationshipStrength * 2, 20); // 최대 20점

  const totalScore =
    referralScore + conversionScore + valueScore + relationshipScore;

  if (totalScore >= 80) return 'diamond';
  if (totalScore >= 65) return 'platinum';
  if (totalScore >= 45) return 'gold';
  if (totalScore >= 25) return 'silver';
  return 'bronze';
}

/**
 * 관계 강도 계산 로직 (0-10점)
 * 최근성, 빈도, 성과를 종합적으로 고려
 */
export function calculateRelationshipStrength(
  totalReferrals: number,
  conversionRate: number,
  daysSinceLastReferral: number,
  daysSinceLastGratitude: number,
  totalContractValue: number
): number {
  // 기본 점수 (성과 기반)
  const performanceScore = Math.min(
    ((totalReferrals * conversionRate) / 100) * 0.5,
    4
  ); // 최대 4점

  // 최근성 점수 (최근 활동일수록 높은 점수)
  const recencyScore = Math.max(0, 3 - daysSinceLastReferral / 30); // 최대 3점

  // 감사 관리 점수 (적절한 감사 표현)
  const gratitudeScore = daysSinceLastGratitude <= 60 ? 2 : 1; // 최대 2점

  // 가치 점수 (계약 가치 기반)
  const valueScore = Math.min(totalContractValue / 5000000, 1); // 500만원당 0.1점, 최대 1점

  return Math.min(
    performanceScore + recencyScore + gratitudeScore + valueScore,
    10
  );
}

/**
 * 네트워크 품질 점수 계산 (0-10점)
 * 데이터 완성도, 정확성, 신뢰도를 종합 평가
 */
export function calculateNetworkQualityScore(
  totalInfluencers: number,
  activeInfluencers: number,
  avgDataCompleteness: number,
  avgAccuracy: number
): number {
  // 네트워크 규모 점수
  const sizeScore = Math.min(totalInfluencers / 10, 3); // 10명당 0.3점, 최대 3점

  // 활성도 점수
  const activityScore =
    totalInfluencers > 0 ? (activeInfluencers / totalInfluencers) * 3 : 0; // 최대 3점

  // 데이터 품질 점수
  const qualityScore = ((avgDataCompleteness + avgAccuracy) / 2) * 4; // 최대 4점

  return Math.min(sizeScore + activityScore + qualityScore, 10);
}

/**
 * 감사 표현 필요성 우선순위 계산
 * 관계 중요도, 마지막 감사 후 경과 시간, 최근 성과를 고려
 */
export function calculateGratitudePriority(
  relationshipStrength: number,
  daysSinceLastGratitude: number,
  recentReferrals: number,
  totalContractValue: number
): number {
  // 관계 중요도 가중치
  const importanceWeight = relationshipStrength / 10; // 0-1

  // 시간 경과 점수 (오래될수록 높은 우선순위)
  const timeScore = Math.min(daysSinceLastGratitude / 30, 5); // 최대 5점

  // 최근 성과 점수
  const recentPerformanceScore = Math.min(recentReferrals * 0.5, 3); // 최대 3점

  // 가치 점수
  const valueScore = Math.min(totalContractValue / 10000000, 2); // 최대 2점

  return (timeScore + recentPerformanceScore + valueScore) * importanceWeight;
}

/**
 * 데이터 유효성 검증 함수
 */
export function validateInfluencerData(data: Partial<InfluencerProfile>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 데이터 검증 (decimal 타입들을 number로 변환하여 비교)
  if (data.conversionRate !== undefined) {
    const rate = Number(data.conversionRate);
    if (rate < 0 || rate > 100) {
      errors.push('전환율은 0-100% 사이여야 합니다');
    }
  }

  if (data.relationshipStrength !== undefined) {
    const strength = Number(data.relationshipStrength);
    if (strength < 0 || strength > 10) {
      errors.push('관계 강도는 0-10점 사이여야 합니다');
    }
  }

  if (data.totalReferrals !== undefined && data.totalReferrals < 0) {
    errors.push('총 소개 건수는 0 이상이어야 합니다');
  }

  // 경고 조건들
  if (data.conversionRate !== undefined) {
    const rate = Number(data.conversionRate);
    if (rate < 10) {
      warnings.push('전환율이 낮습니다 (10% 미만)');
    }
  }

  if (data.relationshipStrength !== undefined) {
    const strength = Number(data.relationshipStrength);
    if (strength < 3) {
      warnings.push('관계 강도가 낮습니다 (3점 미만)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
