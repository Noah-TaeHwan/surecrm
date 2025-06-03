// 📊 Dashboard 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_dashboard_ 사용 (완전 통일)
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
  type PipelineStage,
  type UserRole,
  type Importance,
} from '~/lib/schema/core';

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
import { profiles, teams, clients, pipelineStages } from '~/lib/schema/core';

// 📌 Dashboard 특화 Enum (완전한 app_dashboard_ prefix 통일)
export const appDashboardGoalTypeEnum = pgEnum('app_dashboard_goal_type_enum', [
  'clients',
  'meetings',
  'revenue',
  'referrals',
  'conversion_rate',
]);

export const appDashboardGoalPeriodEnum = pgEnum(
  'app_dashboard_goal_period_enum',
  ['monthly', 'quarterly', 'yearly']
);

export const appDashboardActivityTypeEnum = pgEnum(
  'app_dashboard_activity_type_enum',
  [
    'client_added',
    'client_updated',
    'meeting_scheduled',
    'meeting_completed',
    'meeting_cancelled',
    'referral_received',
    'referral_converted',
    'goal_achieved',
    'stage_changed',
    'document_uploaded',
    'insurance_added',
  ]
);

export const appDashboardNotificationTypeEnum = pgEnum(
  'app_dashboard_notification_type_enum',
  [
    'meeting_reminder',
    'goal_achievement',
    'goal_deadline',
    'new_referral',
    'client_milestone',
    'team_update',
    'system_alert',
  ]
);

export const appDashboardNotificationPriorityEnum = pgEnum(
  'app_dashboard_notification_priority_enum',
  ['low', 'normal', 'high', 'urgent']
);

export const appDashboardMetricPeriodEnum = pgEnum(
  'app_dashboard_metric_period_enum',
  ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
);

export const appDashboardWidgetTypeEnum = pgEnum(
  'app_dashboard_widget_type_enum',
  [
    'kpi_card',
    'chart',
    'table',
    'calendar',
    'list',
    'progress',
    'notification',
    'quick_action',
  ]
);

// 🏷️ Dashboard 특화 테이블들 (완전한 app_dashboard_ prefix 통일)

// Dashboard Performance Metrics 테이블 (일별/월별 성과 집계)
export const appDashboardPerformanceMetrics = pgTable(
  'app_dashboard_performance_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    teamId: uuid('team_id').references(() => teams.id),
    date: date('date').notNull(),
    period: appDashboardMetricPeriodEnum('period').notNull(),
    newClients: integer('new_clients').default(0).notNull(),
    totalMeetings: integer('total_meetings').default(0).notNull(),
    completedMeetings: integer('completed_meetings').default(0).notNull(),
    cancelledMeetings: integer('cancelled_meetings').default(0).notNull(),
    newReferrals: integer('new_referrals').default(0).notNull(),
    convertedReferrals: integer('converted_referrals').default(0).notNull(),
    totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 })
      .default('0')
      .notNull(),
    averageDealSize: decimal('average_deal_size', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    pipelineValue: decimal('pipeline_value', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    // 🔒 데이터 품질 보장 필드
    calculatedAt: timestamp('calculated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    dataVersion: integer('data_version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Dashboard Goals 테이블 (목표 설정) - prefix 통일
export const appDashboardGoals = pgTable('app_dashboard_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  title: text('title').notNull(),
  description: text('description'),
  goalType: appDashboardGoalTypeEnum('goal_type').notNull(),
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  period: appDashboardGoalPeriodEnum('period').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 })
    .default('0')
    .notNull(),
  metadata: jsonb('metadata'), // 추가 설정 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Activity Log 테이블 (사용자 활동 추적) - prefix 통일
export const appDashboardActivityLogs = pgTable('app_dashboard_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  activityType: appDashboardActivityTypeEnum('activity_type').notNull(),
  entityType: text('entity_type'), // 'client', 'meeting', 'referral' 등
  entityId: uuid('entity_id'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  impact: text('impact'), // 'positive', 'neutral', 'negative'
  metadata: jsonb('metadata'), // 추가 정보
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Notifications 테이블 (알림) - prefix 통일
export const appDashboardNotifications = pgTable(
  'app_dashboard_notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: appDashboardNotificationTypeEnum('type').notNull(),
    priority: appDashboardNotificationPriorityEnum('priority')
      .default('normal')
      .notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    actionUrl: text('action_url'), // 클릭 시 이동할 URL
    actionLabel: text('action_label'), // 액션 버튼 텍스트
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),
    metadata: jsonb('metadata'), // 추가 정보
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Dashboard Widgets 테이블 (사용자 맞춤형 위젯 설정) - prefix 통일
export const appDashboardWidgets = pgTable('app_dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  widgetType: appDashboardWidgetTypeEnum('widget_type').notNull(),
  title: text('title').notNull(),
  position: jsonb('position').notNull(), // { x: 0, y: 0, width: 4, height: 3 }
  config: jsonb('config').notNull(), // 위젯별 설정
  isVisible: boolean('is_visible').default(true).notNull(),
  refreshInterval: integer('refresh_interval').default(300), // 초 단위 (5분)
  lastRefreshed: timestamp('last_refreshed', { withTimezone: true }),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Quick Actions 테이블 (빠른 액션 설정) - prefix 통일
export const appDashboardQuickActions = pgTable('app_dashboard_quick_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  actionType: text('action_type').notNull(), // 'add_client', 'schedule_meeting', etc.
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'), // 아이콘 이름
  actionUrl: text('action_url'), // 이동할 URL
  shortcut: text('shortcut'), // 키보드 단축키
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의)
export const appDashboardPerformanceMetricsRelations = relations(
  appDashboardPerformanceMetrics,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appDashboardPerformanceMetrics.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appDashboardPerformanceMetrics.teamId],
      references: [teams.id],
    }),
  })
);

export const appDashboardGoalsRelations = relations(
  appDashboardGoals,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appDashboardGoals.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [appDashboardGoals.teamId],
      references: [teams.id],
    }),
  })
);

export const appDashboardActivityLogsRelations = relations(
  appDashboardActivityLogs,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appDashboardActivityLogs.userId],
      references: [profiles.id],
    }),
  })
);

export const appDashboardNotificationsRelations = relations(
  appDashboardNotifications,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appDashboardNotifications.userId],
      references: [profiles.id],
    }),
  })
);

export const appDashboardWidgetsRelations = relations(
  appDashboardWidgets,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appDashboardWidgets.userId],
      references: [profiles.id],
    }),
  })
);

export const appDashboardQuickActionsRelations = relations(
  appDashboardQuickActions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [appDashboardQuickActions.userId],
      references: [profiles.id],
    }),
  })
);

// 📝 Dashboard 특화 타입들 (실제 코드와 일치)
export type DashboardPerformanceMetrics =
  typeof appDashboardPerformanceMetrics.$inferSelect;
export type NewDashboardPerformanceMetrics =
  typeof appDashboardPerformanceMetrics.$inferInsert;
export type DashboardGoal = typeof appDashboardGoals.$inferSelect;
export type NewDashboardGoal = typeof appDashboardGoals.$inferInsert;
export type DashboardActivityLog = typeof appDashboardActivityLogs.$inferSelect;
export type NewDashboardActivityLog =
  typeof appDashboardActivityLogs.$inferInsert;
export type DashboardNotification =
  typeof appDashboardNotifications.$inferSelect;
export type NewDashboardNotification =
  typeof appDashboardNotifications.$inferInsert;
export type DashboardWidget = typeof appDashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof appDashboardWidgets.$inferInsert;
export type DashboardQuickAction = typeof appDashboardQuickActions.$inferSelect;
export type NewDashboardQuickAction =
  typeof appDashboardQuickActions.$inferInsert;

export type DashboardGoalType =
  (typeof appDashboardGoalTypeEnum.enumValues)[number];
export type DashboardGoalPeriod =
  (typeof appDashboardGoalPeriodEnum.enumValues)[number];
export type DashboardActivityType =
  (typeof appDashboardActivityTypeEnum.enumValues)[number];
export type DashboardNotificationType =
  (typeof appDashboardNotificationTypeEnum.enumValues)[number];
export type DashboardNotificationPriority =
  (typeof appDashboardNotificationPriorityEnum.enumValues)[number];
export type DashboardMetricPeriod =
  (typeof appDashboardMetricPeriodEnum.enumValues)[number];

// 🎯 Dashboard 특화 인터페이스
export interface DashboardOverview {
  metrics: DashboardPerformanceMetrics;
  goals: DashboardGoal[];
  recentActivities: DashboardActivityLog[];
  notifications: DashboardNotification[];
  widgets: DashboardWidget[];
  quickActions: DashboardQuickAction[];
}

export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  totalMeetings: number;
  completedMeetings: number;
  totalRevenue: number;
  averageDealSize: number;
  conversionRate: number;
  goalsAchieved: number;
  totalGoals: number;
}

export interface DashboardFilter {
  period?: DashboardMetricPeriod;
  dateRange?: {
    start: Date;
    end: Date;
  };
  teamId?: string;
  goalTypes?: DashboardGoalType[];
  activityTypes?: DashboardActivityType[];
}
