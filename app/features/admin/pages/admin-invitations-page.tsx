/**
 * 🔒 Admin 백오피스 - 초대장 관리 페이지
 * 보안 최우선: system_admin만 접근 가능
 * 백오피스 단순함: 기능적이고 단순한 UI
 * 감사 로깅: 모든 Admin 작업 추적
 */

import { requireAdmin } from '~/lib/auth/middleware.server';
import { createInvitationsForUser } from '~/lib/data/business/invitations';
import {
  logAdminAction,
  validateAdminOperation,
  getAdminStats,
} from '../lib/utils';
import { db } from '~/lib/core/db.server';
import { invitations, profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';
import { AdminHeader } from '../components/admin-header';
import {
  AdminStatsCards,
  AdminStatTypes,
} from '../components/admin-stats-cards';
import { AdminSystemInfo } from '../components/admin-system-info';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Form } from 'react-router';
import type { AdminUser, AdminInvitation } from '../types/admin';

// Route 타입 정의
interface Route {
  LoaderArgs: { request: Request };
  MetaArgs: { data: any };
  ComponentProps: { loaderData: any; actionData?: any };
}

export async function loader({ request }: Route['LoaderArgs']) {
  // 🔒 Admin 전용 보안 체크
  const user = (await requireAdmin(request)) as AdminUser;

  // 🔍 Admin 접근 감사 로깅
  await logAdminAction(
    user.id,
    'VIEW_INVITATIONS',
    'invitations',
    undefined,
    undefined,
    undefined,
    request
  );

  try {
    // 📊 캐시된 통계 먼저 확인
    const cachedStats = await getAdminStats('invitations_summary');

    // 📋 모든 초대장 조회 (Admin은 모든 데이터 접근 가능)
    const allInvitations = await db
      .select({
        id: invitations.id,
        code: invitations.code,
        status: invitations.status,
        message: invitations.message,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
        usedAt: invitations.usedAt,
        inviterName: profiles.fullName,
        inviterId: invitations.inviterId,
      })
      .from(invitations)
      .leftJoin(profiles, eq(invitations.inviterId, profiles.id))
      .orderBy(invitations.createdAt);

    // 📈 실시간 통계 계산 (백오피스용 정확한 데이터)
    const stats = {
      total: allInvitations.length,
      pending: allInvitations.filter((inv: any) => inv.status === 'pending')
        .length,
      used: allInvitations.filter((inv: any) => inv.status === 'used').length,
      expired: allInvitations.filter((inv: any) => inv.status === 'expired')
        .length,
    };

    return {
      user,
      invitations: allInvitations,
      stats,
      systemInfo: {
        pageType: 'admin_invitations',
        accessTime: new Date().toISOString(),
        totalRecords: allInvitations.length,
      },
    };
  } catch (error) {
    // 🚨 Admin 오류 로깅
    await logAdminAction(
      user.id,
      'ERROR_VIEW_INVITATIONS',
      'invitations',
      undefined,
      { error: error instanceof Error ? error.message : String(error) },
      undefined,
      request
    );

    throw error;
  }
}

export async function action({ request }: Route['LoaderArgs']) {
  // 🔒 Admin 전용 보안 체크
  const user = (await requireAdmin(request)) as AdminUser;

  const formData = await request.formData();
  const actionType = formData.get('action');

  // 🛡️ Admin 작업 권한 검증
  if (!validateAdminOperation(user, 'CREATE_INVITATIONS')) {
    await logAdminAction(
      user.id,
      'UNAUTHORIZED_CREATE_INVITATIONS',
      'invitations',
      undefined,
      { attempted_action: actionType },
      undefined,
      request
    );

    return {
      success: false,
      error: '이 작업을 수행할 권한이 없습니다.',
    };
  }

  if (actionType === 'create_invitations') {
    const count = parseInt(formData.get('count') as string) || 2;

    // 🔍 Admin 작업 시작 로깅
    await logAdminAction(
      user.id,
      'START_CREATE_INVITATIONS',
      'invitations',
      undefined,
      { count },
      undefined,
      request
    );

    try {
      const result = await createInvitationsForUser(user.id, count);

      if (result.success) {
        // ✅ 성공 감사 로깅
        await logAdminAction(
          user.id,
          'SUCCESS_CREATE_INVITATIONS',
          'invitations',
          undefined,
          { count },
          {
            created_codes:
              result.invitations?.map((inv: any) => inv.code) || [],
            total_created: count,
          },
          request
        );

        return {
          success: true,
          message: `🎫 Admin이 ${count}장의 초대장을 생성했습니다.`,
          codes: result.invitations?.map((inv: any) => inv.code) || [],
          adminInfo: {
            createdBy: user.fullName,
            createdAt: new Date().toISOString(),
          },
        };
      } else {
        // ❌ 실패 감사 로깅
        await logAdminAction(
          user.id,
          'FAILED_CREATE_INVITATIONS',
          'invitations',
          undefined,
          { count },
          { error: result.error },
          request
        );

        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      // 🚨 오류 감사 로깅
      await logAdminAction(
        user.id,
        'ERROR_CREATE_INVITATIONS',
        'invitations',
        undefined,
        { count },
        { error: error instanceof Error ? error.message : String(error) },
        request
      );

      return {
        success: false,
        error: 'Admin 초대장 생성 중 시스템 오류가 발생했습니다.',
      };
    }
  }

  return { success: false, error: '잘못된 Admin 요청입니다.' };
}

export function meta({ data }: Route['MetaArgs']) {
  return [
    { title: '🔒 Admin Console - 초대장 관리 | SureCRM' },
    { name: 'description', content: 'Admin 백오피스 - 시스템 초대장 관리' },
    { name: 'robots', content: 'noindex, nofollow' }, // Admin 페이지는 검색 엔진 차단
  ];
}

export default function AdminInvitationsPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const { user, invitations, stats, systemInfo } = loaderData;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            대기중
          </Badge>
        );
      case 'used':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            사용됨
          </Badge>
        );
      case 'expired':
        return <Badge variant="destructive">만료됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 🔒 Admin 헤더 */}
      <AdminHeader
        user={user}
        title="Admin Console - 초대장 관리"
        description="시스템의 모든 초대장을 관리합니다."
        accessTime={systemInfo.accessTime}
        totalRecords={systemInfo.totalRecords}
      />

      {/* 📊 Admin 통계 대시보드 (백오피스용 단순함) */}
      <AdminStatsCards stats={AdminStatTypes.invitations(stats)} columns={4} />

      {/* 🔧 Admin 초대장 생성 (단순한 백오피스 UI) */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">
            🎫 Admin 초대장 생성
          </CardTitle>
          <CardDescription>
            시스템 관리자 권한으로 새로운 초대장을 생성합니다. 모든 작업이 감사
            로그에 기록됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex gap-4 items-end">
            <input type="hidden" name="action" value="create_invitations" />
            <div className="flex-1">
              <label
                htmlFor="count"
                className="block text-sm font-medium mb-2 text-gray-700"
              >
                생성할 초대장 수
              </label>
              <select
                name="count"
                id="count"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                defaultValue="2"
              >
                <option value="1">1장</option>
                <option value="2">2장</option>
                <option value="5">5장</option>
                <option value="10">10장</option>
                <option value="20">20장 (대량)</option>
              </select>
            </div>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              🎫 Admin 생성
            </Button>
          </Form>

          {/* Admin 작업 결과 표시 */}
          {actionData?.success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">
                ✅ {actionData.message}
              </p>
              {actionData.adminInfo && (
                <p className="text-sm text-green-700 mt-1">
                  생성자: {actionData.adminInfo.createdBy} | 시간:{' '}
                  {formatDate(actionData.adminInfo.createdAt)}
                </p>
              )}
              {actionData.codes && actionData.codes.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-700 font-medium">
                    생성된 초대 코드:
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {actionData.codes.map((code: string, index: number) => (
                      <div
                        key={index}
                        className="font-mono text-sm bg-white px-3 py-2 rounded border border-green-300 text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {actionData?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">❌ {actionData.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📋 Admin 초대장 목록 (백오피스용 테이블) */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">📊 전체 초대장 목록</CardTitle>
          <CardDescription>
            시스템에 등록된 모든 초대장 목록입니다. (Admin만 전체 데이터 접근
            가능)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    초대 코드
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    상태
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    초대자
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    생성일
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    만료일
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    사용일
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation: any) => (
                  <tr
                    key={invitation.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-sm bg-gray-50">
                      {invitation.code}
                    </td>
                    <td className="p-3">{getStatusBadge(invitation.status)}</td>
                    <td className="p-3 text-sm">
                      {invitation.inviterName || '알 수 없음'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(invitation.createdAt)}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {invitation.expiresAt
                        ? formatDate(invitation.expiresAt)
                        : '-'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {invitation.usedAt ? formatDate(invitation.usedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invitations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              아직 생성된 초대장이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔍 Admin 시스템 정보 */}
      <AdminSystemInfo user={user} systemInfo={systemInfo} compact={false} />
    </div>
  );
}
