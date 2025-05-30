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
import { profiles } from './core';

// ===== Enum 정의 =====

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

// ===== 공개 페이지 전용 테이블들 =====

// 공개 콘텐츠 (이용약관, 개인정보처리방침 등)
export const publicContents = pgTable('public_contents', {
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
  authorId: uuid('author_id').references(() => profiles.id),
  metadata: jsonb('metadata'),
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
  type: text('type').notNull().default('general'),
  priority: integer('priority').notNull().default(0),
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
  rating: integer('rating').notNull().default(5),
  initial: text('initial').notNull(),
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
  type: text('type').notNull().default('string'),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
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
  userId: uuid('user_id').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== Relations 정의 =====

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

// ===== 타입 추론 =====

export type PublicContent = typeof publicContents.$inferSelect;
export type NewPublicContent = typeof publicContents.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

// Enum 타입들
export type ContentType = (typeof contentTypeEnum.enumValues)[number];
export type ContentStatus = (typeof contentStatusEnum.enumValues)[number];
export type Language = (typeof languageEnum.enumValues)[number];
