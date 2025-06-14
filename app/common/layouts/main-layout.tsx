import React from 'react';
import { useState, useEffect } from 'react';
import {
  AdaptiveNavigation,
  NavigationContainer,
} from '~/common/components/navigation/adaptive-navigation';
import { MobileSidebarContent } from '~/common/components/navigation/flexible-sidebar';
import { Header } from '~/common/components/navigation/header';
import { Sheet, SheetContent } from '~/common/components/ui/sheet';
import { Button } from '~/common/components/ui/button';
import { MobileOnly } from '~/common/components/ui/responsive-layout';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null;
}

export function MainLayout({
  children,
  title,
  currentUser: propsCurrentUser,
}: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 🎯 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);

        // props로 전달된 currentUser가 있으면 우선 사용
        if (propsCurrentUser) {
          setCurrentUser({
            id: propsCurrentUser.id,
            email: propsCurrentUser.email,
            name: propsCurrentUser.name || propsCurrentUser.email.split('@')[0],
          });
          setIsLoadingUser(false);
          return;
        }

        // 없으면 API로 직접 가져오기
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();

          // 에러 응답인지 확인
          if (userData.error) {
            throw new Error(userData.error);
          }

          setCurrentUser({
            id: userData.id,
            email: userData.email,
            name:
              userData.name ||
              userData.fullName ||
              userData.email?.split('@')[0] ||
              '사용자',
          });
        } else {
          // 인증 실패 시 기본값 설정
          setCurrentUser({
            id: 'unknown',
            email: 'user@example.com',
            name: '사용자',
          });
        }
      } catch (error) {
        console.warn('사용자 정보 로드 실패:', error);
        setCurrentUser({
          id: 'unknown',
          email: 'user@example.com',
          name: '사용자',
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [propsCurrentUser]);

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
    <div className="fixed inset-0 bg-background flex overflow-hidden">
      {/* AdaptiveNavigation 시스템 */}
      <NavigationContainer className="border-r border-border bg-muted/30">
        <AdaptiveNavigation />
      </NavigationContainer>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-50">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 모바일 메뉴 버튼 - md breakpoint 미만에서만 표시 */}
              <MobileOnly>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="메뉴 열기"
                  className="min-h-[44px] min-w-[44px]" // 터치 친화적 크기
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </MobileOnly>

              {title && (
                <h1 className="font-semibold text-foreground text-sm md:text-base">
                  {title}
                </h1>
              )}
            </div>

            <Header currentUser={currentUser} isLoadingUser={isLoadingUser} />
          </div>
        </header>

        {/* 페이지 컨텐츠 - 스크롤 가능한 영역 */}
        <main
          className={`flex-1 ${
            title === '소개 네트워크'
              ? 'overflow-hidden p-0'
              : 'overflow-y-auto p-3 md:p-4 lg:p-6'
          } ${
            // 모바일에서 하단 탭 네비게이션을 위한 여백 추가
            'pb-20 md:pb-3'
          }`}
          style={
            title === '소개 네트워크'
              ? {
                  height: 'calc(100vh - 4rem)',
                  maxHeight: 'calc(100vh - 4rem)',
                  overflow: 'hidden',
                }
              : {}
          }
        >
          {children}
        </main>
      </div>

      {/* 모바일 사이드바 Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebarContent onClose={closeMobileMenu} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
