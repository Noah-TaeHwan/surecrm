import { useSyncExternalStore } from 'react';

export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointInfo {
  current: BreakpointName;
  isAbove: (breakpoint: BreakpointName) => boolean;
  isBelow: (breakpoint: BreakpointName) => boolean;
  isExactly: (breakpoint: BreakpointName) => boolean;
  matches: (breakpoint: BreakpointName) => boolean;
}

// Tailwind CSS breakpoint values (from our configuration)
export const BREAKPOINTS = {
  xs: 0,      // Default for very small screens
  sm: 640,    // Mobile landscape (40rem)
  md: 768,    // Tablet portrait (48rem)  
  lg: 1024,   // Tablet landscape/Small desktop (64rem)
  xl: 1280,   // Desktop (80rem)
  '2xl': 1536 // Large desktop (96rem)
} as const;

// Breakpoint detection store
class BreakpointStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: BreakpointInfo;

  constructor() {
    this.currentSnapshot = this.createBreakpointInfo();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true });
    }
  }

  private handleResize = () => {
    this.forceUpdate();
  };

  private getCurrentBreakpoint(): BreakpointName {
    if (typeof window === 'undefined') {
      return 'lg'; // SSR default (desktop-like)
    }

    const width = window.innerWidth;

    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }

  private createBreakpointInfo(): BreakpointInfo {
    const current = this.getCurrentBreakpoint();
    const currentValue = BREAKPOINTS[current];

    return {
      current,
      isAbove: (breakpoint: BreakpointName): boolean => {
        return currentValue > BREAKPOINTS[breakpoint];
      },
      isBelow: (breakpoint: BreakpointName): boolean => {
        return currentValue < BREAKPOINTS[breakpoint];
      },
      isExactly: (breakpoint: BreakpointName): boolean => {
        return current === breakpoint;
      },
      matches: (breakpoint: BreakpointName): boolean => {
        return currentValue >= BREAKPOINTS[breakpoint];
      }
    };
  }

  public getSnapshot = (): BreakpointInfo => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): BreakpointInfo => {
    // SSR safe defaults
    const current: BreakpointName = 'lg';
    const currentValue = BREAKPOINTS[current];

    return {
      current,
      isAbove: (breakpoint: BreakpointName): boolean => {
        return currentValue > BREAKPOINTS[breakpoint];
      },
      isBelow: (breakpoint: BreakpointName): boolean => {
        return currentValue < BREAKPOINTS[breakpoint];
      },
      isExactly: (breakpoint: BreakpointName): boolean => {
        return current === breakpoint;
      },
      matches: (breakpoint: BreakpointName): boolean => {
        return currentValue >= BREAKPOINTS[breakpoint];
      }
    };
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  };

  // 🔧 테스트 환경용: 강제 업데이트 메서드 추가
  public forceUpdate = (): void => {
    const newBreakpointInfo = this.createBreakpointInfo();
    this.currentSnapshot = newBreakpointInfo;
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
const breakpointStore = new BreakpointStore();

/**
 * Hook for Tailwind CSS breakpoint detection and responsive utilities
 * 
 * Provides utilities for responsive logic based on Tailwind breakpoints:
 * - xs: 0px (very small screens)
 * - sm: 640px (mobile landscape)
 * - md: 768px (tablet portrait)
 * - lg: 1024px (tablet landscape/small desktop)
 * - xl: 1280px (desktop)
 * - 2xl: 1536px (large desktop)
 * 
 * @returns BreakpointInfo object with current breakpoint and utility functions
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const bp = useBreakpoint();
 *   
 *   return (
 *     <div>
 *       <p>Current: {bp.current}</p>
 *       {bp.matches('md') && <TabletAndAboveContent />}
 *       {bp.isBelow('lg') && <MobileAndTabletOnly />}
 *       {bp.isExactly('sm') && <MobileLandscapeOnly />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useBreakpoint = (): BreakpointInfo => {
  return useSyncExternalStore(
    breakpointStore.subscribe,
    breakpointStore.getSnapshot,
    breakpointStore.getServerSnapshot
  );
};

// Export store for testing  
export { breakpointStore };

// Cleanup function
export const destroyBreakpointStore = () => {
  breakpointStore.destroy();
}; 