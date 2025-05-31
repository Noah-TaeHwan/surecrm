// 🔄 Pipeline 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_pipeline_ 사용 (공통 스키마와 일관성 유지)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  pipelineStages,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type NewClient,
  type PipelineStage,
  type NewPipelineStage,
  type UserRole,
  type Importance,
} from '~/lib/schema';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  date,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, teams, clients, pipelineStages } from '~/lib/schema';

// 📌 Pipeline 특화 Enum (app_pipeline_ prefix 네이밍 적용)
export const appPipelineStageActionTypeEnum = pgEnum(
  'app_pipeline_stage_action_type_enum',
  [
    'moved_to_stage',
    'stage_created',
    'stage_updated',
    'stage_deleted',
    'bulk_move',
    'automation_triggered',
  ]
);

export const appPipelineViewTypeEnum = pgEnum('app_pipeline_view_type_enum', [
  'kanban',
  'list',
  'table',
  'timeline',
  'funnel',
]);

export const appPipelineAutomationTriggerEnum = pgEnum(
  'app_pipeline_automation_trigger_enum',
  [
    'stage_entry',
    'stage_exit',
    'time_in_stage',
    'client_created',
    'meeting_scheduled',
    'document_uploaded',
  ]
);

export const appPipelineAutomationActionEnum = pgEnum(
  'app_pipeline_automation_action_enum',
  [
    'send_notification',
    'create_task',
    'schedule_meeting',
    'move_to_stage',
    'assign_to_user',
    'send_email',
  ]
);

// 🏷️ Pipeline 특화 테이블들 (app_pipeline_ prefix 네이밍 적용)

// Pipeline Stage History 테이블 (단계 변경 이력)
export const appPipelineStageHistory = pgTable('app_pipeline_stage_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  fromStageId: uuid('from_stage_id').references(() => pipelineStages.id),
  toStageId: uuid('to_stage_id')
    .notNull()
    .references(() => pipelineStages.id),
  changedBy: uuid('changed_by')
    .notNull()
    .references(() => profiles.id),
  actionType: appPipelineStageActionTypeEnum('action_type').notNull(),
  reason: text('reason'),
  notes: text('notes'),
  timeInPreviousStage: integer('time_in_previous_stage'), // 이전 단계에서 머문 시간 (일)
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Views 테이블 (파이프라인 뷰 설정)
export const appPipelineViews = pgTable('app_pipeline_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  viewType: appPipelineViewTypeEnum('view_type').default('kanban').notNull(),
  filters: jsonb('filters'), // 필터 설정
  sortBy: text('sort_by').default('created_at'),
  sortOrder: text('sort_order').default('desc'), // 'asc', 'desc'
  groupBy: text('group_by'), // 그룹화 기준
  visibleStages: text('visible_stages').array(), // 표시할 단계 ID들
  columnSettings: jsonb('column_settings'), // 컬럼 설정 (테이블 뷰용)
  isDefault: boolean('is_default').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Automations 테이블 (파이프라인 자동화)
export const appPipelineAutomations = pgTable('app_pipeline_automations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  trigger: appPipelineAutomationTriggerEnum('trigger').notNull(),
  triggerConditions: jsonb('trigger_conditions').notNull(),
  actions: jsonb('actions').notNull(), // 실행할 액션들
  stageId: uuid('stage_id').references(() => pipelineStages.id), // 특정 단계에 대한 자동화
  isActive: boolean('is_active').default(true).notNull(),
  executionCount: integer('execution_count').default(0).notNull(),
  lastExecuted: timestamp('last_executed', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Analytics 테이블 (파이프라인 분석) - MVP에서는 기본 통계만
export const appPipelineAnalytics = pgTable('app_pipeline_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  date: date('date').notNull(),
  stageId: uuid('stage_id')
    .notNull()
    .references(() => pipelineStages.id),
  clientsEntered: integer('clients_entered').default(0).notNull(),
  clientsExited: integer('clients_exited').default(0).notNull(),
  clientsRemaining: integer('clients_remaining').default(0).notNull(),
  averageTimeInStage: decimal('average_time_in_stage', {
    precision: 8,
    scale: 2,
  }), // 평균 머무는 시간 (일)
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }), // 다음 단계로의 전환율
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Stage Templates 테이블 (단계 템플릿)
export const appPipelineStageTemplates = pgTable(
  'app_pipeline_stage_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => profiles.id), // null이면 시스템 템플릿
    teamId: uuid('team_id').references(() => teams.id),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'), // 'insurance', 'general', 'custom'
    stages: jsonb('stages').notNull(), // 단계 정의들
    isDefault: boolean('is_default').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Pipeline Goals 테이블 (목표 설정) - MVP에서는 단순한 목표만
export const appPipelineGoals = pgTable('app_pipeline_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  stageId: uuid('stage_id').references(() => pipelineStages.id), // null이면 전체 파이프라인 목표
  name: text('name').notNull(),
  description: text('description'),
  targetType: text('target_type').notNull(), // 'client_count', 'conversion_rate'
  targetValue: decimal('target_value', { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 10, scale: 2 }).default(
    '0'
  ),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (단순화된 MVP 버전)
export const appPipelineStageHistoryRelations = relations(
  appPipelineStageHistory,
  ({ one }) => ({
    client: one(clients, {
      fields: [appPipelineStageHistory.clientId],
      references: [clients.id],
    }),
    fromStage: one(pipelineStages, {
      fields: [appPipelineStageHistory.fromStageId],
      references: [pipelineStages.id],
    }),
    toStage: one(pipelineStages, {
      fields: [appPipelineStageHistory.toStageId],
      references: [pipelineStages.id],
    }),
    changedByUser: one(profiles, {
      fields: [appPipelineStageHistory.changedBy],
      references: [profiles.id],
    }),
  })
);

export const appPipelineViewsRelations = relations(
  appPipelineViews,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appPipelineViews.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appPipelineViews.teamId],
      references: [teams.id],
    }),
  })
);

export const appPipelineAnalyticsRelations = relations(
  appPipelineAnalytics,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appPipelineAnalytics.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appPipelineAnalytics.teamId],
      references: [teams.id],
    }),
    stage: one(pipelineStages, {
      fields: [appPipelineAnalytics.stageId],
      references: [pipelineStages.id],
    }),
  })
);

export const appPipelineGoalsRelations = relations(
  appPipelineGoals,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appPipelineGoals.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appPipelineGoals.teamId],
      references: [teams.id],
    }),
    stage: one(pipelineStages, {
      fields: [appPipelineGoals.stageId],
      references: [pipelineStages.id],
    }),
  })
);

// 🎯 MVP용 타입 정의 (필수 기능만)
export type PipelineStageHistory = typeof appPipelineStageHistory.$inferSelect;
export type NewPipelineStageHistory =
  typeof appPipelineStageHistory.$inferInsert;
export type PipelineView = typeof appPipelineViews.$inferSelect;
export type NewPipelineView = typeof appPipelineViews.$inferInsert;
export type PipelineAnalytics = typeof appPipelineAnalytics.$inferSelect;
export type NewPipelineAnalytics = typeof appPipelineAnalytics.$inferInsert;
export type PipelineStageTemplate =
  typeof appPipelineStageTemplates.$inferSelect;
export type NewPipelineStageTemplate =
  typeof appPipelineStageTemplates.$inferInsert;
export type PipelineGoal = typeof appPipelineGoals.$inferSelect;
export type NewPipelineGoal = typeof appPipelineGoals.$inferInsert;

// Enum 타입들
export type PipelineStageActionType =
  (typeof appPipelineStageActionTypeEnum.enumValues)[number];
export type PipelineViewType =
  (typeof appPipelineViewTypeEnum.enumValues)[number];
export type PipelineAutomationTrigger =
  (typeof appPipelineAutomationTriggerEnum.enumValues)[number];
export type PipelineAutomationAction =
  (typeof appPipelineAutomationActionEnum.enumValues)[number];

// 🎯 MVP용 인터페이스 (단순화된 버전)
export interface PipelineOverview {
  stages: (typeof pipelineStages.$inferSelect)[];
  analytics: PipelineAnalytics[];
  goals: PipelineGoal[];
  totalClients: number;
  conversionRates: { [stageId: string]: number };
}

// MVP용 필터 (기본 필터링만)
export interface PipelineFilter {
  stageIds?: string[];
  userIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientImportance?: string[];
  searchQuery?: string;
}

// MVP용 통계 (핵심 지표만)
export interface PipelineStats {
  totalClients: number;
  stageBreakdown: {
    stageId: string;
    stageName: string;
    clientCount: number;
    highImportanceCount: number;
    averageTimeInStage: number;
  }[];
}
