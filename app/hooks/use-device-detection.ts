import { useState, useEffect } from 'react';

/**
 * 디바이스 타입 정의
 * PRD의 breakpoint 정의에 따라 구분
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * 화면 크기 breakpoint 정의 (app.css와 일치)
 */
export const BREAKPOINTS = {
  sm: 640, // 작은 모바일
  md: 768, // 큰 모바일/작은 태블릿 경계
  lg: 1024, // 태블릿/데스크톱 경계
  xl: 1280, // 데스크톱
  '2xl': 1536, // 큰 데스크톱
} as const;

/**
 * 디바이스 상태 인터페이스
 */
interface DeviceState {
  deviceType: DeviceType;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

/**
 * 화면 너비를 기반으로 디바이스 타입 결정
 */
function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) {
    return 'mobile';
  } else if (width < BREAKPOINTS.lg) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * 터치 디바이스 감지
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - 레거시 브라우저 지원
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * 디바이스 정보를 감지하고 추적하는 훅
 *
 * @returns DeviceState 객체
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { deviceType, isMobile, isTablet, isDesktop } = useDeviceDetection();
 *
 *   if (isMobile) {
 *     return <MobileView />;
 *   } else if (isTablet) {
 *     return <TabletView />;
 *   } else {
 *     return <DesktopView />;
 *   }
 * }
 * ```
 */
export function useDeviceDetection(): DeviceState {
  // SSR 안전성을 위해 항상 동일한 기본값으로 시작
  const [deviceState, setDeviceState] = useState<DeviceState>({
    deviceType: 'desktop',
    screenWidth: 1280,
    screenHeight: 720,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    isTouch: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * 화면 크기 변화 핸들러
     * 디바운싱을 통해 성능 최적화
     */
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const deviceType = getDeviceType(width);

        setDeviceState({
          deviceType,
          screenWidth: width,
          screenHeight: height,
          isMobile: deviceType === 'mobile',
          isTablet: deviceType === 'tablet',
          isDesktop: deviceType === 'desktop',
          orientation: width > height ? 'landscape' : 'portrait',
          isTouch: isTouchDevice(),
        });
      }, 100); // 100ms 디바운싱
    };

    // 초기 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 정리 함수
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceState;
}

/**
 * 특정 breakpoint에서의 상태를 확인하는 유틸리티 훅
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { screenWidth } = useDeviceDetection();
  return screenWidth >= BREAKPOINTS[breakpoint];
}

/**
 * 현재 화면이 특정 범위에 있는지 확인하는 유틸리티 훅
 */
export function useBreakpointRange(
  min: keyof typeof BREAKPOINTS,
  max?: keyof typeof BREAKPOINTS
): boolean {
  const { screenWidth } = useDeviceDetection();
  const minWidth = BREAKPOINTS[min];
  const maxWidth = max ? BREAKPOINTS[max] : Infinity;

  return screenWidth >= minWidth && screenWidth < maxWidth;
}
