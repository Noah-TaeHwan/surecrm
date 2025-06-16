import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Network,
  PieChart,
  Users,
  Calendar,
  Mail,
  Settings,
  ChevronRight,
  Sparkles,
  UserPlus,
  FileText,
  Bell,
  // CreditCard, // MVP: 구독 관리 기능 비활성화로 임시 제거
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Separator } from '~/common/components/ui/separator';
import { VersionDisplay } from '~/common/components/navigation/version-display';
import { InsuranceAgentEvents } from '~/lib/utils/analytics';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
  id?: string;
  role?: string;
  'aria-label'?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar({ className, onClose, id, role, 'aria-label': ariaLabel }: SidebarProps) {
  const location = useLocation();

  // 기본 네비게이션 아이템들 (모바일과 동일)
  const mainNavItems: NavItem[] = [
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
  ];

  // 추가 기능 메뉴들 (데스크톱에서만 표시)
  const additionalNavItems: NavItem[] = [
    {
      label: '초대장 관리',
      href: '/invitations',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      label: '알림',
      href: '/notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      label: '보고서',
      href: '/reports',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: '설정',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
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
    // 🎯 극한 분석: 네비게이션 클릭 이벤트 추적
    InsuranceAgentEvents.navigationClick(label, location.pathname);

    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border w-64',
        className
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link
          to="/dashboard"
          onClick={() => handleNavigation('/dashboard', 'SureCRM 로고')}
          className="text-xl font-bold text-sidebar-foreground flex justify-center cursor-pointer hover:text-sidebar-primary transition-colors"
        >
          SureCRM
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav>
          {/* 메인 네비게이션 */}
          <ul className="space-y-2 mb-6">
            {mainNavItems.map(item => {
              const isActive = isActiveRoute(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => handleNavigation(item.href, item.label)}
                    className={cn(
                      // Button 스타일을 직접 적용
                      'inline-flex items-center justify-start gap-3 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                      'w-full h-12 px-4 py-2',
                      // 활성/비활성 상태 스타일
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Separator className="bg-sidebar-border mb-4" />

          {/* 추가 기능 */}
          <ul className="space-y-2">
            {additionalNavItems.map(item => {
              const isActive = isActiveRoute(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => handleNavigation(item.href, item.label)}
                    className={cn(
                      // Button 스타일을 직접 적용
                      'inline-flex items-center justify-start gap-3 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                      'w-full h-12 px-4 py-2',
                      // 활성/비활성 상태 스타일
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="p-4 text-center">
        <VersionDisplay />
      </div>
    </div>
  );
}
