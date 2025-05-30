// 🔄 Pipeline 기능 전용 스키마
// Prefix 네이밍 컨벤션: pipeline_ 사용
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

// 📌 Pipeline 특화 Enum (prefix 네이밍 적용)
export const pipelineStageActionTypeEnum = pgEnum(
  'pipeline_stage_action_type_enum',
  [
    'moved_to_stage',
    'stage_created',
    'stage_updated',
    'stage_deleted',
    'bulk_move',
    'automation_triggered',
  ]
);

export const pipelineViewTypeEnum = pgEnum('pipeline_view_type_enum', [
  'kanban',
  'list',
  'table',
  'timeline',
  'funnel',
]);

export const pipelineAutomationTriggerEnum = pgEnum(
  'pipeline_automation_trigger_enum',
  [
    'stage_entry',
    'stage_exit',
    'time_in_stage',
    'client_created',
    'meeting_scheduled',
    'document_uploaded',
  ]
);

export const pipelineAutomationActionEnum = pgEnum(
  'pipeline_automation_action_enum',
  [
    'send_notification',
    'create_task',
    'schedule_meeting',
    'move_to_stage',
    'assign_to_user',
    'send_email',
  ]
);

// 🏷️ Pipeline 특화 테이블들 (prefix 네이밍 적용)

// Pipeline Stage History 테이블 (단계 변경 이력)
export const pipelineStageHistory = pgTable('pipeline_stage_history', {
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
  actionType: pipelineStageActionTypeEnum('action_type').notNull(),
  reason: text('reason'),
  notes: text('notes'),
  timeInPreviousStage: integer('time_in_previous_stage'), // 이전 단계에서 머문 시간 (일)
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Views 테이블 (파이프라인 뷰 설정)
export const pipelineViews = pgTable('pipeline_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  viewType: pipelineViewTypeEnum('view_type').default('kanban').notNull(),
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
export const pipelineAutomations = pgTable('pipeline_automations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  trigger: pipelineAutomationTriggerEnum('trigger').notNull(),
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

// Pipeline Analytics 테이블 (파이프라인 분석)
export const pipelineAnalytics = pgTable('pipeline_analytics', {
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
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).default('0'), // 해당 단계 고객들의 총 가치
  averageValue: decimal('average_value', { precision: 12, scale: 2 }).default(
    '0'
  ), // 평균 고객 가치
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Stage Templates 테이블 (단계 템플릿)
export const pipelineStageTemplates = pgTable('pipeline_stage_templates', {
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
});

// Pipeline Goals 테이블 (파이프라인 목표)
export const pipelineGoals = pgTable('pipeline_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  stageId: uuid('stage_id').references(() => pipelineStages.id), // 특정 단계 목표
  name: text('name').notNull(),
  description: text('description'),
  targetType: text('target_type').notNull(), // 'conversion_rate', 'time_in_stage', 'value', 'count'
  targetValue: decimal('target_value', { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 12, scale: 2 }).default(
    '0'
  ),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  notifications: jsonb('notifications'), // 알림 설정
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의)
export const pipelineStageHistoryRelations = relations(
  pipelineStageHistory,
  ({ one }) => ({
    client: one(clients, {
      fields: [pipelineStageHistory.clientId],
      references: [clients.id],
    }),
    fromStage: one(pipelineStages, {
      fields: [pipelineStageHistory.fromStageId],
      references: [pipelineStages.id],
    }),
    toStage: one(pipelineStages, {
      fields: [pipelineStageHistory.toStageId],
      references: [pipelineStages.id],
    }),
    changedByUser: one(profiles, {
      fields: [pipelineStageHistory.changedBy],
      references: [profiles.id],
    }),
  })
);

export const pipelineViewsRelations = relations(pipelineViews, ({ one }) => ({
  user: one(profiles, {
    fields: [pipelineViews.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [pipelineViews.teamId],
    references: [teams.id],
  }),
}));

export const pipelineAutomationsRelations = relations(
  pipelineAutomations,
  ({ one }) => ({
    user: one(profiles, {
      fields: [pipelineAutomations.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [pipelineAutomations.teamId],
      references: [teams.id],
    }),
    stage: one(pipelineStages, {
      fields: [pipelineAutomations.stageId],
      references: [pipelineStages.id],
    }),
  })
);

export const pipelineAnalyticsRelations = relations(
  pipelineAnalytics,
  ({ one }) => ({
    user: one(profiles, {
      fields: [pipelineAnalytics.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [pipelineAnalytics.teamId],
      references: [teams.id],
    }),
    stage: one(pipelineStages, {
      fields: [pipelineAnalytics.stageId],
      references: [pipelineStages.id],
    }),
  })
);

export const pipelineStageTemplatesRelations = relations(
  pipelineStageTemplates,
  ({ one }) => ({
    user: one(profiles, {
      fields: [pipelineStageTemplates.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [pipelineStageTemplates.teamId],
      references: [teams.id],
    }),
  })
);

export const pipelineGoalsRelations = relations(pipelineGoals, ({ one }) => ({
  user: one(profiles, {
    fields: [pipelineGoals.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [pipelineGoals.teamId],
    references: [teams.id],
  }),
  stage: one(pipelineStages, {
    fields: [pipelineGoals.stageId],
    references: [pipelineStages.id],
  }),
}));

// 📝 Pipeline 특화 타입들 (실제 코드와 일치)
export type PipelineStageHistory = typeof pipelineStageHistory.$inferSelect;
export type NewPipelineStageHistory = typeof pipelineStageHistory.$inferInsert;
export type PipelineView = typeof pipelineViews.$inferSelect;
export type NewPipelineView = typeof pipelineViews.$inferInsert;
export type PipelineAutomation = typeof pipelineAutomations.$inferSelect;
export type NewPipelineAutomation = typeof pipelineAutomations.$inferInsert;
export type PipelineAnalytics = typeof pipelineAnalytics.$inferSelect;
export type NewPipelineAnalytics = typeof pipelineAnalytics.$inferInsert;
export type PipelineStageTemplate = typeof pipelineStageTemplates.$inferSelect;
export type NewPipelineStageTemplate =
  typeof pipelineStageTemplates.$inferInsert;
export type PipelineGoal = typeof pipelineGoals.$inferSelect;
export type NewPipelineGoal = typeof pipelineGoals.$inferInsert;

export type PipelineStageActionType =
  (typeof pipelineStageActionTypeEnum.enumValues)[number];
export type PipelineViewType = (typeof pipelineViewTypeEnum.enumValues)[number];
export type PipelineAutomationTrigger =
  (typeof pipelineAutomationTriggerEnum.enumValues)[number];
export type PipelineAutomationAction =
  (typeof pipelineAutomationActionEnum.enumValues)[number];

// 🎯 Pipeline 특화 인터페이스
export interface PipelineOverview {
  stages: (typeof pipelineStages.$inferSelect)[];
  analytics: PipelineAnalytics[];
  goals: PipelineGoal[];
  automations: PipelineAutomation[];
  totalClients: number;
  conversionRates: { [stageId: string]: number };
}

export interface PipelineFilter {
  stageIds?: string[];
  userIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  valueRange?: {
    min: number;
    max: number;
  };
  clientImportance?: string[];
}

export interface PipelineStats {
  totalClients: number;
  totalValue: number;
  averageValue: number;
  overallConversionRate: number;
  stageBreakdown: {
    stageId: string;
    stageName: string;
    clientCount: number;
    totalValue: number;
    averageTimeInStage: number;
    conversionRate: number;
  }[];
}
