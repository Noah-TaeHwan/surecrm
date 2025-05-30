import type { Route } from './+types/admin-invitations-page';
import { requireAdmin } from '~/lib/auth/middleware';
import { createInvitationsForUser } from '~/lib/data/business/invitations';
import { db } from '~/lib/core/db';
import { invitations, profiles } from '~/lib/schema';
import { eq } from 'drizzle-orm';
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

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);

  // 모든 초대장 조회
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

  // 통계 계산
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
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAdmin(request);
  const formData = await request.formData();
  const actionType = formData.get('action');

  if (actionType === 'create_invitations') {
    const count = parseInt(formData.get('count') as string) || 2;

    try {
      const result = await createInvitationsForUser(user.id, count);

      if (result.success) {
        return {
          success: true,
          message: `${count}장의 초대장이 생성되었습니다.`,
          codes: result.invitations?.map((inv: any) => inv.code) || [],
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: '초대장 생성 중 오류가 발생했습니다.',
      };
    }
  }

  return { success: false, error: '잘못된 요청입니다.' };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: '관리자 - 초대장 관리 | SureCRM' },
    { name: 'description', content: '시스템 초대장을 관리합니다.' },
  ];
}

export default function AdminInvitationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user, invitations, stats } = loaderData;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-blue-600">
            대기중
          </Badge>
        );
      case 'used':
        return (
          <Badge variant="default" className="bg-green-600">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">초대장 관리</h1>
          <p className="text-muted-foreground">
            시스템의 모든 초대장을 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 초대장</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">사용됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.used}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">만료됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 초대장 생성 */}
      <Card>
        <CardHeader>
          <CardTitle>새 초대장 생성</CardTitle>
          <CardDescription>
            어드민 계정으로 새로운 초대장을 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex gap-4 items-end">
            <input type="hidden" name="action" value="create_invitations" />
            <div className="flex-1">
              <label htmlFor="count" className="block text-sm font-medium mb-2">
                생성할 초대장 수
              </label>
              <select
                name="count"
                id="count"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="2"
              >
                <option value="1">1장</option>
                <option value="2">2장</option>
                <option value="5">5장</option>
                <option value="10">10장</option>
              </select>
            </div>
            <Button type="submit">초대장 생성</Button>
          </Form>

          {actionData?.success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">{actionData.message}</p>
              {actionData.codes && actionData.codes.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">생성된 초대 코드:</p>
                  <ul className="mt-1 space-y-1">
                    {actionData.codes.map((code: string, index: number) => (
                      <li
                        key={index}
                        className="font-mono text-sm bg-white px-2 py-1 rounded border"
                      >
                        {code}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {actionData?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{actionData.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 초대장 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>모든 초대장</CardTitle>
          <CardDescription>
            시스템에 등록된 모든 초대장 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">초대 코드</th>
                  <th className="text-left p-2">상태</th>
                  <th className="text-left p-2">초대자</th>
                  <th className="text-left p-2">생성일</th>
                  <th className="text-left p-2">만료일</th>
                  <th className="text-left p-2">사용일</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation: any) => (
                  <tr key={invitation.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{invitation.code}</td>
                    <td className="p-2">{getStatusBadge(invitation.status)}</td>
                    <td className="p-2">
                      {invitation.inviterName || '알 수 없음'}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {formatDate(invitation.createdAt)}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {invitation.expiresAt
                        ? formatDate(invitation.expiresAt)
                        : '-'}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {invitation.usedAt ? formatDate(invitation.usedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
