// Dashboard 기능에 특화된 스키마
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
import {
  profiles,
  teams,
  clients,
  pipelineStages,
} from '~/lib/schema';

// Dashboard 특화 Enum
export const goalTypeEnum = pgEnum('goal_type', [
  'clients',
  'meetings',
  'revenue',
  'referrals',
  'conversion_rate',
]);

export const goalPeriodEnum = pgEnum('goal_period', [
  'monthly',
  'quarterly',
  'yearly',
]);

export const activityTypeEnum = pgEnum('activity_type', [
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
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'meeting_reminder',
  'goal_achievement',
  'goal_deadline',
  'new_referral',
  'client_milestone',
  'team_update',
  'system_alert',
]);

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

export const metricPeriodEnum = pgEnum('metric_period', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

// Dashboard 특화 테이블들

// Performance Metrics 테이블 (일별/월별 성과 집계)
export const performanceMetrics = pgTable('performance_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  date: date('date').notNull(),
  period: metricPeriodEnum('period').notNull(),
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
});

// Goals 테이블 (목표 설정)
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  title: text('title').notNull(),
  description: text('description'),
  goalType: goalTypeEnum('goal_type').notNull(),
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  period: goalPeriodEnum('period').notNull(),
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

// Activity Log 테이블 (사용자 활동 추적)
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  activityType: activityTypeEnum('activity_type').notNull(),
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

// Notifications 테이블 (알림)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull(),
  priority: notificationPriorityEnum('priority').default('normal').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  actionUrl: text('action_url'), // 클릭 시 이동할 URL
  actionLabel: text('action_label'), // 액션 버튼 라벨
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'), // 추가 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
});

// Dashboard Widgets 테이블 (대시보드 위젯 설정)
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  widgetType: text('widget_type').notNull(), // 'stats', 'chart', 'list', 'calendar'
  title: text('title').notNull(),
  position: jsonb('position').notNull(), // { x: 0, y: 0, w: 4, h: 3 }
  config: jsonb('config').notNull(), // 위젯별 설정
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Quick Actions 테이블 (빠른 액션 설정)
export const quickActions = pgTable('quick_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  actionType: text('action_type').notNull(), // 'add_client', 'schedule_meeting', 'create_referral'
  label: text('label').notNull(),
  icon: text('icon'),
  url: text('url').notNull(),
  order: integer('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const performanceMetricsRelations = relations(
  performanceMetrics,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [performanceMetrics.agentId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [performanceMetrics.teamId],
      references: [teams.id],
    }),
  })
);

export const goalsRelations = relations(goals, ({ one }) => ({
  agent: one(profiles, {
    fields: [goals.agentId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [goals.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(profiles, {
    fields: [activityLogs.userId],
    references: [profiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
  }),
}));

export const dashboardWidgetsRelations = relations(
  dashboardWidgets,
  ({ one }) => ({
    user: one(profiles, {
      fields: [dashboardWidgets.userId],
      references: [profiles.id],
    }),
  })
);

export const quickActionsRelations = relations(quickActions, ({ one }) => ({
  user: one(profiles, {
    fields: [quickActions.userId],
    references: [profiles.id],
  }),
}));

// Dashboard 특화 타입들
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type NewPerformanceMetric = typeof performanceMetrics.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert;
export type QuickAction = typeof quickActions.$inferSelect;
export type NewQuickAction = typeof quickActions.$inferInsert;

export type GoalType = (typeof goalTypeEnum.enumValues)[number];
export type GoalPeriod = (typeof goalPeriodEnum.enumValues)[number];
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationPriority =
  (typeof notificationPriorityEnum.enumValues)[number];
export type MetricPeriod = (typeof metricPeriodEnum.enumValues)[number];

// Dashboard 특화 인터페이스
export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  totalMeetings: number;
  completedMeetings: number;
  totalReferrals: number;
  conversionRate: number;
  monthlyRevenue: number;
  pipelineValue: number;
  monthlyGrowth: {
    clients: number;
    referrals: number;
    revenue: number;
    meetings: number;
  };
}

export interface TopPerformer {
  id: string;
  name: string;
  profileImageUrl?: string;
  clients: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface ActivityLogMetadata {
  clientName?: string;
  clientId?: string;
  meetingTitle?: string;
  meetingId?: string;
  referrerName?: string;
  referralId?: string;
  previousValue?: string;
  newValue?: string;
  stageName?: string;
  documentType?: string;
  [key: string]: any;
}

export interface NotificationMetadata {
  meetingId?: string;
  clientId?: string;
  goalId?: string;
  referralId?: string;
  teamId?: string;
  actionData?: Record<string, any>;
  [key: string]: any;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  metrics?: string[];
  filters?: Record<string, any>;
  limit?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  [key: string]: any;
}

export interface DashboardLayout {
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    position: WidgetPosition;
    config: WidgetConfig;
    isVisible: boolean;
  }>;
  quickActions: QuickAction[];
}

export interface PerformanceTrend {
  period: string;
  date: string;
  clients: number;
  meetings: number;
  referrals: number;
  revenue: number;
  conversionRate: number;
}

export interface GoalProgress {
  goal: Goal;
  progress: number; // 0-100
  remaining: number;
  daysLeft: number;
  isOnTrack: boolean;
  projectedCompletion: number;
}
