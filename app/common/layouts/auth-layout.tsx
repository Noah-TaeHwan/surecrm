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
      <div className="w-full max-w-md space-y-8">
        {showLogo && (
          <div className="text-center">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h1>
            </Link>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              보험 영업의 소개 네트워크와 영업 파이프라인 관리
            </p>
          </div>
        )}

        {children}

        <div className="text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </div>
    </div>
  );
}
