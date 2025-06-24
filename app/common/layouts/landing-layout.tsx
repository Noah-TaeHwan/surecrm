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
      <header className="py-3 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-200">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors">
              SureCRM
            </Link>
          </h1>

          {/* 시작하기 버튼만 표시 */}
          <Button
            asChild
            className="text-sm sm:text-base px-3 sm:px-4 lg:px-6 h-8 sm:h-9 lg:h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link to="/invite-only">시작하기</Link>
          </Button>
        </div>
      </header>

      {/* 헤더 높이만큼 여백 추가 - 반응형 */}
      <div className="h-[56px] sm:h-[64px] lg:h-[88px]"></div>

      <main className="flex-1">{children}</main>

      <footer className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="container mx-auto text-center text-xs sm:text-sm text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
