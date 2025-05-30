/**
 * 🔒 Admin 백오피스 전용 타입 정의
 * 보안 최우선: 일반 사용자 타입과 완전 분리
 * 백오피스 단순함: 필요한 타입만 정의
 */

import type { User } from '~/lib/auth/types';

/**
 * 🔑 Admin 사용자 인터페이스
 * system_admin 역할만 허용
 */
export interface AdminUser extends User {
  role: 'system_admin'; // 반드시 system_admin만
}

/**
 * 📊 Admin 대시보드 통계 타입
 */
export interface AdminDashboardStats {
  invitations: {
    total: number;
    pending: number;
    used: number;
    expired: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };
  system: {
    lastUpdated: string;
    cacheStatus: 'valid' | 'expired' | 'updating';
  };
}

/**
 * 🔍 Admin 감사 로그 타입
 */
export interface AdminAuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  ipAddress?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 🛡️ Admin 작업 권한 타입
 */
export type AdminOperation =
  | 'VIEW_INVITATIONS'
  | 'CREATE_INVITATIONS'
  | 'MODIFY_INVITATIONS'
  | 'DELETE_INVITATIONS'
  | 'VIEW_USERS'
  | 'MODIFY_USER_STATUS'
  | 'DELETE_USER_DATA'
  | 'VIEW_AUDIT_LOGS'
  | 'MODIFY_SYSTEM_SETTINGS'
  | 'ACCESS_SENSITIVE_DATA';

/**
 * 📋 Admin 초대장 관리 타입
 */
export interface AdminInvitation {
  id: string;
  code: string;
  status: 'pending' | 'used' | 'expired' | 'cancelled';
  inviterName: string;
  inviterId: string;
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
  message?: string;
}

/**
 * 🔧 Admin 시스템 설정 타입
 */
export interface AdminSystemSetting {
  key: string;
  value: any;
  description: string;
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
}

/**
 * 📈 Admin 작업 결과 타입
 */
export interface AdminActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  auditLogId?: string; // 감사 로그 ID
  timestamp: string;
}

/**
 * 🔒 Admin 보안 컨텍스트 타입
 */
export interface AdminSecurityContext {
  user: AdminUser;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  lastActivity: string;
  permissions: AdminOperation[];
}
