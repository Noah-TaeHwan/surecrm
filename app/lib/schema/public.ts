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

// ===== Enum 정의 (새로운 네이밍 컨벤션 적용) =====

export const publicContentTypeEnum = pgEnum('public_content_type_enum', [
  'terms_of_service',
  'privacy_policy',
  'faq',
  'announcement',
  'help_article',
]);

export const publicContentStatusEnum = pgEnum('public_content_status_enum', [
  'draft',
  'published',
  'archived',
]);

export const publicLanguageEnum = pgEnum('public_language_enum', [
  'ko',
  'en',
  'ja',
  'zh',
]);

// ===== 공개 페이지 전용 테이블들 =====

// 공개 콘텐츠 (이용약관, 개인정보처리방침 등)
export const publicContents = pgTable('public_site_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: publicContentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  version: text('version').notNull().default('1.0'),
  language: publicLanguageEnum('language').notNull().default('ko'),
  status: publicContentStatusEnum('status').notNull().default('draft'),
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
export const faqs = pgTable('public_site_faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull().default('general'),
  order: integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  language: publicLanguageEnum('language').notNull().default('ko'),
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
export const announcements = pgTable('public_site_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('general'),
  priority: integer('priority').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  language: publicLanguageEnum('language').notNull().default('ko'),
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
export const testimonials = pgTable('public_site_testimonials', {
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
  language: publicLanguageEnum('language').notNull().default('ko'),
  authorId: uuid('author_id').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 사이트 설정 테이블
export const siteSettings = pgTable('public_site_settings', {
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

// 대기자 명단 테이블 (Waitlist)
export const waitlist = pgTable('public_site_waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  company: text('company'),
  role: text('role'),
  message: text('message'),
  source: text('source'), // 'landing', 'direct', 'referral', etc.
  isContacted: boolean('is_contacted').notNull().default(false),
  contactedAt: timestamp('contacted_at', { withTimezone: true }),
  contactedBy: uuid('contacted_by').references(() => profiles.id),
  notes: text('notes'), // 관리자 메모
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 문의사항 테이블 (Contact Form)
export const contacts = pgTable('public_site_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'), // pending, in-progress, resolved
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  respondedBy: uuid('responded_by').references(() => profiles.id),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 페이지 조회수 추적 테이블
export const pageViews = pgTable('public_site_analytics', {
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

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  contactedBy: one(profiles, {
    fields: [waitlist.contactedBy],
    references: [profiles.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  respondedBy: one(profiles, {
    fields: [contacts.respondedBy],
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
export type Waitlist = typeof waitlist.$inferSelect;
export type NewWaitlist = typeof waitlist.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

// Enum 타입들 (새로운 네이밍 반영)
export type ContentType = (typeof publicContentTypeEnum.enumValues)[number];
export type ContentStatus = (typeof publicContentStatusEnum.enumValues)[number];
export type Language = (typeof publicLanguageEnum.enumValues)[number];
