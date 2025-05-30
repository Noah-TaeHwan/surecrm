// Notifications 기능에 특화된 스키마
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

// Notifications 특화 Enum
export const notificationTypeEnum = pgEnum('notification_type', [
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

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'in_app',
  'email',
  'sms',
  'push',
  'kakao',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'sent',
  'delivered',
  'read',
  'failed',
  'cancelled',
]);

// Notifications 특화 테이블들

// Notification Settings 테이블 (알림 설정)
export const notificationSettings = pgTable('notification_settings', {
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
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id), // null이면 시스템 템플릿
  teamId: uuid('team_id').references(() => teams.id),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
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
export const notificationQueue = pgTable('notification_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  templateId: uuid('template_id').references(() => notificationTemplates.id),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  priority: notificationPriorityEnum('priority').default('normal').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  recipient: text('recipient').notNull(), // 이메일, 전화번호 등
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  status: notificationStatusEnum('status').default('pending').notNull(),
  retryCount: integer('retry_count').default(0).notNull(),
  maxRetries: integer('max_retries').default(3).notNull(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'), // 추가 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification History 테이블 (알림 이력)
export const notificationHistory = pgTable('notification_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  queueId: uuid('queue_id').references(() => notificationQueue.id),
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  recipient: text('recipient').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  status: notificationStatusEnum('status').notNull(),
  responseData: jsonb('response_data'), // 외부 서비스 응답
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Notification Rules 테이블 (알림 규칙)
export const notificationRules = pgTable('notification_rules', {
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
export const notificationSubscriptions = pgTable('notification_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  entityType: text('entity_type').notNull(), // 'client', 'team', 'meeting', etc.
  entityId: uuid('entity_id').notNull(),
  notificationTypes: text('notification_types').array().notNull(),
  channels: text('channels').array().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const notificationSettingsRelations = relations(
  notificationSettings,
  ({ one }) => ({
    user: one(profiles, {
      fields: [notificationSettings.userId],
      references: [profiles.id],
    }),
  })
);

export const notificationTemplatesRelations = relations(
  notificationTemplates,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [notificationTemplates.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [notificationTemplates.teamId],
      references: [teams.id],
    }),
    queueItems: many(notificationQueue),
  })
);

export const notificationQueueRelations = relations(
  notificationQueue,
  ({ one }) => ({
    user: one(profiles, {
      fields: [notificationQueue.userId],
      references: [profiles.id],
    }),
    template: one(notificationTemplates, {
      fields: [notificationQueue.templateId],
      references: [notificationTemplates.id],
    }),
  })
);

export const notificationHistoryRelations = relations(
  notificationHistory,
  ({ one }) => ({
    user: one(profiles, {
      fields: [notificationHistory.userId],
      references: [profiles.id],
    }),
    queueItem: one(notificationQueue, {
      fields: [notificationHistory.queueId],
      references: [notificationQueue.id],
    }),
  })
);

export const notificationRulesRelations = relations(
  notificationRules,
  ({ one }) => ({
    user: one(profiles, {
      fields: [notificationRules.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [notificationRules.teamId],
      references: [teams.id],
    }),
  })
);

export const notificationSubscriptionsRelations = relations(
  notificationSubscriptions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [notificationSubscriptions.userId],
      references: [profiles.id],
    }),
  })
);

// Notifications 특화 타입들
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type NewNotificationSettings = typeof notificationSettings.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationQueue = typeof notificationQueue.$inferSelect;
export type NewNotificationQueue = typeof notificationQueue.$inferInsert;
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type NewNotificationHistory = typeof notificationHistory.$inferInsert;
export type NotificationRule = typeof notificationRules.$inferSelect;
export type NewNotificationRule = typeof notificationRules.$inferInsert;
export type NotificationSubscription =
  typeof notificationSubscriptions.$inferSelect;
export type NewNotificationSubscription =
  typeof notificationSubscriptions.$inferInsert;

// Enum 타입들 export
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationPriority =
  (typeof notificationPriorityEnum.enumValues)[number];
export type NotificationChannel =
  (typeof notificationChannelEnum.enumValues)[number];
export type NotificationStatus =
  (typeof notificationStatusEnum.enumValues)[number];

// Notifications 특화 인터페이스
export interface NotificationPreferences {
  channels: NotificationChannel[];
  types: NotificationType[];
  quietHours: {
    start: string;
    end: string;
  };
  weekendEnabled: boolean;
}

export interface NotificationRuleConfig {
  id: string;
  name: string;
  triggerEvent: string;
  conditions: Record<string, any>;
  actions: {
    type: 'send_notification';
    channel: NotificationChannel;
    template?: string;
    message?: string;
  }[];
  isActive: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  channelStats: {
    channel: NotificationChannel;
    sent: number;
    delivered: number;
    read: number;
  }[];
  typeStats: {
    type: NotificationType;
    sent: number;
    delivered: number;
    read: number;
  }[];
}

export interface NotificationBatch {
  id: string;
  name: string;
  recipients: string[];
  template: NotificationTemplate;
  scheduledAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}
