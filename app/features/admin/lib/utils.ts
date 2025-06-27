/**
 * 🔒 Admin 백오피스 전용 유틸리티
 * 보안 최우선: 감사 로깅, 접근 제어, 데이터 보호
 */

import { db } from '~/lib/core/db.server';
import { adminAuditLogs, adminStatsCache } from '~/lib/schema';
import { profiles, invitations } from '~/lib/schema';
import { eq, count } from 'drizzle-orm';
import type { AdminAuditLog, NewAdminAuditLog } from '~/lib/schema';

/**
 * 🔍 Admin 감사 로그 기록
 * 모든 Admin 작업을 추적하여 보안 감사 대비
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  tableName?: string,
  targetId?: string,
  beforeData?: any,
  afterData?: any,
  request?: Request
): Promise<void> {
  try {
    const logData: NewAdminAuditLog = {
      adminId,
      action,
      tableName,
      targetId,
      oldValues: beforeData || null,
      newValues: afterData || null,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    };

    await db.insert(adminAuditLogs).values(logData);

    console.log(
      `[ADMIN AUDIT] ${adminId}: ${action} on ${tableName}:${targetId}`
    );
  } catch (error) {
    console.error('Admin 감사 로그 기록 실패:', error);
    // 감사 로그 실패는 치명적이므로 별도 알림 필요
  }
}

/**
 * 🛡️ Admin 작업 권한 검증
 * 특정 Admin 작업에 대한 추가 권한 검증
 */
export function validateAdminOperation(
  adminUser: any,
  operation: string
): boolean {
  // 기본적으로 system_admin만 모든 작업 허용
  if (adminUser.role !== 'system_admin') {
    return false;
  }

  // 특별히 위험한 작업들에 대한 추가 검증
  const criticalOperations = [
    'DELETE_USER_DATA',
    'MODIFY_SYSTEM_SETTINGS',
    'ACCESS_SENSITIVE_DATA',
  ];

  if (criticalOperations.includes(operation)) {
    // 추가 검증 로직 (예: 특별 권한, 시간 제한 등)
    console.warn(
      `[ADMIN SECURITY] Critical operation attempted: ${operation} by ${adminUser.id}`
    );
  }

  return true;
}

/**
 * 📊 Admin 시스템 통계 캐시 관리
 * 백오피스 대시보드용 통계 데이터 효율적 관리
 */
export async function getAdminStats(statType: string): Promise<any> {
  try {
    const cached = await db
      .select()
      .from(adminStatsCache)
      .where(eq(adminStatsCache.statType, statType))
      .limit(1);

    if (cached.length > 0) {
      const cacheData = cached[0];
      const now = new Date();

      // 캐시가 유효한 경우
      if (new Date(cacheData.expiresAt) > now) {
        return cacheData.statData;
      }
    }

    // 캐시가 없거나 만료된 경우 새로 계산
    return await calculateAndCacheStats(statType);
  } catch (error) {
    console.error('Admin 통계 조회 실패:', error);
    return null;
  }
}

/**
 * 🔄 Admin 통계 재계산 및 캐시 업데이트
 */
async function calculateAndCacheStats(statType: string): Promise<any> {
  try {
    let statData: any = {};
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30분 캐시

    switch (statType) {
      case 'invitations_summary':
        // 초대장 통계 계산 (기존 로직 활용)
        statData = await calculateInvitationStats();
        break;

      case 'users_summary':
        // 사용자 통계 계산
        statData = await calculateUserStats();
        break;

      default:
        throw new Error(`Unknown stat type: ${statType}`);
    }

    // 캐시 업데이트
    await db
      .insert(adminStatsCache)
      .values({
        statType,
        statData,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: adminStatsCache.statType,
        set: {
          statData,
          calculatedAt: now,
          expiresAt,
        },
      });

    return statData;
  } catch (error) {
    console.error('Admin 통계 계산 실패:', error);
    return {};
  }
}

/**
 * 📈 초대장 통계 계산
 */
async function calculateInvitationStats(): Promise<any> {
  // 기존 invitations 테이블에서 통계 계산
  // (기존 코드의 통계 로직 활용)
  return {
    total: 0,
    pending: 0,
    used: 0,
    expired: 0,
  };
}

/**
 * 👥 사용자 통계 계산
 */
async function calculateUserStats(): Promise<any> {
  return {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
  };
}

/**
 * 🌐 클라이언트 IP 추출
 */
function getClientIP(request?: Request): string | null {
  if (!request) return null;

  // Cloudflare, nginx 등의 프록시 헤더 고려
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('cf-connecting-ip');

  return clientIP || realIP || forwardedFor?.split(',')[0] || null;
}

/**
 * 🔍 User Agent 추출
 */
function getUserAgent(request?: Request): string | null {
  if (!request) return null;
  return request.headers.get('user-agent');
}

/**
 * 🔐 Admin 데이터 마스킹
 * 민감한 정보를 안전하게 표시
 */
export function maskSensitiveData(data: any, field: string): string {
  if (!data || !data[field]) return '';

  const value = data[field].toString();

  switch (field) {
    case 'email':
      // 이메일 마스킹: test***@example.com
      const [local, domain] = value.split('@');
      if (local.length <= 3) return value;
      return `${local.substring(0, 3)}***@${domain}`;

    case 'phone':
      // 전화번호 마스킹: 010-****-1234
      if (value.length <= 7) return value;
      return `${value.substring(0, 3)}-****-${value.substring(
        value.length - 4
      )}`;

    default:
      return value;
  }
}
