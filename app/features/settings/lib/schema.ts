// Settings 기능에 특화된 스키마 (MVP 버전)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  // 타입들
  type Profile,
  type Team,
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
import { profiles, teams } from '~/lib/schema';

// MVP Settings 특화 Enum (app_user_ prefix 적용)
export const appUserSettingCategoryEnum = pgEnum('app_user_setting_category', [
  'profile',
  'notifications',
  'system',
  'security',
  'integrations',
]);

export const appUserNotificationChannelEnum = pgEnum(
  'app_user_notification_channel',
  [
    'email',
    'sms',
    'push',
    'kakao', // 보험설계사 핵심 채널
  ]
);

export const appUserIntegrationTypeEnum = pgEnum('app_user_integration_type', [
  'kakao_talk',
  'google_calendar',
  'email',
  'sms',
]);

export const appUserIntegrationStatusEnum = pgEnum(
  'app_user_integration_status',
  ['active', 'inactive', 'error', 'pending']
);

// MVP Settings 특화 테이블들 (app_user_ prefix 적용)

// User Settings 테이블 (사용자 개인 설정)
export const appUserSettings = pgTable('app_user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .unique()
    .references(() => profiles.id),

  // 시스템 설정
  language: text('language').default('ko').notNull(),
  dark_mode: boolean('dark_mode').default(true).notNull(),
  timezone: text('timezone').default('Asia/Seoul').notNull(),

  // 알림 설정 (JSON으로 저장)
  notification_settings: jsonb('notification_settings').notNull().default({
    kakaoNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    meetingReminders: true,
    goalDeadlines: true,
    newReferrals: true,
    clientMilestones: true,
    followUpReminders: true,
    birthdayReminders: false,
    teamUpdates: true,
    systemAlerts: true,
    weekendNotifications: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  }),

  // 보험설계사 특화 설정
  agent_settings: jsonb('agent_settings').default({
    workingHours: {
      start: '09:00',
      end: '18:00',
      workDays: [1, 2, 3, 4, 5], // 월-금
    },
    clientManagement: {
      autoFollowUpDays: 7,
      birthdayReminderDays: 3,
      contractRenewalReminderDays: 30,
    },
    performanceTracking: {
      monthlyGoalReminder: true,
      weeklyReportGeneration: true,
      achievementNotifications: true,
    },
  }),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// User Integrations 테이블 (외부 서비스 연동 - MVP 버전)
export const appUserIntegrations = pgTable('app_user_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profiles.id),

  integration_type: appUserIntegrationTypeEnum('integration_type').notNull(),
  integration_name: text('integration_name').notNull(),

  // 연동 설정 및 인증 정보
  config: jsonb('config').notNull(),
  credentials: jsonb('credentials'), // 암호화된 인증 정보

  status: appUserIntegrationStatusEnum('status').default('pending').notNull(),
  is_active: boolean('is_active').default(true).notNull(),

  last_sync_at: timestamp('last_sync_at', { withTimezone: true }),
  last_error_message: text('last_error_message'),
  sync_count: integer('sync_count').default(0).notNull(),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Settings Backup 테이블 (설정 백업 - MVP 버전)
export const appUserSettingsBackup = pgTable('app_user_settings_backup', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profiles.id),

  backup_name: text('backup_name').notNull(),
  backup_data: jsonb('backup_data').notNull(), // 전체 설정 데이터
  backup_version: text('backup_version').default('MVP_v1.0').notNull(),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Settings Change Log 테이블 (설정 변경 이력 - MVP 버전)
export const appUserSettingsChangeLog = pgTable(
  'app_user_settings_change_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => profiles.id),

    setting_category: appUserSettingCategoryEnum('setting_category').notNull(),
    setting_field: text('setting_field').notNull(),
    old_value: jsonb('old_value'),
    new_value: jsonb('new_value'),

    change_reason: text('change_reason'), // 변경 사유
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),

    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Relations (관계 정의)
export const appUserSettingsRelations = relations(
  appUserSettings,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appUserSettings.user_id],
      references: [profiles.id],
    }),
  })
);

export const appUserIntegrationsRelations = relations(
  appUserIntegrations,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appUserIntegrations.user_id],
      references: [profiles.id],
    }),
  })
);

export const appUserSettingsBackupRelations = relations(
  appUserSettingsBackup,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appUserSettingsBackup.user_id],
      references: [profiles.id],
    }),
  })
);

export const appUserSettingsChangeLogRelations = relations(
  appUserSettingsChangeLog,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appUserSettingsChangeLog.user_id],
      references: [profiles.id],
    }),
  })
);

// Type exports (MVP 버전)
export type AppUserSetting = typeof appUserSettings.$inferSelect;
export type NewAppUserSetting = typeof appUserSettings.$inferInsert;
export type AppUserIntegration = typeof appUserIntegrations.$inferSelect;
export type NewAppUserIntegration = typeof appUserIntegrations.$inferInsert;
export type AppUserSettingsBackup = typeof appUserSettingsBackup.$inferSelect;
export type NewAppUserSettingsBackup =
  typeof appUserSettingsBackup.$inferInsert;
export type AppUserSettingsChangeLog =
  typeof appUserSettingsChangeLog.$inferSelect;
export type NewAppUserSettingsChangeLog =
  typeof appUserSettingsChangeLog.$inferInsert;

// Enum type exports
export type AppUserSettingCategory =
  (typeof appUserSettingCategoryEnum.enumValues)[number];
export type AppUserNotificationChannel =
  (typeof appUserNotificationChannelEnum.enumValues)[number];
export type AppUserIntegrationType =
  (typeof appUserIntegrationTypeEnum.enumValues)[number];
export type AppUserIntegrationStatus =
  (typeof appUserIntegrationStatusEnum.enumValues)[number];

// MVP 보험설계사 특화 인터페이스들
export interface InsuranceAgentNotificationSettings {
  // 알림 채널
  kakaoNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;

  // 업무 알림
  meetingReminders: boolean;
  goalDeadlines: boolean;
  newReferrals: boolean;
  clientMilestones: boolean;
  followUpReminders: boolean;
  birthdayReminders: boolean;
  teamUpdates: boolean;
  systemAlerts: boolean;
  weekendNotifications: boolean;

  // 방해금지 시간
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface InsuranceAgentWorkSettings {
  workingHours: {
    start: string;
    end: string;
    workDays: number[];
  };
  clientManagement: {
    autoFollowUpDays: number;
    birthdayReminderDays: number;
    contractRenewalReminderDays: number;
  };
  performanceTracking: {
    monthlyGoalReminder: boolean;
    weeklyReportGeneration: boolean;
    achievementNotifications: boolean;
  };
}

export interface InsuranceAgentSystemSettings {
  language: string;
  darkMode: boolean;
  timezone: string;
  dateFormat?: string;
  numberFormat?: string;
}

// MVP 설정 기본값
export const MVP_SETTINGS_DEFAULTS = {
  system: {
    language: 'ko',
    darkMode: true,
    timezone: 'Asia/Seoul',
  },
  notifications: {
    kakaoNotifications: true, // 보험설계사 핵심
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    meetingReminders: true,
    goalDeadlines: true,
    newReferrals: true,
    clientMilestones: true,
    followUpReminders: true,
    birthdayReminders: false,
    teamUpdates: true,
    systemAlerts: true,
    weekendNotifications: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  agentSettings: {
    workingHours: {
      start: '09:00',
      end: '18:00',
      workDays: [1, 2, 3, 4, 5],
    },
    clientManagement: {
      autoFollowUpDays: 7,
      birthdayReminderDays: 3,
      contractRenewalReminderDays: 30,
    },
    performanceTracking: {
      monthlyGoalReminder: true,
      weeklyReportGeneration: true,
      achievementNotifications: true,
    },
  },
} as const;
