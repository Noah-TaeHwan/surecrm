import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  useOrientation,
  useIsPortrait,
  useIsLandscape,
  orientationStore, 
  destroyOrientationStore 
} from '../useOrientation';

// Mock for screen.orientation (modern API)
interface MockScreenOrientation {
  angle: number;
  type: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

describe('useOrientation Hook', () => {
  const resetOrientationStore = () => {
    destroyOrientationStore();
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  const createMockScreenOrientation = (angle: number, type: string): MockScreenOrientation => ({
    angle,
    type,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  beforeEach(async () => {
    await resetOrientationStore();
    vi.clearAllMocks();
    
    // Reset screen orientation
    Object.defineProperty(screen, 'orientation', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    
    // Reset window.orientation
    Object.defineProperty(window, 'orientation', {
      writable: true,
      configurable: true,
      value: undefined,
    });
  });

  afterEach(async () => {
    await resetOrientationStore();
    vi.restoreAllMocks();
  });

  describe('Modern API (screen.orientation)', () => {
    it('should detect portrait orientation with modern API', () => {
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: createMockScreenOrientation(0, 'portrait-primary'),
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation with modern API', () => {
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: createMockScreenOrientation(90, 'landscape-primary'),
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(90);
      expect(result.current.type).toBe('landscape-primary');
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });

    it('should handle all standard orientation types', () => {
      const orientations = [
        { angle: 0, type: 'portrait-primary', isPortrait: true },
        { angle: 180, type: 'portrait-secondary', isPortrait: true },
        { angle: 90, type: 'landscape-primary', isLandscape: true },
        { angle: 270, type: 'landscape-secondary', isLandscape: true },
      ];

      orientations.forEach(({ angle, type, isPortrait = false, isLandscape = false }) => {
        Object.defineProperty(screen, 'orientation', {
          writable: true,
          configurable: true,
          value: createMockScreenOrientation(angle, type),
        });

        const { result } = renderHook(() => useOrientation());
        
        expect(result.current.angle).toBe(angle);
        expect(result.current.type).toBe(type);
        expect(result.current.isPortrait).toBe(isPortrait);
        expect(result.current.isLandscape).toBe(isLandscape);
      });
    });

    it('should handle orientationchange events with modern API', () => {
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.isPortrait).toBe(true);

      // Simulate orientation change
      act(() => {
        mockOrientation.angle = 90;
        mockOrientation.type = 'landscape-primary';
        
        // Trigger the event handler that was registered
        const eventHandler = mockOrientation.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (eventHandler) {
          eventHandler();
        }
      });

      expect(result.current.angle).toBe(90);
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });
  });

  describe('Legacy API (window.orientation)', () => {
    it('should detect portrait orientation with legacy API', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // Set legacy API
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation with legacy API', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // Set legacy API
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: 90,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(90);
      expect(result.current.type).toBe('landscape-primary');
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });

    it('should handle all legacy orientation angles', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const legacyOrientations = [
        { angle: 0, expectedType: 'portrait-primary', isPortrait: true },
        { angle: 180, expectedType: 'portrait-secondary', isPortrait: true },
        { angle: -180, expectedType: 'portrait-secondary', isPortrait: true },
        { angle: 90, expectedType: 'landscape-primary', isLandscape: true },
        { angle: -90, expectedType: 'landscape-secondary', isLandscape: true },
        { angle: 270, expectedType: 'landscape-secondary', isLandscape: true },
      ];

      legacyOrientations.forEach(({ angle, expectedType, isPortrait = false, isLandscape = false }) => {
        Object.defineProperty(window, 'orientation', {
          writable: true,
          configurable: true,
          value: angle,
        });

        const { result } = renderHook(() => useOrientation());
        
        expect(result.current.angle).toBe(angle);
        expect(result.current.type).toBe(expectedType);
        expect(result.current.isPortrait).toBe(isPortrait);
        expect(result.current.isLandscape).toBe(isLandscape);
      });
    });

    it('should handle orientationchange events with legacy API', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // Set initial legacy orientation
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.isPortrait).toBe(true);

      // Simulate orientation change
      act(() => {
        Object.defineProperty(window, 'orientation', {
          writable: true,
          configurable: true,
          value: 90,
        });
        
        // Trigger the event handler
        const eventHandler = addEventListenerSpy.mock.calls
          .find(call => call[0] === 'orientationchange')?.[1];
        if (eventHandler) {
          (eventHandler as EventListener)(new Event('orientationchange'));
        }
      });

      expect(result.current.angle).toBe(90);
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
      
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Fallback and Edge Cases', () => {
    it('should provide default values when no orientation API is available', () => {
      // Remove both APIs
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });
      
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);

      // Restore window
      global.window = originalWindow;
    });

    it('should handle undefined screen gracefully', () => {
      const originalScreen = global.screen;
      
      // @ts-ignore
      delete global.screen;

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);

      // Restore screen
      global.screen = originalScreen;
    });

    it('should handle invalid orientation angles', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // Set invalid legacy orientation
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: 45, // Invalid angle
      });

      const { result } = renderHook(() => useOrientation());
      
      // Should fallback to portrait for unknown angles
      expect(result.current.angle).toBe(45);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should handle NaN orientation values', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // Set NaN legacy orientation
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: NaN,
      });

      const { result } = renderHook(() => useOrientation());
      
      // Should fallback to default
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });
  });

  describe('Convenience Hooks', () => {
    it('useIsPortrait should return boolean portrait detection', () => {
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: createMockScreenOrientation(0, 'portrait-primary'),
      });

      const { result } = renderHook(() => useIsPortrait());
      
      expect(result.current).toBe(true);
      expect(typeof result.current).toBe('boolean');
    });

    it('useIsLandscape should return boolean landscape detection', () => {
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: createMockScreenOrientation(90, 'landscape-primary'),
      });

      const { result } = renderHook(() => useIsLandscape());
      
      expect(result.current).toBe(true);
      expect(typeof result.current).toBe('boolean');
    });

    it('convenience hooks should update when orientation changes', () => {
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result: portraitResult } = renderHook(() => useIsPortrait());
      const { result: landscapeResult } = renderHook(() => useIsLandscape());
      
      expect(portraitResult.current).toBe(true);
      expect(landscapeResult.current).toBe(false);

      // Simulate orientation change
      act(() => {
        mockOrientation.angle = 90;
        mockOrientation.type = 'landscape-primary';
        
        const eventHandler = mockOrientation.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (eventHandler) {
          eventHandler();
        }
      });

      expect(portraitResult.current).toBe(false);
      expect(landscapeResult.current).toBe(true);
    });
  });

  describe('SSR Compatibility', () => {
    it('should provide safe defaults during SSR', () => {
      const serverSnapshot = orientationStore.getServerSnapshot();
      
      expect(serverSnapshot.angle).toBe(0);
      expect(serverSnapshot.type).toBe('portrait-primary');
      expect(serverSnapshot.isPortrait).toBe(true);
      expect(serverSnapshot.isLandscape).toBe(false);
    });

    it('should handle server-side rendering gracefully', () => {
      // Simulate SSR environment
      const originalWindow = global.window;
      const originalScreen = global.screen;
      
      // @ts-ignore
      delete global.window;
      // @ts-ignore  
      delete global.screen;

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);

      // Restore globals
      global.window = originalWindow;
      global.screen = originalScreen;
    });
  });

  describe('Performance and Cleanup', () => {
    it('should properly clean up modern API event listeners', () => {
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { unmount } = renderHook(() => useOrientation());
      
      expect(mockOrientation.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      unmount();
      destroyOrientationStore();
      
      expect(mockOrientation.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should properly clean up legacy API event listeners', () => {
      // Remove modern API
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: 0,
      });

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useOrientation());
      
      unmount();
      destroyOrientationStore();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should handle multiple subscribers correctly', () => {
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result: result1 } = renderHook(() => useOrientation());
      const { result: result2 } = renderHook(() => useOrientation());
      const { result: result3 } = renderHook(() => useIsPortrait());

      expect(result1.current.isPortrait).toBe(true);
      expect(result2.current.isPortrait).toBe(true);
      expect(result3.current).toBe(true);

      act(() => {
        mockOrientation.angle = 90;
        mockOrientation.type = 'landscape-primary';
        
        const eventHandler = mockOrientation.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (eventHandler) {
          eventHandler();
        }
      });

      expect(result1.current.isLandscape).toBe(true);
      expect(result2.current.isLandscape).toBe(true);
      expect(result3.current).toBe(false);
    });

    it('should share state between all hook instances', () => {
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result: fullResult } = renderHook(() => useOrientation());
      const { result: portraitResult } = renderHook(() => useIsPortrait());
      const { result: landscapeResult } = renderHook(() => useIsLandscape());

      // All should start with portrait
      expect(fullResult.current.isPortrait).toBe(true);
      expect(portraitResult.current).toBe(true);
      expect(landscapeResult.current).toBe(false);

      // Change to landscape
      act(() => {
        mockOrientation.angle = 90;
        mockOrientation.type = 'landscape-primary';
        
        const eventHandler = mockOrientation.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (eventHandler) {
          eventHandler();
        }
      });

      // All should update to landscape
      expect(fullResult.current.isLandscape).toBe(true);
      expect(portraitResult.current).toBe(false);
      expect(landscapeResult.current).toBe(true);
    });
  });

  describe('Real-world Device Scenarios', () => {
    it('should handle typical mobile portrait to landscape rotation', () => {
      // Start in portrait
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.type).toBe('portrait-primary');
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);

      // Rotate to landscape
      act(() => {
        mockOrientation.angle = 90;
        mockOrientation.type = 'landscape-primary';
        
        const eventHandler = mockOrientation.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (eventHandler) {
          eventHandler();
        }
      });

      expect(result.current.angle).toBe(90);
      expect(result.current.type).toBe('landscape-primary');
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });

    it('should handle desktop browser orientation lock simulation', () => {
      // Desktop browsers might not change orientation
      const mockOrientation = createMockScreenOrientation(0, 'portrait-primary');
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: mockOrientation,
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(0);
      expect(result.current.isPortrait).toBe(true);

      // Orientation doesn't change on desktop
      // This just verifies the hook handles stable orientation correctly
      setTimeout(() => {
        expect(result.current.angle).toBe(0);
        expect(result.current.isPortrait).toBe(true);
      }, 100);
    });

    it('should handle iOS Safari orientation quirks', () => {
      // iOS Safari sometimes reports different values
      // Remove modern API to simulate older iOS
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      // iOS Safari legacy values
      Object.defineProperty(window, 'orientation', {
        writable: true,
        configurable: true,
        value: -90, // iOS reports -90 for landscape
      });

      const { result } = renderHook(() => useOrientation());
      
      expect(result.current.angle).toBe(-90);
      expect(result.current.type).toBe('landscape-secondary');
      expect(result.current.isLandscape).toBe(true);
    });
  });
}); 