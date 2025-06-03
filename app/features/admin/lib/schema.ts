/**
 * 🔒 Admin 백오피스 전용 Schema
 * 보안 최우선: 기존 구조 100% 보존하며 Admin 전용 확장
 * 안전한 확장: 공통 스키마 재export + Admin 전용 추가 테이블
 * 완벽한 연동: 기존 import 경로 모두 정상 작동 보장
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== 공통 스키마에서 필요한 요소들 가져오기 =====
import {
  // 기존 Admin 테이블들 (네이밍 그대로 유지)
  adminAuditLogs,
  adminSettings,
  adminStatsCache,

  // 기존 Admin Relations
  adminAuditLogsRelations,
  adminSettingsRelations,

  // 기존 Admin 타입들
  type AdminAuditLog,
  type NewAdminAuditLog,
  type AdminSetting,
  type NewAdminSetting,
  type AdminStatsCache,
  type NewAdminStatsCache,

  // Admin이 참조하는 공통 테이블들
  profiles,
  invitations,
  clients,
  teams,

  // 필요한 공통 Relations
  profilesRelations,
  invitationsRelations,

  // 공통 타입들
  type Profile,
  type Invitation,
  type Client,
  type Team,
} from '~/lib/schema/core';

// ===== 공통 스키마 재export (기존 구조 100% 보존) =====
export {
  // 기존 Admin 테이블들 (네이밍 그대로 유지)
  adminAuditLogs,
  adminSettings,
  adminStatsCache,

  // 기존 Admin Relations
  adminAuditLogsRelations,
  adminSettingsRelations,

  // 기존 Admin 타입들
  type AdminAuditLog,
  type NewAdminAuditLog,
  type AdminSetting,
  type NewAdminSetting,
  type AdminStatsCache,
  type NewAdminStatsCache,

  // Admin이 참조하는 공통 테이블들
  profiles,
  invitations,
  clients,
  teams,

  // 필요한 공통 Relations
  profilesRelations,
  invitationsRelations,

  // 공통 타입들
  type Profile,
  type Invitation,
  type Client,
  type Team,
};

// ===== Admin 기능 전용 추가 테이블들 =====

/**
 * 🔐 Admin 세션 관리 테이블
 * 보안 강화: Admin 사용자 세션 추적 및 관리
 */
export const appAdminSessions = pgTable('app_admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull(), // system_admin 사용자 ID
  sessionToken: text('session_token').unique().notNull(), // 세션 토큰
  ipAddress: text('ip_address'), // 로그인 IP
  userAgent: text('user_agent'), // 브라우저 정보
  lastActivity: timestamp('last_activity', { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * 🚨 Admin 보안 알림 테이블
 * 실시간 보안: 의심스러운 Admin 활동 알림 관리
 */
export const appAdminSecurityAlerts = pgTable('app_admin_security_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id'), // 관련 Admin (nullable for system alerts)
  alertType: text('alert_type').notNull(), // 알림 유형
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  title: text('title').notNull(), // 알림 제목
  description: text('description'), // 상세 설명
  metadata: jsonb('metadata'), // 추가 메타데이터
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedById: uuid('resolved_by_id'), // 해결한 Admin
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * 📊 Admin 대시보드 위젯 설정 테이블
 * 개인화: Admin별 대시보드 레이아웃 및 위젯 설정
 */
export const appAdminDashboardWidgets = pgTable('app_admin_dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull(), // Admin 사용자 ID
  widgetType: text('widget_type').notNull(), // 위젯 유형
  title: text('title').notNull(), // 위젯 제목
  config: jsonb('config').notNull(), // 위젯 설정
  position: jsonb('position').notNull(), // 위젯 위치 (x, y, w, h)
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== Admin 기능 전용 Relations =====

export const appAdminSessionsRelations = relations(
  appAdminSessions,
  ({ one }) => ({
    admin: one(profiles, {
      fields: [appAdminSessions.adminId],
      references: [profiles.id],
      relationName: 'admin_sessions',
    }),
  })
);

export const appAdminSecurityAlertsRelations = relations(
  appAdminSecurityAlerts,
  ({ one }) => ({
    admin: one(profiles, {
      fields: [appAdminSecurityAlerts.adminId],
      references: [profiles.id],
      relationName: 'admin_security_alerts',
    }),
    resolvedBy: one(profiles, {
      fields: [appAdminSecurityAlerts.resolvedById],
      references: [profiles.id],
      relationName: 'admin_security_alerts_resolver',
    }),
  })
);

export const appAdminDashboardWidgetsRelations = relations(
  appAdminDashboardWidgets,
  ({ one }) => ({
    admin: one(profiles, {
      fields: [appAdminDashboardWidgets.adminId],
      references: [profiles.id],
      relationName: 'admin_dashboard_widgets',
    }),
  })
);

// ===== Admin 기능 전용 타입 추론 =====

export type AppAdminSession = typeof appAdminSessions.$inferSelect;
export type NewAppAdminSession = typeof appAdminSessions.$inferInsert;

export type AppAdminSecurityAlert = typeof appAdminSecurityAlerts.$inferSelect;
export type NewAppAdminSecurityAlert =
  typeof appAdminSecurityAlerts.$inferInsert;

export type AppAdminDashboardWidget =
  typeof appAdminDashboardWidgets.$inferSelect;
export type NewAppAdminDashboardWidget =
  typeof appAdminDashboardWidgets.$inferInsert;

// ===== Admin 기능 전용 Enum 타입들 =====

export type AdminAlertType =
  | 'SUSPICIOUS_LOGIN'
  | 'MULTIPLE_FAILED_ATTEMPTS'
  | 'UNAUTHORIZED_ACTION'
  | 'DATA_BREACH_ATTEMPT'
  | 'SYSTEM_ANOMALY'
  | 'PRIVILEGE_ESCALATION';

export type AdminAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AdminWidgetType =
  | 'STATS_CARD'
  | 'CHART_LINE'
  | 'CHART_BAR'
  | 'CHART_PIE'
  | 'RECENT_LOGS'
  | 'SYSTEM_STATUS'
  | 'SECURITY_ALERTS'
  | 'QUICK_ACTIONS';

/**
 * 🔄 Admin Schema 통합 Export
 * 모든 Admin 관련 스키마를 하나의 인터페이스로 제공
 */
export const AdminSchemaExports = {
  // 기존 공통 테이블들
  tables: {
    adminAuditLogs,
    adminSettings,
    adminStatsCache,
  },

  // Admin 기능 전용 테이블들
  adminTables: {
    appAdminSessions,
    appAdminSecurityAlerts,
    appAdminDashboardWidgets,
  },

  // 모든 Relations
  relations: {
    adminAuditLogsRelations,
    adminSettingsRelations,
    appAdminSessionsRelations,
    appAdminSecurityAlertsRelations,
    appAdminDashboardWidgetsRelations,
  },
} as const;
