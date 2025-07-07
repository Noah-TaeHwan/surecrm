import { Outlet, NavLink, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { requireAdmin } from '~/lib/auth/guards.server';
import { Home, Users, Settings, Bell, UserCircle } from 'lucide-react';
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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { user } = await requireAdmin(request);
    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // requireAdmin에서 던진 리디렉션 응답을 그대로 반환
    throw error;
  }
}

export default function AdminLayout() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center px-3 py-2 text-gray-400 rounded-md hover:bg-zinc-700 hover:text-white',
      isActive && 'bg-zinc-700 text-white'
    );

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-zinc-900 text-white">
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <Link
            to="/admin"
            className="text-white font-bold text-xl tracking-tight"
          >
            SureCRM / Admin
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <NavLink to="/admin" className={navLinkClasses} end>
              <Home className="h-5 w-5 mr-3" />
              대시보드
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClasses}>
              <Users className="h-5 w-5 mr-3" />
              사용자 관리
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClasses}>
              <Settings className="h-5 w-5 mr-3" />
              시스템 설정
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-end items-center p-4 bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
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
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-950 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
