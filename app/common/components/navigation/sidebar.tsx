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
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/common/components/ui/button';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { Separator } from '~/common/components/ui/separator';

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
      label: '미팅 일정',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: '초대장 관리',
      href: '/invitations',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      label: '설정',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64',
        className
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-sidebar-foreground"
        >
          SureCRM
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                    onClick={() => {
                      // 모바일 환경에서 네비게이션 항목 클릭 시 사이드바 닫기
                      if (onClose && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform',
                          isActive
                            ? 'rotate-90 text-sidebar-accent-foreground/70'
                            : 'text-sidebar-foreground/50'
                        )}
                      />
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      <div className="p-4 text-center">
        <p className="text-xs text-sidebar-foreground/60">버전 0.1.0</p>
      </div>
    </div>
  );
}
