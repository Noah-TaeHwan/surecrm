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

interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar({ className }: SidebarProps) {
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
      href: '/customers',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: '미팅 일정',
      href: '/meetings',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: '초대장 관리',
      href: '/invites',
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
        'w-64 h-full flex flex-col bg-white dark:bg-slate-900',
        className
      )}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          SureCRM
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                <ChevronRight
                  className={cn(
                    'ml-auto h-4 w-4 transition-transform',
                    location.pathname === item.href
                      ? 'rotate-90 text-slate-500'
                      : 'text-slate-400'
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">버전 0.1.0</p>
      </div>
    </div>
  );
}
