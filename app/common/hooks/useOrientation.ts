import { useSyncExternalStore } from 'react';

export type OrientationType = 'portrait' | 'landscape';

export interface OrientationInfo {
  type: OrientationType;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// Orientation detection store
class OrientationStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: OrientationInfo;

  constructor() {
    this.currentSnapshot = this.detectOrientation();

    if (typeof window !== 'undefined') {
      // Listen for orientation changes
      window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
      window.addEventListener('resize', this.handleResize, { passive: true });
      
      // Modern browsers support 'screen.orientation'
      if ('orientation' in screen && screen.orientation && 'addEventListener' in screen.orientation) {
        (screen.orientation as any).addEventListener('change', this.handleOrientationChange);
      }
    }
  }

  private handleOrientationChange = () => {
    // Small delay to ensure window dimensions are updated
    setTimeout(() => {
      const newOrientation = this.detectOrientation();
      if (newOrientation.type !== this.currentSnapshot.type || 
          newOrientation.angle !== this.currentSnapshot.angle) {
        this.currentSnapshot = newOrientation;
        this.listeners.forEach((listener) => listener());
      }
    }, 100);
  };

  private handleResize = () => {
    // Debounce resize to avoid excessive updates
    const newOrientation = this.detectOrientation();
    if (newOrientation.aspectRatio !== this.currentSnapshot.aspectRatio) {
      this.currentSnapshot = newOrientation;
      this.listeners.forEach((listener) => listener());
    }
  };

  private detectOrientation(): OrientationInfo {
    if (typeof window === 'undefined') {
      // SSR defaults
      return {
        type: 'portrait',
        angle: 0,
        isPortrait: true,
        isLandscape: false,
        aspectRatio: 0.75,
        dimensions: { width: 768, height: 1024 }
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    // Determine orientation based on dimensions
    const isLandscape = width > height;
    const type: OrientationType = isLandscape ? 'landscape' : 'portrait';

    // Get orientation angle
    let angle = 0;
    if ('orientation' in screen && screen.orientation) {
      // Modern API
      angle = screen.orientation.angle || 0;
    } else if ('orientation' in window) {
      // Legacy API
      angle = (window as any).orientation || 0;
    } else {
      // Fallback: estimate based on dimensions
      if (isLandscape) {
        angle = width > height * 1.3 ? 90 : 0; // Rough estimate
      }
    }

    return {
      type,
      angle,
      isPortrait: !isLandscape,
      isLandscape,
      aspectRatio,
      dimensions: { width, height }
    };
  }

  public getSnapshot = (): OrientationInfo => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): OrientationInfo => {
    // SSR safe defaults (portrait orientation)
    return {
      type: 'portrait',
      angle: 0,
      isPortrait: true,
      isLandscape: false,
      aspectRatio: 0.75,
      dimensions: { width: 768, height: 1024 }
    };
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', this.handleOrientationChange);
      window.removeEventListener('resize', this.handleResize);
      
      if ('orientation' in screen && screen.orientation && 'removeEventListener' in screen.orientation) {
        (screen.orientation as any).removeEventListener('change', this.handleOrientationChange);
      }
    }
    this.listeners.clear();
  }
}

// Singleton instance
const orientationStore = new OrientationStore();

/**
 * Hook for detecting device orientation and related information
 * 
 * Provides comprehensive orientation detection including:
 * - Orientation type (portrait/landscape)
 * - Orientation angle (0, 90, 180, 270 degrees)
 * - Boolean helpers for quick checks
 * - Aspect ratio calculations
 * - Current dimensions
 * 
 * @returns OrientationInfo object with orientation details
 * 
 * @example
 * ```tsx
 * function OrientationAwareComponent() {
 *   const orientation = useOrientation();
 *   
 *   return (
 *     <div>
 *       <p>Current: {orientation.type}</p>
 *       <p>Angle: {orientation.angle}°</p>
 *       {orientation.isLandscape && <LandscapeLayout />}
 *       {orientation.isPortrait && <PortraitLayout />}
 *       <p>Aspect ratio: {orientation.aspectRatio.toFixed(2)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useOrientation = (): OrientationInfo => {
  return useSyncExternalStore(
    orientationStore.subscribe,
    orientationStore.getSnapshot,
    orientationStore.getServerSnapshot
  );
};

// Convenience hooks for quick orientation checks
export const useIsPortrait = (): boolean => {
  const { isPortrait } = useOrientation();
  return isPortrait;
};

export const useIsLandscape = (): boolean => {
  const { isLandscape } = useOrientation();
  return isLandscape;
};

// Export store for testing
export { orientationStore };

// Cleanup function
export const destroyOrientationStore = () => {
  orientationStore.destroy();
}; 