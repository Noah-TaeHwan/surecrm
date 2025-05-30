// Settings 기능에 특화된 스키마
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

// Settings 특화 Enum
export const settingCategoryEnum = pgEnum('setting_category', [
  'general',
  'notifications',
  'privacy',
  'security',
  'integrations',
  'appearance',
  'billing',
  'team',
]);

export const settingTypeEnum = pgEnum('setting_type', [
  'boolean',
  'string',
  'number',
  'json',
  'array',
  'enum',
]);

export const integrationTypeEnum = pgEnum('integration_type', [
  'google_calendar',
  'kakao_talk',
  'slack',
  'email',
  'sms',
  'webhook',
  'api',
]);

export const integrationStatusEnum = pgEnum('integration_status', [
  'active',
  'inactive',
  'error',
  'pending',
  'expired',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'import',
  'share',
  'invite',
]);

// Settings 특화 테이블들

// User Settings 테이블 (사용자 설정)
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => profiles.id),
  category: settingCategoryEnum('category').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  type: settingTypeEnum('type').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Settings 테이블 (팀 설정)
export const teamSettings = pgTable('team_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id),
  category: settingCategoryEnum('category').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  type: settingTypeEnum('type').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by')
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// System Settings 테이블 (시스템 설정)
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: settingCategoryEnum('category').notNull(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  type: settingTypeEnum('type').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(), // 공개 설정 여부
  updatedBy: uuid('updated_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Integrations 테이블 (외부 서비스 연동)
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  type: integrationTypeEnum('type').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  config: jsonb('config').notNull(), // 연동 설정
  credentials: jsonb('credentials'), // 인증 정보 (암호화 필요)
  status: integrationStatusEnum('status').default('pending').notNull(),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastErrorAt: timestamp('last_error_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  syncCount: integer('sync_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// API Keys 테이블 (API 키 관리)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  keyHash: text('key_hash').notNull().unique(), // 해시된 키
  permissions: text('permissions').array().notNull(), // 권한 목록
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  usageCount: integer('usage_count').default(0).notNull(),
  rateLimit: integer('rate_limit').default(1000).notNull(), // 시간당 요청 제한
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Audit Logs 테이블 (감사 로그)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  action: auditActionEnum('action').notNull(),
  entityType: text('entity_type'), // 'user', 'team', 'client', 'setting' 등
  entityId: uuid('entity_id'),
  description: text('description').notNull(),
  changes: jsonb('changes'), // 변경 내용
  metadata: jsonb('metadata'), // 추가 메타데이터
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Backup Configurations 테이블 (백업 설정)
export const backupConfigurations = pgTable('backup_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  schedule: text('schedule').notNull(), // cron 표현식
  includeData: text('include_data').array().notNull(), // 백업할 데이터 유형
  excludeData: text('exclude_data').array(), // 제외할 데이터 유형
  storageConfig: jsonb('storage_config').notNull(), // 저장소 설정
  retentionDays: integer('retention_days').default(30).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastBackupAt: timestamp('last_backup_at', { withTimezone: true }),
  nextBackupAt: timestamp('next_backup_at', { withTimezone: true }),
  backupCount: integer('backup_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Feature Flags 테이블 (기능 플래그)
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  rolloutPercentage: integer('rollout_percentage').default(0).notNull(), // 0-100
  targetUsers: text('target_users').array(), // 특정 사용자 대상
  targetTeams: text('target_teams').array(), // 특정 팀 대상
  conditions: jsonb('conditions'), // 활성화 조건
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(profiles, {
    fields: [userSettings.userId],
    references: [profiles.id],
  }),
}));

export const teamSettingsRelations = relations(teamSettings, ({ one }) => ({
  team: one(teams, {
    fields: [teamSettings.teamId],
    references: [teams.id],
  }),
  updatedByUser: one(profiles, {
    fields: [teamSettings.updatedBy],
    references: [profiles.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(profiles, {
    fields: [systemSettings.updatedBy],
    references: [profiles.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(profiles, {
    fields: [integrations.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [integrations.teamId],
    references: [teams.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(profiles, {
    fields: [apiKeys.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [apiKeys.teamId],
    references: [teams.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(profiles, {
    fields: [auditLogs.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [auditLogs.teamId],
    references: [teams.id],
  }),
}));

export const backupConfigurationsRelations = relations(
  backupConfigurations,
  ({ one }) => ({
    user: one(profiles, {
      fields: [backupConfigurations.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [backupConfigurations.teamId],
      references: [teams.id],
    }),
  })
);

export const featureFlagsRelations = relations(featureFlags, ({ one }) => ({
  createdByUser: one(profiles, {
    fields: [featureFlags.createdBy],
    references: [profiles.id],
  }),
}));

// Settings 특화 타입들
export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;
export type TeamSetting = typeof teamSettings.$inferSelect;
export type NewTeamSetting = typeof teamSettings.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type BackupConfiguration = typeof backupConfigurations.$inferSelect;
export type NewBackupConfiguration = typeof backupConfigurations.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;

export type SettingCategory = (typeof settingCategoryEnum.enumValues)[number];
export type SettingType = (typeof settingTypeEnum.enumValues)[number];
export type IntegrationType = (typeof integrationTypeEnum.enumValues)[number];
export type IntegrationStatus =
  (typeof integrationStatusEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];

// Settings 특화 인터페이스
export interface SettingsGroup {
  category: SettingCategory;
  title: string;
  description?: string;
  settings: SettingItem[];
}

export interface SettingItem {
  key: string;
  label: string;
  description?: string;
  type: SettingType;
  value: any;
  defaultValue: any;
  options?: { label: string; value: any }[]; // enum 타입용
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  isReadOnly?: boolean;
  isAdvanced?: boolean;
}

export interface IntegrationConfig {
  type: IntegrationType;
  name: string;
  description?: string;
  isEnabled: boolean;
  config: Record<string, any>;
  credentials?: Record<string, any>;
  lastSync?: Date;
  syncInterval?: number; // 분 단위
  errorMessage?: string;
}

export interface ApiKeyData {
  id: string;
  name: string;
  description?: string;
  key: string; // 실제 키 (생성 시에만 표시)
  permissions: string[];
  lastUsed?: Date;
  usageCount: number;
  rateLimit: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface AuditLogEntry {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  description: string;
  changes?: Record<string, { from: any; to: any }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface BackupConfig {
  id: string;
  name: string;
  description?: string;
  schedule: string; // cron 표현식
  includeData: string[];
  excludeData?: string[];
  storageType: 'local' | 's3' | 'gcs' | 'azure';
  storageConfig: Record<string, any>;
  retentionDays: number;
  isActive: boolean;
  lastBackup?: Date;
  nextBackup?: Date;
  backupCount: number;
}

export interface FeatureFlagConfig {
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetTeams?: string[];
  conditions?: Record<string, any>;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number; // 일 단위
  };
  sessionSettings: {
    maxDuration: number; // 분 단위
    idleTimeout: number; // 분 단위
    maxConcurrentSessions: number;
  };
  twoFactorAuth: {
    isRequired: boolean;
    methods: ('sms' | 'email' | 'app')[];
  };
  ipWhitelist?: string[];
  auditRetentionDays: number;
}

export interface NotificationSettings {
  email: {
    isEnabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    types: string[];
  };
  sms: {
    isEnabled: boolean;
    types: string[];
  };
  push: {
    isEnabled: boolean;
    types: string[];
  };
  inApp: {
    isEnabled: boolean;
    types: string[];
  };
  quietHours: {
    isEnabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  timezone: string;
  compactMode: boolean;
  animations: boolean;
}
