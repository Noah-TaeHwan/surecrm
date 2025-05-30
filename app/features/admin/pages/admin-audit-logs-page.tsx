/**
 * 🔒 Admin 백오피스 - 감사 로그 페이지
 * 보안 최우선: 모든 Admin 작업 추적 및 모니터링
 * 백오피스 단순함: 중요한 감사 정보만 명확하게 표시
 * 실시간 보안: 의심스러운 활동 패턴 감지
 */

import { requireAdmin } from '~/lib/auth/middleware';
import { logAdminAction } from '../lib/utils';
import { db } from '~/lib/core/db';
import { adminAuditLogs } from '~/lib/schema';
import { desc, count, and, gte, like } from 'drizzle-orm';
import { AdminHeader } from '../components/admin-header';
import { AdminStatsCards } from '../components/admin-stats-cards';
import { AdminSystemInfo } from '../components/admin-system-info';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { Form } from 'react-router';
import type { AdminUser } from '../types/admin';

// Route 타입 정의
interface Route {
  LoaderArgs: { request: Request };
  MetaArgs: { data: any };
  ComponentProps: { loaderData: any };
}

export async function loader({ request }: Route['LoaderArgs']) {
  // 🔒 Admin 전용 보안 체크
  const user = (await requireAdmin(request)) as AdminUser;

  // 🔍 Admin 감사 로그 접근 감사 로깅
  await logAdminAction(
    user.id,
    'VIEW_ADMIN_AUDIT_LOGS',
    'audit_logs',
    undefined,
    undefined,
    undefined,
    request
  );

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';
  const actionFilter = url.searchParams.get('action') || '';

  try {
    // 📊 감사 로그 통계 조회
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [auditStats, auditLogs] = await Promise.all([
      // 감사 로그 통계
      db
        .select({ count: count() })
        .from(adminAuditLogs)
        .then(async (result) => {
          const total = result[0]?.count || 0;
          const [today, errors, unauthorized, admins] = await Promise.all([
            db
              .select({ count: count() })
              .from(adminAuditLogs)
              .where(gte(adminAuditLogs.createdAt, startOfToday)),
            db
              .select({ count: count() })
              .from(adminAuditLogs)
              .where(like(adminAuditLogs.action, '%ERROR%')),
            db
              .select({ count: count() })
              .from(adminAuditLogs)
              .where(like(adminAuditLogs.action, '%UNAUTHORIZED%')),
            db
              .select({ count: count() })
              .from(adminAuditLogs)
              .where(like(adminAuditLogs.adminId, '%')),
          ]);
          return {
            total,
            today: today[0]?.count || 0,
            errors: errors[0]?.count || 0,
            unauthorized: unauthorized[0]?.count || 0,
            uniqueAdmins: admins[0]?.count || 0,
          };
        }),

      // 감사 로그 목록 (최신순, 필터링 적용)
      db
        .select()
        .from(adminAuditLogs)
        .where(
          and(
            searchTerm
              ? like(adminAuditLogs.action, `%${searchTerm}%`)
              : undefined,
            actionFilter
              ? like(adminAuditLogs.action, `%${actionFilter}%`)
              : undefined
          )
        )
        .orderBy(desc(adminAuditLogs.createdAt))
        .limit(50), // Admin 백오피스: 최근 50개 로그만 표시
    ]);

    return {
      user,
      auditStats,
      auditLogs,
      searchTerm,
      actionFilter,
      systemInfo: {
        pageType: 'admin_audit_logs',
        accessTime: new Date().toISOString(),
        totalRecords: auditLogs.length,
      },
    };
  } catch (error) {
    // 🚨 Admin 감사 로그 조회 오류 로깅
    await logAdminAction(
      user.id,
      'ERROR_ADMIN_AUDIT_LOGS',
      'audit_logs',
      undefined,
      { error: error instanceof Error ? error.message : String(error) },
      undefined,
      request
    );

    throw error;
  }
}

export function meta({ data }: Route['MetaArgs']) {
  return [
    { title: '🔒 Admin Console - 감사 로그 | SureCRM' },
    {
      name: 'description',
      content: 'Admin 백오피스 - 시스템 감사 로그 모니터링',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
}

export default function AdminAuditLogsPage({
  loaderData,
}: Route['ComponentProps']) {
  const { user, auditStats, auditLogs, searchTerm, actionFilter, systemInfo } =
    loaderData;

  const getActionBadge = (action: string) => {
    if (action.includes('ERROR')) {
      return (
        <Badge variant="destructive" className="text-xs">
          🚨 오류
        </Badge>
      );
    }
    if (action.includes('UNAUTHORIZED')) {
      return (
        <Badge variant="destructive" className="text-xs">
          🚫 무권한
        </Badge>
      );
    }
    if (action.includes('SUCCESS')) {
      return (
        <Badge variant="default" className="text-xs bg-green-600">
          ✅ 성공
        </Badge>
      );
    }
    if (action.includes('VIEW')) {
      return (
        <Badge variant="secondary" className="text-xs">
          👁️ 조회
        </Badge>
      );
    }
    if (action.includes('CREATE')) {
      return (
        <Badge variant="default" className="text-xs bg-blue-600">
          ➕ 생성
        </Badge>
      );
    }
    if (action.includes('MODIFY') || action.includes('UPDATE')) {
      return (
        <Badge variant="default" className="text-xs bg-purple-600">
          ✏️ 수정
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        📝 {action}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatJsonData = (data: any) => {
    if (!data) return '-';
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(data);
    }
  };

  const auditStatsCards = [
    {
      title: '전체 로그',
      value: auditStats.total || 0,
      borderColor: 'border-gray-200',
      titleColor: 'text-gray-700',
      valueColor: 'text-gray-900',
      icon: '📊',
    },
    {
      title: '오늘 활동',
      value: auditStats.today || 0,
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-600',
      icon: '📅',
    },
    {
      title: '오류 로그',
      value: auditStats.errors || 0,
      borderColor: 'border-red-200',
      titleColor: 'text-red-700',
      valueColor: 'text-red-600',
      icon: '🚨',
    },
    {
      title: '무권한 시도',
      value: auditStats.unauthorized || 0,
      borderColor: 'border-orange-200',
      titleColor: 'text-orange-700',
      valueColor: 'text-orange-600',
      icon: '🚫',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 🔒 Admin 헤더 */}
      <AdminHeader
        user={user}
        title="Admin Console - 감사 로그"
        description="모든 Admin 작업과 보안 이벤트를 추적합니다."
        accessTime={systemInfo.accessTime}
        totalRecords={systemInfo.totalRecords}
      />

      {/* 📊 감사 로그 통계 */}
      <AdminStatsCards stats={auditStatsCards} columns={4} />

      {/* 🔍 필터링 및 검색 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">🔍 로그 필터링</CardTitle>
          <CardDescription>
            감사 로그를 필터링하여 특정 작업이나 패턴을 찾을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="get" className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                작업 검색
              </label>
              <Input
                name="search"
                placeholder="작업명 검색 (예: CREATE, ERROR, VIEW...)"
                defaultValue={searchTerm}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                빠른 필터
              </label>
              <select
                name="action"
                defaultValue={actionFilter}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체 작업</option>
                <option value="ERROR">오류 로그만</option>
                <option value="UNAUTHORIZED">무권한 시도만</option>
                <option value="SUCCESS">성공 작업만</option>
                <option value="VIEW">조회 작업만</option>
                <option value="CREATE">생성 작업만</option>
              </select>
            </div>
            <Button type="submit" variant="default">
              🔍 필터 적용
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = window.location.pathname;
              }}
            >
              🔄 초기화
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* 📋 감사 로그 목록 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">📋 감사 로그 목록</CardTitle>
          <CardDescription>
            최근 50개 Admin 작업 로그 (실시간 보안 모니터링)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log: any) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-medium text-sm">{log.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">
                      <span className="font-medium">Admin ID:</span>{' '}
                      {log.adminId}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">대상 테이블:</span>{' '}
                      {log.tableName || '-'}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">대상 ID:</span>{' '}
                      {log.targetId || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">
                      <span className="font-medium">IP 주소:</span>{' '}
                      {log.ipAddress || '-'}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">User Agent:</span>
                      <span className="text-xs ml-1">
                        {log.userAgent
                          ? log.userAgent.substring(0, 50) + '...'
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {(log.oldValues || log.newValues) && (
                  <div className="mt-3 space-y-2">
                    {log.oldValues && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                          📝 변경 전 데이터
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {formatJsonData(log.oldValues)}
                        </pre>
                      </details>
                    )}
                    {log.newValues && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                          📝 변경 후 데이터
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {formatJsonData(log.newValues)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {auditLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              검색 조건에 맞는 감사 로그가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔍 Admin 시스템 정보 */}
      <AdminSystemInfo
        user={user}
        systemInfo={systemInfo}
        additionalInfo={[
          { label: '표시 로그 수', value: auditLogs.length, icon: '📋' },
          { label: '오늘 활동', value: auditStats.today, icon: '📅' },
          {
            label: '현재 필터',
            value: searchTerm || actionFilter || '없음',
            icon: '🔍',
          },
        ]}
        compact={false}
      />
    </div>
  );
}
