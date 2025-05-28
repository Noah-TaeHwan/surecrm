// Common 공개 페이지 기능에 특화된 스키마
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  invitations,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type Invitation,
  type UserRole,
} from '~/lib/supabase-schema';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles } from '~/lib/supabase-schema';

// Enum 정의
export const contentTypeEnum = pgEnum('content_type', [
  'terms_of_service',
  'privacy_policy',
  'faq',
  'announcement',
  'help_article',
]);

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'published',
  'archived',
]);

export const languageEnum = pgEnum('language', ['ko', 'en', 'ja', 'zh']);

// 🏗️ Common Tables - 새로운 명명 규칙 적용

// 공통 프로필 (auth.users와 연결)
export const commonProfiles = pgTable('common_profiles', {
  id: uuid('id').primaryKey().notNull(), // auth.users.id와 동일
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  company: text('company'),
  role: text('role').notNull().default('agent'), // 'system_admin', 'team_admin', 'agent'
  invitationsLeft: integer('invitations_left').notNull().default(5),
  settings: jsonb('settings'), // 사용자별 설정
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 공통 팀
export const commonTeams = pgTable('common_teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => commonProfiles.id),
  settings: jsonb('settings'), // 팀별 설정
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 시스템 설정
export const commonSystemSettings = pgTable('common_system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  key: text('key').notNull(),
  value: text('value').notNull(),
  type: text('type').notNull().default('string'),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  updatedBy: uuid('updated_by').references(() => commonProfiles.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 팀 설정
export const commonTeamSettings = pgTable('common_team_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => commonTeams.id),
  category: text('category').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  type: text('type').notNull().default('json'),
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => commonProfiles.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 사용자 설정
export const commonUserSettings = pgTable('common_user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => commonProfiles.id),
  category: text('category').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  type: text('type').notNull().default('json'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// FAQ
export const commonFaqs = pgTable('common_faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('general'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => commonProfiles.id),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 공개 콘텐츠
export const commonPublicContents = pgTable('common_public_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: contentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  version: text('version').notNull().default('1.0'),
  language: languageEnum('language').notNull().default('ko'),
  status: contentStatusEnum('status').notNull().default('draft'),
  effectiveDate: timestamp('effective_date', {
    withTimezone: true,
    mode: 'string',
  }),
  expiryDate: timestamp('expiry_date', { withTimezone: true, mode: 'string' }),
  authorId: uuid('author_id').references(() => commonProfiles.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 공지사항
export const commonAnnouncements = pgTable('common_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('general'),
  priority: integer('priority').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => commonProfiles.id),
  publishedAt: timestamp('published_at', {
    withTimezone: true,
    mode: 'string',
  }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 사용자 후기
export const commonTestimonials = pgTable('common_testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  quote: text('quote').notNull(),
  rating: integer('rating').notNull().default(5),
  initial: text('initial').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  order: integer('order').notNull().default(0),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => commonProfiles.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 사이트 설정
export const commonSiteSettings = pgTable('common_site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type').notNull().default('string'),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  updatedBy: uuid('updated_by').references(() => commonProfiles.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 감사 로그
export const commonAuditLogs = pgTable('common_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => commonProfiles.id),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// API 키
export const commonApiKeys = pgTable('common_api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => commonProfiles.id),
  permissions: jsonb('permissions'),
  isActive: boolean('is_active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at', {
    withTimezone: true,
    mode: 'string',
  }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 통합 설정
export const commonIntegrations = pgTable('common_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => commonProfiles.id),
  type: text('type').notNull(), // 'google_calendar', 'slack', etc.
  name: text('name').notNull(),
  config: jsonb('config').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastSyncAt: timestamp('last_sync_at', {
    withTimezone: true,
    mode: 'string',
  }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 기능 플래그
export const commonFeatureFlags = pgTable('common_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isEnabled: boolean('is_enabled').notNull().default(false),
  rolloutPercentage: integer('rollout_percentage').notNull().default(0),
  targetUsers: jsonb('target_users'), // 특정 사용자 대상
  createdBy: uuid('created_by').references(() => commonProfiles.id),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// 백업 설정
export const commonBackupConfigurations = pgTable(
  'common_backup_configurations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    schedule: text('schedule').notNull(), // cron expression
    isActive: boolean('is_active').notNull().default(true),
    retentionDays: integer('retention_days').notNull().default(30),
    config: jsonb('config'),
    lastRunAt: timestamp('last_run_at', {
      withTimezone: true,
      mode: 'string',
    }),
    createdBy: uuid('created_by').references(() => commonProfiles.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  }
);

// 🔗 기존 테이블들 (호환성 유지)
// 공개 콘텐츠 관리 테이블 (이용약관, 개인정보처리방침 등)
export const publicContents = pgTable('public_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: contentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(), // 마크다운 또는 HTML 형태
  version: text('version').notNull().default('1.0'),
  language: languageEnum('language').notNull().default('ko'),
  status: contentStatusEnum('status').notNull().default('draft'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  authorId: uuid('author_id').references(() => profiles.id),
  metadata: jsonb('metadata'), // 추가 메타데이터 (SEO, 태그 등)
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// FAQ 테이블
export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('general'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => profiles.id),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 공지사항 테이블
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('general'), // general, maintenance, feature, etc.
  priority: integer('priority').notNull().default(0), // 0: normal, 1: high, 2: urgent
  isPublished: boolean('is_published').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => profiles.id),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 사용자 후기 테이블
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  quote: text('quote').notNull(),
  rating: integer('rating').notNull().default(5), // 1-5 별점
  initial: text('initial').notNull(), // 이니셜 (예: "김")
  isVerified: boolean('is_verified').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  order: integer('order').notNull().default(0),
  language: languageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 사이트 설정 테이블
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type').notNull().default('string'), // string, number, boolean, json
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false), // 공개 API에서 접근 가능한지
  updatedBy: uuid('updated_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 페이지 조회수 추적 테이블
export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  path: text('path').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  sessionId: text('session_id'),
  userId: uuid('user_id').references(() => profiles.id), // 로그인한 사용자인 경우
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations
export const publicContentsRelations = relations(publicContents, ({ one }) => ({
  author: one(profiles, {
    fields: [publicContents.authorId],
    references: [profiles.id],
  }),
}));

export const faqsRelations = relations(faqs, ({ one }) => ({
  author: one(profiles, {
    fields: [faqs.authorId],
    references: [profiles.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(profiles, {
    fields: [announcements.authorId],
    references: [profiles.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  author: one(profiles, {
    fields: [testimonials.authorId],
    references: [profiles.id],
  }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  updatedBy: one(profiles, {
    fields: [siteSettings.updatedBy],
    references: [profiles.id],
  }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(profiles, {
    fields: [pageViews.userId],
    references: [profiles.id],
  }),
}));

// 타입 정의
export type PublicContent = typeof publicContents.$inferSelect;
export type NewPublicContent = typeof publicContents.$inferInsert;
export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

export type ContentType = (typeof contentTypeEnum.enumValues)[number];
export type ContentStatus = (typeof contentStatusEnum.enumValues)[number];
export type Language = (typeof languageEnum.enumValues)[number];

// 공개 페이지 특화 인터페이스
export interface TermsData {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: Date;
  lastUpdated: Date;
}

export interface PrivacyPolicyData {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: Date;
  lastUpdated: Date;
}

export interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

export interface PublicStats {
  totalUsers: number;
  totalTeams: number;
  totalClients: number;
  totalInvitations: number;
  avgEfficiencyIncrease: number;
  successRate: number;
  recentSignups: number;
  growthRate: number;
}

export interface TestimonialWithStats extends Testimonial {
  averageRating: number;
  totalTestimonials: number;
}
