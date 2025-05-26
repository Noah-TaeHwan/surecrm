// Influencers 기능에 특화된 스키마
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
} from '~/lib/supabase-schema';

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
} from '~/lib/supabase-schema';

// Influencers 특화 Enum
export const gratitudeTypeEnum = pgEnum('gratitude_type', [
  'thank_you_call',
  'thank_you_message',
  'gift_delivery',
  'meal_invitation',
  'event_invitation',
  'custom',
]);

export const gratitudeStatusEnum = pgEnum('gratitude_status', [
  'planned',
  'scheduled',
  'sent',
  'delivered',
  'completed',
  'cancelled',
]);

export const giftTypeEnum = pgEnum('gift_type', [
  'flowers',
  'fruit_basket',
  'gift_card',
  'meal_voucher',
  'coffee_voucher',
  'custom_gift',
  'none',
]);

export const influencerTierEnum = pgEnum('influencer_tier', [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);

export const contactMethodEnum = pgEnum('contact_method', [
  'phone',
  'email',
  'kakao',
  'sms',
  'in_person',
  'video_call',
]);

// Influencers 특화 테이블들

// Influencer Profiles 테이블 (영향력 지표 관리)
export const influencerProfiles = pgTable('influencer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  tier: influencerTierEnum('tier').default('bronze').notNull(),
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
  preferredContactMethod: contactMethodEnum('preferred_contact_method'),
  specialNotes: text('special_notes'), // 특별 메모 (선호도, 주의사항 등)
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Gratitude History 테이블 (감사 표현 이력)
export const gratitudeHistory = pgTable('gratitude_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  influencerId: uuid('influencer_id')
    .notNull()
    .references(() => influencerProfiles.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  gratitudeType: gratitudeTypeEnum('gratitude_type').notNull(),
  giftType: giftTypeEnum('gift_type').default('none').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  scheduledDate: date('scheduled_date'),
  sentDate: date('sent_date'),
  deliveredDate: date('delivered_date'),
  status: gratitudeStatusEnum('status').default('planned').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),
  vendor: text('vendor'), // 선물 업체 정보
  trackingNumber: text('tracking_number'), // 배송 추적번호
  recipientFeedback: text('recipient_feedback'), // 수령자 피드백
  notes: text('notes'),
  metadata: jsonb('metadata'), // 추가 정보 (주소, 연락처 등)
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Network Analysis 테이블 (네트워크 분석 결과 캐시)
export const networkAnalysis = pgTable('network_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  analysisDate: date('analysis_date').notNull(),
  totalInfluencers: integer('total_influencers').default(0).notNull(),
  averageConversionRate: decimal('average_conversion_rate', {
    precision: 5,
    scale: 2,
  })
    .default('0')
    .notNull(),
  totalNetworkValue: decimal('total_network_value', { precision: 15, scale: 2 })
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
  networkGrowthRate: decimal('network_growth_rate', { precision: 5, scale: 2 })
    .default('0')
    .notNull(),
  analysisMetadata: jsonb('analysis_metadata'), // 상세 분석 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Referral Patterns 테이블 (소개 패턴 분석)
export const referralPatterns = pgTable('referral_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  influencerId: uuid('influencer_id')
    .notNull()
    .references(() => influencerProfiles.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  month: date('month').notNull(), // 월별 집계
  referralCount: integer('referral_count').default(0).notNull(),
  successfulCount: integer('successful_count').default(0).notNull(),
  averageTimeBetweenReferrals: integer(
    'average_time_between_referrals'
  ).default(0), // 일 단위
  preferredReferralDay: text('preferred_referral_day'), // 요일
  preferredReferralTime: text('preferred_referral_time'), // 시간대
  seasonalTrends: jsonb('seasonal_trends'), // 계절별 트렌드 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Gratitude Templates 테이블 (감사 표현 템플릿)
export const gratitudeTemplates = pgTable('gratitude_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  gratitudeType: gratitudeTypeEnum('gratitude_type').notNull(),
  giftType: giftTypeEnum('gift_type').default('none').notNull(),
  titleTemplate: text('title_template').notNull(),
  messageTemplate: text('message_template').notNull(),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }).default(
    '0'
  ),
  recommendedVendors: text('recommended_vendors').array(),
  usageCount: integer('usage_count').default(0).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const influencerProfilesRelations = relations(
  influencerProfiles,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [influencerProfiles.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [influencerProfiles.agentId],
      references: [profiles.id],
    }),
    gratitudeHistory: many(gratitudeHistory),
    referralPatterns: many(referralPatterns),
  })
);

export const gratitudeHistoryRelations = relations(
  gratitudeHistory,
  ({ one }) => ({
    influencer: one(influencerProfiles, {
      fields: [gratitudeHistory.influencerId],
      references: [influencerProfiles.id],
    }),
    agent: one(profiles, {
      fields: [gratitudeHistory.agentId],
      references: [profiles.id],
    }),
  })
);

export const networkAnalysisRelations = relations(
  networkAnalysis,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [networkAnalysis.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [networkAnalysis.teamId],
      references: [teams.id],
    }),
  })
);

export const referralPatternsRelations = relations(
  referralPatterns,
  ({ one }) => ({
    influencer: one(influencerProfiles, {
      fields: [referralPatterns.influencerId],
      references: [influencerProfiles.id],
    }),
    agent: one(profiles, {
      fields: [referralPatterns.agentId],
      references: [profiles.id],
    }),
  })
);

export const gratitudeTemplatesRelations = relations(
  gratitudeTemplates,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [gratitudeTemplates.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [gratitudeTemplates.teamId],
      references: [teams.id],
    }),
  })
);

// Influencers 특화 타입들
export type InfluencerProfile = typeof influencerProfiles.$inferSelect;
export type NewInfluencerProfile = typeof influencerProfiles.$inferInsert;
export type GratitudeHistory = typeof gratitudeHistory.$inferSelect;
export type NewGratitudeHistory = typeof gratitudeHistory.$inferInsert;
export type NetworkAnalysis = typeof networkAnalysis.$inferSelect;
export type NewNetworkAnalysis = typeof networkAnalysis.$inferInsert;
export type ReferralPattern = typeof referralPatterns.$inferSelect;
export type NewReferralPattern = typeof referralPatterns.$inferInsert;
export type GratitudeTemplate = typeof gratitudeTemplates.$inferSelect;
export type NewGratitudeTemplate = typeof gratitudeTemplates.$inferInsert;

export type GratitudeType = (typeof gratitudeTypeEnum.enumValues)[number];
export type GratitudeStatus = (typeof gratitudeStatusEnum.enumValues)[number];
export type GiftType = (typeof giftTypeEnum.enumValues)[number];
export type InfluencerTier = (typeof influencerTierEnum.enumValues)[number];
export type ContactMethod = (typeof contactMethodEnum.enumValues)[number];

// Influencers 특화 인터페이스
export interface InfluencerStats {
  totalInfluencers: number;
  averageConversionRate: number;
  totalNetworkValue: number;
  avgNetworkDepth: number;
  avgNetworkWidth: number;
  monthlyGrowth: number;
}

export interface InfluencerRanking {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  totalReferrals: number;
  successfulContracts: number;
  conversionRate: number;
  totalContractValue: number;
  networkDepth: number;
  networkWidth: number;
  lastGratitude: string;
  relationshipStrength: number;
  tier: InfluencerTier;
}

export interface GratitudeFormData {
  type: GratitudeType;
  giftType?: GiftType;
  message: string;
  scheduledDate?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
}

export interface NetworkAnalysisData {
  totalInfluencers: number;
  averageConversionRate: number;
  totalNetworkValue: number;
  avgNetworkDepth: number;
  avgNetworkWidth: number;
  monthlyGrowth: number;
  topInfluencers: InfluencerRanking[];
  networkTrends: {
    month: string;
    referrals: number;
    conversions: number;
    value: number;
  }[];
}

export interface ReferralPatternData {
  monthlyReferrals: number[];
  preferredDays: Record<string, number>;
  preferredTimes: Record<string, number>;
  seasonalTrends: Record<string, number>;
  averageTimeBetweenReferrals: number;
}

export interface GratitudeMetadata {
  recipientAddress?: string;
  recipientPhone?: string;
  deliveryInstructions?: string;
  specialRequests?: string;
  [key: string]: any;
}

export interface InfluencerOverview {
  profile: InfluencerProfile;
  client: Client;
  recentGratitude: GratitudeHistory[];
  patterns: ReferralPattern[];
}
