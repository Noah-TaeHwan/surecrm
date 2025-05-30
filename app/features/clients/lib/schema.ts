// 📋 Clients 기능 전용 스키마
// Prefix 네이밍 컨벤션: client_ 사용
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
import { profiles, clients, insuranceInfo } from '~/lib/schema';

// 📌 Clients 특화 Enum (prefix 네이밍 적용)
export const clientStatusEnum = pgEnum('client_status_enum', [
  'prospect',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost',
  'dormant',
]);

export const clientContactMethodEnum = pgEnum('client_contact_method_enum', [
  'phone',
  'email',
  'kakao',
  'sms',
  'in_person',
  'video_call',
]);

export const clientSourceEnum = pgEnum('client_source_enum', [
  'referral',
  'cold_call',
  'marketing',
  'website',
  'social_media',
  'event',
  'partner',
  'other',
]);

// 🏷️ Clients 특화 테이블들 (prefix 네이밍 적용)

// Client Tags (고객 태그)
export const clientTags = pgTable('client_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  name: text('name').notNull(),
  color: text('color').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Tag Assignments (고객-태그 연결)
export const clientTagAssignments = pgTable('client_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => clientTags.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Contact History (연락 이력)
export const clientContactHistory = pgTable('client_contact_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  contactMethod: clientContactMethodEnum('contact_method').notNull(),
  subject: text('subject'),
  content: text('content'),
  duration: integer('duration'), // 분 (통화시간 등)
  outcome: text('outcome'),
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date', { withTimezone: true }),
  attachments: jsonb('attachments'), // 첨부파일 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Family Members (가족 구성원)
export const clientFamilyMembers = pgTable('client_family_members', {
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Preferences (고객 선호도)
export const clientPreferences = pgTable('client_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  preferredContactMethod: clientContactMethodEnum(
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Analytics (고객 분석)
export const clientAnalytics = pgTable('client_analytics', {
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
  referralValue: decimal('referral_value', { precision: 12, scale: 2 }).default(
    '0'
  ),
  lastAnalyzedAt: timestamp('last_analyzed_at', {
    withTimezone: true,
  }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Milestones (고객 마일스톤)
export const clientMilestones = pgTable('client_milestones', {
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
  isSignificant: boolean('is_significant').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의)
export const clientTagsRelations = relations(clientTags, ({ one, many }) => ({
  agent: one(profiles, {
    fields: [clientTags.agentId],
    references: [profiles.id],
  }),
  assignments: many(clientTagAssignments),
}));

export const clientTagAssignmentsRelations = relations(
  clientTagAssignments,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientTagAssignments.clientId],
      references: [clients.id],
    }),
    tag: one(clientTags, {
      fields: [clientTagAssignments.tagId],
      references: [clientTags.id],
    }),
  })
);

export const clientContactHistoryRelations = relations(
  clientContactHistory,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientContactHistory.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [clientContactHistory.agentId],
      references: [profiles.id],
    }),
  })
);

export const clientFamilyMembersRelations = relations(
  clientFamilyMembers,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientFamilyMembers.clientId],
      references: [clients.id],
    }),
  })
);

export const clientPreferencesRelations = relations(
  clientPreferences,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientPreferences.clientId],
      references: [clients.id],
    }),
  })
);

export const clientAnalyticsRelations = relations(
  clientAnalytics,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientAnalytics.clientId],
      references: [clients.id],
    }),
  })
);

export const clientMilestonesRelations = relations(
  clientMilestones,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientMilestones.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [clientMilestones.agentId],
      references: [profiles.id],
    }),
  })
);

// 📝 Clients 특화 타입들 (실제 코드와 일치)
export type ClientTag = typeof clientTags.$inferSelect;
export type NewClientTag = typeof clientTags.$inferInsert;
export type ClientTagAssignment = typeof clientTagAssignments.$inferSelect;
export type NewClientTagAssignment = typeof clientTagAssignments.$inferInsert;
export type ClientContactHistory = typeof clientContactHistory.$inferSelect;
export type NewClientContactHistory = typeof clientContactHistory.$inferInsert;
export type ClientFamilyMember = typeof clientFamilyMembers.$inferSelect;
export type NewClientFamilyMember = typeof clientFamilyMembers.$inferInsert;
export type ClientPreferences = typeof clientPreferences.$inferSelect;
export type NewClientPreferences = typeof clientPreferences.$inferInsert;
export type ClientAnalytics = typeof clientAnalytics.$inferSelect;
export type NewClientAnalytics = typeof clientAnalytics.$inferInsert;
export type ClientMilestone = typeof clientMilestones.$inferSelect;
export type NewClientMilestone = typeof clientMilestones.$inferInsert;

export type ClientStatus = (typeof clientStatusEnum.enumValues)[number];
export type ClientContactMethod =
  (typeof clientContactMethodEnum.enumValues)[number];
export type ClientSource = (typeof clientSourceEnum.enumValues)[number];

// 🎯 Clients 특화 인터페이스 (types.ts와 일치)
import type { Client, Importance } from '~/lib/schema';

export interface ClientOverview {
  client: Client;
  analytics?: ClientAnalytics;
  preferences?: ClientPreferences;
  tags: ClientTag[];
  familyMembers: ClientFamilyMember[];
  recentContacts: ClientContactHistory[];
  milestones: ClientMilestone[];
}

export interface ContactSummary {
  totalContacts: number;
  lastContact?: ClientContactHistory;
  upcomingActions: {
    action: string;
    date: Date;
    priority: string;
  }[];
  responseRate: number;
  averageResponseTime: number;
}

export interface ReferralNetwork {
  referrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    phone: string;
    lastContactDate?: string;
  }>;
  siblingReferrals: Array<{
    id: string;
    fullName: string;
    currentStage?: string;
    contractAmount: number;
    relationship: string;
    lastContactDate?: string;
  }>;
  stats: {
    totalReferred: number;
    totalContracts: number;
    totalValue: number;
    conversionRate: number;
  };
}

export interface ClientFilter {
  stages?: string[];
  importance?: Importance[];
  tags?: string[];
  sources?: ClientSource[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasInsurance?: boolean;
  hasFamilyMembers?: boolean;
  engagementScore?: {
    min: number;
    max: number;
  };
}

export interface ClientSearchResult {
  clients: Client[];
  totalCount: number;
  facets: {
    stages: { name: string; count: number }[];
    importance: { level: string; count: number }[];
    tags: { name: string; count: number }[];
    sources: { source: string; count: number }[];
  };
}
