import { Link } from 'react-router';
import { Card } from '~/common/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  showLogo?: boolean;
}

export function AuthLayout({
  children,
  title = 'SureCRM',
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        {showLogo && (
          <div className="text-center">
            <Link to="/" className="inline-block">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h1>
            </Link>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-4 sm:px-0">
              보험 영업의 소개 네트워크와 영업 파이프라인 관리
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          {children}
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </div>
    </div>
  );
}
