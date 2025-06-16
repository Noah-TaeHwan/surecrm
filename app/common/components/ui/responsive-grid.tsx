import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveGridBreakpoint {
  cols?: number;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minItemWidth?: string;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;

  // 기본 그리드 설정
  cols?: number;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minItemWidth?: string;

  // 반응형 브레이크포인트별 설정
  sm?: ResponsiveGridBreakpoint;
  md?: ResponsiveGridBreakpoint;
  lg?: ResponsiveGridBreakpoint;
  xl?: ResponsiveGridBreakpoint;
  '2xl'?: ResponsiveGridBreakpoint;

  // 접근성 및 의미론적 HTML
  as?: React.ElementType;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  role?: string;

  // 그리드 정렬 옵션
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';

  // 자동 레이아웃 옵션
  autoFit?: boolean; // auto-fit 사용 여부
  autoFill?: boolean; // auto-fill 사용 여부
}

/**
 * ResponsiveGrid - 반응형 그리드 컴포넌트
 *
 * CSS Grid를 사용하여 다양한 화면 크기에서 자동으로 조정되는
 * 그리드 레이아웃을 제공합니다.
 */
export const ResponsiveGrid = React.forwardRef<
  HTMLElement,
  ResponsiveGridProps
>(
  (
    {
      children,
      className,
      cols = 1,
      gap = 'md',
      minItemWidth,
      sm,
      md,
      lg,
      xl,
      '2xl': xl2,
      as: Component = 'div',
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role,
      alignItems = 'stretch',
      justifyItems = 'stretch',
      autoFit = false,
      autoFill = false,
      ...props
    },
    ref
  ) => {
    // 간격별 클래스 매핑
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    // 정렬 클래스 매핑
    const alignItemsClasses = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      stretch: 'items-stretch',
    };

    const justifyItemsClasses = {
      start: 'justify-items-start',
      end: 'justify-items-end',
      center: 'justify-items-center',
      stretch: 'justify-items-stretch',
    };

    // 기본 그리드 컬럼 스타일 생성
    const getGridTemplateColumns = (
      colCount: number,
      minWidth?: string,
      useAutoFit?: boolean,
      useAutoFill?: boolean
    ) => {
      if (minWidth && (useAutoFit || useAutoFill)) {
        const repeatType = useAutoFit ? 'auto-fit' : 'auto-fill';
        return {
          gridTemplateColumns: `repeat(${repeatType}, minmax(${minWidth}, 1fr))`,
        };
      }
      return { gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` };
    };

    // 접근성 속성
    const accessibilityProps = {
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role: role || (ariaLabel || ariaLabelledBy ? 'grid' : undefined),
    };

    // 고급 그리드 스타일 (minItemWidth, autoFit, autoFill이 사용된 경우)
    const advancedGridStyle: React.CSSProperties | undefined =
      minItemWidth || autoFit || autoFill
        ? getGridTemplateColumns(cols, minItemWidth, autoFit, autoFill)
        : undefined;

    // 반응형 컬럼 클래스 생성 (Tailwind 기반)
    const getResponsiveColumnClasses = () => {
      const classes = [];

      // SM 브레이크포인트
      if (sm?.cols) {
        classes.push(`sm:grid-cols-${sm.cols}`);
      }

      // MD 브레이크포인트
      if (md?.cols) {
        classes.push(`md:grid-cols-${md.cols}`);
      }

      // LG 브레이크포인트
      if (lg?.cols) {
        classes.push(`lg:grid-cols-${lg.cols}`);
      }

      // XL 브레이크포인트
      if (xl?.cols) {
        classes.push(`xl:grid-cols-${xl.cols}`);
      }

      // 2XL 브레이크포인트
      if (xl2?.cols) {
        classes.push(`2xl:grid-cols-${xl2.cols}`);
      }

      return classes;
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'grid',
          `grid-cols-${cols}`, // 기본 컬럼 수
          gapClasses[gap],
          alignItemsClasses[alignItems],
          justifyItemsClasses[justifyItems],
          ...getResponsiveColumnClasses(),
          // 반응형 간격 클래스
          sm?.gap && `sm:${gapClasses[sm.gap]}`,
          md?.gap && `md:${gapClasses[md.gap]}`,
          lg?.gap && `lg:${gapClasses[lg.gap]}`,
          xl?.gap && `xl:${gapClasses[xl.gap]}`,
          xl2?.gap && `2xl:${gapClasses[xl2.gap]}`,
          className
        )}
        style={advancedGridStyle}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

export default ResponsiveGrid;
