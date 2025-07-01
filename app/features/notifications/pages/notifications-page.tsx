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
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';

// 타입들만 최소한으로 import
import type { NotificationPageData } from '../types';

// 데이터 함수 imports
import { getCurrentUser } from '~/lib/auth/core.server';
import {
  getUnreadNotificationCount,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
} from '../lib/notifications-data';

// 클라이언트 안전 유틸 함수 imports
import {
  formatNotificationTime,
  getTranslatedChannel,
  getTranslatedPriority,
  getTranslatedType,
  getNotificationPriorityClass,
  getNotificationTypeIcon,
  getTranslatedNotificationTitle,
  getTranslatedNotificationMessage,
} from '../lib/notifications-utils';

export function meta(): any {
  return [
    { title: 'notifications:meta.title' },
    { name: 'description', content: 'notifications:meta.description' },
  ];
}

// 알림 페이지 로더 - 모든 데이터를 실제 데이터베이스에서 로딩
export async function loader({
  request,
}: Route.LoaderArgs): Promise<NotificationPageData> {
  try {
    // 🔥 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);

    // 모든 필요한 데이터를 병렬로 로딩
    const [unreadCount, notifications] = await Promise.all([
      getUnreadNotificationCount(user.id),
      getNotifications(user.id, { limit: 50 }),
    ]);

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
          message: 'notifications:messages.success.markAllAsRead',
        };

      case 'markAsRead':
        const notificationId = formData.get('notificationId') as string;
        if (!notificationId) {
          return {
            success: false,
            message: 'notifications:messages.error.notificationIdRequired',
          };
        }
        await markNotificationAsRead(notificationId, user.id);
        return {
          success: true,
          message: 'notifications:messages.success.markAsRead',
        };

      case 'markAsUnread':
        const unreadId = formData.get('notificationId') as string;
        if (!unreadId) {
          return {
            success: false,
            message: 'notifications:messages.error.notificationIdRequired',
          };
        }
        await markNotificationAsUnread(unreadId, user.id);
        return {
          success: true,
          message: 'notifications:messages.success.markAsUnread',
        };

      case 'delete':
        const deleteId = formData.get('notificationId') as string;
        if (!deleteId) {
          return {
            success: false,
            message: 'notifications:messages.error.notificationIdRequired',
          };
        }
        await deleteNotification(deleteId, user.id);
        return {
          success: true,
          message: 'notifications:messages.success.delete',
        };

      default:
        return {
          success: false,
          message: 'notifications:messages.error.unknownAction',
        };
    }
  } catch (error) {
    console.error('알림 액션 처리 실패:', error);
    return {
      success: false,
      message: 'notifications:messages.error.processingError',
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
function getStatusBadge(
  status: string,
  readAt: Date | null,
  t: (key: string) => string
) {
  if (readAt) {
    return (
      <Badge variant="secondary" className="text-xs">
        {t('notifications:status.read')}
      </Badge>
    );
  }

  switch (status) {
    case 'delivered':
      return (
        <Badge
          variant="default"
          className="text-xs bg-blue-500 hover:bg-blue-600"
        >
          {t('notifications:status.newNotification')}
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="text-xs">
          {t('notifications:status.pending')}
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="text-xs">
          {t('notifications:status.failed')}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="default"
          className="text-xs bg-blue-500 hover:bg-blue-600"
        >
          {t('notifications:status.newNotification')}
        </Badge>
      );
  }
}

export default function NotificationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { notifications, unreadCount, user } = loaderData;
  const fetcher = useFetcher();
  const { t } = useHydrationSafeTranslation('notifications');

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

  // 알림 읽음/안읽음 토글
  const handleToggleRead = (
    notificationId: string,
    currentReadAt: Date | null
  ) => {
    const formData = new FormData();
    if (currentReadAt) {
      // 현재 읽음 상태 → 안읽음으로 변경
      formData.append('intent', 'markAsUnread');
    } else {
      // 현재 안읽음 상태 → 읽음으로 변경
      formData.append('intent', 'markAsRead');
    }
    formData.append('notificationId', notificationId);
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <MainLayout title={t('notifications:title')}>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* 🎯 모바일 최적화: 상단 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div
                className={`p-2 sm:p-3 rounded-full ${getPriorityColor(
                  'normal'
                )} mr-3 sm:mr-4`}
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('notifications:stats.total')}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {notifications.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div
                className={`p-2 sm:p-3 rounded-full ${getPriorityColor('high')} mr-3 sm:mr-4`}
              >
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('notifications:stats.unread')}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="flex items-center p-4 sm:p-6">
              <div
                className={`p-2 sm:p-3 rounded-full ${getPriorityColor('low')} mr-3 sm:mr-4`}
              >
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t('notifications:stats.completionRate')}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
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

        {/* 🎯 모바일 최적화: 알림 목록 */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('notifications:sections.recentNotifications')}
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="min-h-[44px] px-3 sm:px-4 text-sm flex-1 sm:flex-initial"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('notifications:actions.markAllAsRead')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {notifications.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {/* 🎯 읽지 않은 알림과 읽은 알림을 구분하여 표시 */}
                {(() => {
                  const unreadNotifications = notifications.filter(
                    n => !n.readAt
                  );
                  const readNotifications = notifications.filter(n => n.readAt);

                  return (
                    <>
                      {/* 읽지 않은 알림 섹션 */}
                      {unreadNotifications.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            {t('notifications:sections.unreadNotifications', {
                              count: unreadNotifications.length,
                            })}
                          </div>
                          {unreadNotifications.map(notification => (
                            <div
                              key={notification.id}
                              className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg transition-all cursor-pointer hover:bg-muted/50 hover:shadow-sm hover:border-primary/40 bg-muted/20 border-primary/20 min-h-[60px] sm:min-h-[72px]"
                              onClick={() =>
                                handleToggleRead(
                                  notification.id,
                                  notification.readAt
                                )
                              }
                              title={t(
                                'notifications:actions.clickToMarkAsRead'
                              )}
                            >
                              {/* 🎯 모바일 최적화: 알림 아이콘 */}
                              <div
                                className={`p-2 rounded-full ${getPriorityColor(
                                  notification.priority
                                )} flex-shrink-0`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>

                              {/* 🎯 모바일 최적화: 알림 내용 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm sm:text-base leading-tight font-semibold text-foreground pr-2">
                                    {getTranslatedNotificationTitle(
                                      notification,
                                      t
                                    )}
                                    <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                  </h4>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    {getStatusBadge(
                                      notification.status,
                                      notification.readAt,
                                      t
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 min-h-[32px] sm:min-h-[36px]"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleDelete(notification.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-foreground leading-relaxed">
                                  {getTranslatedNotificationMessage(
                                    notification,
                                    t
                                  )}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatNotificationTime(
                                      new Date(notification.createdAt),
                                      t
                                    )}
                                  </span>
                                  {notification.channel && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs hidden sm:inline-flex"
                                    >
                                      {getTranslatedChannel(
                                        notification.channel,
                                        t
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 읽은 알림 섹션 */}
                      {readNotifications.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                          {unreadNotifications.length > 0 && (
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pt-3 sm:pt-4 border-t">
                              <CheckCircle className="w-4 h-4" />
                              {t('notifications:sections.readNotifications', {
                                count: readNotifications.length,
                              })}
                            </div>
                          )}
                          {readNotifications.map(notification => (
                            <div
                              key={notification.id}
                              className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg transition-all cursor-pointer hover:bg-muted/50 hover:shadow-sm hover:border-primary/40 min-h-[60px] sm:min-h-[72px]"
                              onClick={() =>
                                handleToggleRead(
                                  notification.id,
                                  notification.readAt
                                )
                              }
                              title={t(
                                'notifications:actions.clickToMarkAsUnread'
                              )}
                            >
                              {/* 🎯 모바일 최적화: 알림 아이콘 */}
                              <div
                                className={`p-2 rounded-full ${getPriorityColor(
                                  notification.priority
                                )} opacity-75 flex-shrink-0`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>

                              {/* 🎯 모바일 최적화: 알림 내용 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm sm:text-base leading-tight font-normal text-muted-foreground pr-2">
                                    {getTranslatedNotificationTitle(
                                      notification,
                                      t
                                    )}
                                  </h4>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    {getStatusBadge(
                                      notification.status,
                                      notification.readAt,
                                      t
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 min-h-[32px] sm:min-h-[36px]"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleDelete(notification.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-muted-foreground leading-relaxed">
                                  {getTranslatedNotificationMessage(
                                    notification,
                                    t
                                  )}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatNotificationTime(
                                      new Date(notification.createdAt),
                                      t
                                    )}
                                  </span>
                                  {notification.channel && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs hidden sm:inline-flex"
                                    >
                                      {getTranslatedChannel(
                                        notification.channel,
                                        t
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              // 🎯 모바일 최적화: 빈 상태 UI 개선
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {t('notifications:empty.noNotifications.title')}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
                  {user
                    ? t('notifications:empty.welcomeMessage.withUser', {
                        name: user.fullName || user.email,
                      })
                    : t('notifications:empty.welcomeMessage.default')}
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1 max-w-sm mx-auto">
                  <p>
                    {t('notifications:empty.welcomeMessage.description.line1')}
                  </p>
                  <p>
                    {t('notifications:empty.welcomeMessage.description.line2')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
