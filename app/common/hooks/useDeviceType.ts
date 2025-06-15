import { useSyncExternalStore } from 'react';
import { useViewport } from './useViewport';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Device type detection store
class DeviceTypeStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: DeviceType;

  constructor() {
    this.currentSnapshot = this.detectDeviceType();

    if (typeof window !== 'undefined') {
      // Listen to viewport changes
      window.addEventListener('resize', this.handleResize, { passive: true });
    }
  }

  private handleResize = () => {
    const newDeviceType = this.detectDeviceType();
    if (newDeviceType !== this.currentSnapshot) {
      this.currentSnapshot = newDeviceType;
      this.listeners.forEach((listener) => listener());
    }
  };

  private detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop'; // SSR default
    }

    const width = window.innerWidth;
    const userAgent = navigator.userAgent;

    // First check viewport width (most reliable)
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    }

    // Secondary check: User Agent for more precise detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*tablet)|Kindle|Silk|Playbook/i.test(userAgent) || 
                     (isMobile && width >= 768);

    if (isTablet) {
      return 'tablet';
    } else if (isMobile) {
      return 'mobile';
    }

    return 'desktop';
  }

  public getSnapshot = (): DeviceType => {
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): DeviceType => {
    return 'desktop'; // Safe default for SSR
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
    this.listeners.clear();
  }
}

// Singleton instance
const deviceTypeStore = new DeviceTypeStore();

/**
 * Hook for detecting device type (mobile, tablet, desktop)
 * 
 * Detection logic:
 * - Primary: Viewport width-based detection
 * - Secondary: User Agent string analysis for better accuracy
 * - SSR compatible with safe defaults
 * 
 * Breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px 
 * - desktop: >= 1024px
 * 
 * @returns DeviceType - 'mobile' | 'tablet' | 'desktop'
 * 
 * @example
 * ```tsx
 * function AdaptiveComponent() {
 *   const deviceType = useDeviceType();
 *   
 *   return (
 *     <div>
 *       {deviceType === 'mobile' && <MobileView />}
 *       {deviceType === 'tablet' && <TabletView />}
 *       {deviceType === 'desktop' && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useDeviceType = (): DeviceType => {
  return useSyncExternalStore(
    deviceTypeStore.subscribe,
    deviceTypeStore.getSnapshot,
    deviceTypeStore.getServerSnapshot
  );
};

// Export store for testing
export { deviceTypeStore };

// Cleanup function
export const destroyDeviceTypeStore = () => {
  deviceTypeStore.destroy();
}; 