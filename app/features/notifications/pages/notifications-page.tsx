import type { Route } from './+types/notifications-page';
import { MainLayout } from '~/common/layouts/main-layout';

// 타입들만 최소한으로 import
import type { NotificationPageData } from '../types';

// Step 2.1: 인증 함수만 추가 (점진적 복구)
import { getCurrentUser } from '~/lib/auth/core';

// Step 2.2: 인증 + 읽지 않은 알림 수 함수 추가 (점진적 복구)
import { getUnreadNotificationCount } from '../lib/notifications-data';

// Step 2.3: 모든 데이터 함수 import (완전 복구)
import { getNotifications } from '../lib/notifications-data';

export function meta(): any {
  return [
    { title: '알림 | SureCRM' },
    { name: 'description', content: '알림 관리 및 설정' },
  ];
}

// 알림 페이지 로더 - 모든 데이터를 실제 데이터베이스에서 로딩
export async function loader({
  request,
}: Route.LoaderArgs): Promise<NotificationPageData> {
  console.log('알림 페이지 로드 시작');

  try {
    // 인증 확인
    const user = await getCurrentUser(request);
    if (!user) {
      console.log('인증 실패 - 로그인이 필요합니다');
      return {
        notifications: [],
        unreadCount: 0,
        user: null,
      };
    }

    // 모든 필요한 데이터를 병렬로 로딩
    const [unreadCount, notifications] = await Promise.all([
      getUnreadNotificationCount(user.id),
      getNotifications(user.id, { limit: 50 }),
    ]);

    console.log('알림 페이지 데이터 로딩 완료');

    return {
      notifications,
      unreadCount,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error('알림 페이지 로드 실패:', error);

    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';

    // 에러 시 빈 데이터 반환
    return {
      notifications: [],
      unreadCount: 0,
      user: null,
    };
  }
}

export default function NotificationsPage({
  loaderData,
}: Route.ComponentProps) {
  const { notifications, unreadCount, user } = loaderData;

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* 헤더 섹션 */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">알림</h1>
          <p className="text-muted-foreground">
            {user ? `${user.fullName || user.email}님, ` : ''}
            {unreadCount > 0
              ? `${unreadCount}개의 읽지 않은 알림이 있습니다`
              : '모든 알림을 확인했습니다'}
          </p>
        </div>

        {/* 알림 목록 */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center p-8">
              <p>알림이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
