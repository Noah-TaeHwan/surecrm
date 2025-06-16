import { useSyncExternalStore } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
}

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
      return { width: 1024, height: 768 }; // SSR default
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  public getSnapshot = (): ViewportSize => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): ViewportSize => {
    return { width: 1024, height: 768 }; // SSR safe defaults
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