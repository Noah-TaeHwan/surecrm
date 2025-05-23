import type { Route } from '.react-router/types/app/features/notifications/pages/+types/notifications-page';
import { useState } from 'react';
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
import { Bell, Check, Search, Trash2 } from 'lucide-react';
import { cn } from '~/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '알림 - SureCRM' },
    { name: 'description', content: '모든 알림을 확인하고 관리합니다' },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  // TODO: 실제 API에서 알림 데이터 가져오기
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: '새로운 고객 등록',
      message: '이영희님이 김철수님의 소개로 등록되었습니다.',
      time: '5분 전',
      isRead: false,
    },
    {
      id: '2',
      title: '미팅 예정',
      message: '박지성님과의 미팅이 30분 후 시작됩니다.',
      time: '25분 전',
      isRead: false,
    },
    {
      id: '3',
      title: '계약 체결 완료',
      message: '최민수님의 보험 계약이 체결되었습니다.',
      time: '1시간 전',
      isRead: true,
    },
    {
      id: '4',
      title: '소개 네트워크 업데이트',
      message: '김철수님이 새로운 고객을 소개해주셨습니다.',
      time: '2시간 전',
      isRead: true,
    },
    {
      id: '5',
      title: '일정 변경 알림',
      message: '내일 오후 2시 미팅이 3시로 변경되었습니다.',
      time: '3시간 전',
      isRead: false,
    },
    {
      id: '6',
      title: '월간 보고서 준비',
      message: '이번 달 성과 보고서가 준비되었습니다.',
      time: '1일 전',
      isRead: true,
    },
  ];

  return { notifications };
}

export default function NotificationsPage({
  loaderData,
}: Route.ComponentProps) {
  const { notifications } = loaderData || { notifications: [] };
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(
    (n: NotificationItem) => !n.isRead
  ).length;

  const filteredNotifications = notifications.filter(
    (notification: NotificationItem) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === 'all' || (filter === 'unread' && !notification.isRead);

      return matchesSearch && matchesFilter;
    }
  );

  const handleMarkAsRead = (id: string) => {
    console.log('알림 읽음 처리:', id);
    // TODO: API 호출
  };

  const handleMarkAllAsRead = () => {
    console.log('모든 알림 읽음 처리');
    // TODO: API 호출
  };

  const handleDeleteNotification = (id: string) => {
    console.log('알림 삭제:', id);
    // TODO: API 호출
  };

  return (
    <MainLayout title="알림">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              모든 알림을 확인하고 관리하세요
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="mr-2 h-4 w-4" />
              모두 읽음 ({unreadCount})
            </Button>
          )}
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>전체 알림</CardDescription>
              <CardTitle className="text-2xl">{notifications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>읽지 않음</CardDescription>
              <CardTitle className="text-2xl">{unreadCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>오늘</CardDescription>
              <CardTitle className="text-2xl">
                {
                  notifications.filter(
                    (n: NotificationItem) =>
                      n.time.includes('분 전') || n.time.includes('시간 전')
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="알림 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  읽지 않음
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* 알림 목록 */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification: NotificationItem) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border rounded-lg transition-colors hover:bg-muted/50',
                      !notification.isRead && 'bg-muted/30 border-primary/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm leading-tight">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 px-3 text-xs"
                          >
                            읽음
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-2">알림이 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filter === 'unread'
                    ? '조건에 맞는 알림이 없습니다.'
                    : '새로운 알림이 도착하면 여기에 표시됩니다.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
