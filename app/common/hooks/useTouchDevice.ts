import { useSyncExternalStore } from 'react';

export interface TouchCapabilities {
  hasTouch: boolean;
  maxTouchPoints: number;
  supportsCoarsePointer: boolean;
  supportsFinePointer: boolean;
  isHoverCapable: boolean;
  isPrimaryTouch: boolean;
}

// Touch detection store
class TouchDeviceStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: TouchCapabilities;

  constructor() {
    this.currentSnapshot = this.detectTouchCapabilities();

    if (typeof window !== 'undefined') {
      // Listen for potential changes in input methods
      window.addEventListener('touchstart', this.handleTouchStart, { passive: true, once: true });
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true, once: true });
    }
  }

  private handleTouchStart = () => {
    // Update capabilities when touch is first detected
    const newCapabilities = this.detectTouchCapabilities();
    if (newCapabilities.hasTouch !== this.currentSnapshot.hasTouch) {
      this.currentSnapshot = newCapabilities;
      this.listeners.forEach((listener) => listener());
    }
  };

  private handleMouseMove = () => {
    // Update capabilities when mouse is detected
    const newCapabilities = this.detectTouchCapabilities();
    if (newCapabilities.isPrimaryTouch !== this.currentSnapshot.isPrimaryTouch) {
      this.currentSnapshot = newCapabilities;
      this.listeners.forEach((listener) => listener());
    }
  };

  private detectTouchCapabilities(): TouchCapabilities {
    if (typeof window === 'undefined') {
      // SSR defaults
      return {
        hasTouch: false,
        maxTouchPoints: 0,
        supportsCoarsePointer: false,
        supportsFinePointer: true,
        isHoverCapable: true,
        isPrimaryTouch: false,
      };
    }

    // Detect touch support
    const hasTouch = 'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0 ||
                     // @ts-ignore - DocumentTouch is for legacy browser support
                     (window.DocumentTouch && document instanceof window.DocumentTouch);

    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Media queries for pointer capabilities
    const supportsCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isHoverCapable = window.matchMedia('(hover: hover)').matches;

    // Determine if touch is the primary input method
    const isPrimaryTouch = supportsCoarsePointer && !supportsFinePointer;

    return {
      hasTouch,
      maxTouchPoints,
      supportsCoarsePointer,
      supportsFinePointer,
      isHoverCapable,
      isPrimaryTouch,
    };
  }

  public getSnapshot = (): TouchCapabilities => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): TouchCapabilities => {
    // SSR safe defaults (assume non-touch)
    return {
      hasTouch: false,
      maxTouchPoints: 0,
      supportsCoarsePointer: false,
      supportsFinePointer: true,
      isHoverCapable: true,
      isPrimaryTouch: false,
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
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
    this.listeners.clear();
  }
}

// Singleton instance
const touchDeviceStore = new TouchDeviceStore();

/**
 * Hook for detecting touch capabilities and input methods
 * 
 * Provides comprehensive touch detection including:
 * - Basic touch support detection
 * - Multi-touch capabilities (maxTouchPoints)
 * - Pointer type detection (coarse vs fine)
 * - Hover capability detection
 * - Primary input method identification
 * 
 * @returns TouchCapabilities object with detailed touch information
 * 
 * @example
 * ```tsx
 * function TouchAwareComponent() {
 *   const touch = useTouchDevice();
 *   
 *   return (
 *     <div>
 *       {touch.hasTouch && <p>Touch supported</p>}
 *       {touch.isPrimaryTouch && <TouchOptimizedUI />}
 *       {touch.isHoverCapable && <HoverEffects />}
 *       <p>Max touch points: {touch.maxTouchPoints}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTouchDevice = (): TouchCapabilities => {
  return useSyncExternalStore(
    touchDeviceStore.subscribe,
    touchDeviceStore.getSnapshot,
    touchDeviceStore.getServerSnapshot
  );
};

// Convenience hook for simple touch detection
export const useHasTouch = (): boolean => {
  const { hasTouch } = useTouchDevice();
  return hasTouch;
};

// Convenience hook for checking if touch is primary input
export const useIsTouchPrimary = (): boolean => {
  const { isPrimaryTouch } = useTouchDevice();
  return isPrimaryTouch;
};

// Export store for testing
export { touchDeviceStore };

// Cleanup function
export const destroyTouchDeviceStore = () => {
  touchDeviceStore.destroy();
}; 