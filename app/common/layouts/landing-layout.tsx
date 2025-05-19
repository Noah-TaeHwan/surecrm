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
      <header className="py-4 md:py-6 px-4 md:px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">SureCRM</h1>

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
              <Link to="/login">로그인</Link>
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
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
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

      <main className="flex-1">{children}</main>

      <footer className="py-6 md:py-8 px-4 md:px-8 border-t">
        <div className="container mx-auto text-center text-xs text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
