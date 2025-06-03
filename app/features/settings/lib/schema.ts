// Settings 기능에 특화된 스키마 (MVP 버전)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  // 타입들
  type Profile,
  type Team,
  type UserRole,
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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, teams } from '~/lib/schema/core';

// Settings 특화 Enum (app_settings_ prefix 적용)
export const appSettingsCategoryEnum = pgEnum('app_settings_category', [
  'profile',
  'notifications',
  'system',
  'security',
  'integrations',
]);

export const appSettingsNotificationChannelEnum = pgEnum(
  'app_settings_notification_channel',
  [
    'email',
    'sms',
    'push',
    'kakao', // 보험설계사 핵심 채널
  ]
);

export const appSettingsIntegrationTypeEnum = pgEnum(
  'app_settings_integration_type',
  ['kakao_talk', 'google_calendar', 'email', 'sms']
);

export const appSettingsIntegrationStatusEnum = pgEnum(
  'app_settings_integration_status',
  ['active', 'inactive', 'error', 'pending']
);

// Settings 특화 테이블들 (app_settings_ prefix 적용)

// Settings User Profiles 테이블 (사용자 개인 설정)
export const appSettingsUserProfiles = pgTable('app_settings_user_profiles', {
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

// Settings Integrations 테이블 (외부 서비스 연동 - MVP 버전)
export const appSettingsIntegrations = pgTable('app_settings_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profiles.id),

  integration_type:
    appSettingsIntegrationTypeEnum('integration_type').notNull(),
  integration_name: text('integration_name').notNull(),

  // 연동 설정 및 인증 정보
  config: jsonb('config').notNull(),
  credentials: jsonb('credentials'), // 암호화된 인증 정보

  status: appSettingsIntegrationStatusEnum('status')
    .default('pending')
    .notNull(),
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

// Settings Backups 테이블 (설정 백업 - MVP 버전)
export const appSettingsBackups = pgTable('app_settings_backups', {
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

// Settings Change Logs 테이블 (설정 변경 이력 - MVP 버전)
export const appSettingsChangeLogs = pgTable('app_settings_change_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profiles.id),

  setting_category: appSettingsCategoryEnum('setting_category').notNull(),
  setting_field: text('setting_field').notNull(),
  old_value: jsonb('old_value'),
  new_value: jsonb('new_value'),

  change_reason: text('change_reason'), // 변경 사유
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Settings Theme Preferences 테이블 (테마 및 UI 설정)
export const appSettingsThemePreferences = pgTable(
  'app_settings_theme_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .unique()
      .references(() => profiles.id),

    theme_mode: text('theme_mode').default('dark').notNull(), // 'light', 'dark', 'system'
    sidebar_collapsed: boolean('sidebar_collapsed').default(false).notNull(),
    compact_mode: boolean('compact_mode').default(false).notNull(),

    // 색상 테마 설정
    primary_color: text('primary_color').default('#007bff').notNull(),
    accent_color: text('accent_color').default('#6c757d').notNull(),

    // 폰트 설정
    font_size: text('font_size').default('medium').notNull(), // 'small', 'medium', 'large'
    font_family: text('font_family').default('system').notNull(),

    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Settings Security Logs 테이블 (보안 관련 로그)
export const appSettingsSecurityLogs = pgTable('app_settings_security_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profiles.id),

  action_type: text('action_type').notNull(), // 'password_change', 'login', 'logout', '2fa_enable' 등
  action_description: text('action_description').notNull(),

  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  location: text('location'),

  success: boolean('success').default(true).notNull(),
  error_message: text('error_message'),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations (관계 정의)
export const appSettingsUserProfilesRelations = relations(
  appSettingsUserProfiles,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsUserProfiles.user_id],
      references: [profiles.id],
    }),
  })
);

export const appSettingsIntegrationsRelations = relations(
  appSettingsIntegrations,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsIntegrations.user_id],
      references: [profiles.id],
    }),
  })
);

export const appSettingsBackupsRelations = relations(
  appSettingsBackups,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsBackups.user_id],
      references: [profiles.id],
    }),
  })
);

export const appSettingsChangeLogsRelations = relations(
  appSettingsChangeLogs,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsChangeLogs.user_id],
      references: [profiles.id],
    }),
  })
);

export const appSettingsThemePreferencesRelations = relations(
  appSettingsThemePreferences,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsThemePreferences.user_id],
      references: [profiles.id],
    }),
  })
);

export const appSettingsSecurityLogsRelations = relations(
  appSettingsSecurityLogs,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appSettingsSecurityLogs.user_id],
      references: [profiles.id],
    }),
  })
);

// Type exports (MVP 버전)
export type AppSettingsUserProfile =
  typeof appSettingsUserProfiles.$inferSelect;
export type NewAppSettingsUserProfile =
  typeof appSettingsUserProfiles.$inferInsert;
export type AppSettingsIntegration =
  typeof appSettingsIntegrations.$inferSelect;
export type NewAppSettingsIntegration =
  typeof appSettingsIntegrations.$inferInsert;
export type AppSettingsBackup = typeof appSettingsBackups.$inferSelect;
export type NewAppSettingsBackup = typeof appSettingsBackups.$inferInsert;
export type AppSettingsChangeLog = typeof appSettingsChangeLogs.$inferSelect;
export type NewAppSettingsChangeLog = typeof appSettingsChangeLogs.$inferInsert;
export type AppSettingsThemePreference =
  typeof appSettingsThemePreferences.$inferSelect;
export type NewAppSettingsThemePreference =
  typeof appSettingsThemePreferences.$inferInsert;
export type AppSettingsSecurityLog =
  typeof appSettingsSecurityLogs.$inferSelect;
export type NewAppSettingsSecurityLog =
  typeof appSettingsSecurityLogs.$inferInsert;

// Enum type exports
export type AppSettingsCategory =
  (typeof appSettingsCategoryEnum.enumValues)[number];
export type AppSettingsNotificationChannel =
  (typeof appSettingsNotificationChannelEnum.enumValues)[number];
export type AppSettingsIntegrationType =
  (typeof appSettingsIntegrationTypeEnum.enumValues)[number];
export type AppSettingsIntegrationStatus =
  (typeof appSettingsIntegrationStatusEnum.enumValues)[number];

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
