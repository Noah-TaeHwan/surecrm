import { useSyncExternalStore } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// 🔧 SSR 기본값을 상수로 캐시하여 무한 루프 방지
const SSR_DEFAULT_VIEWPORT: ViewportSize = {
  width: 1024, 
  height: 768,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

// Viewport tracking store
class ViewportStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: ViewportSize;

  constructor() {
    this.currentSnapshot = this.getViewportSize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true });
    }
  }

  private handleResize = () => {
    this.forceUpdate();
  };

  private getViewportSize(): ViewportSize {
    if (typeof window === 'undefined') {
      return SSR_DEFAULT_VIEWPORT; // 캐시된 상수 사용
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
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
    this.listeners.forEach((listener) => listener());
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
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
 *   const { width, height } = useViewport();
 *   
 *   return (
 *     <div>
 *       <p>Viewport: {width}x{height}</p>
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

// Export store for testing  
export { viewportStore };

// Cleanup function
export const destroyViewportStore = () => {
  viewportStore.destroy();
}; 