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
} from '~/lib/schema/core';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  profiles,
  teams,
  clients,
  invitations,
  meetings,
  type Profile,
  type Team,
  type Client,
  type Invitation,
  type Meeting,
  type InvitationStatus,
} from '~/lib/schema/core';

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

// Invitations 특화 테이블들 - MVP 단순화

// MVP: 추천 코드 사용 로그 (기본적인 추적만)
export const appInvitationUsageLogs = pgTable('app_invitation_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  invitationId: uuid('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id), // 가입한 사용자 ID
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  action: usageActionEnum('action').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의 - MVP 단순화
export const appInvitationUsageLogsRelations = relations(
  appInvitationUsageLogs,
  ({ one }) => ({
    invitation: one(invitations, {
      fields: [appInvitationUsageLogs.invitationId],
      references: [invitations.id],
    }),
    user: one(profiles, {
      fields: [appInvitationUsageLogs.userId],
      references: [profiles.id],
    }),
  })
);

// MVP 타입 정의 - 필요한 것만
export type InvitationUsageLog = typeof appInvitationUsageLogs.$inferSelect;
export type NewInvitationUsageLog = typeof appInvitationUsageLogs.$inferInsert;

// MVP: 기본적인 타입들만 유지
export type InvitationType = (typeof invitationTypeEnum.enumValues)[number];
export type InvitationSource = (typeof invitationSourceEnum.enumValues)[number];
export type UsageAction = (typeof usageActionEnum.enumValues)[number];

// MVP: 단순화된 통계 인터페이스
export interface InvitationStats {
  totalSent: number;
  totalUsed: number;
  availableInvitations: number;
  successfulInvitations: number;
  // MVP: 복잡한 전환율, 만료 통계 제거
}

// MVP: 단순화된 추천 코드 카드 데이터
export interface InvitationCardData {
  id: string;
  code: string;
  status: InvitationStatus;
  createdAt: string;
  usedAt?: string;
  invitee?: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  };
  // MVP: personalMessage, source, expiresAt 제거 (단순화)
}

// MVP: 복잡한 인터페이스들 제거
// - InvitationFormData (복잡한 폼 불필요)
// - InvitationAnalyticsData (분석 시스템 불필요)
// - WaitlistEntry (대기자 명단 불필요)
// - InvitationRewardData (보상 시스템 불필요)
// - InvitationMetadata (상세 메타데이터 불필요)
// - CampaignStats (캠페인 시스템 불필요)
// - ReferralAnalytics (상세 분석 불필요)
