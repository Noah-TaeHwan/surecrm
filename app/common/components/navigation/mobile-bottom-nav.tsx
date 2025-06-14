import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  PieChart,
  Calendar,
  Settings,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

interface MobileBottomNavProps {
  className?: string;
}

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * 모바일 하단 탭 네비게이션 컴포넌트
 * - 768px 미만에서만 표시
 * - 주요 5개 메뉴로 구성
 * - 터치 친화적 44px 이상 타겟 크기
 */
export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();

  // PRD에서 정의한 모바일 주요 5개 탭
  const mobileNavItems: MobileNavItem[] = [
    {
      label: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: '고객',
      href: '/clients',
      icon: Users,
    },
    {
      label: '파이프라인',
      href: '/pipeline',
      icon: PieChart,
    },
    {
      label: '일정',
      href: '/calendar',
      icon: Calendar,
    },
    {
      label: '설정',
      href: '/settings',
      icon: Settings,
    },
  ];

  // 하위 경로도 포함하여 활성 상태를 확인하는 함수
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      // 대시보드는 정확히 일치하거나 루트 경로일 때만 활성
      return location.pathname === href || location.pathname === '/';
    }
    // 다른 메뉴들은 해당 경로로 시작하면 활성
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href: string, label: string) => {
    // 네비게이션 클릭 이벤트 추적
    InsuranceAgentEvents.navigationClick(`Mobile-${label}`, location.pathname);
  };

  return (
    <nav
      className={cn(
        // 모바일에서만 표시 (md breakpoint 미만)
        'block md:hidden',
        // 하단 고정 위치
        'fixed bottom-0 left-0 right-0 z-50',
        // 배경 및 테두리
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        'border-t border-border',
        // 안전 영역 고려 (iPhone 등)
        'pb-safe-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map(item => {
          const isActive = isActiveRoute(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => handleNavigation(item.href, item.label)}
              className={cn(
                // 터치 친화적 크기 (최소 44px)
                'flex flex-col items-center justify-center',
                'min-h-[60px] min-w-[60px] px-2 py-2',
                // 터치 타겟 확장
                'relative',
                // 전환 효과
                'transition-colors duration-200',
                // 활성/비활성 상태
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* 활성 상태 표시 */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}

              {/* 아이콘 */}
              <IconComponent
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />

              {/* 라벨 */}
              <span
                className={cn(
                  'text-xs font-medium leading-none',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
