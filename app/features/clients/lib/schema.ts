// 📋 Clients 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_client_ 사용 (완전 통일)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  documents,
  pipelineStages,
  meetings,
  referrals,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type NewClient,
  type ClientDetail,
  type NewClientDetail,
  type InsuranceInfo,
  type NewInsuranceInfo,
  type Document,
  type NewDocument,
  type PipelineStage,
  type Meeting,
  type Referral,
  type UserRole,
  type Importance,
  type Gender,
  type InsuranceType,
  type DocumentType,
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
import { profiles, clients, insuranceInfo, pipelineStages } from '~/lib/schema';

// 📌 Clients 특화 Enum (완전한 app_client_ prefix 통일)
export const appClientStatusEnum = pgEnum('app_client_status_enum', [
  'prospect',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost',
  'dormant',
]);

export const appClientContactMethodEnum = pgEnum(
  'app_client_contact_method_enum',
  ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call']
);

export const appClientSourceEnum = pgEnum('app_client_source_enum', [
  'referral',
  'cold_call',
  'marketing',
  'website',
  'social_media',
  'event',
  'partner',
  'other',
]);

// 🔒 고객 데이터 보안 관련 Enum 추가
export const appClientPrivacyLevelEnum = pgEnum(
  'app_client_privacy_level_enum',
  [
    'public', // 팀 내 공유 가능
    'restricted', // 제한적 공유
    'private', // 본인만 접근
    'confidential', // 최고 보안
  ]
);

export const appClientDataAccessLogTypeEnum = pgEnum(
  'app_client_data_access_log_type_enum',
  ['view', 'edit', 'export', 'share', 'delete']
);

// 🏷️ Clients 특화 테이블들 (완전한 app_client_ prefix 통일)

// Client Tags (고객 태그) - prefix 통일
export const appClientTags = pgTable('app_client_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  name: text('name').notNull(),
  color: text('color').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  // 🔒 보안 강화 필드
  privacyLevel: appClientPrivacyLevelEnum('privacy_level')
    .default('public')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Tag Assignments (고객-태그 연결) - prefix 통일
export const appClientTagAssignments = pgTable('app_client_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => appClientTags.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by')
    .notNull()
    .references(() => profiles.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Contact History (연락 이력) - prefix 통일 및 보안 강화
export const appClientContactHistory = pgTable('app_client_contact_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  contactMethod: appClientContactMethodEnum('contact_method').notNull(),
  subject: text('subject'),
  content: text('content'),
  duration: integer('duration'), // 분 (통화시간 등)
  outcome: text('outcome'),
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date', { withTimezone: true }),
  attachments: jsonb('attachments'), // 첨부파일 정보
  // 🔒 보안 강화 필드
  privacyLevel: appClientPrivacyLevelEnum('privacy_level')
    .default('restricted')
    .notNull(),
  isConfidential: boolean('is_confidential').default(false).notNull(),
  accessibleBy: text('accessible_by').array(), // 접근 가능한 사용자 ID 목록
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Family Members (가족 구성원) - prefix 통일 및 보안 강화
export const appClientFamilyMembers = pgTable('app_client_family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relationship: text('relationship').notNull(), // 배우자, 자녀, 부모 등
  birthDate: timestamp('birth_date', { withTimezone: true }),
  gender: text('gender'),
  occupation: text('occupation'),
  phone: text('phone'),
  email: text('email'),
  hasInsurance: boolean('has_insurance').default(false),
  insuranceDetails: jsonb('insurance_details'),
  notes: text('notes'),
  // 🔒 개인정보 보호 강화
  privacyLevel: appClientPrivacyLevelEnum('privacy_level')
    .default('confidential')
    .notNull(),
  consentDate: timestamp('consent_date', { withTimezone: true }), // 정보 제공 동의 날짜
  consentExpiry: timestamp('consent_expiry', { withTimezone: true }), // 동의 만료 날짜
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Preferences (고객 선호도) - prefix 통일
export const appClientPreferences = pgTable('app_client_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  preferredContactMethod: appClientContactMethodEnum(
    'preferred_contact_method'
  ).default('phone'),
  preferredContactTime: jsonb('preferred_contact_time'), // { start: "09:00", end: "18:00", days: [1,2,3,4,5] }
  communicationStyle: text('communication_style'), // formal, casual, technical
  interests: text('interests').array(),
  concerns: text('concerns').array(),
  budget: jsonb('budget'), // { min: 100000, max: 500000, currency: "KRW" }
  riskTolerance: text('risk_tolerance'), // conservative, moderate, aggressive
  investmentGoals: text('investment_goals').array(),
  specialNeeds: text('special_needs'),
  notes: text('notes'),
  // 🔒 마케팅 동의 관리
  marketingConsent: boolean('marketing_consent').default(false).notNull(),
  dataProcessingConsent: boolean('data_processing_consent')
    .default(true)
    .notNull(),
  thirdPartyShareConsent: boolean('third_party_share_consent')
    .default(false)
    .notNull(),
  privacyLevel: appClientPrivacyLevelEnum('privacy_level')
    .default('private')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Analytics (고객 분석) - prefix 통일
export const appClientAnalytics = pgTable('app_client_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  totalContacts: integer('total_contacts').default(0),
  lastContactDate: timestamp('last_contact_date', { withTimezone: true }),
  averageResponseTime: integer('average_response_time'), // 시간 단위
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }), // 0-100
  conversionProbability: decimal('conversion_probability', {
    precision: 5,
    scale: 2,
  }), // 0-100
  lifetimeValue: decimal('lifetime_value', { precision: 12, scale: 2 }),
  acquisitionCost: decimal('acquisition_cost', { precision: 10, scale: 2 }),
  referralCount: integer('referral_count').default(0),
  referralValue: decimal('referral_value', { precision: 12, scale: 2 }),
  lastAnalyzedAt: timestamp('last_analyzed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Milestones (고객 마일스톤) - prefix 통일
export const appClientMilestones = pgTable('app_client_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // contract, payment, renewal, claim, etc.
  value: decimal('value', { precision: 12, scale: 2 }),
  achievedAt: timestamp('achieved_at', { withTimezone: true }).notNull(),
  isSignificant: boolean('is_significant').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Stage History (단계 변경 이력) - prefix 통일
export const appClientStageHistory = pgTable('app_client_stage_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  fromStageId: uuid('from_stage_id').references(() => pipelineStages.id),
  toStageId: uuid('to_stage_id')
    .notNull()
    .references(() => pipelineStages.id),
  reason: text('reason'),
  notes: text('notes'),
  changedAt: timestamp('changed_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔒 NEW: Client Data Access Log (고객 데이터 접근 로그) - 보안 강화
export const appClientDataAccessLogs = pgTable('app_client_data_access_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  accessedBy: uuid('accessed_by')
    .notNull()
    .references(() => profiles.id),
  accessType: appClientDataAccessLogTypeEnum('access_type').notNull(),
  accessedData: text('accessed_data').array(), // 접근한 필드들
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  purpose: text('purpose'), // 접근 목적
  accessResult: text('access_result'), // success, failed, denied
  metadata: jsonb('metadata'), // 추가 정보
  accessedAt: timestamp('accessed_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔒 NEW: Client Data Backup (고객 데이터 백업) - 데이터 보호
export const appClientDataBackups = pgTable('app_client_data_backups', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  backupType: text('backup_type').notNull(), // full, incremental, emergency
  backupData: jsonb('backup_data').notNull(), // 암호화된 백업 데이터
  backupHash: text('backup_hash').notNull(), // 데이터 무결성 검증
  triggeredBy: uuid('triggered_by')
    .notNull()
    .references(() => profiles.id),
  triggerReason: text('trigger_reason'), // scheduled, manual, before_delete
  retentionUntil: timestamp('retention_until', {
    withTimezone: true,
  }).notNull(),
  isEncrypted: boolean('is_encrypted').default(true).notNull(),
  encryptionKey: text('encryption_key'), // 암호화 키 ID (실제 키는 별도 보관)
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의) - 새로운 테이블명 반영
export const appClientTagsRelations = relations(
  appClientTags,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [appClientTags.agentId],
      references: [profiles.id],
    }),
    assignments: many(appClientTagAssignments),
  })
);

export const appClientTagAssignmentsRelations = relations(
  appClientTagAssignments,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientTagAssignments.clientId],
      references: [clients.id],
    }),
    tag: one(appClientTags, {
      fields: [appClientTagAssignments.tagId],
      references: [appClientTags.id],
    }),
    assignedByAgent: one(profiles, {
      fields: [appClientTagAssignments.assignedBy],
      references: [profiles.id],
    }),
  })
);

export const appClientContactHistoryRelations = relations(
  appClientContactHistory,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientContactHistory.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [appClientContactHistory.agentId],
      references: [profiles.id],
    }),
  })
);

export const appClientFamilyMembersRelations = relations(
  appClientFamilyMembers,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientFamilyMembers.clientId],
      references: [clients.id],
    }),
  })
);

export const appClientPreferencesRelations = relations(
  appClientPreferences,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientPreferences.clientId],
      references: [clients.id],
    }),
  })
);

export const appClientAnalyticsRelations = relations(
  appClientAnalytics,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientAnalytics.clientId],
      references: [clients.id],
    }),
  })
);

export const appClientMilestonesRelations = relations(
  appClientMilestones,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientMilestones.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [appClientMilestones.agentId],
      references: [profiles.id],
    }),
  })
);

export const appClientStageHistoryRelations = relations(
  appClientStageHistory,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientStageHistory.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [appClientStageHistory.agentId],
      references: [profiles.id],
    }),
    fromStage: one(pipelineStages, {
      fields: [appClientStageHistory.fromStageId],
      references: [pipelineStages.id],
    }),
    toStage: one(pipelineStages, {
      fields: [appClientStageHistory.toStageId],
      references: [pipelineStages.id],
    }),
  })
);

export const appClientDataAccessLogsRelations = relations(
  appClientDataAccessLogs,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientDataAccessLogs.clientId],
      references: [clients.id],
    }),
    accessedByAgent: one(profiles, {
      fields: [appClientDataAccessLogs.accessedBy],
      references: [profiles.id],
    }),
  })
);

export const appClientDataBackupsRelations = relations(
  appClientDataBackups,
  ({ one }) => ({
    client: one(clients, {
      fields: [appClientDataBackups.clientId],
      references: [clients.id],
    }),
    triggeredByAgent: one(profiles, {
      fields: [appClientDataBackups.triggeredBy],
      references: [profiles.id],
    }),
  })
);

// 📝 Clients 특화 타입들 (새로운 테이블명 반영)
export type AppClientTag = typeof appClientTags.$inferSelect;
export type NewAppClientTag = typeof appClientTags.$inferInsert;
export type AppClientTagAssignment =
  typeof appClientTagAssignments.$inferSelect;
export type NewAppClientTagAssignment =
  typeof appClientTagAssignments.$inferInsert;
export type AppClientContactHistory =
  typeof appClientContactHistory.$inferSelect;
export type NewAppClientContactHistory =
  typeof appClientContactHistory.$inferInsert;
export type AppClientFamilyMember = typeof appClientFamilyMembers.$inferSelect;
export type NewAppClientFamilyMember =
  typeof appClientFamilyMembers.$inferInsert;
export type AppClientPreferences = typeof appClientPreferences.$inferSelect;
export type NewAppClientPreferences = typeof appClientPreferences.$inferInsert;
export type AppClientAnalytics = typeof appClientAnalytics.$inferSelect;
export type NewAppClientAnalytics = typeof appClientAnalytics.$inferInsert;
export type AppClientMilestone = typeof appClientMilestones.$inferSelect;
export type NewAppClientMilestone = typeof appClientMilestones.$inferInsert;
export type AppClientStageHistory = typeof appClientStageHistory.$inferSelect;
export type NewAppClientStageHistory =
  typeof appClientStageHistory.$inferInsert;
export type AppClientDataAccessLog =
  typeof appClientDataAccessLogs.$inferSelect;
export type NewAppClientDataAccessLog =
  typeof appClientDataAccessLogs.$inferInsert;
export type AppClientDataBackup = typeof appClientDataBackups.$inferSelect;
export type NewAppClientDataBackup = typeof appClientDataBackups.$inferInsert;

// Enum 타입들
export type ClientStatus = (typeof appClientStatusEnum.enumValues)[number];
export type ClientContactMethod =
  (typeof appClientContactMethodEnum.enumValues)[number];
export type ClientSource = (typeof appClientSourceEnum.enumValues)[number];
export type ClientPrivacyLevel =
  (typeof appClientPrivacyLevelEnum.enumValues)[number];
export type ClientDataAccessLogType =
  (typeof appClientDataAccessLogTypeEnum.enumValues)[number];

// 🎯 Clients 특화 인터페이스 (보안 강화)
import type { Client } from '~/lib/schema';

export interface ClientOverview {
  client: Client;
  tags: AppClientTag[];
  preferences?: AppClientPreferences;
  analytics?: AppClientAnalytics;
  familyMembers: AppClientFamilyMember[];
  recentContacts: AppClientContactHistory[];
  milestones: AppClientMilestone[];
  stageHistory: AppClientStageHistory[];
  // 🔒 보안 정보
  accessLevel: ClientPrivacyLevel;
  dataConsents: {
    marketing: boolean;
    dataProcessing: boolean;
    thirdPartyShare: boolean;
  };
}

export interface ClientSearchFilters {
  query?: string;
  stageIds?: string[];
  tagIds?: string[];
  importance?: string[];
  sources?: ClientSource[];
  privacyLevels?: ClientPrivacyLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasRecentContact?: boolean;
  hasUpcomingMeeting?: boolean;
}

export interface ClientSecuritySettings {
  clientId: string;
  privacyLevel: ClientPrivacyLevel;
  dataRetentionPeriod: number; // 일 단위
  accessRestrictions: string[]; // 제한된 사용자 목록
  auditLogEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  encryptionRequired: boolean;
}

// 이전 네이밍과의 호환성을 위한 타입 alias (Deprecated - 새 코드에서 사용 금지)
/** @deprecated Use AppClientTag instead */
export type ClientTag = AppClientTag;
/** @deprecated Use AppClientContactHistory instead */
export type ClientContactHistory = AppClientContactHistory;
/** @deprecated Use AppClientFamilyMember instead */
export type ClientFamilyMember = AppClientFamilyMember;
/** @deprecated Use AppClientPreferences instead */
export type ClientPreferences = AppClientPreferences;
/** @deprecated Use AppClientAnalytics instead */
export type ClientAnalytics = AppClientAnalytics;
