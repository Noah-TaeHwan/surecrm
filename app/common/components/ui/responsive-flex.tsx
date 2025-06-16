import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveFlexBreakpoint {
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline';
  justify?:
    | 'normal'
    | 'start'
    | 'end'
    | 'center'
    | 'between'
    | 'around'
    | 'evenly'
    | 'stretch';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;

  // 기본 flex 설정
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline';
  justify?:
    | 'normal'
    | 'start'
    | 'end'
    | 'center'
    | 'between'
    | 'around'
    | 'evenly'
    | 'stretch';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // flex-grow, flex-shrink, flex-basis 제어
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string | number;

  // 반응형 브레이크포인트별 설정
  sm?: ResponsiveFlexBreakpoint;
  md?: ResponsiveFlexBreakpoint;
  lg?: ResponsiveFlexBreakpoint;
  xl?: ResponsiveFlexBreakpoint;
  '2xl'?: ResponsiveFlexBreakpoint;

  // 레이아웃 옵션
  fullHeight?: boolean;
  fullWidth?: boolean;

  // 의미론적 HTML 지원
  as?: React.ElementType;

  // 접근성
  'aria-label'?: string;
  'aria-labelledby'?: string;
  role?: string;
}

const ResponsiveFlex = React.forwardRef<HTMLElement, ResponsiveFlexProps>(
  (
    {
      children,
      className,
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      wrap = 'nowrap',
      gap = 'none',
      grow,
      shrink,
      basis,
      sm,
      md,
      lg,
      xl,
      '2xl': xl2,
      fullHeight = false,
      fullWidth = false,
      as: Component = 'div',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      role,
      ...props
    },
    ref
  ) => {
    // 기본 flex 클래스
    const baseClasses = ['flex'];

    // 방향 클래스 매핑
    const directionMap = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    };

    // 정렬 클래스 매핑
    const alignMap = {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    };

    // justify 클래스 매핑
    const justifyMap = {
      normal: 'justify-normal',
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
      stretch: 'justify-stretch',
    };

    // wrap 클래스 매핑
    const wrapMap = {
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
      nowrap: 'flex-nowrap',
    };

    // gap 클래스 매핑
    const gapMap = {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    // 기본 스타일 적용
    if (direction) baseClasses.push(directionMap[direction]);
    if (align) baseClasses.push(alignMap[align]);
    if (justify) baseClasses.push(justifyMap[justify]);
    if (wrap) baseClasses.push(wrapMap[wrap]);
    if (gap && gapMap[gap]) baseClasses.push(gapMap[gap]);

    // flex-grow, flex-shrink, flex-basis 처리
    if (grow !== undefined) {
      if (grow === true) {
        baseClasses.push('grow');
      } else if (grow === false) {
        baseClasses.push('grow-0');
      } else if (typeof grow === 'number') {
        baseClasses.push(`grow-${grow}`);
      }
    }

    if (shrink !== undefined) {
      if (shrink === true) {
        baseClasses.push('shrink');
      } else if (shrink === false) {
        baseClasses.push('shrink-0');
      } else if (typeof shrink === 'number') {
        baseClasses.push(`shrink-${shrink}`);
      }
    }

    if (basis !== undefined) {
      if (typeof basis === 'string') {
        baseClasses.push(`basis-${basis}`);
      } else if (typeof basis === 'number') {
        baseClasses.push(`basis-${basis}`);
      }
    }

    // 반응형 클래스 생성 함수
    const generateResponsiveClasses = (
      breakpoint: string,
      config: ResponsiveFlexBreakpoint
    ): string[] => {
      const responsiveClasses: string[] = [];

      if (config.direction) {
        responsiveClasses.push(
          `${breakpoint}:${directionMap[config.direction]}`
        );
      }
      if (config.align) {
        responsiveClasses.push(`${breakpoint}:${alignMap[config.align]}`);
      }
      if (config.justify) {
        responsiveClasses.push(`${breakpoint}:${justifyMap[config.justify]}`);
      }
      if (config.wrap) {
        responsiveClasses.push(`${breakpoint}:${wrapMap[config.wrap]}`);
      }
      if (config.gap && gapMap[config.gap]) {
        responsiveClasses.push(`${breakpoint}:${gapMap[config.gap]}`);
      }

      return responsiveClasses;
    };

    // 반응형 클래스 적용
    const responsiveClasses: string[] = [];

    if (sm) responsiveClasses.push(...generateResponsiveClasses('sm', sm));
    if (md) responsiveClasses.push(...generateResponsiveClasses('md', md));
    if (lg) responsiveClasses.push(...generateResponsiveClasses('lg', lg));
    if (xl) responsiveClasses.push(...generateResponsiveClasses('xl', xl));
    if (xl2) responsiveClasses.push(...generateResponsiveClasses('2xl', xl2));

    // 전체 크기 옵션
    if (fullHeight) baseClasses.push('h-full');
    if (fullWidth) baseClasses.push('w-full');

    const finalClasses = cn(...baseClasses, ...responsiveClasses, className);

    return (
      <Component
        ref={ref}
        className={finalClasses}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        role={role}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveFlex.displayName = 'ResponsiveFlex';

export { ResponsiveFlex };
export type { ResponsiveFlexProps, ResponsiveFlexBreakpoint };
