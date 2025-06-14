import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * 모바일 환경에서만 표시할 컨텐츠
   */
  mobileOnly?: React.ReactNode;
  /**
   * 데스크톱 환경에서만 표시할 컨텐츠
   */
  desktopOnly?: React.ReactNode;
  /**
   * 모바일에서 숨김 처리할지 여부
   */
  hideOnMobile?: boolean;
  /**
   * 데스크톱에서 숨김 처리할지 여부
   */
  hideOnDesktop?: boolean;
}

/**
 * Tailwind CSS 기반 반응형 레이아웃 컴포넌트
 * - md (768px) 기준으로 모바일/데스크톱 구분
 * - CSS-first 접근으로 하이드레이션 문제 방지
 * - 일관된 breakpoint 사용
 */
export function ResponsiveLayout({
  children,
  className,
  mobileOnly,
  desktopOnly,
  hideOnMobile = false,
  hideOnDesktop = false,
}: ResponsiveLayoutProps) {
  return (
    <div
      className={cn(
        // 기본 레이아웃
        'relative',
        // 모바일/데스크톱 표시/숨김 처리
        hideOnMobile && 'hidden md:block',
        hideOnDesktop && 'block md:hidden',
        className
      )}
    >
      {/* 메인 컨텐츠 */}
      {children}

      {/* 모바일 전용 컨텐츠 */}
      {mobileOnly && <div className="block md:hidden">{mobileOnly}</div>}

      {/* 데스크톱 전용 컨텐츠 */}
      {desktopOnly && <div className="hidden md:block">{desktopOnly}</div>}
    </div>
  );
}

/**
 * 모바일 전용 컴포넌트 래퍼
 * md breakpoint (768px) 미만에서만 표시
 */
export function MobileOnly({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('block md:hidden', className)}>{children}</div>;
}

/**
 * 데스크톱 전용 컴포넌트 래퍼
 * md breakpoint (768px) 이상에서만 표시
 */
export function DesktopOnly({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('hidden md:block', className)}>{children}</div>;
}

/**
 * 반응형 그리드 컴포넌트
 * 모바일에서 1열, 데스크톱에서 자동 조정
 */
export function ResponsiveGrid({
  children,
  className,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
}: {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}) {
  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

/**
 * 반응형 간격 유틸리티
 */
export const responsiveSpacing = {
  // 패딩
  padding: {
    sm: 'p-3 md:p-4 lg:p-6',
    md: 'p-4 md:p-6 lg:p-8',
    lg: 'p-6 md:p-8 lg:p-12',
  },
  // 마진
  margin: {
    sm: 'm-3 md:m-4 lg:m-6',
    md: 'm-4 md:m-6 lg:m-8',
    lg: 'm-6 md:m-8 lg:m-12',
  },
  // 갭
  gap: {
    sm: 'gap-3 md:gap-4 lg:gap-6',
    md: 'gap-4 md:gap-6 lg:gap-8',
    lg: 'gap-6 md:gap-8 lg:gap-12',
  },
} as const;

/**
 * 반응형 텍스트 크기 유틸리티
 */
export const responsiveText = {
  xs: 'text-xs md:text-sm',
  sm: 'text-sm md:text-base',
  base: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
  '2xl': 'text-2xl md:text-3xl',
  '3xl': 'text-3xl md:text-4xl',
} as const;
