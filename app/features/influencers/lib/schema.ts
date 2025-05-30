// 🌟 Influencers 기능 전용 스키마
// Prefix 네이밍 컨벤션: influencer_ 사용
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
} from '~/lib/schema';

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
import { profiles, teams, clients, referrals, type Client } from '~/lib/schema';

// 📌 Influencers 특화 Enum (prefix 네이밍 적용)
export const influencerGratitudeTypeEnum = pgEnum(
  'influencer_gratitude_type_enum',
  [
    'thank_you_call',
    'thank_you_message',
    'gift_delivery',
    'meal_invitation',
    'event_invitation',
    'custom',
  ]
);

export const influencerGratitudeStatusEnum = pgEnum(
  'influencer_gratitude_status_enum',
  ['planned', 'scheduled', 'sent', 'delivered', 'completed', 'cancelled']
);

export const influencerGiftTypeEnum = pgEnum('influencer_gift_type_enum', [
  'flowers',
  'fruit_basket',
  'gift_card',
  'meal_voucher',
  'coffee_voucher',
  'custom_gift',
  'none',
]);

export const influencerTierEnum = pgEnum('influencer_tier_enum', [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);

export const influencerContactMethodEnum = pgEnum(
  'influencer_contact_method_enum',
  ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call']
);

// 🏷️ Influencers 특화 테이블들 (prefix 네이밍 적용)

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
  preferredContactMethod: influencerContactMethodEnum(
    'preferred_contact_method'
  ),
  specialNotes: text('special_notes'), // 특별 메모 (선호도, 주의사항 등)
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Influencer Gratitude History 테이블 (감사 표현 이력)
export const influencerGratitudeHistory = pgTable(
  'influencer_gratitude_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => influencerProfiles.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    gratitudeType: influencerGratitudeTypeEnum('gratitude_type').notNull(),
    giftType: influencerGiftTypeEnum('gift_type').default('none').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    scheduledDate: date('scheduled_date'),
    sentDate: date('sent_date'),
    deliveredDate: date('delivered_date'),
    status: influencerGratitudeStatusEnum('status')
      .default('planned')
      .notNull(),
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
  }
);

// Influencer Network Analysis 테이블 (네트워크 분석 결과 캐시)
export const influencerNetworkAnalysis = pgTable(
  'influencer_network_analysis',
  {
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
    analysisMetadata: jsonb('analysis_metadata'), // 상세 분석 데이터
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 🔗 Relations (관계 정의)
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
    gratitudeHistory: many(influencerGratitudeHistory),
  })
);

export const influencerGratitudeHistoryRelations = relations(
  influencerGratitudeHistory,
  ({ one }) => ({
    influencer: one(influencerProfiles, {
      fields: [influencerGratitudeHistory.influencerId],
      references: [influencerProfiles.id],
    }),
    agent: one(profiles, {
      fields: [influencerGratitudeHistory.agentId],
      references: [profiles.id],
    }),
  })
);

export const influencerNetworkAnalysisRelations = relations(
  influencerNetworkAnalysis,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [influencerNetworkAnalysis.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [influencerNetworkAnalysis.teamId],
      references: [teams.id],
    }),
  })
);

// 📝 Influencers 특화 타입들 (실제 코드와 일치)
export type InfluencerProfile = typeof influencerProfiles.$inferSelect;
export type NewInfluencerProfile = typeof influencerProfiles.$inferInsert;
export type InfluencerGratitudeHistory =
  typeof influencerGratitudeHistory.$inferSelect;
export type NewInfluencerGratitudeHistory =
  typeof influencerGratitudeHistory.$inferInsert;
export type InfluencerNetworkAnalysis =
  typeof influencerNetworkAnalysis.$inferSelect;
export type NewInfluencerNetworkAnalysis =
  typeof influencerNetworkAnalysis.$inferInsert;

export type InfluencerGratitudeType =
  (typeof influencerGratitudeTypeEnum.enumValues)[number];
export type InfluencerGratitudeStatus =
  (typeof influencerGratitudeStatusEnum.enumValues)[number];
export type InfluencerGiftType =
  (typeof influencerGiftTypeEnum.enumValues)[number];
export type InfluencerTier = (typeof influencerTierEnum.enumValues)[number];
export type InfluencerContactMethod =
  (typeof influencerContactMethodEnum.enumValues)[number];

// 🎯 Influencers 특화 인터페이스
export interface InfluencerOverview {
  profile: InfluencerProfile;
  client: Client;
  recentGratitude: InfluencerGratitudeHistory[];
  networkStats: {
    directReferrals: number;
    chainLength: number;
    totalValue: number;
    conversionRate: number;
  };
  upcomingGratitude: InfluencerGratitudeHistory[];
}

export interface InfluencerFilter {
  tiers?: InfluencerTier[];
  minReferrals?: number;
  minConversionRate?: number;
  lastReferralDays?: number;
  lastGratitudeDays?: number;
  isActive?: boolean;
}

export interface InfluencerNetworkMap {
  nodes: Array<{
    id: string;
    name: string;
    tier: InfluencerTier;
    totalReferrals: number;
    conversionRate: number;
    x: number;
    y: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    referralCount: number;
    contractValue: number;
  }>;
}
