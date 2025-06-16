import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  as?: React.ElementType;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  role?: string;
}

/**
 * ResponsiveContainer - 반응형 컨테이너 컴포넌트
 *
 * 화면 크기에 따라 자동으로 컨테이너 너비와 패딩을 조정합니다.
 * 접근성을 고려한 semantic HTML을 제공합니다.
 */
export const ResponsiveContainer = React.forwardRef<
  HTMLElement,
  ResponsiveContainerProps
>(
  (
    {
      children,
      className,
      size = 'lg',
      padding = 'md',
      center = false,
      as: Component = 'div',
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role,
      ...props
    },
    ref
  ) => {
    // 크기별 max-width 클래스 매핑
    const sizeClasses = {
      xs: 'max-w-xs', // 320px
      sm: 'max-w-sm', // 384px
      md: 'max-w-md', // 448px
      lg: 'max-w-4xl', // 896px
      xl: 'max-w-6xl', // 1152px
      '2xl': 'max-w-7xl', // 1280px
      full: 'max-w-full', // 100%
    };

    // 패딩별 클래스 매핑 (반응형)
    const paddingClasses = {
      none: '',
      xs: 'px-2 sm:px-3',
      sm: 'px-3 sm:px-4 md:px-6',
      md: 'px-4 sm:px-6 md:px-8 lg:px-12',
      lg: 'px-6 sm:px-8 md:px-12 lg:px-16',
      xl: 'px-8 sm:px-12 md:px-16 lg:px-20',
    };

    // 중앙 정렬 클래스
    const centerClass = center ? 'mx-auto' : '';

    // 접근성 속성
    const accessibilityProps = {
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role: role || (ariaLabel || ariaLabelledBy ? 'region' : undefined),
    };

    // 기본 레이아웃 클래스
    const baseClasses = 'w-full';

    return (
      <Component
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          paddingClasses[padding],
          centerClass,
          className
        )}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

export default ResponsiveContainer;
