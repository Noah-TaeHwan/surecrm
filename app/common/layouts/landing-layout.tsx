import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent } from '~/common/components/ui/sheet';

interface LandingLayoutProps {
  children: React.ReactNode;
  showCTA?: boolean;
}

export function LandingLayout({
  children,
  showCTA = true,
}: LandingLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 md:py-6 px-4 md:px-8 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-200">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            <Link to="/">SureCRM</Link>
          </h1>

          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex md:space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link to="/invite-only">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-64">
          <nav className="flex flex-col space-y-4 mt-8">
            <Button variant="ghost" asChild className="justify-start">
              <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                로그인
              </Link>
            </Button>
            <Button asChild className="justify-start">
              <Link
                to="/invite-only"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                시작하기
              </Link>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* 헤더 높이만큼 여백 추가 */}
      <div className="h-[72px] md:h-[88px]"></div>

      <main className="flex-1">{children}</main>

      <footer className="py-6 md:py-8 px-4 md:px-8 border-t">
        <div className="container mx-auto text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
