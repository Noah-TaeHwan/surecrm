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
import { getCurrentUser } from '~/lib/auth';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationTime,
  getNotificationTypeIcon,
  getNotificationPriorityClass,
  type NotificationQueue,
} from '../lib/notifications-data';
import {
  type NotificationStatus,
  type NotificationType,
  type NotificationPriority,
} from '../schema';
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

export function meta(): any {
  return [
    { title: '알림 | SureCRM' },
    { name: 'description', content: '알림 관리 및 설정' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
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

export async function action({ request }: Route.ActionArgs) {
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

  // 알림 우선순위별 아이콘
  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
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
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="알림 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>

              {/* 필터 */}
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as any)}
                >
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="sent">발송됨</SelectItem>
                    <SelectItem value="read">읽음</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as any)}
                >
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue placeholder="유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 유형</SelectItem>
                    <SelectItem value="meeting_reminder">미팅 알림</SelectItem>
                    <SelectItem value="goal_achievement">목표 달성</SelectItem>
                    <SelectItem value="new_referral">새 추천</SelectItem>
                    <SelectItem value="birthday_reminder">생일 알림</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 섹션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background"
            >
              전체 ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-background"
            >
              읽지 않음 ({unreadCount})
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="data-[state=active]:bg-background"
            >
              읽음 ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* 알림 목록 */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      'border-border bg-card hover:bg-accent/50 transition-colors',
                      !notification.readAt &&
                        'border-l-4 border-l-primary bg-primary/5'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 아이콘 */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="text-2xl">
                            {getNotificationTypeIcon(notification.type)}
                          </div>
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3
                                className={cn(
                                  'font-medium text-foreground',
                                  !notification.readAt && 'font-semibold'
                                )}
                              >
                                {notification.title}
                              </h3>
                              {getPriorityIcon(notification.priority)}
                              {!notification.readAt && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  notification.status === 'read'
                                    ? 'secondary'
                                    : 'default'
                                }
                                className="text-xs"
                              >
                                {notification.status === 'read'
                                  ? '읽음'
                                  : '읽지 않음'}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatNotificationTime(
                                  new Date(notification.createdAt)
                                )}
                              </span>
                              <span>
                                {notification.channel === 'in_app'
                                  ? '앱 내'
                                  : notification.channel}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {!notification.readAt && (
                                <Form method="post" className="inline">
                                  <input
                                    type="hidden"
                                    name="intent"
                                    value="markAsRead"
                                  />
                                  <input
                                    type="hidden"
                                    name="notificationId"
                                    value={notification.id}
                                  />
                                  <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </Form>
                              )}
                              <Form method="post" className="inline">
                                <input
                                  type="hidden"
                                  name="intent"
                                  value="delete"
                                />
                                <input
                                  type="hidden"
                                  name="notificationId"
                                  value={notification.id}
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery ||
                    statusFilter !== 'all' ||
                    typeFilter !== 'all'
                      ? '검색 결과가 없습니다'
                      : activeTab === 'unread'
                      ? '읽지 않은 알림이 없습니다'
                      : activeTab === 'read'
                      ? '읽은 알림이 없습니다'
                      : '알림이 없습니다'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ||
                    statusFilter !== 'all' ||
                    typeFilter !== 'all'
                      ? '다른 검색 조건을 시도해보세요'
                      : '새로운 알림이 도착하면 여기에 표시됩니다'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
