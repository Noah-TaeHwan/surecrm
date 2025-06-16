import React from 'react';
import { cn } from '~/lib/utils';

interface ResponsiveSectionBreakpoint {
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'none' | 'white' | 'gray' | 'primary' | 'secondary' | 'accent';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: 'none' | 'thin' | 'thick';
}

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;

  // 기본 섹션 설정
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'none' | 'white' | 'gray' | 'primary' | 'secondary' | 'accent';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: 'none' | 'thin' | 'thick';

  // 반응형 브레이크포인트별 설정
  sm?: ResponsiveSectionBreakpoint;
  md?: ResponsiveSectionBreakpoint;
  lg?: ResponsiveSectionBreakpoint;
  xl?: ResponsiveSectionBreakpoint;
  '2xl'?: ResponsiveSectionBreakpoint;

  // 의미론적 HTML 요소 선택
  as?: React.ElementType;

  // 접근성 속성
  'aria-label'?: string;
  'aria-labelledby'?: string;
  role?: string;

  // 추가 컨테이너 옵션
  fullWidth?: boolean;
  centerContent?: boolean;
  minHeight?: 'screen' | 'half' | 'quarter' | 'auto';
  maxWidth?:
    | 'none'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';
}

const ResponsiveSection = React.forwardRef<HTMLElement, ResponsiveSectionProps>(
  (
    {
      children,
      className,

      // 기본 설정
      padding = 'md',
      margin = 'none',
      background = 'none',
      rounded = 'none',
      shadow = 'none',
      border = 'none',

      // 반응형 설정
      sm,
      md,
      lg,
      xl,
      '2xl': xl2,

      // HTML 요소
      as: Component = 'section',

      // 접근성
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      role,

      // 추가 옵션
      fullWidth = false,
      centerContent = false,
      minHeight = 'auto',
      maxWidth = 'none',

      ...props
    },
    ref
  ) => {
    // 패딩 클래스 생성
    const getPaddingClasses = (paddingValue: string, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const paddingMap = {
        none: `${prefix}p-0`,
        xs: `${prefix}p-2`,
        sm: `${prefix}p-4`,
        md: `${prefix}p-6`,
        lg: `${prefix}p-8`,
        xl: `${prefix}p-12`,
        '2xl': `${prefix}p-16`,
      };
      return paddingMap[paddingValue as keyof typeof paddingMap] || '';
    };

    // 마진 클래스 생성
    const getMarginClasses = (marginValue: string, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const marginMap = {
        none: `${prefix}m-0`,
        xs: `${prefix}m-2`,
        sm: `${prefix}m-4`,
        md: `${prefix}m-6`,
        lg: `${prefix}m-8`,
        xl: `${prefix}m-12`,
        '2xl': `${prefix}m-16`,
      };
      return marginMap[marginValue as keyof typeof marginMap] || '';
    };

    // 배경 클래스 생성
    const getBackgroundClasses = (
      backgroundValue: string,
      breakpoint?: string
    ) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const backgroundMap = {
        none: '',
        white: `${prefix}bg-white`,
        gray: `${prefix}bg-gray-50`,
        primary: `${prefix}bg-blue-50`,
        secondary: `${prefix}bg-purple-50`,
        accent: `${prefix}bg-green-50`,
      };
      return backgroundMap[backgroundValue as keyof typeof backgroundMap] || '';
    };

    // 둥근 모서리 클래스 생성
    const getRoundedClasses = (roundedValue: string, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const roundedMap = {
        none: '',
        sm: `${prefix}rounded-sm`,
        md: `${prefix}rounded-md`,
        lg: `${prefix}rounded-lg`,
        xl: `${prefix}rounded-xl`,
        '2xl': `${prefix}rounded-2xl`,
        full: `${prefix}rounded-full`,
      };
      return roundedMap[roundedValue as keyof typeof roundedMap] || '';
    };

    // 그림자 클래스 생성
    const getShadowClasses = (shadowValue: string, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const shadowMap = {
        none: '',
        xs: `${prefix}shadow-xs`,
        sm: `${prefix}shadow-sm`,
        md: `${prefix}shadow-md`,
        lg: `${prefix}shadow-lg`,
        xl: `${prefix}shadow-xl`,
        '2xl': `${prefix}shadow-2xl`,
      };
      return shadowMap[shadowValue as keyof typeof shadowMap] || '';
    };

    // 테두리 클래스 생성
    const getBorderClasses = (borderValue: string, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : '';
      const borderMap = {
        none: '',
        thin: `${prefix}border border-gray-200`,
        thick: `${prefix}border-2 border-gray-300`,
      };
      return borderMap[borderValue as keyof typeof borderMap] || '';
    };

    // 최소 높이 클래스
    const getMinHeightClasses = () => {
      const minHeightMap = {
        auto: '',
        screen: 'min-h-screen',
        half: 'min-h-[50vh]',
        quarter: 'min-h-[25vh]',
      };
      return minHeightMap[minHeight] || '';
    };

    // 최대 너비 클래스
    const getMaxWidthClasses = () => {
      const maxWidthMap = {
        none: '',
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
      };
      return maxWidthMap[maxWidth] || '';
    };

    // 기본 클래스들
    const baseClasses = [
      // 기본 설정
      getPaddingClasses(padding),
      getMarginClasses(margin),
      getBackgroundClasses(background),
      getRoundedClasses(rounded),
      getShadowClasses(shadow),
      getBorderClasses(border),

      // 추가 옵션
      fullWidth ? 'w-full' : '',
      centerContent ? 'mx-auto' : '',
      getMinHeightClasses(),
      getMaxWidthClasses(),
    ];

    // 반응형 클래스들
    const responsiveClasses = [
      // sm 브레이크포인트
      sm?.padding ? getPaddingClasses(sm.padding, 'sm') : '',
      sm?.margin ? getMarginClasses(sm.margin, 'sm') : '',
      sm?.background ? getBackgroundClasses(sm.background, 'sm') : '',
      sm?.rounded ? getRoundedClasses(sm.rounded, 'sm') : '',
      sm?.shadow ? getShadowClasses(sm.shadow, 'sm') : '',
      sm?.border ? getBorderClasses(sm.border, 'sm') : '',

      // md 브레이크포인트
      md?.padding ? getPaddingClasses(md.padding, 'md') : '',
      md?.margin ? getMarginClasses(md.margin, 'md') : '',
      md?.background ? getBackgroundClasses(md.background, 'md') : '',
      md?.rounded ? getRoundedClasses(md.rounded, 'md') : '',
      md?.shadow ? getShadowClasses(md.shadow, 'md') : '',
      md?.border ? getBorderClasses(md.border, 'md') : '',

      // lg 브레이크포인트
      lg?.padding ? getPaddingClasses(lg.padding, 'lg') : '',
      lg?.margin ? getMarginClasses(lg.margin, 'lg') : '',
      lg?.background ? getBackgroundClasses(lg.background, 'lg') : '',
      lg?.rounded ? getRoundedClasses(lg.rounded, 'lg') : '',
      lg?.shadow ? getShadowClasses(lg.shadow, 'lg') : '',
      lg?.border ? getBorderClasses(lg.border, 'lg') : '',

      // xl 브레이크포인트
      xl?.padding ? getPaddingClasses(xl.padding, 'xl') : '',
      xl?.margin ? getMarginClasses(xl.margin, 'xl') : '',
      xl?.background ? getBackgroundClasses(xl.background, 'xl') : '',
      xl?.rounded ? getRoundedClasses(xl.rounded, 'xl') : '',
      xl?.shadow ? getShadowClasses(xl.shadow, 'xl') : '',
      xl?.border ? getBorderClasses(xl.border, 'xl') : '',

      // 2xl 브레이크포인트
      xl2?.padding ? getPaddingClasses(xl2.padding, '2xl') : '',
      xl2?.margin ? getMarginClasses(xl2.margin, '2xl') : '',
      xl2?.background ? getBackgroundClasses(xl2.background, '2xl') : '',
      xl2?.rounded ? getRoundedClasses(xl2.rounded, '2xl') : '',
      xl2?.shadow ? getShadowClasses(xl2.shadow, '2xl') : '',
      xl2?.border ? getBorderClasses(xl2.border, '2xl') : '',
    ];

    // 모든 클래스 결합
    const combinedClassName = cn(
      ...baseClasses,
      ...responsiveClasses,
      className
    );

    return (
      <Component
        ref={ref}
        className={combinedClassName}
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

ResponsiveSection.displayName = 'ResponsiveSection';

export { ResponsiveSection };
