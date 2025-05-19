import { Link } from 'react-router';
import { Bell, User, LogOut, Settings, Menu } from 'lucide-react';
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute top-0.5 right-0.5 w-2 h-2 p-0 bg-destructive" />
            <span className="sr-only">알림</span>
          </Button>
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
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('로그아웃')}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
