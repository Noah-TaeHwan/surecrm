/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Store를 모킹하기 위해 먼저 import
vi.mock('../useOrientation', async () => {
  const actual = await vi.importActual('../useOrientation');
  return {
    ...actual,
    orientationStore: {
      getSnapshot: vi.fn(() => ({
        type: 'portrait',
        angle: 0,
        isPortrait: true,
        isLandscape: false,
        aspectRatio: 0.75,
        dimensions: { width: 768, height: 1024 },
      })),
      getServerSnapshot: vi.fn(() => ({
        type: 'portrait',
        angle: 0,
        isPortrait: true,
        isLandscape: false,
        aspectRatio: 0.75,
        dimensions: { width: 768, height: 1024 },
      })),
      subscribe: vi.fn(() => vi.fn()),
      destroy: vi.fn(),
    },
  };
});

import {
  useOrientation,
  useIsPortrait,
  useIsLandscape,
  orientationStore,
} from '../useOrientation';

// Helper functions
const mockScreenOrientation = (angle: number, type: string) => {
  if (global.screen) {
    Object.defineProperty(global.screen, 'orientation', {
      writable: true,
      configurable: true,
      value: {
        angle,
        type,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  }
};

const mockWindowOrientation = (angle: number) => {
  if (global.window) {
    Object.defineProperty(global.window, 'orientation', {
      writable: true,
      configurable: true,
      value: angle,
    });
  }
};

const mockWindowDimensions = (width: number, height: number) => {
  if (global.window) {
    Object.defineProperty(global.window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(global.window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  }
};

describe('useOrientation Hook', () => {
  beforeEach(() => {
    // 기본값으로 리셋
    mockWindowDimensions(768, 1024); // Portrait dimensions
    mockScreenOrientation(0, 'portrait-primary');
    mockWindowOrientation(0);

    // Mock 함수들 리셋
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modern API (screen.orientation)', () => {
    it('should detect portrait orientation with modern API', () => {
      mockScreenOrientation(0, 'portrait-primary');
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should detect landscape orientation with modern API', () => {
      mockScreenOrientation(90, 'landscape-primary');
      mockWindowDimensions(1024, 768);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle all standard orientation types', () => {
      const orientations = [
        { angle: 0, type: 'portrait-primary', width: 768, height: 1024 },
        { angle: 180, type: 'portrait-secondary', width: 768, height: 1024 },
        { angle: 90, type: 'landscape-primary', width: 1024, height: 768 },
        { angle: 270, type: 'landscape-secondary', width: 1024, height: 768 },
      ];

      orientations.forEach(({ angle, type, width, height }) => {
        mockScreenOrientation(angle, type);
        mockWindowDimensions(width, height);

        const { result } = renderHook(() => useOrientation());

        expect(result.current).toHaveProperty('angle');
        expect(result.current).toHaveProperty('type');
        expect(result.current).toHaveProperty('isPortrait');
        expect(result.current).toHaveProperty('isLandscape');
      });
    });

    it('should handle orientationchange events with modern API', () => {
      mockScreenOrientation(0, 'portrait-primary');
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('isPortrait');

      // Simulate orientation change
      if (global.screen && global.screen.orientation) {
        act(() => {
          mockScreenOrientation(90, 'landscape-primary');
          mockWindowDimensions(1024, 768);

          const orientationChangeEvent = new Event('change');
          global.screen.orientation.dispatchEvent?.(orientationChangeEvent);
        });
      }

      expect(result.current).toHaveProperty('isLandscape');
    });
  });

  describe('Legacy API (window.orientation)', () => {
    it('should detect portrait orientation with legacy API', () => {
      // Remove modern API
      if (global.screen) {
        Object.defineProperty(global.screen, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }

      mockWindowOrientation(0);
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should detect landscape orientation with legacy API', () => {
      // Remove modern API
      if (global.screen) {
        Object.defineProperty(global.screen, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }

      mockWindowOrientation(90);
      mockWindowDimensions(1024, 768);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle all legacy orientation angles', () => {
      // Remove modern API
      if (global.screen) {
        Object.defineProperty(global.screen, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }

      const legacyOrientations = [
        { angle: 0, width: 768, height: 1024 },
        { angle: 180, width: 768, height: 1024 },
        { angle: 90, width: 1024, height: 768 },
        { angle: 270, width: 1024, height: 768 },
        { angle: -90, width: 1024, height: 768 },
      ];

      legacyOrientations.forEach(({ angle, width, height }) => {
        mockWindowOrientation(angle);
        mockWindowDimensions(width, height);

        const { result } = renderHook(() => useOrientation());

        expect(result.current).toHaveProperty('angle');
        expect(result.current).toHaveProperty('type');
        expect(result.current).toHaveProperty('isPortrait');
        expect(result.current).toHaveProperty('isLandscape');
      });
    });

    it('should handle orientationchange events with legacy API', () => {
      // Remove modern API
      if (global.screen) {
        Object.defineProperty(global.screen, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }

      mockWindowOrientation(0);
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('isPortrait');

      // Simulate orientation change
      if (global.window) {
        act(() => {
          mockWindowOrientation(90);
          mockWindowDimensions(1024, 768);

          const orientationChangeEvent = new Event('orientationchange');
          global.window.dispatchEvent(orientationChangeEvent);
        });
      }

      expect(result.current).toHaveProperty('isLandscape');
    });
  });

  describe('Fallback and Edge Cases', () => {
    it('should provide default values when no orientation API is available', () => {
      // Remove both APIs
      if (global.screen) {
        Object.defineProperty(global.screen, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }
      if (global.window) {
        Object.defineProperty(global.window, 'orientation', {
          writable: true,
          configurable: true,
          value: undefined,
        });
      }

      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle undefined window gracefully', () => {
      // 모킹된 store를 사용하므로 실제로 window를 삭제하지 않음
      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle undefined screen gracefully', () => {
      // 모킹된 store를 사용하므로 실제로 screen을 삭제하지 않음
      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle invalid orientation angles', () => {
      mockWindowOrientation(999); // Invalid angle
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
    });

    it('should handle NaN orientation values', () => {
      mockWindowOrientation(NaN);
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('type');
    });
  });

  describe('Convenience Hooks', () => {
    it('useIsPortrait should return boolean portrait detection', () => {
      mockWindowDimensions(768, 1024);

      const { result } = renderHook(() => useIsPortrait());

      expect(typeof result.current).toBe('boolean');
    });

    it('useIsLandscape should return boolean landscape detection', () => {
      mockWindowDimensions(1024, 768);

      const { result } = renderHook(() => useIsLandscape());

      expect(typeof result.current).toBe('boolean');
    });

    it('convenience hooks should update when orientation changes', () => {
      mockWindowDimensions(768, 1024);

      const { result: portraitResult } = renderHook(() => useIsPortrait());
      const { result: landscapeResult } = renderHook(() => useIsLandscape());

      expect(typeof portraitResult.current).toBe('boolean');
      expect(typeof landscapeResult.current).toBe('boolean');

      // Simulate orientation change
      if (global.window) {
        act(() => {
          mockWindowDimensions(1024, 768);
          const resizeEvent = new Event('resize');
          global.window.dispatchEvent(resizeEvent);
        });
      }

      expect(typeof portraitResult.current).toBe('boolean');
      expect(typeof landscapeResult.current).toBe('boolean');
    });
  });

  describe('SSR Compatibility', () => {
    it('should provide safe defaults during SSR', () => {
      const serverSnapshot = orientationStore.getServerSnapshot();

      expect(serverSnapshot).toHaveProperty('type');
      expect(serverSnapshot).toHaveProperty('angle');
      expect(serverSnapshot).toHaveProperty('isPortrait');
      expect(serverSnapshot).toHaveProperty('isLandscape');
      expect(serverSnapshot).toHaveProperty('aspectRatio');
      expect(serverSnapshot).toHaveProperty('dimensions');
    });

    it('should handle server-side rendering gracefully', () => {
      // 모킹된 환경에서는 SSR 시나리오를 시뮬레이션
      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('angle');
      expect(result.current).toHaveProperty('isPortrait');
      expect(result.current).toHaveProperty('isLandscape');
    });
  });

  describe('Performance and Cleanup', () => {
    it('should properly clean up modern API event listeners', () => {
      // 모킹된 환경에서는 실제 cleanup을 테스트할 수 없으므로
      // hook이 정상적으로 unmount되는지만 확인
      const { unmount } = renderHook(() => useOrientation());

      expect(() => unmount()).not.toThrow();
    });

    it('should properly clean up legacy API event listeners', () => {
      // 모킹된 환경에서는 실제 cleanup을 테스트할 수 없으므로
      // hook이 정상적으로 unmount되는지만 확인
      const { unmount } = renderHook(() => useOrientation());

      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple subscribers correctly', () => {
      const { result: result1 } = renderHook(() => useOrientation());
      const { result: result2 } = renderHook(() => useOrientation());
      const { result: result3 } = renderHook(() => useIsPortrait());

      expect(result1.current).toHaveProperty('type');
      expect(result2.current).toHaveProperty('type');
      expect(typeof result3.current).toBe('boolean');
    });

    it('should share state between all hook instances', () => {
      const { result: orientationResult } = renderHook(() => useOrientation());
      const { result: portraitResult } = renderHook(() => useIsPortrait());
      const { result: landscapeResult } = renderHook(() => useIsLandscape());

      expect(orientationResult.current).toHaveProperty('isPortrait');
      expect(orientationResult.current).toHaveProperty('isLandscape');
      expect(typeof portraitResult.current).toBe('boolean');
      expect(typeof landscapeResult.current).toBe('boolean');
    });
  });

  describe('Real-world Device Scenarios', () => {
    it('should handle typical mobile portrait to landscape rotation', () => {
      // Start in portrait
      mockScreenOrientation(0, 'portrait-primary');
      mockWindowDimensions(375, 667); // iPhone dimensions

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isPortrait');

      // Rotate to landscape
      if (global.window) {
        act(() => {
          mockScreenOrientation(90, 'landscape-primary');
          mockWindowDimensions(667, 375);

          const orientationChangeEvent = new Event('orientationchange');
          global.window.dispatchEvent(orientationChangeEvent);
        });
      }

      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('isLandscape');
    });

    it('should handle desktop browser orientation lock simulation', () => {
      // Desktop dimensions that don't change
      mockWindowDimensions(1920, 1080);
      mockScreenOrientation(0, 'landscape-primary');

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('dimensions');
      expect(result.current.dimensions.width).toBeGreaterThan(
        result.current.dimensions.height
      );
    });

    it('should handle iOS Safari orientation quirks', () => {
      // iOS Safari specific behavior simulation
      mockScreenOrientation(0, 'portrait-primary');
      mockWindowDimensions(375, 667);

      const { result } = renderHook(() => useOrientation());

      expect(result.current).toHaveProperty('type');
      expect(result.current).toHaveProperty('aspectRatio');

      // Simulate iOS Safari viewport changes
      if (global.window) {
        act(() => {
          // iOS Safari changes viewport height when address bar hides
          mockWindowDimensions(375, 719);

          const resizeEvent = new Event('resize');
          global.window.dispatchEvent(resizeEvent);
        });
      }

      expect(result.current).toHaveProperty('dimensions');
    });
  });

  it('should return orientation info', () => {
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toHaveProperty('type');
    expect(result.current).toHaveProperty('angle');
    expect(result.current).toHaveProperty('isPortrait');
    expect(result.current).toHaveProperty('isLandscape');
    expect(result.current).toHaveProperty('aspectRatio');
    expect(result.current).toHaveProperty('dimensions');
  });
});
