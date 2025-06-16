import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '~/lib/utils';

// 컴포넌트 imports
import { Sidebar } from './sidebar';
import { MobileNav, MobileNavButton, BottomNav } from './mobile-nav';
import { useViewport } from '~/common/hooks/useViewport';

/**
 * 반응형 네비게이션 래퍼의 핵심 타입 정의
 */
export interface ResponsiveNavWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** 네비게이션 상태 변경 시 콜백 */
  onNavigationStateChange?: (state: NavigationState) => void;
  /** 커스텀 브레이크포인트 설정 */
  breakpoints?: Breakpoints;
  /** 네비게이션 모드 강제 설정 (테스트용) */
  forceMode?: NavigationMode;
}

/**
 * 네비게이션 모드 정의
 */
export type NavigationMode = 'desktop' | 'tablet' | 'mobile';

/**
 * 네비게이션 상태 정의
 */
export interface NavigationState {
  mode: NavigationMode;
  isMobileNavOpen: boolean;
  isBottomNavVisible: boolean;
  isSidebarVisible: boolean;
}

/**
 * 브레이크포인트 타입 정의
 */
export interface Breakpoints {
  desktop: number;
  tablet: number;
}

/**
 * 기본 브레이크포인트 설정
 */
const DEFAULT_BREAKPOINTS: Breakpoints = {
  desktop: 1024, // lg 브레이크포인트
  tablet: 768, // md 브레이크포인트
};

/**
 * 네비게이션 모드 결정 로직
 */
function determineNavigationMode(
  width: number,
  breakpoints: Breakpoints
): NavigationMode {
  if (width >= breakpoints.desktop) {
    return 'desktop';
  } else if (width >= breakpoints.tablet) {
    return 'tablet';
  } else {
    return 'mobile';
  }
}

/**
 * 클라이언트 사이드 렌더링 감지 훅
 * SSR/SSG 환경에서 hydration mismatch 방지
 */
function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * 네비게이션 상태 관리 훅
 */
function useNavigationState(
  mode: NavigationMode,
  onStateChange?: (state: NavigationState) => void
) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // 네비게이션 상태 계산
  const navigationState = useMemo<NavigationState>(
    () => ({
      mode,
      isMobileNavOpen,
      isBottomNavVisible: mode === 'mobile',
      isSidebarVisible: mode === 'desktop',
    }),
    [mode, isMobileNavOpen]
  );

  // 상태 변경 콜백 실행
  useEffect(() => {
    onStateChange?.(navigationState);
  }, [navigationState, onStateChange]);

  // 모바일 네비게이션 제어 함수들
  const openMobileNav = useCallback(() => {
    setIsMobileNavOpen(true);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  // 모드 변경 시 모바일 네비게이션 자동 닫기
  useEffect(() => {
    if (mode !== 'mobile' && isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [mode, isMobileNavOpen]);

  return {
    navigationState,
    openMobileNav,
    closeMobileNav,
  };
}

/**
 * Skip Link 컴포넌트 - 접근성을 위한 콘텐츠 바로가기 링크
 */
const SkipLink = memo(function SkipLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:font-medium"
      onClick={e => {
        e.preventDefault();
        const target = document.querySelector(href) as HTMLElement;
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      {children}
    </a>
  );
});

/**
 * 메인 반응형 네비게이션 래퍼 컴포넌트
 *
 * 화면 크기에 따라 자동으로 네비게이션 모드를 전환:
 * - 데스크톱 (≥1024px): 고정 사이드바
 * - 태블릿 (768px-1023px): 햄버거 메뉴 + 모바일 네비게이션
 * - 모바일 (<768px): 햄버거 메뉴 + 하단 탭 네비게이션
 */
export const ResponsiveNavWrapper = memo(function ResponsiveNavWrapper({
  children,
  className,
  onNavigationStateChange,
  breakpoints = DEFAULT_BREAKPOINTS,
  forceMode,
}: ResponsiveNavWrapperProps) {
  const location = useLocation();
  const { width } = useViewport();
  const isClient = useIsClient();

  // 네비게이션 모드 결정
  const navigationMode = useMemo<NavigationMode>(() => {
    if (forceMode) return forceMode;
    if (!isClient) return 'desktop'; // SSR 시 기본값
    return determineNavigationMode(width, breakpoints);
  }, [isClient, width, breakpoints, forceMode]);

  // 네비게이션 상태 관리
  const { navigationState, openMobileNav, closeMobileNav } = useNavigationState(
    navigationMode,
    onNavigationStateChange
  );

  // 라우트 변경 시 모바일 네비게이션 닫기
  useEffect(() => {
    if (navigationState.isMobileNavOpen) {
      closeMobileNav();
    }
  }, [location.pathname, closeMobileNav, navigationState.isMobileNavOpen]);

  // SSR/SSG 중에는 기본 레이아웃만 렌더링
  if (!isClient) {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Skip Links */}
        <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
        <SkipLink href="#navigation">네비게이션으로 바로가기</SkipLink>

        <div className="flex h-screen">
          {/* SSR 시 기본 사이드바 렌더링 */}
          <Sidebar className="hidden lg:flex" />
          <main
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="메인 콘텐츠"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 데스크톱 모드 렌더링
  if (navigationState.mode === 'desktop') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Skip Links */}
        <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
        <SkipLink href="#navigation">네비게이션으로 바로가기</SkipLink>

        <div className="flex h-screen">
          {/* 고정 사이드바 */}
          <Sidebar
            id="navigation"
            role="navigation"
            aria-label="주요 네비게이션"
          />

          {/* 메인 컨텐츠 영역 */}
          <main
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="메인 콘텐츠"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 태블릿/모바일 모드 렌더링
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Skip Links */}
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      <SkipLink href="#mobile-nav-button">메뉴 버튼으로 바로가기</SkipLink>

      {/* 모바일 헤더 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4"
        role="banner"
        aria-label="페이지 헤더"
      >
        {/* 로고/브랜딩 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">SureCRM</h1>
        </div>

        {/* 햄버거 메뉴 버튼 */}
        <MobileNavButton
          id="mobile-nav-button"
          onClick={openMobileNav}
          isOpen={navigationState.isMobileNavOpen}
          ariaLabel={
            navigationState.isMobileNavOpen
              ? '네비게이션 메뉴 닫기'
              : '네비게이션 메뉴 열기'
          }
        />
      </motion.header>

      {/* 메인 컨텐츠 영역 */}
      <main
        id="main-content"
        className={cn(
          'mt-16', // 헤더 높이만큼 여백
          navigationState.isBottomNavVisible && 'pb-20' // 바텀 네비게이션 여백
        )}
        role="main"
        aria-label="메인 콘텐츠"
      >
        {children}
      </main>

      {/* 모바일 네비게이션 */}
      <AnimatePresence mode="wait">
        {navigationState.isMobileNavOpen && (
          <MobileNav
            isOpen={navigationState.isMobileNavOpen}
            onClose={closeMobileNav}
            ariaLabel="메인 네비게이션"
          />
        )}
      </AnimatePresence>

      {/* 하단 탭 네비게이션 (모바일에서만) */}
      {navigationState.isBottomNavVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <BottomNav />
        </motion.div>
      )}
    </div>
  );
});

/**
 * 네비게이션 상태 접근을 위한 Context (선택적 확장)
 */
export interface NavigationContextValue {
  state: NavigationState;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const NavigationContext =
  React.createContext<NavigationContextValue | null>(null);

/**
 * 네비게이션 상태에 접근하기 위한 훅
 */
export function useNavigation() {
  const context = React.useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

/**
 * Context Provider 래퍼 (고급 사용 사례용)
 */
export interface NavigationProviderProps extends ResponsiveNavWrapperProps {
  children: React.ReactNode;
}

export const NavigationProvider = memo(function NavigationProvider({
  children,
  ...props
}: NavigationProviderProps) {
  const { width } = useViewport();
  const isClient = useIsClient();

  const navigationMode = useMemo<NavigationMode>(() => {
    if (props.forceMode) return props.forceMode;
    if (!isClient) return 'desktop';
    return determineNavigationMode(
      width,
      props.breakpoints || DEFAULT_BREAKPOINTS
    );
  }, [isClient, width, props.breakpoints, props.forceMode]);

  const { navigationState, openMobileNav, closeMobileNav } = useNavigationState(
    navigationMode,
    props.onNavigationStateChange
  );

  const contextValue = useMemo<NavigationContextValue>(
    () => ({
      state: navigationState,
      openMobileNav,
      closeMobileNav,
    }),
    [navigationState, openMobileNav, closeMobileNav]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      <ResponsiveNavWrapper {...props}>{children}</ResponsiveNavWrapper>
    </NavigationContext.Provider>
  );
});

export default ResponsiveNavWrapper;
