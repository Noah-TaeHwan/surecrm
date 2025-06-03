// Team 기능에 특화된 스키마 (MVP용)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  invitations,
  // 타입들
  type Profile,
  type Team,
  type NewTeam,
  type Invitation,
  type UserRole,
  type InvitationStatus,
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
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, teams, invitations, type Team } from '~/lib/schema/core';

// ===== Team 관리 Enum (app_team_ prefix 적용) =====
export const appTeamMemberRoleEnum = pgEnum('app_team_member_role_enum', [
  'member',
  'manager',
  'admin',
]);

export const appTeamMemberStatusEnum = pgEnum('app_team_member_status_enum', [
  'active',
  'inactive',
  'pending',
]);

export const appTeamActivityTypeEnum = pgEnum('app_team_activity_type_enum', [
  'member_joined',
  'member_left',
  'member_promoted',
  'member_demoted',
  'goal_created',
  'goal_achieved',
  'meeting_scheduled',
  'performance_milestone',
]);

// ===== Team 핵심 테이블들 (app_team_ prefix 적용) =====

// Team Members 테이블 (팀 멤버)
export const appTeamMembers = pgTable('app_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  role: appTeamMemberRoleEnum('role').default('member').notNull(),
  status: appTeamMemberStatusEnum('status').default('active').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  invitedBy: uuid('invited_by').references(() => profiles.id),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  notes: text('notes'), // 멤버에 대한 간단한 메모
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Stats Cache 테이블 (팀 통계 캐시)
export const appTeamStatsCache = pgTable('app_team_stats_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .unique()
    .references(() => teams.id, { onDelete: 'cascade' }),
  totalMembers: integer('total_members').default(0).notNull(),
  activeMembers: integer('active_members').default(0).notNull(),
  pendingInvites: integer('pending_invites').default(0).notNull(),
  totalClients: integer('total_clients').default(0).notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Performance Metrics 테이블 (팀 성과 지표)
export const appTeamPerformanceMetrics = pgTable(
  'app_team_performance_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),

    // 월별 성과 지표
    year: integer('year').notNull(),
    month: integer('month').notNull(), // 1-12

    // 핵심 성과 지표 (보험설계사 특화)
    newClients: integer('new_clients').default(0).notNull(),
    totalContracts: integer('total_contracts').default(0).notNull(),
    totalPremium: decimal('total_premium', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    meetingsHeld: integer('meetings_held').default(0).notNull(),
    referralsReceived: integer('referrals_received').default(0).notNull(),

    // 활동 지표
    callsMade: integer('calls_made').default(0).notNull(),
    emailsSent: integer('emails_sent').default(0).notNull(),
    followUpsCompleted: integer('follow_ups_completed').default(0).notNull(),

    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Team Goals 테이블 (팀 목표 관리)
export const appTeamGoals = pgTable('app_team_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => profiles.id),

  title: text('title').notNull(),
  description: text('description'),

  // 목표 타입 및 지표
  goalType: text('goal_type').notNull(), // 'team', 'individual', 'department'
  targetMetric: text('target_metric').notNull(), // 'contracts', 'premium', 'clients', 'meetings'
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),

  // 기간 설정
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),

  // 상태 관리
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Activity Logs 테이블 (팀 활동 로그)
export const appTeamActivityLogs = pgTable('app_team_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id), // null 가능 (시스템 이벤트의 경우)

  activityType: appTeamActivityTypeEnum('activity_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),

  // 관련 데이터 (JSON)
  metadata: jsonb('metadata').default({}),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Communication Channels 테이블 (팀 커뮤니케이션)
export const appTeamCommunicationChannels = pgTable(
  'app_team_communication_channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => profiles.id),

    channelName: text('channel_name').notNull(),
    channelDescription: text('channel_description'),
    channelType: text('channel_type').default('general').notNull(), // 'general', 'announcements', 'support', 'training'

    // 설정
    isPrivate: boolean('is_private').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),

    // 통계
    memberCount: integer('member_count').default(0).notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),

    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Team Training Records 테이블 (팀 교육 기록)
export const appTeamTrainingRecords = pgTable('app_team_training_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  trainerId: uuid('trainer_id').references(() => profiles.id), // 교육 담당자

  trainingTitle: text('training_title').notNull(),
  trainingType: text('training_type').notNull(), // 'product', 'sales', 'compliance', 'technical'
  trainingDuration: integer('training_duration'), // 분 단위

  // 완료 상태
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  score: integer('score'), // 0-100점

  // 인증 정보
  certificateNumber: text('certificate_number'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  notes: text('notes'),

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== Relations (관계 정의) =====
export const appTeamMembersRelations = relations(appTeamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [appTeamMembers.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [appTeamMembers.userId],
    references: [profiles.id],
  }),
  invitedByUser: one(profiles, {
    fields: [appTeamMembers.invitedBy],
    references: [profiles.id],
    relationName: 'invited_by',
  }),
}));

export const appTeamStatsCacheRelations = relations(
  appTeamStatsCache,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamStatsCache.teamId],
      references: [teams.id],
    }),
  })
);

export const appTeamPerformanceMetricsRelations = relations(
  appTeamPerformanceMetrics,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamPerformanceMetrics.teamId],
      references: [teams.id],
    }),
    member: one(profiles, {
      fields: [appTeamPerformanceMetrics.memberId],
      references: [profiles.id],
    }),
  })
);

export const appTeamGoalsRelations = relations(appTeamGoals, ({ one }) => ({
  team: one(teams, {
    fields: [appTeamGoals.teamId],
    references: [teams.id],
  }),
  creator: one(profiles, {
    fields: [appTeamGoals.createdBy],
    references: [profiles.id],
  }),
}));

export const appTeamActivityLogsRelations = relations(
  appTeamActivityLogs,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamActivityLogs.teamId],
      references: [teams.id],
    }),
    user: one(profiles, {
      fields: [appTeamActivityLogs.userId],
      references: [profiles.id],
    }),
  })
);

export const appTeamCommunicationChannelsRelations = relations(
  appTeamCommunicationChannels,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamCommunicationChannels.teamId],
      references: [teams.id],
    }),
    creator: one(profiles, {
      fields: [appTeamCommunicationChannels.createdBy],
      references: [profiles.id],
    }),
  })
);

export const appTeamTrainingRecordsRelations = relations(
  appTeamTrainingRecords,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamTrainingRecords.teamId],
      references: [teams.id],
    }),
    member: one(profiles, {
      fields: [appTeamTrainingRecords.memberId],
      references: [profiles.id],
    }),
    trainer: one(profiles, {
      fields: [appTeamTrainingRecords.trainerId],
      references: [profiles.id],
      relationName: 'trainer',
    }),
  })
);

// ===== 타입 정의 =====
export type AppTeamMember = typeof appTeamMembers.$inferSelect;
export type NewAppTeamMember = typeof appTeamMembers.$inferInsert;
export type AppTeamStatsCache = typeof appTeamStatsCache.$inferSelect;
export type NewAppTeamStatsCache = typeof appTeamStatsCache.$inferInsert;
export type AppTeamPerformanceMetric =
  typeof appTeamPerformanceMetrics.$inferSelect;
export type NewAppTeamPerformanceMetric =
  typeof appTeamPerformanceMetrics.$inferInsert;
export type AppTeamGoal = typeof appTeamGoals.$inferSelect;
export type NewAppTeamGoal = typeof appTeamGoals.$inferInsert;
export type AppTeamActivityLog = typeof appTeamActivityLogs.$inferSelect;
export type NewAppTeamActivityLog = typeof appTeamActivityLogs.$inferInsert;
export type AppTeamCommunicationChannel =
  typeof appTeamCommunicationChannels.$inferSelect;
export type NewAppTeamCommunicationChannel =
  typeof appTeamCommunicationChannels.$inferInsert;
export type AppTeamTrainingRecord = typeof appTeamTrainingRecords.$inferSelect;
export type NewAppTeamTrainingRecord =
  typeof appTeamTrainingRecords.$inferInsert;

export type AppTeamMemberRole =
  (typeof appTeamMemberRoleEnum.enumValues)[number];
export type AppTeamMemberStatus =
  (typeof appTeamMemberStatusEnum.enumValues)[number];
export type AppTeamActivityType =
  (typeof appTeamActivityTypeEnum.enumValues)[number];

// ===== 실제 사용용 인터페이스 =====
export interface TeamMemberData {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  role: AppTeamMemberRole;
  status: AppTeamMemberStatus;
  joinedAt: Date;
  lastActiveAt?: Date;
  notes?: string;
  performance?: {
    clients: number;
    conversions: number;
  };
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalClients: number;
}
