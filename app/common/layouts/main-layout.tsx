import React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '~/common/components/navigation/sidebar';
import { Header } from '~/common/components/navigation/header';
import {
  MobileNav,
  MobileNavButton,
} from '~/common/components/navigation/mobile-nav';
import { BottomTabNavigation } from '~/common/components/navigation/bottom-tab-navigation';
import { useViewport } from '~/common/hooks/useViewport';
import { useFullScreenMode } from '~/common/hooks/use-viewport-height';
import { BottomNavVisualizer } from '~/common/components/debug/bottom-nav-visualizer';
import { useSubscription } from '~/lib/contexts/subscription-context';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentUser?: {
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null;
  initialSubscriptionStatus?: {
    needsPayment: boolean;
    isTrialActive: boolean;
    daysRemaining: number;
  } | null;
}

export function MainLayout({
  children,
  title,
  currentUser: propsCurrentUser,
  initialSubscriptionStatus,
}: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile } = useViewport();

  // 🚀 iPhone Safari 전체 화면 모드
  const fullScreen = useFullScreenMode();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 🎯 구독 상태 관리 - Context 사용
  const { subscriptionStatus, setSubscriptionStatus, fetchSubscriptionStatus } =
    useSubscription();

  // 🎯 초기 렌더링 완료 처리 - Hydration 안전하게 처리
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // 🎯 Hydration 완료 처리
  useEffect(() => {
    setIsHydrated(true);

    // localStorage 확인은 hydration 후에만
    const isLayoutInitialized = localStorage.getItem('layout-initialized');

    if (isLayoutInitialized) {
      // 이미 초기화된 경우 즉시 렌더링
      setIsInitialRender(false);
    } else {
      // 첫 방문인 경우 부드러운 전환
      const timer = requestAnimationFrame(() => {
        setIsInitialRender(false);
        localStorage.setItem('layout-initialized', 'true');
      });
      return () => cancelAnimationFrame(timer);
    }
  }, []);

  // 🎯 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoadingUser(true);

        // props로 전달된 currentUser가 있으면 우선 사용
        if (propsCurrentUser) {
          setCurrentUser({
            id: propsCurrentUser.id,
            email: propsCurrentUser.email,
            name: propsCurrentUser.name || propsCurrentUser.email.split('@')[0],
          });
        } else {
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

    fetchUser();
  }, [propsCurrentUser]);

  // 🎯 구독 상태 확인 (currentUser가 설정된 후)
  useEffect(() => {
    // 초기 구독 상태가 있으면 Context에 설정
    if (initialSubscriptionStatus && subscriptionStatus === null) {
      console.log(
        '⏭️ MainLayout: 초기 구독 상태 설정',
        initialSubscriptionStatus
      );
      setSubscriptionStatus(initialSubscriptionStatus);
      return;
    }

    // Context에서 구독 상태 확인
    if (currentUser?.id && currentUser.id !== 'unknown') {
      fetchSubscriptionStatus(currentUser);
    }
  }, [
    currentUser,
    initialSubscriptionStatus,
    subscriptionStatus,
    setSubscriptionStatus,
    fetchSubscriptionStatus,
  ]);

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
      // 💡 MobileNav가 자체적으로 body scroll lock을 관리하므로 여기서는 제거
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 💡 body overflow 제어는 MobileNav에서 담당
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // 🚫 체험 기간 종료 시 사이드바 숨김
  // Context에서 관리되는 구독 상태를 사용하여 페이지 이동 시에도 깜빡이지 않음
  const shouldShowSidebar = React.useMemo(() => {
    // Hydration 전에는 항상 표시
    if (!isHydrated) return true;

    // 초기 구독 상태가 있는 경우 (billing 페이지 등) - 우선 순위 높음
    if (initialSubscriptionStatus) {
      return !initialSubscriptionStatus.needsPayment;
    }

    // Context에서 관리되는 구독 상태 확인
    if (subscriptionStatus !== null) {
      return !subscriptionStatus.needsPayment;
    }

    // 구독 상태가 아직 로드되지 않은 경우 표시 (기본값 - 깜빡임 방지)
    // 한 번 로드된 구독 상태는 Context에서 유지되므로 페이지 이동 시에도 유지됨
    return true;
  }, [isHydrated, subscriptionStatus, initialSubscriptionStatus]);

  return (
    <div
      className={`fixed inset-0 bg-background flex overflow-hidden ${fullScreen.className}`}
      style={fullScreen.style}
    >
      {/* 🎯 데스크톱 사이드바 - Hydration 완료 후 표시 (플래시 방지) + 구독 상태 체크 */}
      {isHydrated && !isInitialRender && !isMobile && shouldShowSidebar && (
        <div className="w-64 border-r border-border bg-muted/30 flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 - 고정됨 */}
        <header
          className={`h-16 border-b border-border flex-shrink-0 fixed top-0 left-0 right-0 ${
            isHydrated && !isInitialRender && !isMobile && shouldShowSidebar
              ? 'sm:left-64'
              : ''
          } ${
            isMobileMenuOpen
              ? 'bg-background/70 backdrop-blur-md z-30' // 🎯 사이드바 열렸을 때: backdrop(z-40) 뒤에 위치
              : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50' // 🎯 기본 상태: 높은 z-index
          }`}
        >
          <div className="h-full px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🎯 모바일 메뉴 버튼 - Hydration 완료 후 표시 + 구독 상태 체크 */}
              {isHydrated &&
                !isInitialRender &&
                isMobile &&
                shouldShowSidebar && (
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
            isHydrated && !isInitialRender && isMobile && shouldShowSidebar
              ? 'pb-bottom-nav'
              : 'pb-4'
          } overflow-y-auto p-3 lg:p-4`}
        >
          {children}
        </main>
      </div>

      {/* 🎯 새로운 모바일 네비게이션 - AnimatePresence로 래핑 + 구독 상태 체크 */}
      {isHydrated && !isInitialRender && shouldShowSidebar && (
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <MobileNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
          )}
        </AnimatePresence>
      )}

      {/* 🎯 Bottom Tab Navigation (모바일에서만 표시) - 새로운 API로 업데이트 + 구독 상태 체크 */}
      {isHydrated && !isInitialRender && isMobile && shouldShowSidebar && (
        <BottomTabNavigation isMenuOpen={isMobileMenuOpen} />
      )}

      {/* 🔧 하단 네비게이션 디버깅 시각화 (개발 환경 전용) */}
      <BottomNavVisualizer enabled={false} />
    </div>
  );
}
