import { useSyncExternalStore } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
}

// Viewport store for external state management
class ViewportStore {
  private listeners = new Set<() => void>();
  private resizeObserver: ResizeObserver | null = null;
  private currentSnapshot: ViewportSize;

  constructor() {
    // Initialize with default values for SSR compatibility
    this.currentSnapshot = {
      width: typeof window !== 'undefined' ? window.innerWidth : 1024,
      height: typeof window !== 'undefined' ? window.innerHeight : 768,
      innerWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
      innerHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    };

    if (typeof window !== 'undefined') {
      this.initializeObserver();
    }
  }

  private initializeObserver() {
    // TypeScript guard - this method is only called when window is defined
    if (typeof window === 'undefined') return;

    // Use ResizeObserver for more efficient viewport tracking
    if ('ResizeObserver' in window && window.ResizeObserver) {
      this.resizeObserver = new window.ResizeObserver(entries => {
        // Use the first entry (document.documentElement)
        const entry = entries[0];
        if (entry) {
          const { inlineSize: width, blockSize: height } = entry
            .contentBoxSize[0] ||
            entry.contentBoxSize || {
              inlineSize: window.innerWidth,
              blockSize: window.innerHeight,
            };

          const newSnapshot: ViewportSize = {
            width: Math.round(width),
            height: Math.round(height),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
          };

          if (this.hasViewportChanged(newSnapshot)) {
            this.currentSnapshot = newSnapshot;
            this.listeners.forEach(listener => listener());
          }
        }
      });

      // Observe the document element
      this.resizeObserver.observe(document.documentElement);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.handleResize, { passive: true });
    }

    // Listen for orientation changes as well
    window.addEventListener('orientationchange', this.handleOrientationChange, {
      passive: true,
    });
  }

  private handleResize = () => {
    if (typeof window === 'undefined') return;
    
    const newSnapshot: ViewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };

    if (this.hasViewportChanged(newSnapshot)) {
      this.currentSnapshot = newSnapshot;
      this.listeners.forEach(listener => listener());
    }
  };

  private handleOrientationChange = () => {
    // Delay to ensure viewport dimensions are updated after orientation change
    setTimeout(() => {
      this.handleResize();
    }, 100);
  };

  private hasViewportChanged(newSnapshot: ViewportSize): boolean {
    return (
      newSnapshot.width !== this.currentSnapshot.width ||
      newSnapshot.height !== this.currentSnapshot.height ||
      newSnapshot.innerWidth !== this.currentSnapshot.innerWidth ||
      newSnapshot.innerHeight !== this.currentSnapshot.innerHeight
    );
  }

  public getSnapshot = (): ViewportSize => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): ViewportSize => {
    // Safe defaults for SSR
    return {
      width: 1024,
      height: 768,
      innerWidth: 1024,
      innerHeight: 768,
    };
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener(
        'orientationchange',
        this.handleOrientationChange
      );
    }

    this.listeners.clear();
  }
}

// Singleton instance
const viewportStore = new ViewportStore();

/**
 * Hook for tracking viewport dimensions using ResizeObserver
 *
 * Provides real-time viewport size information with optimal performance:
 * - Uses ResizeObserver API when available (more efficient)
 * - Falls back to window resize events
 * - Handles orientation changes
 * - SSR compatible with safe defaults
 *
 * @returns ViewportSize object with current dimensions
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const viewport = useViewport();
 *
 *   return (
 *     <div>
 *       <p>Viewport: {viewport.width} x {viewport.height}</p>
 *       <p>Window: {viewport.innerWidth} x {viewport.innerHeight}</p>
 *       {viewport.width < 768 && <MobileView />}
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

// Convenience hooks for common use cases
export const useViewportWidth = (): number => {
  const { width } = useViewport();
  return width;
};

export const useViewportHeight = (): number => {
  const { height } = useViewport();
  return height;
};

export const useViewportDimensions = (): [number, number] => {
  const { width, height } = useViewport();
  return [width, height];
};

// Export store for testing
export { viewportStore };

// Cleanup function
export const destroyViewportStore = () => {
  viewportStore.destroy();
};
