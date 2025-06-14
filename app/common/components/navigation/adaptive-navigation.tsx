import React, { useState } from 'react';
import { cn } from '~/lib/utils';
import { useDeviceDetection } from '~/hooks/use-device-detection';

// 기존 컴포넌트들 import
import { Sidebar } from './sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { CollapsibleSidebar } from './flexible-sidebar';

interface AdaptiveNavigationProps {
  className?: string;
}

/**
 * 적응형 네비게이션 시스템
 *
 * 디바이스별 네비게이션 전략:
 * - 모바일 (< 768px): 하단 탭 네비게이션
 * - 태블릿 (768px - 1024px): 접이식 사이드바
 * - 데스크톱 (>= 1024px): 고정 사이드바
 *
 * @param props AdaptiveNavigationProps
 * @returns 디바이스에 적합한 네비게이션 컴포넌트
 */
export function AdaptiveNavigation({ className }: AdaptiveNavigationProps) {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();

  // 태블릿용 사이드바 접힘 상태
  const [isTabletSidebarCollapsed, setIsTabletSidebarCollapsed] =
    useState(false);

  const handleTabletSidebarToggle = () => {
    setIsTabletSidebarCollapsed(prev => !prev);
  };

  // 모바일인 경우 하단 탭 네비게이션만 렌더링
  if (isMobile) {
    return (
      <div className={cn('mobile-navigation', className)}>
        <MobileBottomNav />
      </div>
    );
  }

  // 태블릿인 경우 접이식 사이드바
  if (isTablet) {
    return (
      <div className={cn('tablet-navigation', className)}>
        <CollapsibleSidebar
          isCollapsed={isTabletSidebarCollapsed}
          onToggle={handleTabletSidebarToggle}
          className="transition-all duration-300 ease-in-out"
        />
      </div>
    );
  }

  // 데스크톱인 경우 고정 사이드바
  if (isDesktop) {
    return (
      <div className={cn('desktop-navigation w-64 flex-shrink-0', className)}>
        <Sidebar />
      </div>
    );
  }

  // 폴백: 기본 사이드바
  return (
    <div className={cn('fallback-navigation w-64 flex-shrink-0', className)}>
      <Sidebar />
    </div>
  );
}

/**
 * 네비게이션 컨테이너 컴포넌트
 * 레이아웃에서 네비게이션 영역을 감싸는 래퍼
 */
export function NavigationContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { deviceType } = useDeviceDetection();

  return (
    <div
      className={cn(
        'navigation-container',
        // 디바이스별 컨테이너 스타일
        {
          'mobile-nav-container': deviceType === 'mobile',
          'tablet-nav-container': deviceType === 'tablet',
          'desktop-nav-container': deviceType === 'desktop',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 디바이스 감지 정보를 표시하는 개발용 컴포넌트
 * 개발 환경에서만 사용 (프로덕션에서는 제거)
 */
export function DeviceDebugInfo() {
  const deviceState = useDeviceDetection();

  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'surecrm-sigma.vercel.app'
  ) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Device: {deviceState.deviceType}</div>
      <div>
        Size: {deviceState.screenWidth}x{deviceState.screenHeight}
      </div>
      <div>Orientation: {deviceState.orientation}</div>
      <div>Touch: {deviceState.isTouch ? 'Yes' : 'No'}</div>
    </div>
  );
}

/**
 * 네비게이션 관련 유틸리티 함수들
 */
export const navigationUtils = {
  /**
   * 현재 디바이스에서 사용 중인 네비게이션 타입 반환
   */
  getCurrentNavigationType(
    deviceType: 'mobile' | 'tablet' | 'desktop'
  ): string {
    switch (deviceType) {
      case 'mobile':
        return 'bottom-tab';
      case 'tablet':
        return 'collapsible-sidebar';
      case 'desktop':
        return 'fixed-sidebar';
      default:
        return 'unknown';
    }
  },

  /**
   * 네비게이션 전환 애니메이션 클래스
   */
  getTransitionClasses(): string {
    return 'transition-all duration-300 ease-in-out';
  },

  /**
   * 터치 친화적 크기 확인
   */
  isTouchFriendlySize(width: number, height: number): boolean {
    // 최소 44px x 44px (Apple HIG 기준)
    return width >= 44 && height >= 44;
  },
} as const;
