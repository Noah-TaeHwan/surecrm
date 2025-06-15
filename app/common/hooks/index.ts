/**
 * SureCRM Responsive Design Hooks
 * 
 * Centralized export for all device detection and viewport management hooks
 * Designed for mobile-first responsive design implementation
 */

// Import types and functions for internal use
import type { DeviceType } from './useDeviceType';
import { useDeviceType, destroyDeviceTypeStore } from './useDeviceType';
import { useTouchDevice, destroyTouchDeviceStore } from './useTouchDevice';
import { BREAKPOINTS, destroyBreakpointStore } from './useBreakpoint';
import { destroyViewportStore } from './useViewport';
import { destroyOrientationStore } from './useOrientation';

// Viewport tracking
export {
  useViewport,
  useViewportWidth,
  useViewportHeight,
  useViewportDimensions,
  viewportStore,
  destroyViewportStore,
} from './useViewport';
export type { ViewportSize } from './useViewport';

// Device type detection
export {
  useDeviceType,
  deviceTypeStore,
  destroyDeviceTypeStore,
} from './useDeviceType';
export type { DeviceType } from './useDeviceType';

// Breakpoint utilities
export {
  useBreakpoint,
  BREAKPOINTS,
  breakpointStore,
  destroyBreakpointStore,
} from './useBreakpoint';
export type { BreakpointName, BreakpointInfo } from './useBreakpoint';

// Touch device detection
export {
  useTouchDevice,
  useHasTouch,
  useIsTouchPrimary,
  touchDeviceStore,
  destroyTouchDeviceStore,
} from './useTouchDevice';
export type { TouchCapabilities } from './useTouchDevice';

// Orientation detection
export {
  useOrientation,
  useIsPortrait,
  useIsLandscape,
  orientationStore,
  destroyOrientationStore,
} from './useOrientation';
export type { OrientationType, OrientationInfo } from './useOrientation';

// Cleanup utility for all stores (useful for testing or app teardown)
export const destroyAllStores = () => {
  destroyViewportStore();
  destroyDeviceTypeStore();
  destroyBreakpointStore();
  destroyTouchDeviceStore();
  destroyOrientationStore();
};

// Re-export constants for easy access
export const RESPONSIVE_BREAKPOINTS = BREAKPOINTS;

// Common responsive utilities
export const createResponsiveHandler = (handlers: {
  mobile?: () => void;
  tablet?: () => void;
  desktop?: () => void;
}) => {
  return (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'mobile':
        handlers.mobile?.();
        break;
      case 'tablet':
        handlers.tablet?.();
        break;
      case 'desktop':
        handlers.desktop?.();
        break;
    }
  };
};

// Utility for checking if device is mobile-like (mobile or tablet)
export const useIsMobileLike = (): boolean => {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' || deviceType === 'tablet';
};

// Utility for getting touch-optimized spacing
export const useTouchSpacing = () => {
  const { isPrimaryTouch } = useTouchDevice();
  const deviceType = useDeviceType();
  
  return {
    buttonMinHeight: isPrimaryTouch ? '48px' : '40px',
    touchTarget: deviceType === 'mobile' ? '44px' : '40px',
    spacing: deviceType === 'mobile' ? 'space-y-4' : 'space-y-3',
    padding: deviceType === 'mobile' ? 'p-4' : 'p-3',
  };
}; 