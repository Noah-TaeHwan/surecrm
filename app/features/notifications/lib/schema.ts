// 📢 Notifications 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_notification_ 사용
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  meetings,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type Meeting,
  type UserRole,
} from '~/lib/schema';

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
import { profiles, teams, clients, meetings } from '~/lib/schema';

// 📌 Notifications 특화 Enum (app_notification_ prefix 네이밍 적용)
export const appNotificationTypeEnum = pgEnum('app_notification_type_enum', [
  'meeting_reminder',
  'goal_achievement',
  'goal_deadline',
  'new_referral',
  'client_milestone',
  'team_update',
  'system_alert',
  'birthday_reminder',
  'follow_up_reminder',
  'contract_expiry',
  'payment_due',
]);

export const appNotificationPriorityEnum = pgEnum(
  'app_notification_priority_enum',
  ['low', 'normal', 'high', 'urgent']
);

export const appNotificationChannelEnum = pgEnum(
  'app_notification_channel_enum',
  ['in_app', 'email', 'sms', 'push', 'kakao']
);

export const appNotificationStatusEnum = pgEnum(
  'app_notification_status_enum',
  ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled']
);

// 🏷️ Notifications 특화 테이블들 (app_notification_ prefix 네이밍 적용)

// Notification Settings 테이블 (알림 설정)
export const appNotificationSettings = pgTable('app_notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => profiles.id),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  smsNotifications: boolean('sms_notifications').default(false).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  kakaoNotifications: boolean('kakao_notifications').default(false).notNull(),
  meetingReminders: boolean('meeting_reminders').default(true).notNull(),
  goalDeadlines: boolean('goal_deadlines').default(true).notNull(),
  newReferrals: boolean('new_referrals').default(true).notNull(),
  clientMilestones: boolean('client_milestones').default(true).notNull(),
  teamUpdates: boolean('team_updates').default(true).notNull(),
  systemAlerts: boolean('system_alerts').default(true).notNull(),
  birthdayReminders: boolean('birthday_reminders').default(true).notNull(),
  followUpReminders: boolean('follow_up_reminders').default(true).notNull(),
  quietHoursStart: text('quiet_hours_start').default('22:00'),
  quietHoursEnd: text('quiet_hours_end').default('08:00'),
  weekendNotifications: boolean('weekend_notifications')
    .default(false)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification Templates 테이블 (알림 템플릿)
export const appNotificationTemplates = pgTable('app_notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id), // null이면 시스템 템플릿
  teamId: uuid('team_id').references(() => teams.id),
  type: appNotificationTypeEnum('type').notNull(),
  channel: appNotificationChannelEnum('channel').notNull(),
  name: text('name').notNull(),
  subject: text('subject'),
  bodyTemplate: text('body_template').notNull(),
  variables: jsonb('variables'), // 사용 가능한 변수들
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification Queue 테이블 (알림 대기열)
export const appNotificationQueue = pgTable('app_notification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  templateId: uuid('template_id').references(() => appNotificationTemplates.id),
  type: appNotificationTypeEnum('type').notNull(),
  channel: appNotificationChannelEnum('channel').notNull(),
  priority: appNotificationPriorityEnum('priority').default('normal').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  recipient: text('recipient').notNull(), // 이메일, 전화번호 등
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  status: appNotificationStatusEnum('status').default('pending').notNull(),
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // 추가 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification History 테이블 (알림 이력)
export const appNotificationHistory = pgTable('app_notification_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  queueId: uuid('queue_id').references(() => appNotificationQueue.id),
  type: appNotificationTypeEnum('type').notNull(),
  channel: appNotificationChannelEnum('channel').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  recipient: text('recipient').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  status: appNotificationStatusEnum('status').notNull(),
  responseData: jsonb('response_data'), // 외부 서비스 응답
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification Rules 테이블 (알림 규칙)
export const appNotificationRules = pgTable('app_notification_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  triggerEvent: text('trigger_event').notNull(), // 'meeting_created', 'client_added', etc.
  conditions: jsonb('conditions').notNull(), // 조건들
  actions: jsonb('actions').notNull(), // 실행할 액션들
  isActive: boolean('is_active').default(true).notNull(),
  lastTriggered: timestamp('last_triggered', { withTimezone: true }),
  triggerCount: integer('trigger_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification Subscriptions 테이블 (구독 관리)
export const appNotificationSubscriptions = pgTable(
  'app_notification_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id),
    resourceType: text('resource_type').notNull(), // 'client', 'team', 'goal' etc.
    resourceId: uuid('resource_id').notNull(),
    subscriptionType: text('subscription_type').notNull(), // 'updates', 'reminders' etc.
    channels: appNotificationChannelEnum('channels').array().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 🔗 Relations (관계 정의)
export const appNotificationSettingsRelations = relations(
  appNotificationSettings,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appNotificationSettings.userId],
      references: [profiles.id],
    }),
  })
);

export const appNotificationTemplatesRelations = relations(
  appNotificationTemplates,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [appNotificationTemplates.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appNotificationTemplates.teamId],
      references: [teams.id],
    }),
    queueItems: many(appNotificationQueue),
  })
);

export const appNotificationQueueRelations = relations(
  appNotificationQueue,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appNotificationQueue.userId],
      references: [profiles.id],
    }),
    template: one(appNotificationTemplates, {
      fields: [appNotificationQueue.templateId],
      references: [appNotificationTemplates.id],
    }),
  })
);

export const appNotificationHistoryRelations = relations(
  appNotificationHistory,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appNotificationHistory.userId],
      references: [profiles.id],
    }),
    queueItem: one(appNotificationQueue, {
      fields: [appNotificationHistory.queueId],
      references: [appNotificationQueue.id],
    }),
  })
);

export const appNotificationRulesRelations = relations(
  appNotificationRules,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appNotificationRules.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appNotificationRules.teamId],
      references: [teams.id],
    }),
  })
);

export const appNotificationSubscriptionsRelations = relations(
  appNotificationSubscriptions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appNotificationSubscriptions.userId],
      references: [profiles.id],
    }),
  })
);

// 📝 Notifications 특화 타입들 (실제 코드와 일치)
export type NotificationSettings = typeof appNotificationSettings.$inferSelect;
export type NewNotificationSettings =
  typeof appNotificationSettings.$inferInsert;
export type NotificationTemplate = typeof appNotificationTemplates.$inferSelect;
export type NewNotificationTemplate =
  typeof appNotificationTemplates.$inferInsert;
export type NotificationQueue = typeof appNotificationQueue.$inferSelect;
export type NewNotificationQueue = typeof appNotificationQueue.$inferInsert;
export type NotificationHistory = typeof appNotificationHistory.$inferSelect;
export type NewNotificationHistory = typeof appNotificationHistory.$inferInsert;
export type NotificationRule = typeof appNotificationRules.$inferSelect;
export type NewNotificationRule = typeof appNotificationRules.$inferInsert;
export type NotificationSubscription =
  typeof appNotificationSubscriptions.$inferSelect;
export type NewNotificationSubscription =
  typeof appNotificationSubscriptions.$inferInsert;

export type NotificationType =
  (typeof appNotificationTypeEnum.enumValues)[number];
export type NotificationPriority =
  (typeof appNotificationPriorityEnum.enumValues)[number];
export type NotificationChannel =
  (typeof appNotificationChannelEnum.enumValues)[number];
export type NotificationStatus =
  (typeof appNotificationStatusEnum.enumValues)[number];

// �� Notifications 특화 인터페이스
export interface NotificationOverview {
  settings: NotificationSettings;
  unreadCount: number;
  recentNotifications: NotificationHistory[];
  upcomingReminders: NotificationQueue[];
  activeRules: NotificationRule[];
}

export interface NotificationFilter {
  types?: NotificationType[];
  channels?: NotificationChannel[];
  priorities?: NotificationPriority[];
  statuses?: NotificationStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  unreadOnly?: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  channelBreakdown: {
    channel: NotificationChannel;
    count: number;
    deliveryRate: number;
  }[];
}
