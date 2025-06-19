import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isHydrated: boolean;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기값 설정

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function useBreakpoint(): Breakpoints {
  // hydration을 위해 초기값을 데스크톱으로 통일 (가장 일반적인 케이스)
  const [isHydrated, setIsHydrated] = useState(false);
  const [breakpoints, setBreakpoints] = useState<
    Omit<Breakpoints, 'isHydrated'>
  >({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLarge: false,
  });

  useEffect(() => {
    // 클라이언트에서만 실행되어 실제 화면 크기 기반으로 breakpoint 계산
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLarge: width >= 1280,
      });
    };

    updateBreakpoints();
    setIsHydrated(true);

    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return {
    ...breakpoints,
    isHydrated,
  };
}

// 특정 breakpoint에서만 활성화되는 훅
export function useIsMobile(): boolean {
  const { isMobile } = useBreakpoint();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useBreakpoint();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop, isLarge } = useBreakpoint();
  return isDesktop || isLarge;
}
