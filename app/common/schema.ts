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
