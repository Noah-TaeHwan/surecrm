import React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from '~/common/components/navigation/sidebar';
import { Header } from '~/common/components/navigation/header';
import { Sheet, SheetContent } from '~/common/components/ui/sheet';
import { Button } from '~/common/components/ui/button';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title = '대시보드' }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 반응형 처리를 위한 윈도우 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // 초기 체크
    checkScreenSize();

    // 리사이즈 이벤트에 대응
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 모바일 메뉴가 열려있을 때 외부 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-background">
      {/* 데스크톱 사이드바 - lg 이상에서만 표시 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* 모바일 사이드바 - lg 미만에서 시트로 표시 */}
      <Sheet
        open={isMobileMenuOpen && isMobile}
        onOpenChange={setIsMobileMenuOpen}
      >
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onClose={closeMobileMenu} />
        </SheetContent>
      </Sheet>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <Header
          title={title}
          showMenuButton={isMobile}
          onMenuButtonClick={() => setIsMobileMenuOpen(true)}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
