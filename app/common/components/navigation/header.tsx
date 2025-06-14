import React from 'react';
import { Link } from 'react-router';
import { Bell, User, LogOut, Settings, Menu, Eye } from 'lucide-react';
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
import { Badge } from '~/common/components/ui/badge';
import { ScrollArea } from '~/common/components/ui/scroll-area';

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
  title = '',
  className,
  showMenuButton = false,
  onMenuButtonClick,
  currentUser,
  isLoadingUser = false,
}: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [notifications, setNotifications] = React.useState<BasicNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

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
        } catch (e) {
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

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    return `${days}일 전`;
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
        'h-14 md:h-16 px-4 md:px-6 border-b border-border bg-background flex items-center justify-between',
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
            className="lg:hidden !outline-none !border-none !ring-0 !shadow-none hover:!bg-transparent focus:!bg-transparent active:!bg-transparent !transition-none"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        )}

        {/* 페이지 제목 */}
        {title && (
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
        )}
      </div>

      {/* 헤더 우측 요소들 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* 알림 아이콘 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative !outline-none !border-none !ring-0 !shadow-none hover:!bg-transparent focus:!bg-transparent active:!bg-transparent !transition-none"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
              <span className="sr-only">알림</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 md:w-96 p-0" align="end">
            <DropdownMenuLabel className="flex items-center justify-between py-3 px-4 border-b border-border/50">
              <span className="font-semibold text-base">알림</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  onClick={handleMarkAllAsRead}
                >
                  모두 읽음
                </Button>
              )}
            </DropdownMenuLabel>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">로딩 중...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <div className="py-2">
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
                    .map((notification, index) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          'flex items-start mx-2 my-1 p-3 cursor-pointer rounded-lg transition-all duration-200',
                          !notification.readAt
                            ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/30'
                            : 'hover:bg-muted/50 opacity-80'
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
                                  읽지 않음
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-muted/30 rounded-full flex items-center justify-center">
                  <Bell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  읽지 않은 알림이 없습니다
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  새로운 알림이 도착하면 여기에 표시됩니다
                </p>
              </div>
            )}

            <div className="border-t border-border/50">
              <DropdownMenuItem asChild>
                <Link
                  to="/notifications"
                  className="w-full justify-center py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  모든 알림 보기
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 사용자 프로필 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full !outline-none !border-none !ring-0 !shadow-none hover:!bg-transparent focus:!bg-transparent active:!bg-transparent !transition-none"
            >
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
              <span className="sr-only">프로필 메뉴</span>
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
                      {currentUser?.name || '사용자'}
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
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>내 프로필</span>
                    <span className="text-xs text-muted-foreground">
                      개인정보 및 계정 관리
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
