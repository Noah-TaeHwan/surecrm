import { Link } from 'react-router';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { cn } from '~/lib/utils';

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = '대시보드', className }: HeaderProps) {
  return (
    <header
      className={cn(
        'h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between',
        className
      )}
    >
      {/* 페이지 제목 */}
      <h1 className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {title}
      </h1>

      {/* 헤더 우측 요소들 */}
      <div className="flex items-center space-x-4">
        {/* 알림 아이콘 */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="sr-only">알림</span>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 사용자 프로필 드롭다운 (간소화됨) */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center space-x-2 p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="sr-only">프로필 메뉴</span>
            <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
          </button>

          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 invisible group-hover:visible z-10">
            <div className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800">
              <div>홍길동</div>
              <div className="font-medium truncate">user@example.com</div>
            </div>

            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
            >
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                프로필
              </div>
            </Link>

            <Link
              to="/settings"
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
            >
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                설정
              </div>
            </Link>

            <button
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
              onClick={() => console.log('로그아웃')}
            >
              <div className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
