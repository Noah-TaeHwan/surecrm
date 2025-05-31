import type { Route } from '.react-router/types/app/features/notifications/pages/+types/notifications-page';
import { useState } from 'react';
import { Form, redirect, Link } from 'react-router';
import { Button } from '~/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Input } from '~/common/components/ui/input';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Bell,
  Check,
  Search,
  Trash2,
  Filter,
  Settings,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { getCurrentUser } from '~/lib/auth/core';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationTime,
  getNotificationTypeIcon,
  getNotificationPriorityClass,
} from '../lib/notifications-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/common/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/common/components/ui/tabs';

// 타입들을 중앙 타입 파일에서 import
import type {
  NotificationQueue,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationPageData,
  NotificationActionData,
} from '../types';

// 새로 생성한 컴포넌트들 import
import { NotificationCard } from '../components/notification-card';
import { NotificationFilters } from '../components/notification-filters';
import { NotificationTabs } from '../components/notification-tabs';
import { NotificationEmptyState } from '../components/notification-empty-state';

export function meta(): any {
  return [
    { title: '알림 | SureCRM' },
    { name: 'description', content: '알림 관리 및 설정' },
  ];
}

export async function loader({
  request,
}: Route.LoaderArgs): Promise<NotificationPageData> {
  try {
    // 현재 사용자 정보 가져오기
    const user = await getCurrentUser(request);
    if (!user) {
      throw redirect('/auth/login');
    }

    // 알림 데이터 가져오기
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id, { limit: 50 }),
      getUnreadNotificationCount(user.id),
    ]);

    return {
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      user,
    };
  } catch (error) {
    console.error('알림 페이지 로더 에러:', error);
    return {
      notifications: [],
      unreadCount: 0,
      user: null,
    };
  }
}

export async function action({
  request,
}: Route.ActionArgs): Promise<NotificationActionData> {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const notificationId = formData.get('notificationId') as string;

  try {
    const user = await getCurrentUser(request);
    if (!user) {
      throw redirect('/auth/login');
    }

    switch (intent) {
      case 'markAsRead':
        if (notificationId) {
          await markNotificationAsRead(notificationId, user.id);
        }
        break;
      case 'markAllAsRead':
        await markAllNotificationsAsRead(user.id);
        break;
      case 'delete':
        if (notificationId) {
          await deleteNotification(notificationId, user.id);
        }
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('알림 액션 에러:', error);
    return { error: '작업을 처리하는 중 오류가 발생했습니다.' };
  }
}

export default function NotificationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { notifications, unreadCount, user } = loaderData;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || notification.status === statusFilter;
    const matchesType =
      typeFilter === 'all' || notification.type === typeFilter;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.readAt) ||
      (activeTab === 'read' && notification.readAt);

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  // 빈 상태 타입 결정
  const getEmptyStateType = () => {
    if (searchQuery || statusFilter !== 'all' || typeFilter !== 'all') {
      return 'no-search-results';
    }

    switch (activeTab) {
      case 'unread':
        return 'no-unread';
      case 'read':
        return 'no-read';
      default:
        return 'no-notifications';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">알림</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount}개의 읽지 않은 알림이 있습니다`
                : '모든 알림을 확인했습니다'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Form method="post">
                <input type="hidden" name="intent" value="markAllAsRead" />
                <Button type="submit" variant="outline" size="sm">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  모두 읽음
                </Button>
              </Form>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                알림 설정
              </Link>
            </Button>
          </div>
        </div>

        {/* 필터 및 검색 섹션 */}
        <NotificationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* 탭 섹션 */}
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalCount={notifications.length}
          unreadCount={unreadCount}
        />

        {/* 알림 목록 */}
        <div className="mt-6">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          ) : (
            <NotificationEmptyState
              type={getEmptyStateType()}
              searchQuery={searchQuery}
              hasFilters={statusFilter !== 'all' || typeFilter !== 'all'}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
