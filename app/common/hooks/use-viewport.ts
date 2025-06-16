import { useState, useEffect } from 'react';

interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isXL: boolean;
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isXL: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.sm,
      isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
      isXL: width >= BREAKPOINTS.xl,
    };
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < BREAKPOINTS.sm,
        isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
        isXL: width >= BREAKPOINTS.xl,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
}

export function useDeviceType() {
  const { isMobile, isTablet, isDesktop, isXL } = useViewport();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isXL,
    deviceType: isMobile
      ? 'mobile'
      : isTablet
        ? 'tablet'
        : isDesktop
          ? 'desktop'
          : 'xl',
  } as const;
}

export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS) {
  const { width } = useViewport();
  return width >= BREAKPOINTS[breakpoint];
}

export { BREAKPOINTS };
