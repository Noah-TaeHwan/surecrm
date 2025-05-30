// 📊 Dashboard 기능 전용 스키마
// Prefix 네이밍 컨벤션: dashboard_ 사용
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type NewClient,
  type ClientDetail,
  type InsuranceInfo,
  type Referral,
  type Meeting,
  type NewMeeting,
  type PipelineStage,
  type UserRole,
  type Importance,
  type MeetingStatus,
  type MeetingType,
  type InsuranceType,
  type ReferralStatus,
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

// 📌 Dashboard 특화 Enum (prefix 네이밍 적용)
export const dashboardGoalTypeEnum = pgEnum('dashboard_goal_type_enum', [
  'clients',
  'meetings',
  'revenue',
  'referrals',
  'conversion_rate',
]);

export const dashboardGoalPeriodEnum = pgEnum('dashboard_goal_period_enum', [
  'monthly',
  'quarterly',
  'yearly',
]);

export const dashboardActivityTypeEnum = pgEnum(
  'dashboard_activity_type_enum',
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

export const dashboardNotificationTypeEnum = pgEnum(
  'dashboard_notification_type_enum',
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

export const dashboardNotificationPriorityEnum = pgEnum(
  'dashboard_notification_priority_enum',
  ['low', 'normal', 'high', 'urgent']
);

export const dashboardMetricPeriodEnum = pgEnum(
  'dashboard_metric_period_enum',
  ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
);

// 🏷️ Dashboard 특화 테이블들 (prefix 네이밍 적용)

// Dashboard Performance Metrics 테이블 (일별/월별 성과 집계)
export const dashboardPerformanceMetrics = pgTable(
  'dashboard_performance_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    teamId: uuid('team_id').references(() => teams.id),
    date: date('date').notNull(),
    period: dashboardMetricPeriodEnum('period').notNull(),
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Dashboard Goals 테이블 (목표 설정)
export const dashboardGoals = pgTable('dashboard_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  title: text('title').notNull(),
  description: text('description'),
  goalType: dashboardGoalTypeEnum('goal_type').notNull(),
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  period: dashboardGoalPeriodEnum('period').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  metadata: jsonb('metadata'), // 추가 설정 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Activity Log 테이블 (사용자 활동 추적)
export const dashboardActivityLogs = pgTable('dashboard_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  activityType: dashboardActivityTypeEnum('activity_type').notNull(),
  entityType: text('entity_type'), // 'client', 'meeting', 'referral' 등
  entityId: uuid('entity_id'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata'), // 추가 정보
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Notifications 테이블 (알림)
export const dashboardNotifications = pgTable('dashboard_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: dashboardNotificationTypeEnum('type').notNull(),
  priority: dashboardNotificationPriorityEnum('priority')
    .default('normal')
    .notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  actionUrl: text('action_url'), // 클릭시 이동할 URL
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Widgets 테이블 (대시보드 위젯 설정)
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  widgetType: text('widget_type').notNull(), // 'chart', 'metric', 'list', 'calendar'
  title: text('title').notNull(),
  position: jsonb('position').notNull(), // { x: 0, y: 0, w: 2, h: 2 }
  configuration: jsonb('configuration').notNull(), // 위젯별 설정
  isVisible: boolean('is_visible').default(true).notNull(),
  refreshInterval: integer('refresh_interval').default(300), // 초 단위
  lastRefreshed: timestamp('last_refreshed', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dashboard Quick Actions 테이블 (빠른 액션)
export const dashboardQuickActions = pgTable('dashboard_quick_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  name: text('name').notNull(),
  description: text('description'),
  actionType: text('action_type').notNull(), // 'navigate', 'modal', 'api_call'
  actionConfig: jsonb('action_config').notNull(), // 액션 설정
  icon: text('icon'), // 아이콘 이름
  color: text('color').default('#3B82F6'), // 색상
  position: integer('position').default(0), // 정렬 순서
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의)
export const dashboardPerformanceMetricsRelations = relations(
  dashboardPerformanceMetrics,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [dashboardPerformanceMetrics.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [dashboardPerformanceMetrics.teamId],
      references: [teams.id],
    }),
  })
);

export const dashboardGoalsRelations = relations(dashboardGoals, ({ one }) => ({
  agent: one(profiles, {
    fields: [dashboardGoals.agentId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [dashboardGoals.teamId],
    references: [teams.id],
  }),
}));

export const dashboardActivityLogsRelations = relations(
  dashboardActivityLogs,
  ({ one }) => ({
    user: one(profiles, {
      fields: [dashboardActivityLogs.userId],
      references: [profiles.id],
    }),
  })
);

export const dashboardNotificationsRelations = relations(
  dashboardNotifications,
  ({ one }) => ({
    user: one(profiles, {
      fields: [dashboardNotifications.userId],
      references: [profiles.id],
    }),
  })
);

export const dashboardWidgetsRelations = relations(
  dashboardWidgets,
  ({ one }) => ({
    user: one(profiles, {
      fields: [dashboardWidgets.userId],
      references: [profiles.id],
    }),
  })
);

export const dashboardQuickActionsRelations = relations(
  dashboardQuickActions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [dashboardQuickActions.userId],
      references: [profiles.id],
    }),
  })
);

// 📝 Dashboard 특화 타입들 (실제 코드와 일치)
export type DashboardPerformanceMetrics =
  typeof dashboardPerformanceMetrics.$inferSelect;
export type NewDashboardPerformanceMetrics =
  typeof dashboardPerformanceMetrics.$inferInsert;
export type DashboardGoal = typeof dashboardGoals.$inferSelect;
export type NewDashboardGoal = typeof dashboardGoals.$inferInsert;
export type DashboardActivityLog = typeof dashboardActivityLogs.$inferSelect;
export type NewDashboardActivityLog = typeof dashboardActivityLogs.$inferInsert;
export type DashboardNotification = typeof dashboardNotifications.$inferSelect;
export type NewDashboardNotification =
  typeof dashboardNotifications.$inferInsert;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert;
export type DashboardQuickAction = typeof dashboardQuickActions.$inferSelect;
export type NewDashboardQuickAction = typeof dashboardQuickActions.$inferInsert;

export type DashboardGoalType =
  (typeof dashboardGoalTypeEnum.enumValues)[number];
export type DashboardGoalPeriod =
  (typeof dashboardGoalPeriodEnum.enumValues)[number];
export type DashboardActivityType =
  (typeof dashboardActivityTypeEnum.enumValues)[number];
export type DashboardNotificationType =
  (typeof dashboardNotificationTypeEnum.enumValues)[number];
export type DashboardNotificationPriority =
  (typeof dashboardNotificationPriorityEnum.enumValues)[number];
export type DashboardMetricPeriod =
  (typeof dashboardMetricPeriodEnum.enumValues)[number];

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
