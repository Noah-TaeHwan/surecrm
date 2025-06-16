import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveStackBreakpoint {
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  
  // 기본 스택 설정
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  
  // 반응형 브레이크포인트별 설정
  sm?: ResponsiveStackBreakpoint;
  md?: ResponsiveStackBreakpoint;
  lg?: ResponsiveStackBreakpoint;
  xl?: ResponsiveStackBreakpoint;
  '2xl'?: ResponsiveStackBreakpoint;
  
  // 접근성 및 의미론적 HTML
  as?: React.ElementType;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  role?: string;
  
  // 추가 옵션
  fullHeight?: boolean;
  fullWidth?: boolean;
}

export const ResponsiveStack = React.forwardRef<
  HTMLElement,
  ResponsiveStackProps
>(({
  children,
  className,
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
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
  fullHeight = false,
  fullWidth = true,
  ...props
}, ref) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const directionClasses = {
    column: 'flex-col',
    row: 'flex-row',
    'column-reverse': 'flex-col-reverse',
    'row-reverse': 'flex-row-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const getResponsiveClasses = () => {
    const classes = [];

    if (sm) {
      if (sm.direction) classes.push(`sm:${directionClasses[sm.direction]}`);
      if (sm.gap) classes.push(`sm:${gapClasses[sm.gap]}`);
      if (sm.align) classes.push(`sm:${alignClasses[sm.align]}`);
      if (sm.justify) classes.push(`sm:${justifyClasses[sm.justify]}`);
      if (sm.wrap !== undefined) classes.push(sm.wrap ? 'sm:flex-wrap' : 'sm:flex-nowrap');
    }

    if (md) {
      if (md.direction) classes.push(`md:${directionClasses[md.direction]}`);
      if (md.gap) classes.push(`md:${gapClasses[md.gap]}`);
      if (md.align) classes.push(`md:${alignClasses[md.align]}`);
      if (md.justify) classes.push(`md:${justifyClasses[md.justify]}`);
      if (md.wrap !== undefined) classes.push(md.wrap ? 'md:flex-wrap' : 'md:flex-nowrap');
    }

    if (lg) {
      if (lg.direction) classes.push(`lg:${directionClasses[lg.direction]}`);
      if (lg.gap) classes.push(`lg:${gapClasses[lg.gap]}`);
      if (lg.align) classes.push(`lg:${alignClasses[lg.align]}`);
      if (lg.justify) classes.push(`lg:${justifyClasses[lg.justify]}`);
      if (lg.wrap !== undefined) classes.push(lg.wrap ? 'lg:flex-wrap' : 'lg:flex-nowrap');
    }

    if (xl) {
      if (xl.direction) classes.push(`xl:${directionClasses[xl.direction]}`);
      if (xl.gap) classes.push(`xl:${gapClasses[xl.gap]}`);
      if (xl.align) classes.push(`xl:${alignClasses[xl.align]}`);
      if (xl.justify) classes.push(`xl:${justifyClasses[xl.justify]}`);
      if (xl.wrap !== undefined) classes.push(xl.wrap ? 'xl:flex-wrap' : 'xl:flex-nowrap');
    }

    if (xl2) {
      if (xl2.direction) classes.push(`2xl:${directionClasses[xl2.direction]}`);
      if (xl2.gap) classes.push(`2xl:${gapClasses[xl2.gap]}`);
      if (xl2.align) classes.push(`2xl:${alignClasses[xl2.align]}`);
      if (xl2.justify) classes.push(`2xl:${justifyClasses[xl2.justify]}`);
      if (xl2.wrap !== undefined) classes.push(xl2.wrap ? '2xl:flex-wrap' : '2xl:flex-nowrap');
    }

    return classes;
  };

  const accessibilityProps = {
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    role: role || (ariaLabel || ariaLabelledBy ? 'group' : undefined)
  };

  return (
    <Component
      ref={ref}
      className={cn(
        'flex',
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap ? 'flex-wrap' : 'flex-nowrap',
        fullWidth && 'w-full',
        fullHeight && 'min-h-full',
        ...getResponsiveClasses(),
        className
      )}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </Component>
  );
});

ResponsiveStack.displayName = 'ResponsiveStack';

export default ResponsiveStack; 