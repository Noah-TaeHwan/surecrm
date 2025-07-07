import { Outlet, NavLink } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { requireAdmin } from '~/lib/auth/guards.server';
import { Home, Users, Settings } from 'lucide-react';
import { cn } from '~/lib/utils';

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
      'flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700',
      isActive && 'bg-gray-200 dark:bg-gray-700'
    );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 font-sans">
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Admin Panel
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-2">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
