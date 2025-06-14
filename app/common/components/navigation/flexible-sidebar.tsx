import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Network,
  PieChart,
  Users,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Sidebar } from './sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import {
  DesktopOnly,
  MobileOnly,
} from '~/common/components/ui/responsive-layout';
import { cn } from '~/lib/utils';

interface FlexibleSidebarProps {
  className?: string;
}

/**
 * 반응형 사이드바 시스템
 *
 * 화면 크기별 동작:
 * - 데스크톱 (lg+): 고정 사이드바 표시
 * - 태블릿 (md-lg): 접이식 사이드바 (향후 구현)
 * - 모바일 (<md): 하단 탭 네비게이션 + Sheet 사이드바
 */
export function FlexibleSidebar({ className }: FlexibleSidebarProps) {
  return (
    <>
      {/* 데스크톱 고정 사이드바 (md 이상) */}
      <DesktopOnly className="md:block hidden">
        <div className={cn('w-64 flex-shrink-0', className)}>
          <Sidebar />
        </div>
      </DesktopOnly>

      {/* 태블릿 접이식 사이드바 (md-lg) - 향후 구현 */}
      {/* TODO: 태블릿용 접이식 사이드바 구현 - 현재는 데스크톱과 동일하게 처리 */}

      {/* 모바일 하단 탭 네비게이션 (md 미만) */}
      <MobileOnly>
        <MobileBottomNav />
      </MobileOnly>

      {/* 모바일 Sheet용 사이드바 (별도 렌더링) */}
      {/* 이 부분은 MainLayout에서 Sheet으로 감싸서 사용 */}
    </>
  );
}

/**
 * Sheet 내부에서 사용할 모바일 사이드바
 * MainLayout의 Sheet 컴포넌트 내부에서 사용
 */
export function MobileSidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* 모바일 전용 헤더 - X 버튼 제거 (SheetContent에서 제공) */}
      <div className="flex items-center p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">메뉴</h2>
      </div>

      {/* 사이드바 컨텐츠 */}
      <div className="flex-1">
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
}

/**
 * 태블릿용 접이식 사이드바
 * 아이콘만 표시하는 축소 모드와 풀 사이드바 간 전환
 */
export function CollapsibleSidebar({
  isCollapsed,
  onToggle,
  className,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={cn('transition-all duration-300 ease-in-out', className)}>
      {isCollapsed ? (
        // 축소된 사이드바 (아이콘만)
        <CollapsedSidebar onToggle={onToggle} />
      ) : (
        // 전체 사이드바
        <ExpandedSidebar onToggle={onToggle} />
      )}
    </div>
  );
}

/**
 * 축소된 사이드바 (아이콘만 표시)
 */
function CollapsedSidebar({ onToggle }: { onToggle: () => void }) {
  const location = useLocation();

  const iconNavItems = [
    {
      label: '대시보드',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: '소개 네트워크',
      href: '/network',
      icon: <Network className="h-5 w-5" />,
    },
    {
      label: '영업 파이프라인',
      href: '/pipeline',
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      label: '고객 관리',
      href: '/clients',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: '일정 관리',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: '설정',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-16 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* 로고 및 토글 버튼 */}
      <div className="p-2 border-b border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
          title="사이드바 확장"
        >
          <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
        </button>
      </div>

      {/* 축소된 네비게이션 아이콘들 */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav>
          <ul className="space-y-2">
            {iconNavItems.map(item => {
              const isActive = isActiveRoute(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-md transition-colors min-touch-target',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                    title={item.label}
                  >
                    {item.icon}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/**
 * 확장된 사이드바 (전체 메뉴 표시)
 */
function ExpandedSidebar({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* 헤더 with 토글 버튼 */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-sidebar-foreground flex justify-center cursor-pointer hover:text-sidebar-primary transition-colors"
        >
          SureCRM
        </Link>
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-sidebar-accent transition-colors min-touch-target"
          title="사이드바 축소"
        >
          <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
        </button>
      </div>

      {/* 풀 사이드바 컨텐츠 */}
      <div className="flex-1">
        <Sidebar />
      </div>
    </div>
  );
}
