// Reports 기능에 특화된 스키마
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  meetings,
  referrals,
  pipelineStages,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type Meeting,
  type Referral,
  type PipelineStage,
  type UserRole,
  type Importance,
  type MeetingStatus,
  type ReferralStatus,
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
import {
  profiles,
  teams,
  clients,
  meetings,
  referrals,
  pipelineStages,
} from '~/lib/schema/core';

// MVP 특화: Reports 전용 Enum (app_report_ prefix 적용)
export const appReportTypeEnum = pgEnum('app_report_type_enum', [
  'performance',
  'pipeline',
  'client_analysis',
  'referral_analysis',
  'meeting_analysis',
  'revenue',
  'conversion',
  'activity',
  'custom',
]);

export const appReportFormatEnum = pgEnum('app_report_format_enum', [
  'pdf',
  'excel',
  'csv',
  'json',
  'html',
]);

export const appReportFrequencyEnum = pgEnum('app_report_frequency_enum', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'on_demand',
]);

export const appReportStatusEnum = pgEnum('app_report_status_enum', [
  'pending',
  'generating',
  'completed',
  'failed',
  'cancelled',
]);

export const appChartTypeEnum = pgEnum('app_chart_type_enum', [
  'line',
  'bar',
  'pie',
  'doughnut',
  'area',
  'scatter',
  'funnel',
  'gauge',
]);

// MVP 특화: Reports 전용 테이블들 (app_report_ prefix 적용)

// Report Templates 테이블 (보고서 템플릿)
export const reportTemplates = pgTable('app_report_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id), // null이면 시스템 템플릿
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  type: appReportTypeEnum('type').notNull(),
  category: text('category'), // 'daily', 'weekly', 'monthly'
  config: jsonb('config').notNull(), // 보고서 설정
  layout: jsonb('layout'), // 레이아웃 설정
  filters: jsonb('filters'), // 기본 필터
  charts: jsonb('charts'), // 차트 설정
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

// Report Schedules 테이블 (보고서 스케줄)
export const reportSchedules = pgTable('app_report_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  templateId: uuid('template_id')
    .notNull()
    .references(() => reportTemplates.id),
  name: text('name').notNull(),
  description: text('description'),
  frequency: appReportFrequencyEnum('frequency').notNull(),
  format: appReportFormatEnum('format').default('pdf').notNull(),
  recipients: text('recipients').array().notNull(), // 이메일 주소들
  filters: jsonb('filters'), // 동적 필터
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  runCount: integer('run_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Report Instances 테이블 (생성된 보고서)
export const reportInstances = pgTable('app_report_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  templateId: uuid('template_id').references(() => reportTemplates.id),
  scheduleId: uuid('schedule_id').references(() => reportSchedules.id),
  name: text('name').notNull(),
  type: appReportTypeEnum('type').notNull(),
  format: appReportFormatEnum('format').notNull(),
  status: appReportStatusEnum('status').default('pending').notNull(),
  filePath: text('file_path'), // 생성된 파일 경로
  fileSize: integer('file_size'), // 파일 크기 (바이트)
  parameters: jsonb('parameters'), // 생성 시 사용된 파라미터
  data: jsonb('data'), // 보고서 데이터 (작은 보고서의 경우)
  metadata: jsonb('metadata'), // 메타데이터
  generatedAt: timestamp('generated_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  downloadCount: integer('download_count').default(0).notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Report Dashboards 테이블 (대시보드)
export const reportDashboards = pgTable('app_report_dashboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  description: text('description'),
  layout: jsonb('layout').notNull(), // 대시보드 레이아웃
  widgets: jsonb('widgets').notNull(), // 위젯 설정들
  filters: jsonb('filters'), // 전역 필터
  refreshInterval: integer('refresh_interval').default(300), // 새로고침 간격 (초)
  isPublic: boolean('is_public').default(false).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  lastViewed: timestamp('last_viewed', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Report Metrics 테이블 (보고서 지표)
export const reportMetrics = pgTable('app_report_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  date: date('date').notNull(),
  metricType: text('metric_type').notNull(), // 'client_count', 'meeting_count', 'revenue' 등
  value: decimal('value', { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal('previous_value', { precision: 15, scale: 2 }),
  changePercent: decimal('change_percent', { precision: 5, scale: 2 }),
  metadata: jsonb('metadata'), // 추가 메트릭 데이터
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Report Exports 테이블 (보고서 내보내기 이력)
export const reportExports = pgTable('app_report_exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  reportInstanceId: uuid('report_instance_id').references(
    () => reportInstances.id
  ),
  format: appReportFormatEnum('format').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  lastDownloaded: timestamp('last_downloaded', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Report Subscriptions 테이블 (보고서 구독)
export const reportSubscriptions = pgTable('app_report_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id),
  templateId: uuid('template_id')
    .notNull()
    .references(() => reportTemplates.id),
  email: text('email').notNull(),
  frequency: appReportFrequencyEnum('frequency').notNull(),
  format: appReportFormatEnum('format').default('pdf').notNull(),
  filters: jsonb('filters'), // 구독자별 필터
  isActive: boolean('is_active').default(true).notNull(),
  lastSent: timestamp('last_sent', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const reportTemplatesRelations = relations(
  reportTemplates,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [reportTemplates.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [reportTemplates.teamId],
      references: [teams.id],
    }),
    schedules: many(reportSchedules),
    instances: many(reportInstances),
    subscriptions: many(reportSubscriptions),
  })
);

export const reportSchedulesRelations = relations(
  reportSchedules,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [reportSchedules.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [reportSchedules.teamId],
      references: [teams.id],
    }),
    template: one(reportTemplates, {
      fields: [reportSchedules.templateId],
      references: [reportTemplates.id],
    }),
    instances: many(reportInstances),
  })
);

export const reportInstancesRelations = relations(
  reportInstances,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [reportInstances.userId],
      references: [profiles.id],
    }),
    template: one(reportTemplates, {
      fields: [reportInstances.templateId],
      references: [reportTemplates.id],
    }),
    schedule: one(reportSchedules, {
      fields: [reportInstances.scheduleId],
      references: [reportSchedules.id],
    }),
    exports: many(reportExports),
  })
);

export const reportDashboardsRelations = relations(
  reportDashboards,
  ({ one }) => ({
    user: one(profiles, {
      fields: [reportDashboards.userId],
      references: [profiles.id],
    }),
    team: one(teams, {
      fields: [reportDashboards.teamId],
      references: [teams.id],
    }),
  })
);

export const reportMetricsRelations = relations(reportMetrics, ({ one }) => ({
  user: one(profiles, {
    fields: [reportMetrics.userId],
    references: [profiles.id],
  }),
  team: one(teams, {
    fields: [reportMetrics.teamId],
    references: [teams.id],
  }),
}));

export const reportExportsRelations = relations(reportExports, ({ one }) => ({
  user: one(profiles, {
    fields: [reportExports.userId],
    references: [profiles.id],
  }),
  reportInstance: one(reportInstances, {
    fields: [reportExports.reportInstanceId],
    references: [reportInstances.id],
  }),
}));

export const reportSubscriptionsRelations = relations(
  reportSubscriptions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [reportSubscriptions.userId],
      references: [profiles.id],
    }),
    template: one(reportTemplates, {
      fields: [reportSubscriptions.templateId],
      references: [reportTemplates.id],
    }),
  })
);

// Reports 특화 타입들
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type NewReportTemplate = typeof reportTemplates.$inferInsert;
export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type NewReportSchedule = typeof reportSchedules.$inferInsert;
export type ReportInstance = typeof reportInstances.$inferSelect;
export type NewReportInstance = typeof reportInstances.$inferInsert;
export type ReportDashboard = typeof reportDashboards.$inferSelect;
export type NewReportDashboard = typeof reportDashboards.$inferInsert;
export type ReportMetric = typeof reportMetrics.$inferSelect;
export type NewReportMetric = typeof reportMetrics.$inferInsert;
export type ReportExport = typeof reportExports.$inferSelect;
export type NewReportExport = typeof reportExports.$inferInsert;
export type ReportSubscription = typeof reportSubscriptions.$inferSelect;
export type NewReportSubscription = typeof reportSubscriptions.$inferInsert;

export type ReportType = (typeof appReportTypeEnum.enumValues)[number];
export type ReportFormat = (typeof appReportFormatEnum.enumValues)[number];
export type ReportFrequency =
  (typeof appReportFrequencyEnum.enumValues)[number];
export type ReportStatus = (typeof appReportStatusEnum.enumValues)[number];
export type ChartType = (typeof appChartTypeEnum.enumValues)[number];

// Reports 특화 인터페이스
export interface ReportConfig {
  title: string;
  description?: string;
  dateRange: {
    start: Date;
    end: Date;
    type: 'custom' | 'last_week' | 'last_month' | 'last_quarter' | 'last_year';
  };
  filters: {
    teams?: string[];
    agents?: string[];
    clients?: string[];
    stages?: string[];
    importance?: string[];
  };
  metrics: string[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  dataSource: string;
  xAxis: string;
  yAxis: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: ChartConfig | MetricConfig | TableConfig | TextConfig;
}

export interface MetricConfig {
  metric: string;
  format: 'number' | 'currency' | 'percentage';
  comparison?: {
    period: 'previous_period' | 'same_period_last_year';
    showChange: boolean;
  };
}

export interface TableConfig {
  dataSource: string;
  columns: {
    key: string;
    title: string;
    type: 'text' | 'number' | 'currency' | 'date' | 'percentage';
    sortable?: boolean;
  }[];
  pagination?: boolean;
  pageSize?: number;
}

export interface TextConfig {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface ReportData {
  summary: {
    totalClients: number;
    totalMeetings: number;
    totalReferrals: number;
    conversionRate: number;
    revenue: number;
  };
  charts: {
    id: string;
    type: ChartType;
    title: string;
    data: any[];
  }[];
  tables: {
    id: string;
    title: string;
    headers: string[];
    rows: any[][];
  }[];
  metrics: {
    key: string;
    label: string;
    value: number;
    format: string;
    change?: {
      value: number;
      percentage: number;
      direction: 'up' | 'down' | 'neutral';
    };
  }[];
}

export interface ReportFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  teams?: string[];
  agents?: string[];
  clients?: string[];
  stages?: string[];
  importance?: string[];
  tags?: string[];
}

export interface ScheduleConfig {
  frequency: ReportFrequency;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  timezone: string;
}

export interface ReportStats {
  totalReports: number;
  scheduledReports: number;
  completedReports: number;
  failedReports: number;
  totalDownloads: number;
  popularTemplates: {
    id: string;
    name: string;
    usageCount: number;
  }[];
}
