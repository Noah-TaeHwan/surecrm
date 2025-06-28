import { useSyncExternalStore } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

// 🔧 SSR 기본값을 상수로 캐시하여 무한 루프 방지
const SSR_DEFAULT_VIEWPORT: ViewportSize = {
  width: 1024,
  height: 768,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false,
  deviceType: 'desktop',
};

// 🆕 개선된 디바이스 감지 함수들
const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

const isIPad = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // 기존 iPad 감지
  if (userAgent.includes('ipad')) return true;

  // iOS 13+ 아이패드는 데스크톱 Safari User Agent를 사용
  // 터치 + 맥OS Safari + 특정 해상도 조합으로 감지
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isMacOS =
    userAgent.includes('macintosh') || userAgent.includes('mac os x');
  const hasTouch = isTouchDevice();

  // iPad Pro/Air/Mini의 일반적인 해상도들
  const { width, height } = window.screen;
  const isIPadResolution =
    (width === 768 && height === 1024) || // iPad Mini/기본 iPad
    (width === 1024 && height === 768) ||
    (width === 820 && height === 1180) || // iPad Air
    (width === 1180 && height === 820) ||
    (width === 834 && height === 1194) || // iPad Pro 11"
    (width === 1194 && height === 834) ||
    (width === 1024 && height === 1366) || // iPad Pro 12.9"
    (width === 1366 && height === 1024);

  return isSafari && isMacOS && hasTouch && isIPadResolution;
};

const getDeviceType = (
  width: number,
  height: number
): 'mobile' | 'tablet' | 'desktop' => {
  // 🎯 아이패드 명시적 감지
  if (isIPad()) {
    return 'tablet';
  }

  // 터치 디바이스면서 특정 크기 범위인 경우 태블릿으로 처리
  if (isTouchDevice()) {
    // 작은 화면 (모바일)
    if (width < 768) return 'mobile';

    // 중간 화면이면서 터치 가능 (태블릿)
    if (width < 1200) return 'tablet';
  }

  // 전통적인 해상도 기반 감지
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Viewport tracking store
class ViewportStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: ViewportSize;

  constructor() {
    this.currentSnapshot = this.getViewportSize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true });
      // 🆕 방향 변경 이벤트도 처리 (아이패드 회전 대응)
      window.addEventListener('orientationchange', this.handleResize, {
        passive: true,
      });
    }
  }

  private handleResize = () => {
    // 🆕 방향 변경 시 약간의 딜레이 추가 (iOS 특성상 즉시 반영되지 않음)
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  };

  private getViewportSize(): ViewportSize {
    if (typeof window === 'undefined') {
      return SSR_DEFAULT_VIEWPORT; // 캐시된 상수 사용
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDeviceFlag = isTouchDevice();
    const deviceType = getDeviceType(width, height);

    // 🆕 개선된 디바이스 타입 기반 분류
    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice: isTouchDeviceFlag,
      deviceType,
    };
  }

  public getSnapshot = (): ViewportSize => {
    return this.currentSnapshot;
  };

  // 🔧 캐시된 SSR 기본값 반환으로 무한 루프 방지
  public getServerSnapshot = (): ViewportSize => {
    return SSR_DEFAULT_VIEWPORT;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public forceUpdate = (): void => {
    const newViewportSize = this.getViewportSize();
    this.currentSnapshot = newViewportSize;
    this.listeners.forEach(listener => listener());
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleResize);
    }
    this.listeners.clear();
  }
}

// Singleton instance
const viewportStore = new ViewportStore();

/**
 * Hook for viewport size tracking
 *
 * @returns ViewportSize object with current width and height
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { width, height, deviceType, isTouchDevice } = useViewport();
 *
 *   return (
 *     <div>
 *       <p>Viewport: {width}x{height}</p>
 *       <p>Device: {deviceType}</p>
 *       <p>Touch: {isTouchDevice ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useViewport = (): ViewportSize => {
  return useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
    viewportStore.getServerSnapshot
  );
};

/**
 * Hook for viewport width only
 *
 * @returns Current viewport width
 */
export const useViewportWidth = (): number => {
  const { width } = useViewport();
  return width;
};

/**
 * Hook for viewport height only
 *
 * @returns Current viewport height
 */
export const useViewportHeight = (): number => {
  const { height } = useViewport();
  return height;
};

/**
 * Hook for viewport dimensions (alias for useViewport)
 *
 * @returns ViewportSize object with current width and height
 */
export const useViewportDimensions = (): ViewportSize => {
  return useViewport();
};

// 🆕 디바이스 타입별 훅들
export const useIsMobile = (): boolean => {
  const { isMobile } = useViewport();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useViewport();
  return isTablet;
};

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useViewport();
  return isDesktop;
};

export const useIsTouchDevice = (): boolean => {
  const { isTouchDevice } = useViewport();
  return isTouchDevice;
};

export const useDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const { deviceType } = useViewport();
  return deviceType;
};

// Export store for testing
export { viewportStore };

// Cleanup function
export const destroyViewportStore = () => {
  viewportStore.destroy();
};
