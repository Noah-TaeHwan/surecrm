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
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
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
    // MVP: 핵심 소개자 기능 비활성화
    // {
    //   label: '핵심 소개자',
    //   href: '/influencers',
    //   icon: <Sparkles className="h-5 w-5" />,
    // },
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
    // 👥 나의 팀 - 팀 관련 기능 개발 후 활성화 예정
    // {
    //   label: '나의 팀',
    //   href: '/team',
    //   icon: <UserPlus className="h-5 w-5" />,
    // },
    // 🗓️ 일정 관리 - 구글 캘린더 연동 활성화
    {
      label: '일정 관리',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
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
    // MVP: 구독 관리 기능 - 추후 결제 시스템 연동 후 활성화 예정
    // {
    //   label: '구독 관리',
    //   href: '/billing/subscribe',
    //   icon: <CreditCard className="h-5 w-5" />,
    // },
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
      className={cn(
        'flex flex-col h-full bg-background w-full',
        // 데스크톱에서는 기존 스타일 유지
        'md:h-screen md:bg-sidebar md:border-r md:border-sidebar-border md:w-64',
        className
      )}
    >
      {/* 데스크톱에서만 로고 헤더 표시 */}
      <div className="hidden md:block p-4 border-b border-sidebar-border">
        <Link
          to="/dashboard"
          onClick={() => handleNavigation('/dashboard', 'SureCRM 로고')}
          className="text-xl font-bold text-sidebar-foreground flex justify-center cursor-pointer hover:text-sidebar-primary transition-colors"
        >
          SureCRM
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
        <nav>
          <ul className="space-y-2">
            {navItems.map(item => {
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
                      // 모바일과 데스크톱 스타일 분리
                      isActive
                        ? 'bg-accent text-accent-foreground md:bg-sidebar-accent md:text-sidebar-accent-foreground'
                        : 'text-foreground hover:text-foreground hover:bg-accent/50 md:text-sidebar-foreground md:hover:text-sidebar-foreground md:hover:bg-sidebar-accent/50'
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

      <Separator className="bg-border md:bg-sidebar-border" />

      <div className="p-4 text-center">
        <VersionDisplay />
      </div>
    </div>
  );
}
