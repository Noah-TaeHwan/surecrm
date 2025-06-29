import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut, Menu, Eye, Lock } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/common/components/ui/button';
import { Avatar, AvatarFallback } from '~/common/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { useSubscription } from '~/lib/contexts/subscription-context';
import { LanguageSelector } from '~/common/components/i18n/language-selector';

interface HeaderProps {
  title?: string;
  className?: string;
  showMenuButton?: boolean;
  onMenuButtonClick?: () => void;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null;
  isLoadingUser?: boolean;
}

// 기본 알림 타입 정의
interface BasicNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  readAt?: string | null;
}

export function Header({
  className,
  showMenuButton = false,
  onMenuButtonClick,
  currentUser,
  isLoadingUser = false,
}: HeaderProps) {
  const { t } = useTranslation('navigation');
  const { subscriptionStatus, isLoading: isSubscriptionLoading } =
    useSubscription();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [notifications, setNotifications] = React.useState<BasicNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydration 완료 감지
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 구독 상태 확인 함수
  const isSubscriptionActive = () => {
    if (isSubscriptionLoading || !subscriptionStatus) return false;
    // needsPayment가 false이거나 isTrialActive가 true이면 활성 상태
    return !subscriptionStatus.needsPayment || subscriptionStatus.isTrialActive;
  };

  // 알림 데이터를 직접 fetch하는 함수
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // 읽지 않은 알림만 가져오기 (헤더에서는 읽지 않은 알림만 표시)
      const response = await fetch(
        '/api/notifications?limit=15&sortBy=createdAt&sortOrder=desc&unreadOnly=true',
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();

        // API 응답 구조에 맞게 데이터 추출
        const responseData = data.data || data; // data.data가 없으면 data 직접 사용
        const notificationsArray = responseData.notifications || [];
        const unreadCountValue = responseData.unreadCount || 0;

        setNotifications(notificationsArray);
        setUnreadCount(unreadCountValue);
      } else {
        console.warn(
          '❌ 알림 API 응답 오류:',
          response.status,
          response.statusText
        );

        // 에러 응답 내용도 확인
        try {
          const errorData = await response.text();
          console.warn('❌ 에러 응답 내용:', errorData);
        } catch {
          console.warn('❌ 에러 응답 파싱 실패');
        }

        // 인증 오류 등은 조용히 처리
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.warn('❌ 알림 로드 실패:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 알림 로드
  React.useEffect(() => {
    fetchNotifications();

    // 30초마다 알림 새로고침
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const formData = new FormData();
      formData.append('intent', 'markAsRead');
      formData.append('notificationId', id);

      await fetch('/api/notifications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // 성공 시 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const formData = new FormData();
      formData.append('intent', 'markAllAsRead');

      await fetch('/api/notifications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // 성공 시 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/auth/login?message=logged-out';
      } else {
        console.error('로그아웃 실패');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      setIsLoggingOut(false);
    }
  };

  // 시간 포맷 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (!isHydrated) {
      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}시간 전`;
      const days = Math.floor(hours / 24);
      return `${days}일 전`;
    }

    if (minutes < 1) return t('time.just_now');
    if (minutes < 60) return t('time.minutes_ago', { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('time.hours_ago', { count: hours });

    const days = Math.floor(hours / 24);
    return t('time.days_ago', { count: days });
  };

  // 아이콘 가져오기 함수
  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting_reminder':
        return '📅';
      case 'client_milestone':
        return '👤';
      case 'new_referral':
        return '🔗';
      case 'goal_achievement':
        return '🎯';
      case 'team_update':
        return '👥';
      case 'system_alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <header
      className={cn(
        'h-14 md:h-16 px-4 md:px-6 bg-background flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* 모바일 메뉴 버튼 */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuButtonClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">
              {isHydrated ? t('header.open_menu') : '메뉴 열기'}
            </span>
          </Button>
        )}
      </div>

      {/* 헤더 우측 요소들 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* 알림 아이콘 - 구독 상태에 따라 제한 */}
        {isSubscriptionActive() ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
                <span className="sr-only">
                  {isHydrated ? t('header.notifications') : '알림'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="font-medium">
                  {isHydrated ? t('header.notifications') : '알림'}
                </span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleMarkAllAsRead}
                  >
                    {isHydrated
                      ? t('notifications.mark_all_read')
                      : '모두 읽음으로 표시'}
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isHydrated ? t('common.loading') : '로딩 중...'}
                  </p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {/* 🔧 수정: 읽지 않은 알림을 먼저 표시하고, 읽은 알림과 구분 */}
                  {notifications
                    .sort((a, b) => {
                      // 읽지 않은 알림을 먼저 정렬
                      if (!a.readAt && b.readAt) return -1;
                      if (a.readAt && !b.readAt) return 1;
                      // 같은 읽음 상태라면 최신순
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    })
                    .map(notification => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          'flex items-start p-4 cursor-pointer border-b border-border/50 last:border-b-0 transition-colors',
                          !notification.readAt
                            ? 'bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15'
                            : 'hover:bg-muted/50 opacity-75'
                        )}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="flex w-full gap-3">
                          <div className="text-lg">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <p
                                className={cn(
                                  'text-sm leading-tight',
                                  !notification.readAt
                                    ? 'font-semibold text-foreground'
                                    : 'font-medium text-muted-foreground'
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.readAt && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-1 ml-2 flex-shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p
                              className={cn(
                                'text-xs leading-relaxed mb-2',
                                !notification.readAt
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/70'
                              )}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </p>
                              {!notification.readAt && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                  {isHydrated
                                    ? t('notifications.unread')
                                    : '읽지 않음'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    {isHydrated
                      ? t('notifications.no_unread')
                      : '읽지 않은 알림이 없습니다'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isHydrated
                      ? t('notifications.empty_message')
                      : '새 알림이 오면 여기에 표시됩니다'}
                  </p>
                </div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/notifications"
                  className="w-full justify-center py-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isHydrated ? t('notifications.view_all') : '모든 알림 보기'}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative opacity-50 cursor-not-allowed"
            disabled
            title={
              isHydrated
                ? t('subscription.expired_notification')
                : '구독 만료 - 알림 기능을 사용하려면 구독을 갱신하세요'
            }
          >
            <Bell className="h-4 w-4" />
            <Lock className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
            <span className="sr-only">
              {isHydrated
                ? t('subscription.notification_expired')
                : '알림 (구독 만료)'}
            </span>
          </Button>
        )}

        {/* 언어 선택기 */}
        <LanguageSelector variant="dropdown" />

        {/* 사용자 프로필 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {isLoadingUser ? (
                  <AvatarFallback className="text-xs animate-pulse bg-muted">
                    <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="text-xs">
                    {currentUser?.name
                      ? currentUser.name.charAt(0).toUpperCase()
                      : currentUser?.email
                        ? currentUser.email.charAt(0).toUpperCase()
                        : '사'}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="sr-only">
                {isHydrated ? t('header.profile_menu') : '프로필 메뉴'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                {isLoadingUser ? (
                  <>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {currentUser?.name ||
                        (isHydrated ? t('header.user') : '사용자')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.email || 'email@example.com'}
                    </p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isSubscriptionActive() ? (
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{isHydrated ? t('header.profile') : '프로필'}</span>
                      <span className="text-xs text-muted-foreground">
                        {isHydrated
                          ? t('profile.description')
                          : '프로필 설정 관리'}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-not-allowed opacity-50"
                  disabled
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <span>{isHydrated ? t('header.profile') : '프로필'}</span>
                      <span className="text-xs text-muted-foreground">
                        {isHydrated
                          ? t('subscription.settings_locked')
                          : '구독 만료로 잠김'}
                      </span>
                    </div>
                    <Lock className="h-3 w-3 ml-2 text-muted-foreground" />
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>
                {isLoggingOut
                  ? isHydrated
                    ? t('header.logging_out')
                    : '로그아웃 중...'
                  : isHydrated
                    ? t('header.logout')
                    : '로그아웃'}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
