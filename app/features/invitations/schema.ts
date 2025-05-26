// Invitations 기능에 특화된 스키마
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  invitations,
  // 타입들
  type Profile,
  type Team,
  type Invitation,
  type NewInvitation,
  type UserRole,
  type InvitationStatus,
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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  profiles,
  teams,
  invitations,
  type InvitationStatus,
} from '~/lib/supabase-schema';

// Invitations 특화 Enum
export const invitationTypeEnum = pgEnum('invitation_type', [
  'standard',
  'premium',
  'team_admin',
  'beta_tester',
]);

export const invitationSourceEnum = pgEnum('invitation_source', [
  'direct_link',
  'email',
  'sms',
  'kakao_talk',
  'qr_code',
  'referral_bonus',
]);

export const waitlistStatusEnum = pgEnum('waitlist_status', [
  'waiting',
  'invited',
  'registered',
  'rejected',
]);

export const usageActionEnum = pgEnum('usage_action', [
  'viewed',
  'clicked',
  'registered',
  'completed',
]);

// Invitations 특화 테이블들

// Invitation Usage Logs 테이블 (초대장 사용 로그)
export const invitationUsageLogs = pgTable('invitation_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  invitationId: uuid('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id), // 가입한 사용자 ID (가입 완료 시에만)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  action: usageActionEnum('action').notNull(),
  actionData: jsonb('action_data'), // 액션 관련 추가 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Templates 테이블 (초대 메시지 템플릿)
export const invitationTemplates = pgTable('invitation_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  messageTemplate: text('message_template').notNull(),
  type: invitationTypeEnum('type').default('standard').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Rewards 테이블 (초대 보상 시스템)
export const invitationRewards = pgTable('invitation_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => profiles.id),
  inviteeId: uuid('invitee_id')
    .notNull()
    .references(() => profiles.id),
  invitationId: uuid('invitation_id')
    .notNull()
    .references(() => invitations.id),
  rewardType: text('reward_type').notNull(), // 'additional_invitations', 'premium_features', 'credits'
  rewardValue: integer('reward_value').notNull(), // 보상 수량
  rewardDescription: text('reward_description').notNull(),
  isGranted: boolean('is_granted').default(false).notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'), // 보상 관련 추가 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Analytics 테이블 (초대 성과 분석)
export const invitationAnalytics = pgTable('invitation_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  date: date('date').notNull(),
  invitationsSent: integer('invitations_sent').default(0).notNull(),
  invitationsViewed: integer('invitations_viewed').default(0).notNull(),
  invitationsUsed: integer('invitations_used').default(0).notNull(),
  newRegistrations: integer('new_registrations').default(0).notNull(),
  conversionRate: integer('conversion_rate').default(0).notNull(), // 백분율 (0-100)
  topSource: invitationSourceEnum('top_source'),
  analyticsData: jsonb('analytics_data'), // 상세 분석 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Waitlist 테이블 (대기자 명단)
export const invitationWaitlist = pgTable('invitation_waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  phone: text('phone'),
  company: text('company'),
  referredBy: text('referred_by'), // 추천인 정보
  requestMessage: text('request_message'), // 가입 요청 메시지
  priority: integer('priority').default(0).notNull(), // 우선순위 (높을수록 우선)
  status: waitlistStatusEnum('status').default('waiting').notNull(),
  invitedAt: timestamp('invited_at', { withTimezone: true }),
  invitationId: uuid('invitation_id').references(() => invitations.id), // 발송된 초대장 ID
  registeredAt: timestamp('registered_at', { withTimezone: true }),
  registeredUserId: uuid('registered_user_id').references(() => profiles.id), // 가입 완료한 사용자 ID
  metadata: jsonb('metadata'), // 추가 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Campaigns 테이블 (초대 캠페인 관리)
export const invitationCampaigns = pgTable('invitation_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  templateId: uuid('template_id').references(() => invitationTemplates.id),
  targetAudience: text('target_audience'), // 'general', 'professionals', 'students' 등
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  maxInvitations: integer('max_invitations'),
  currentInvitations: integer('current_invitations').default(0).notNull(),
  bonusRewards: jsonb('bonus_rewards'), // 캠페인 특별 보상
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitation Referral Tracking 테이블 (추천 추적)
export const invitationReferralTracking = pgTable(
  'invitation_referral_tracking',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invitationId: uuid('invitation_id')
      .notNull()
      .references(() => invitations.id),
    referralSource: text('referral_source'), // 'social_media', 'word_of_mouth', 'professional_network'
    referralDetails: jsonb('referral_details'), // 추천 경로 상세 정보
    conversionPath: jsonb('conversion_path'), // 전환 경로 추적
    attributionScore: integer('attribution_score').default(100).notNull(), // 기여도 점수 (0-100)
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Relations 정의
export const invitationUsageLogsRelations = relations(
  invitationUsageLogs,
  ({ one }) => ({
    invitation: one(invitations, {
      fields: [invitationUsageLogs.invitationId],
      references: [invitations.id],
    }),
    user: one(profiles, {
      fields: [invitationUsageLogs.userId],
      references: [profiles.id],
    }),
  })
);

export const invitationTemplatesRelations = relations(
  invitationTemplates,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [invitationTemplates.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [invitationTemplates.teamId],
      references: [teams.id],
    }),
    campaigns: many(invitationCampaigns),
  })
);

export const invitationRewardsRelations = relations(
  invitationRewards,
  ({ one }) => ({
    inviter: one(profiles, {
      fields: [invitationRewards.inviterId],
      references: [profiles.id],
    }),
    invitee: one(profiles, {
      fields: [invitationRewards.inviteeId],
      references: [profiles.id],
    }),
    invitation: one(invitations, {
      fields: [invitationRewards.invitationId],
      references: [invitations.id],
    }),
  })
);

export const invitationAnalyticsRelations = relations(
  invitationAnalytics,
  ({ one }) => ({
    user: one(profiles, {
      fields: [invitationAnalytics.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [invitationAnalytics.teamId],
      references: [teams.id],
    }),
  })
);

export const invitationWaitlistRelations = relations(
  invitationWaitlist,
  ({ one }) => ({
    invitation: one(invitations, {
      fields: [invitationWaitlist.invitationId],
      references: [invitations.id],
    }),
    registeredUser: one(profiles, {
      fields: [invitationWaitlist.registeredUserId],
      references: [profiles.id],
    }),
  })
);

export const invitationCampaignsRelations = relations(
  invitationCampaigns,
  ({ one }) => ({
    user: one(profiles, {
      fields: [invitationCampaigns.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [invitationCampaigns.teamId],
      references: [teams.id],
    }),
    template: one(invitationTemplates, {
      fields: [invitationCampaigns.templateId],
      references: [invitationTemplates.id],
    }),
  })
);

export const invitationReferralTrackingRelations = relations(
  invitationReferralTracking,
  ({ one }) => ({
    invitation: one(invitations, {
      fields: [invitationReferralTracking.invitationId],
      references: [invitations.id],
    }),
  })
);

// Invitations 특화 타입들
export type InvitationUsageLog = typeof invitationUsageLogs.$inferSelect;
export type NewInvitationUsageLog = typeof invitationUsageLogs.$inferInsert;
export type InvitationTemplate = typeof invitationTemplates.$inferSelect;
export type NewInvitationTemplate = typeof invitationTemplates.$inferInsert;
export type InvitationReward = typeof invitationRewards.$inferSelect;
export type NewInvitationReward = typeof invitationRewards.$inferInsert;
export type InvitationAnalytics = typeof invitationAnalytics.$inferSelect;
export type NewInvitationAnalytics = typeof invitationAnalytics.$inferInsert;
export type InvitationWaitlist = typeof invitationWaitlist.$inferSelect;
export type NewInvitationWaitlist = typeof invitationWaitlist.$inferInsert;
export type InvitationCampaign = typeof invitationCampaigns.$inferSelect;
export type NewInvitationCampaign = typeof invitationCampaigns.$inferInsert;
export type InvitationReferralTracking =
  typeof invitationReferralTracking.$inferSelect;
export type NewInvitationReferralTracking =
  typeof invitationReferralTracking.$inferInsert;

export type InvitationType = (typeof invitationTypeEnum.enumValues)[number];
export type InvitationSource = (typeof invitationSourceEnum.enumValues)[number];
export type WaitlistStatus = (typeof waitlistStatusEnum.enumValues)[number];
export type UsageAction = (typeof usageActionEnum.enumValues)[number];

// Invitations 특화 인터페이스
export interface InvitationStats {
  totalSent: number;
  totalUsed: number;
  totalExpired: number;
  conversionRate: number;
  availableInvitations: number;
  successfulInvitations: number;
}

export interface InvitationCardData {
  id: string;
  code: string;
  status: InvitationStatus;
  createdAt: string;
  usedAt?: string;
  expiresAt: string;
  invitee?: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  };
  personalMessage?: string;
  source: InvitationSource;
}

export interface InvitationFormData {
  inviteeEmail?: string;
  inviteeName?: string;
  personalMessage?: string;
  type: InvitationType;
  source: InvitationSource;
  expiresInDays?: number;
  campaignId?: string;
}

export interface InvitationAnalyticsData {
  totalInvitations: number;
  successfulInvitations: number;
  conversionRate: number;
  topSources: {
    source: InvitationSource;
    count: number;
    conversionRate: number;
  }[];
  dailyStats: {
    date: string;
    sent: number;
    used: number;
    registered: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }[];
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  company?: string;
  requestMessage?: string;
  priority: number;
  status: WaitlistStatus;
  createdAt: string;
  invitedAt?: string;
  registeredAt?: string;
}

export interface InvitationRewardData {
  id: string;
  type: string;
  value: number;
  description: string;
  isGranted: boolean;
  grantedAt?: string;
  expiresAt?: string;
  inviteeName: string;
}

export interface InvitationMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
  location?: {
    country?: string;
    city?: string;
  };
  [key: string]: any;
}

export interface CampaignStats {
  campaign: InvitationCampaign;
  totalInvitations: number;
  successfulInvitations: number;
  conversionRate: number;
  remainingQuota: number;
  topPerformers: {
    userId: string;
    userName: string;
    invitationsSent: number;
    conversions: number;
  }[];
}

export interface ReferralAnalytics {
  totalReferrals: number;
  topSources: {
    source: string;
    count: number;
    conversionRate: number;
  }[];
  conversionPath: {
    step: string;
    count: number;
    dropoffRate: number;
  }[];
  attributionScores: {
    source: string;
    averageScore: number;
    totalContributions: number;
  }[];
}
