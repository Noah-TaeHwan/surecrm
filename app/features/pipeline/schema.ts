// Pipeline 기능에 특화된 스키마
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
} from '~/lib/supabase-schema';

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
import {
  profiles,
  teams,
  clients,
  pipelineStages,
} from '~/lib/supabase-schema';

// Pipeline 특화 Enum
export const stageActionTypeEnum = pgEnum('stage_action_type', [
  'moved_to_stage',
  'stage_created',
  'stage_updated',
  'stage_deleted',
  'bulk_move',
  'automation_triggered',
]);

export const pipelineViewTypeEnum = pgEnum('pipeline_view_type', [
  'kanban',
  'list',
  'table',
  'timeline',
  'funnel',
]);

export const automationTriggerEnum = pgEnum('automation_trigger', [
  'stage_entry',
  'stage_exit',
  'time_in_stage',
  'client_created',
  'meeting_scheduled',
  'document_uploaded',
]);

export const automationActionEnum = pgEnum('automation_action', [
  'send_notification',
  'create_task',
  'schedule_meeting',
  'move_to_stage',
  'assign_to_user',
  'send_email',
]);

// Pipeline 특화 테이블들

// Stage History 테이블 (단계 변경 이력)
export const stageHistory = pgTable('stage_history', {
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
  actionType: stageActionTypeEnum('action_type').notNull(),
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
  trigger: automationTriggerEnum('trigger').notNull(),
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

// Stage Templates 테이블 (단계 템플릿)
export const stageTemplates = pgTable('stage_templates', {
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
  stageId: uuid('stage_id').references(() => pipelineStages.id), // null이면 전체 파이프라인
  goalType: text('goal_type').notNull(), // 'conversion_rate', 'time_in_stage', 'client_count', 'value'
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 }).default(
    '0'
  ),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Bottlenecks 테이블 (병목 지점 분석)
export const pipelineBottlenecks = pgTable('pipeline_bottlenecks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  stageId: uuid('stage_id')
    .notNull()
    .references(() => pipelineStages.id),
  analysisDate: date('analysis_date').notNull(),
  clientsStuck: integer('clients_stuck').default(0).notNull(), // 오래 머물고 있는 고객 수
  averageStuckTime: decimal('average_stuck_time', { precision: 8, scale: 2 }), // 평균 정체 시간
  bottleneckScore: decimal('bottleneck_score', { precision: 5, scale: 2 }), // 병목 점수 (0-100)
  recommendations: jsonb('recommendations'), // 개선 추천사항
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const stageHistoryRelations = relations(stageHistory, ({ one }) => ({
  client: one(clients, {
    fields: [stageHistory.clientId],
    references: [clients.id],
  }),
  fromStage: one(pipelineStages, {
    fields: [stageHistory.fromStageId],
    references: [pipelineStages.id],
    relationName: 'from_stage',
  }),
  toStage: one(pipelineStages, {
    fields: [stageHistory.toStageId],
    references: [pipelineStages.id],
    relationName: 'to_stage',
  }),
  changedByUser: one(profiles, {
    fields: [stageHistory.changedBy],
    references: [profiles.id],
  }),
}));

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

export const stageTemplatesRelations = relations(stageTemplates, ({ one }) => ({
  user: one(profiles, {
    fields: [stageTemplates.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [stageTemplates.teamId],
    references: [teams.id],
  }),
}));

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

export const pipelineBottlenecksRelations = relations(
  pipelineBottlenecks,
  ({ one }) => ({
    user: one(profiles, {
      fields: [pipelineBottlenecks.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [pipelineBottlenecks.teamId],
      references: [teams.id],
    }),
    stage: one(pipelineStages, {
      fields: [pipelineBottlenecks.stageId],
      references: [pipelineStages.id],
    }),
  })
);

// Pipeline 특화 타입들
export type StageHistory = typeof stageHistory.$inferSelect;
export type NewStageHistory = typeof stageHistory.$inferInsert;
export type PipelineView = typeof pipelineViews.$inferSelect;
export type NewPipelineView = typeof pipelineViews.$inferInsert;
export type PipelineAutomation = typeof pipelineAutomations.$inferSelect;
export type NewPipelineAutomation = typeof pipelineAutomations.$inferInsert;
export type PipelineAnalytics = typeof pipelineAnalytics.$inferSelect;
export type NewPipelineAnalytics = typeof pipelineAnalytics.$inferInsert;
export type StageTemplate = typeof stageTemplates.$inferSelect;
export type NewStageTemplate = typeof stageTemplates.$inferInsert;
export type PipelineGoal = typeof pipelineGoals.$inferSelect;
export type NewPipelineGoal = typeof pipelineGoals.$inferInsert;
export type PipelineBottleneck = typeof pipelineBottlenecks.$inferSelect;
export type NewPipelineBottleneck = typeof pipelineBottlenecks.$inferInsert;

export type StageActionType = (typeof stageActionTypeEnum.enumValues)[number];
export type PipelineViewType = (typeof pipelineViewTypeEnum.enumValues)[number];
export type AutomationTrigger =
  (typeof automationTriggerEnum.enumValues)[number];
export type AutomationAction = (typeof automationActionEnum.enumValues)[number];

// Pipeline 특화 인터페이스
export interface PipelineStats {
  totalClients: number;
  stageDistribution: {
    stageId: string;
    stageName: string;
    clientCount: number;
    percentage: number;
    averageTimeInStage: number;
  }[];
  conversionRates: {
    fromStage: string;
    toStage: string;
    rate: number;
  }[];
  bottlenecks: {
    stageId: string;
    stageName: string;
    score: number;
    stuckClients: number;
  }[];
}

export interface PipelineFilter {
  stages?: string[];
  importance?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedTo?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface StageMovement {
  clientId: string;
  clientName: string;
  fromStage: string;
  toStage: string;
  movedAt: Date;
  movedBy: string;
  timeInPreviousStage: number;
  reason?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: Record<string, any>;
  actions: {
    type: AutomationAction;
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
  executionCount: number;
}

export interface PipelineMetrics {
  totalValue: number;
  averageTimeToClose: number;
  conversionRate: number;
  velocityByStage: {
    stageId: string;
    averageTime: number;
    clientCount: number;
  }[];
  trends: {
    period: string;
    newClients: number;
    closedClients: number;
    conversionRate: number;
  }[];
}
