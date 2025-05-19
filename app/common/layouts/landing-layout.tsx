import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';

interface LandingLayoutProps {
  children: React.ReactNode;
  showCTA?: boolean;
}

export function LandingLayout({
  children,
  showCTA = true,
}: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SureCRM</h1>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link to="/invite-only">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 px-8 border-t">
        <div className="container mx-auto text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
