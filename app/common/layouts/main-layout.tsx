import React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from '~/common/components/navigation/sidebar';
import { Header } from '~/common/components/navigation/header';
import { MobileNav, MobileNavButton } from '~/common/components/navigation/mobile-nav';
import { BottomTabNavigation } from '~/common/components/navigation/bottom-tab-navigation';
import { useViewport } from '~/common/hooks/useViewport';

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
  const [isInitialRender, setIsInitialRender] = useState(true);
  const { isMobile } = useViewport();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 🎯 초기 렌더링 완료 처리 (사이드바 플래시 방지)
  useEffect(() => {
    // 즉시 실행하되, 레이아웃 계산이 완료된 후에 실행
    const timer = requestAnimationFrame(() => {
      setIsInitialRender(false);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

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

  // 모바일 메뉴 닫기 핸들러 개선
  const closeMobileMenu = React.useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // 모바일 메뉴 열기 핸들러
  const openMobileMenu = React.useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  // 모바일 메뉴 토글 핸들러
  const toggleMobileMenu = React.useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // ESC 키로 모바일 메뉴 닫기 (개선된 버전)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        event.preventDefault();
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 모바일 메뉴가 열려있을 때 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 메뉴가 닫혔을 때 배경 스크롤 복원
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <div className="fixed inset-0 bg-background flex overflow-hidden">
      {/* 🎯 데스크톱 사이드바 - 초기 렌더링 완료 후에만 표시 (플래시 방지) */}
      {!isInitialRender && !isMobile && (
        <div className="w-64 border-r border-border bg-muted/30 flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 - 고정됨 */}
        <header className={`h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-50 fixed top-0 left-0 right-0 ${!isInitialRender && !isMobile ? 'lg:left-64' : ''}`}>
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🎯 모바일 메뉴 버튼 - 초기 렌더링 완료 후에만 표시 */}
              {!isInitialRender && isMobile && (
                <MobileNavButton
                  onClick={openMobileMenu}
                  isOpen={isMobileMenuOpen}
                />
              )}
              {title && (
                <h1 className="font-semibold text-foreground">{title}</h1>
              )}
            </div>

            <Header currentUser={currentUser} isLoadingUser={isLoadingUser} />
          </div>
        </header>

        {/* 페이지 컨텐츠 - 바텀 네비게이션과 헤더를 고려한 스크롤 가능한 영역 */}
        <main
          className={`flex-1 mt-16 ${
            !isInitialRender && isMobile ? 'pb-40' : 'pb-4'
          } ${
            title === '소개 네트워크'
              ? 'overflow-hidden p-0'
              : 'overflow-y-auto p-3 lg:p-4'
          }`}
          style={
            title === '소개 네트워크'
              ? {
                  height: !isInitialRender && isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 4rem)', // 헤더(4rem) + 바텀네비(10rem - 플로팅 여백 포함)
                  maxHeight: !isInitialRender && isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 4rem)',
                  overflow: 'hidden',
                }
              : {}
          }
        >
          {children}
        </main>
      </div>

      {/* 🎯 새로운 모바일 네비게이션 - 초기 렌더링 완료 후에만 표시 */}
      {!isInitialRender && (
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}

      {/* 🎯 Bottom Tab Navigation (모바일에서만 표시) - 새로운 API로 업데이트 */}
      {!isInitialRender && isMobile && (
        <BottomTabNavigation
          isMenuOpen={isMobileMenuOpen}
        />
      )}
    </div>
  );
}
