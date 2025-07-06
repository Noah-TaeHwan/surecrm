/**
 * 🔒 Admin 백오피스 - 설정 관리 페이지
 * 보안 최우선: system_admin만 시스템 설정 변경 가능
 * 백오피스 단순함: 필수 설정만 안전하게 관리
 * 감사 로깅: 모든 설정 변경 추적
 */

import { requireAdmin } from '~/lib/auth/middleware.server';
import { validateAdminOperation } from '../lib/utils';
import { db } from '~/lib/core/db.server';
import { adminSettings } from '~/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { AdminHeader } from '../components/admin-header';
import { AdminSystemInfo } from '../components/admin-system-info';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Textarea } from '~/common/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Form } from 'react-router';
import { Switch } from '~/common/components/ui/switch';
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

  // 서버 전용 함수 import
  const { logAdminAction } = await import('../lib/utils.server');

  // 🔍 Admin 설정 관리 접근 감사 로깅
  await logAdminAction(
    user.id,
    'VIEW_ADMIN_SETTINGS',
    'admin_settings',
    undefined,
    undefined,
    undefined,
    request
  );

  try {
    // 📊 모든 Admin 설정 조회
    const settings = await db
      .select()
      .from(adminSettings)
      .orderBy(desc(adminSettings.updatedAt));

    return {
      user,
      settings,
      systemInfo: {
        pageType: 'admin_settings',
        accessTime: new Date().toISOString(),
        totalRecords: settings.length,
      },
    };
  } catch (error) {
    // 🚨 Admin 설정 조회 오류 로깅
    await logAdminAction(
      user.id,
      'ERROR_ADMIN_SETTINGS',
      'admin_settings',
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

  // 서버 전용 함수 import
  const { logAdminAction } = await import('../lib/utils.server');

  const formData = await request.formData();
  const actionType = formData.get('action');

  // 🛡️ Admin 설정 변경 권한 검증
  if (!validateAdminOperation(user, 'MODIFY_SYSTEM_SETTINGS')) {
    await logAdminAction(
      user.id,
      'UNAUTHORIZED_MODIFY_SETTINGS',
      'admin_settings',
      undefined,
      { attempted_action: actionType },
      undefined,
      request
    );

    return {
      success: false,
      error: '시스템 설정 변경 권한이 없습니다.',
    };
  }

  if (actionType === 'update_setting') {
    const settingId = formData.get('settingId') as string;
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;
    const description = formData.get('description') as string;
    const isActive = formData.get('isActive') === 'on';

    // 🔍 설정 변경 시작 로깅
    await logAdminAction(
      user.id,
      'START_UPDATE_SETTING',
      'admin_settings',
      settingId,
      { key },
      undefined,
      request
    );

    try {
      // 기존 설정 조회
      const currentSetting = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.id, settingId))
        .limit(1);

      if (currentSetting.length === 0) {
        return {
          success: false,
          error: '설정을 찾을 수 없습니다.',
        };
      }

      const oldSetting = currentSetting[0];
      let parsedValue;

      try {
        // JSON 값 파싱 시도
        parsedValue = JSON.parse(value);
      } catch {
        // JSON이 아니면 문자열로 저장
        parsedValue = value;
      }

      // 설정 업데이트
      await db
        .update(adminSettings)
        .set({
          key,
          value: parsedValue,
          description,
          isActive,
          updatedById: user.id,
          updatedAt: new Date(),
        })
        .where(eq(adminSettings.id, settingId));

      // ✅ 성공 감사 로깅
      await logAdminAction(
        user.id,
        'SUCCESS_UPDATE_SETTING',
        'admin_settings',
        settingId,
        {
          key: oldSetting.key,
          value: oldSetting.value,
          isActive: oldSetting.isActive,
        },
        {
          key,
          value: parsedValue,
          isActive,
          updatedBy: user.fullName,
        },
        request
      );

      return {
        success: true,
        message: `설정 "${key}"이 성공적으로 업데이트되었습니다.`,
        adminInfo: {
          modifiedBy: user.fullName,
          modifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      // 🚨 오류 감사 로깅
      await logAdminAction(
        user.id,
        'ERROR_UPDATE_SETTING',
        'admin_settings',
        settingId,
        { key },
        { error: error instanceof Error ? error.message : String(error) },
        request
      );

      return {
        success: false,
        error: '설정 업데이트 중 오류가 발생했습니다.',
      };
    }
  }

  if (actionType === 'create_setting') {
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;
    const description = formData.get('description') as string;

    if (!key || !value) {
      return {
        success: false,
        error: '설정 키와 값은 필수입니다.',
      };
    }

    // 🔍 설정 생성 시작 로깅
    await logAdminAction(
      user.id,
      'START_CREATE_SETTING',
      'admin_settings',
      undefined,
      { key },
      undefined,
      request
    );

    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      // 새 설정 생성
      const newSetting = await db
        .insert(adminSettings)
        .values({
          key,
          value: parsedValue,
          description,
          isActive: true,
          updatedById: user.id,
        })
        .returning();

      // ✅ 성공 감사 로깅
      await logAdminAction(
        user.id,
        'SUCCESS_CREATE_SETTING',
        'admin_settings',
        newSetting[0]?.id,
        undefined,
        {
          key,
          value: parsedValue,
          createdBy: user.fullName,
        },
        request
      );

      return {
        success: true,
        message: `새 설정 "${key}"이 생성되었습니다.`,
        adminInfo: {
          createdBy: user.fullName,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      // 🚨 오류 감사 로깅
      await logAdminAction(
        user.id,
        'ERROR_CREATE_SETTING',
        'admin_settings',
        undefined,
        { key },
        { error: error instanceof Error ? error.message : String(error) },
        request
      );

      return {
        success: false,
        error: '설정 생성 중 오류가 발생했습니다. (키 중복 가능성)',
      };
    }
  }

  return { success: false, error: '잘못된 Admin 요청입니다.' };
}

export function meta({ data }: Route['MetaArgs']) {
  return [
    { title: '🔒 Admin Console - 설정 관리 | SureCRM' },
    { name: 'description', content: 'Admin 백오피스 - 시스템 설정 관리' },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
}

export default function AdminSettingsPage({
  loaderData,
  actionData,
}: Route['ComponentProps']) {
  const { user, settings, systemInfo } = loaderData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: any) => {
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 🔒 Admin 헤더 */}
      <AdminHeader
        user={user}
        title="Admin Console - 설정 관리"
        description="시스템 전반적인 설정을 안전하게 관리합니다."
        accessTime={systemInfo.accessTime}
        totalRecords={systemInfo.totalRecords}
      />

      {/* Admin 작업 결과 표시 */}
      {actionData?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">✅ {actionData.message}</p>
          {actionData.adminInfo && (
            <p className="text-sm text-green-700 mt-1">
              {actionData.adminInfo.createdBy &&
                `생성자: ${actionData.adminInfo.createdBy}`}
              {actionData.adminInfo.modifiedBy &&
                `수정자: ${actionData.adminInfo.modifiedBy}`}
              {' | '}
              시간:{' '}
              {formatDate(
                actionData.adminInfo.createdAt ||
                  actionData.adminInfo.modifiedAt
              )}
            </p>
          )}
        </div>
      )}

      {actionData?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">❌ {actionData.error}</p>
        </div>
      )}

      {/* ➕ 새 설정 생성 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">➕ 새 설정 생성</CardTitle>
          <CardDescription>
            새로운 시스템 설정을 추가합니다. (Admin만 생성 가능)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action="/admin/settings" className="space-y-4">
            <input type="hidden" name="action" value="create_setting" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  설정 키 (영문/언더스코어)
                </label>
                <Input
                  name="key"
                  placeholder="예: maintenance_mode, api_rate_limit"
                  required
                  pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  설정 값 (JSON 또는 텍스트)
                </label>
                <Input
                  name="value"
                  placeholder='예: true, "enabled", {"limit": 100}'
                  required
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                설정 설명
              </label>
              <Textarea
                name="description"
                placeholder="이 설정의 용도와 효과를 설명하세요."
                rows={2}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              ➕ 설정 생성
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* ⚙️ 기존 설정 목록 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">⚙️ 시스템 설정 목록</CardTitle>
          <CardDescription>
            현재 등록된 모든 시스템 설정 (Admin만 수정 가능)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting: any) => (
              <div
                key={setting.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="action" value="update_setting" />
                  <input type="hidden" name="settingId" value={setting.id} />

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={setting.isActive ? 'default' : 'secondary'}
                      >
                        {setting.isActive ? '🟢 활성' : '🔴 비활성'}
                      </Badge>
                      <span className="font-medium text-lg">{setting.key}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      마지막 수정: {formatDate(setting.updatedAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        설정 키
                      </label>
                      <Input
                        name="key"
                        defaultValue={setting.key}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        설정 값
                      </label>
                      <Textarea
                        name="value"
                        defaultValue={formatValue(setting.value)}
                        required
                        rows={2}
                        className="w-full font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      설정 설명
                    </label>
                    <Textarea
                      name="description"
                      defaultValue={setting.description || ''}
                      rows={2}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        name="isActive"
                        defaultChecked={setting.isActive}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        활성 상태
                      </label>
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      ✏️ 설정 업데이트
                    </Button>
                  </div>
                </Form>
              </div>
            ))}
          </div>

          {settings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              등록된 시스템 설정이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔍 Admin 시스템 정보 */}
      <AdminSystemInfo
        user={user}
        systemInfo={systemInfo}
        additionalInfo={[
          { label: '전체 설정 수', value: settings.length, icon: '⚙️' },
          {
            label: '활성 설정 수',
            value: settings.filter((s: any) => s.isActive).length,
            icon: '🟢',
          },
        ]}
        compact={false}
      />
    </div>
  );
}
