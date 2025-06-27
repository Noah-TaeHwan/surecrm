/**
 * 🔒 Admin 백오피스 - 사용자 관리 페이지
 * 보안 최우선: system_admin만 접근 가능
 * 백오피스 단순함: 사용자 현황 조회 및 기본 관리
 * 감사 로깅: 모든 사용자 관련 Admin 작업 추적
 */

import { requireAdmin } from '~/lib/auth/middleware.server';
import { validateAdminOperation, maskSensitiveData } from '../lib/utils';
import { db } from '~/lib/core/db.server';
import { profiles, invitations } from '~/lib/schema';
import { count, eq, isNotNull, desc } from 'drizzle-orm';
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
import type { AdminUser } from '../types/admin';

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
  const { logAdminAction } = await import('../lib/utils.server');
  await logAdminAction(
    user.id,
    'VIEW_USERS',
    'users',
    undefined,
    undefined,
    undefined,
    request
  );

  try {
    // 🔍 모든 사용자 프로필 조회 (Admin은 모든 데이터 접근 가능)
    const allUsers = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        phone: profiles.phone,
        company: profiles.company,
        role: profiles.role,
        isActive: profiles.isActive,
        createdAt: profiles.createdAt,
        lastLoginAt: profiles.lastLoginAt,
        invitedById: profiles.invitedById,
        invitationsLeft: profiles.invitationsLeft,
      })
      .from(profiles)
      .orderBy(profiles.createdAt);

    // 🎯 Admin용 민감 정보 마스킹 (부분적 보안)
    const maskedUsers = allUsers.map(user => ({
      ...user,
      phone: user.phone ? maskSensitiveData(user.phone, 'phone') : null,
    }));

    // 📊 Admin용 통계 계산
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      inactive: allUsers.filter(u => !u.isActive).length,
      admins: allUsers.filter(u => u.role === 'system_admin').length,
      agents: allUsers.filter(u => u.role === 'agent').length,
    };

    return {
      user,
      users: maskedUsers,
      stats,
      systemInfo: {
        pageType: 'admin_users',
        accessTime: new Date().toISOString(),
        totalRecords: allUsers.length,
      },
    };
  } catch (error) {
    // 🚨 Admin 오류 로깅
    await logAdminAction(
      user.id,
      'ERROR_VIEW_USERS',
      'users',
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
  if (!validateAdminOperation(user, 'MANAGE_USERS')) {
    const { logAdminAction } = await import('../lib/utils.server');
    await logAdminAction(
      user.id,
      'UNAUTHORIZED_MANAGE_USERS',
      'users',
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

  if (actionType === 'toggle_user_status') {
    const targetUserId = formData.get('userId') as string;
    const newStatus = formData.get('isActive') === 'true';

    // 🔍 Admin 작업 시작 로깅
    const { logAdminAction } = await import('../lib/utils.server');
    await logAdminAction(
      user.id,
      'START_TOGGLE_USER_STATUS',
      'users',
      targetUserId,
      { newStatus },
      undefined,
      request
    );

    try {
      // 🛡️ 자기 자신 비활성화 방지
      if (targetUserId === user.id && !newStatus) {
        await logAdminAction(
          user.id,
          'BLOCKED_SELF_DEACTIVATION',
          'users',
          targetUserId,
          { reason: 'Cannot deactivate self' },
          undefined,
          request
        );

        return {
          success: false,
          error: '자기 자신을 비활성화할 수 없습니다.',
        };
      }

      // 🔄 사용자 상태 변경
      await db
        .update(profiles)
        .set({
          isActive: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, targetUserId));

      // ✅ 성공 감사 로깅
      await logAdminAction(
        user.id,
        'SUCCESS_TOGGLE_USER_STATUS',
        'users',
        targetUserId,
        { newStatus },
        {
          admin_action: 'user_status_changed',
          target_user: targetUserId,
          new_status: newStatus ? 'active' : 'inactive',
        },
        request
      );

      return {
        success: true,
        message: `사용자 상태가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
      };
    } catch (error) {
      // 🚨 오류 감사 로깅
      await logAdminAction(
        user.id,
        'ERROR_TOGGLE_USER_STATUS',
        'users',
        targetUserId,
        { newStatus },
        { error: error instanceof Error ? error.message : String(error) },
        request
      );

      return {
        success: false,
        error: 'Admin 사용자 상태 변경 중 시스템 오류가 발생했습니다.',
      };
    }
  }

  return { success: false, error: '잘못된 Admin 요청입니다.' };
}

export function meta({ data }: Route['MetaArgs']) {
  return [
    { title: '🔒 Admin Console - 사용자 관리 | SureCRM' },
    { name: 'description', content: 'Admin 백오피스 - 시스템 사용자 관리' },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
}

export default function AdminUsersPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const { user, userStats, users, systemInfo } = loaderData;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'system_admin':
        return (
          <Badge variant="destructive" className="text-xs">
            👑 시스템 관리자
          </Badge>
        );
      case 'team_admin':
        return (
          <Badge variant="default" className="text-xs bg-purple-600">
            👨‍💼 팀 관리자
          </Badge>
        );
      case 'agent':
        return (
          <Badge variant="outline" className="text-xs">
            👤 에이전트
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {role}
          </Badge>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="text-xs bg-green-600">
        🟢 활성
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs text-red-600 border-red-600">
        🔴 비활성
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
        title="Admin Console - 사용자 관리"
        description="시스템에 등록된 모든 사용자를 관리합니다."
        accessTime={systemInfo.accessTime}
        totalRecords={systemInfo.totalRecords}
      />

      {/* 📊 사용자 통계 */}
      <AdminStatsCards stats={AdminStatTypes.users(userStats)} columns={4} />

      {/* Admin 작업 결과 표시 */}
      {actionData?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">✅ {actionData.message}</p>
          {actionData.adminInfo && (
            <p className="text-sm text-green-700 mt-1">
              수정자: {actionData.adminInfo.modifiedBy} | 시간:{' '}
              {formatDate(actionData.adminInfo.modifiedAt)}
            </p>
          )}
        </div>
      )}

      {actionData?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">❌ {actionData.error}</p>
        </div>
      )}

      {/* 👥 사용자 목록 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">👥 전체 사용자 목록</CardTitle>
          <CardDescription>
            시스템에 등록된 모든 사용자 목록입니다. (Admin만 전체 데이터 접근
            가능)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    사용자 정보
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    역할
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    상태
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    초대장
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    가입일
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    최근 로그인
                  </th>
                  <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {maskSensitiveData(user, 'id')}
                        </div>
                        {user.company && (
                          <div className="text-xs text-gray-500">
                            {user.company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{getRoleBadge(user.role)}</td>
                    <td className="p-3">{getStatusBadge(user.isActive)}</td>
                    <td className="p-3 text-center">
                      <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                        {user.invitationsLeft || 0}장
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="p-3">
                      {user.role !== 'system_admin' && (
                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="action"
                            value="toggle_user_status"
                          />
                          <input type="hidden" name="userId" value={user.id} />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className={
                              user.isActive
                                ? 'text-red-600 border-red-600 hover:bg-red-50'
                                : 'text-green-600 border-green-600 hover:bg-green-50'
                            }
                          >
                            {user.isActive ? '🔴 비활성화' : '🟢 활성화'}
                          </Button>
                        </Form>
                      )}
                      {user.role === 'system_admin' && (
                        <Badge variant="secondary" className="text-xs">
                          👑 관리자
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              등록된 사용자가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔍 Admin 시스템 정보 */}
      <AdminSystemInfo
        user={user}
        systemInfo={systemInfo}
        additionalInfo={[
          { label: '표시 사용자 수', value: users.length, icon: '👥' },
          { label: '전체 사용자 수', value: userStats.total, icon: '📊' },
        ]}
        compact={false}
      />
    </div>
  );
}
