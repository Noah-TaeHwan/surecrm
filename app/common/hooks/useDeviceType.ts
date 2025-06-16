import { useSyncExternalStore } from 'react';

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
      this.listeners.forEach(listener => listener());
    }
  };

  private detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop'; // SSR default
    }

    const width = window.innerWidth;

    // Check User Agent first for device identification
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent;

      // Specific tablet detection (iPad and Android tablets)
      const isTablet =
        /iPad/i.test(userAgent) ||
        /Android(?=.*tablet)/i.test(userAgent) ||
        /Kindle|Silk|Playbook/i.test(userAgent);

      if (isTablet) {
        return 'tablet';
      }

      // Mobile device detection (phones)
      const isMobileDevice =
        /iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );

      if (isMobileDevice) {
        return 'mobile';
      }
    }

    // Fallback to viewport width-based detection for desktop browsers
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
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

  // Method to force recalculation (for testing)
  public forceUpdate() {
    const newDeviceType = this.detectDeviceType();
    if (newDeviceType !== this.currentSnapshot) {
      this.currentSnapshot = newDeviceType;
      this.listeners.forEach(listener => listener());
    }
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
