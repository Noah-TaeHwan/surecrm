import type { Route } from './+types/notifications-page';
import { MainLayout } from '~/common/layouts/main-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/common/components/ui/card';
import { Badge } from '~/common/components/ui/badge';
import { Button } from '~/common/components/ui/button';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Settings,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { useFetcher } from 'react-router';

// 타입들만 최소한으로 import
import type { NotificationPageData } from '../types';

// 데이터 함수 imports
import { getCurrentUser } from '~/lib/auth/core';
import {
  getUnreadNotificationCount,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from '../lib/notifications-data';

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

// 알림 액션 처리
export async function action({ request }: Route.ActionArgs) {
  console.log('알림 액션 처리 시작');

  try {
    // 인증 확인
    const user = await getCurrentUser(request);
    if (!user) {
      return {
        success: false,
        message: '인증이 필요합니다.',
      };
    }

    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    switch (intent) {
      case 'markAllAsRead':
        await markAllNotificationsAsRead(user.id);
        return {
          success: true,
          message: '모든 알림을 읽음으로 처리했습니다.',
        };

      case 'markAsRead':
        const notificationId = formData.get('notificationId') as string;
        if (!notificationId) {
          return {
            success: false,
            message: '알림 ID가 필요합니다.',
          };
        }
        await markNotificationAsRead(notificationId, user.id);
        return {
          success: true,
          message: '알림을 읽음으로 처리했습니다.',
        };

      case 'delete':
        const deleteId = formData.get('notificationId') as string;
        if (!deleteId) {
          return {
            success: false,
            message: '알림 ID가 필요합니다.',
          };
        }
        await deleteNotification(deleteId, user.id);
        return {
          success: true,
          message: '알림을 삭제했습니다.',
        };

      default:
        return {
          success: false,
          message: '알 수 없는 액션입니다.',
        };
    }
  } catch (error) {
    console.error('알림 액션 처리 실패:', error);
    return {
      success: false,
      message: '작업 처리 중 오류가 발생했습니다.',
    };
  }
}

// 알림 타입별 아이콘 반환
function getNotificationIcon(type: string) {
  switch (type) {
    case 'meeting_reminder':
      return <Calendar className="h-4 w-4" />;
    case 'goal_achievement':
    case 'goal_deadline':
      return <TrendingUp className="h-4 w-4" />;
    case 'new_referral':
      return <Users className="h-4 w-4" />;
    case 'client_milestone':
      return <CheckCircle className="h-4 w-4" />;
    case 'team_update':
      return <Users className="h-4 w-4" />;
    case 'system_alert':
      return <AlertTriangle className="h-4 w-4" />;
    case 'birthday_reminder':
      return <Gift className="h-4 w-4" />;
    case 'follow_up_reminder':
      return <Clock className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

// 알림 우선순위별 색상 반환
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 hover:bg-red-600';
    case 'high':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'normal':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'low':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
}

// 알림 상태별 표시 반환
function getStatusBadge(status: string, readAt: Date | null) {
  if (readAt) {
    return <Badge variant="secondary">읽음</Badge>;
  }

  switch (status) {
    case 'delivered':
      return <Badge variant="default">새 알림</Badge>;
    case 'pending':
      return <Badge variant="outline">대기중</Badge>;
    case 'failed':
      return <Badge variant="destructive">실패</Badge>;
    default:
      return <Badge variant="default">새 알림</Badge>;
  }
}

export default function NotificationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { notifications, unreadCount, user } = loaderData;
  const fetcher = useFetcher();

  // 성공 메시지 표시를 위한 상태
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccessful = actionData?.success;

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = () => {
    const formData = new FormData();
    formData.append('intent', 'markAllAsRead');
    fetcher.submit(formData, { method: 'post' });
  };

  // 개별 알림 읽음 처리
  const handleMarkAsRead = (notificationId: string) => {
    const formData = new FormData();
    formData.append('intent', 'markAsRead');
    formData.append('notificationId', notificationId);
    fetcher.submit(formData, { method: 'post' });
  };

  // 알림 삭제
  const handleDelete = (notificationId: string) => {
    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('notificationId', notificationId);
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <MainLayout title="알림">
      <div className="space-y-6">
        {/* 상단 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div
                className={`p-3 rounded-full ${getPriorityColor(
                  'normal'
                )} mr-4`}
              >
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  전체 알림
                </p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div
                className={`p-3 rounded-full ${getPriorityColor('high')} mr-4`}
              >
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  읽지 않음
                </p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div
                className={`p-3 rounded-full ${getPriorityColor('low')} mr-4`}
              >
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  완료율
                </p>
                <p className="text-2xl font-bold">
                  {notifications.length > 0
                    ? Math.round(
                        ((notifications.length - unreadCount) /
                          notifications.length) *
                          100
                      )
                    : 100}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 알림 목록 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              최근 알림
            </CardTitle>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  모두 읽음
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      !notification.readAt
                        ? 'bg-muted/20 border-primary/20'
                        : ''
                    }`}
                  >
                    {/* 알림 아이콘 */}
                    <div
                      className={`p-2 rounded-full ${getPriorityColor(
                        notification.priority
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* 알림 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(
                            notification.status,
                            notification.readAt
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.createdAt).toLocaleDateString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                        {notification.channel && (
                          <Badge variant="outline" className="text-xs">
                            {notification.channel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 빈 상태 UI 개선
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">알림이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  {user
                    ? `${
                        user.fullName || user.email
                      }님, 모든 알림을 확인했습니다.`
                    : '새로운 알림이 있으면 여기에 표시됩니다.'}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🎂 고객 생일, 📈 파이프라인 변화, 📅 미팅 일정 등</p>
                  <p>중요한 알림들이 자동으로 생성되어 표시됩니다.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
