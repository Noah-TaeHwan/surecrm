import { Outlet, NavLink, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { requireAdmin } from '~/lib/auth/guards.server';
import {
  Home,
  Users,
  Settings,
  Bell,
  UserCircle,
  UserPlus,
  MessageSquare,
  Megaphone,
  HelpCircle,
  CreditCard,
  Activity,
  FileText,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Toaster } from '~/common/components/ui/sonner';
import { Button } from '~/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/common/components/ui/collapsible';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);

  return { user };
}

export default function AdminLayout() {
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center px-4 py-3 text-gray-400 rounded-lg hover:bg-zinc-700/50 hover:text-white transition-all duration-200 group',
      isActive && 'bg-zinc-700 text-white shadow-sm'
    );

  const sectionTitleClasses =
    'px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider';

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800">
          <Link
            to="/admin"
            className="text-white font-bold text-xl tracking-tight hover:text-gray-200 transition-colors"
          >
            SureCRM
            <span className="text-sm font-normal text-gray-400 ml-2">
              Admin
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <NavLink to="/admin" className={navLinkClasses} end>
              <Home className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
              대시보드
            </NavLink>

            {/* 사용자 관리 섹션 */}
            <div className="pt-6">
              <h3 className={sectionTitleClasses}>사용자 관리</h3>
              <div className="space-y-1">
                <NavLink to="/admin/users" className={navLinkClasses}>
                  <Users className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                  회원 관리
                </NavLink>
                <NavLink to="/admin/waitlist" className={navLinkClasses}>
                  <UserPlus className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                  대기자 명단
                </NavLink>
              </div>
            </div>

            {/* 콘텐츠 관리 섹션 */}
            <div className="pt-6">
              <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
                <CollapsibleTrigger className="w-full group">
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <h3 className={cn(sectionTitleClasses, 'mb-0')}>
                      콘텐츠 관리
                    </h3>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-500 transition-all duration-200 group-hover:text-gray-300',
                        isContentOpen && 'transform rotate-180'
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  <NavLink to="/admin/contacts" className={navLinkClasses}>
                    <MessageSquare className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    문의사항
                  </NavLink>
                  <NavLink to="/admin/announcements" className={navLinkClasses}>
                    <Megaphone className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    공지사항
                  </NavLink>
                  <NavLink to="/admin/faqs" className={navLinkClasses}>
                    <HelpCircle className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    FAQ 관리
                  </NavLink>
                  <NavLink to="/admin/testimonials" className={navLinkClasses}>
                    <FileText className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    고객 후기
                  </NavLink>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* 시스템 관리 섹션 */}
            <div className="pt-6">
              <Collapsible open={isSystemOpen} onOpenChange={setIsSystemOpen}>
                <CollapsibleTrigger className="w-full group">
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <h3 className={cn(sectionTitleClasses, 'mb-0')}>
                      시스템 관리
                    </h3>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-gray-500 transition-all duration-200 group-hover:text-gray-300',
                        isSystemOpen && 'transform rotate-180'
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  <NavLink to="/admin/billing" className={navLinkClasses}>
                    <CreditCard className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    결제 관리
                  </NavLink>
                  <NavLink to="/admin/activity" className={navLinkClasses}>
                    <Activity className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    활동 로그
                  </NavLink>
                  <NavLink to="/admin/settings" className={navLinkClasses}>
                    <Settings className="h-5 w-5 mr-3 group-hover:scale-105 transition-transform" />
                    시스템 설정
                  </NavLink>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                >
                  <UserCircle className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@surecrm.pro
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
