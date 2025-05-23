'use client';

import { Link } from 'react-router';
import {
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  Check,
  CheckCheck,
  Eye,
  Archive,
} from 'lucide-react';
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
}

export function Header({
  title = '대시보드',
  className,
  showMenuButton = false,
  onMenuButtonClick,
}: HeaderProps) {
  // 더미 알림 데이터
  const notifications = [
    {
      id: '1',
      title: '새로운 고객 등록',
      message: '이영희님이 김철수님의 소개로 등록되었습니다.',
      time: '5분 전',
      isRead: false,
      type: 'client',
    },
    {
      id: '2',
      title: '미팅 알림',
      message: '박지성님과의 계약 검토 미팅이 30분 후 시작됩니다.',
      time: '25분 전',
      isRead: false,
      type: 'meeting',
    },
    {
      id: '3',
      title: '계약 체결 완료',
      message: '최민수님의 보험 계약이 성공적으로 체결되었습니다.',
      time: '1시간 전',
      isRead: true,
      type: 'contract',
    },
    {
      id: '4',
      title: '핵심 소개자 업데이트',
      message: '김철수님이 이번 달 소개 건수 1위를 달성했습니다.',
      time: '2시간 전',
      isRead: true,
      type: 'influencer',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    console.log('알림 읽음 처리:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('모든 알림 읽음 처리');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'meeting':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'contract':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'influencer':
        return <Archive className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
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
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        )}

        {/* 페이지 제목 */}
        <h1 className="text-base md:text-lg font-medium text-foreground truncate">
          {title}
        </h1>
      </div>

      {/* 헤더 우측 요소들 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* 알림 아이콘 - 모바일에서는 선택적으로 숨김 */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute top-0 left-6 w-5 h-5 p-0 bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">알림</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>알림</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    모두 읽음
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications.length > 0 ? (
                <ScrollArea className="h-80">
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          'flex items-start p-3 cursor-pointer focus:bg-accent/50',
                          !notification.isRead && 'bg-blue-50/50'
                        )}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-2 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">새로운 알림이 없습니다</p>
                </div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full text-center py-2">
                  <Eye className="mr-2 h-4 w-4" />
                  모든 알림 보기
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 사용자 프로필 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">홍</AvatarFallback>
              </Avatar>
              <span className="sr-only">프로필 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">홍길동</p>
                <p className="text-xs text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/settings?tab=profile" className="cursor-pointer">
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
              onClick={() => console.log('로그아웃')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
