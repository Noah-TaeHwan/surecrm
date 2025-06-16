import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useDeviceType,
  deviceTypeStore,
  destroyDeviceTypeStore,
} from '../useDeviceType';

// Mock navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

// Mock window.innerWidth
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Helper to force hook update after mocking
const forceHookUpdate = () => {
  act(() => {
    deviceTypeStore.forceUpdate();
  });
};

describe('useDeviceType Hook', () => {
  const resetDeviceTypeStore = () => {
    destroyDeviceTypeStore();
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  beforeEach(async () => {
    await resetDeviceTypeStore();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await resetDeviceTypeStore();
  });

  beforeEach(() => {
    // Reset to default desktop state
    mockWindowWidth(1200);
    mockUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
  });

  describe('Viewport Width-based Detection', () => {
    it('should detect mobile for viewport width < 768px', () => {
      mockWindowWidth(375); // iPhone width

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');
    });

    it('should detect tablet for viewport width 768px-1023px', () => {
      mockWindowWidth(768); // Tablet width

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('tablet');
    });

    it('should detect desktop for viewport width >= 1024px', () => {
      mockWindowWidth(1200); // Desktop width

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('desktop');
    });

    it('should detect mobile at boundary (767px)', () => {
      mockWindowWidth(767);

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');
    });

    it('should detect tablet at boundary (768px)', () => {
      mockWindowWidth(768);

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('tablet');
    });

    it('should detect tablet at upper boundary (1023px)', () => {
      mockWindowWidth(1023);

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('tablet');
    });

    it('should detect desktop at boundary (1024px)', () => {
      mockWindowWidth(1024);

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('desktop');
    });
  });

  describe('User Agent-based Detection', () => {
    it('should detect mobile from iPhone user agent', () => {
      mockWindowWidth(1200); // Wide viewport
      mockUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');
    });

    it('should detect mobile from Android user agent', () => {
      mockWindowWidth(1200); // Wide viewport
      mockUserAgent(
        'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      );

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');
    });

    it('should detect tablet from iPad user agent', () => {
      mockWindowWidth(1200); // Wide viewport
      mockUserAgent(
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      );

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('tablet');
    });

    it('should detect tablet from Android tablet user agent', () => {
      mockWindowWidth(1200); // Wide viewport
      mockUserAgent(
        'Mozilla/5.0 (Linux; Android 9; SM-T820) AppleWebKit/537.36 tablet'
      );

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('tablet');
    });

    it('should detect desktop from desktop user agent', () => {
      mockWindowWidth(1200);
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('desktop');
    });
  });

  describe('Real-time Updates', () => {
    it('should update when viewport width changes', () => {
      // Start with mobile width and desktop user agent
      mockWindowWidth(375);
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ); // Desktop user agent

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');

      // Change to desktop width and update
      act(() => {
        mockWindowWidth(1200);
        window.dispatchEvent(new Event('resize'));
        // Force update to ensure store recalculates with new width
        deviceTypeStore.forceUpdate();
      });

      expect(result.current).toBe('desktop');
    });

    it('should not update if device type remains the same', () => {
      mockWindowWidth(800); // Tablet width
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ); // Desktop user agent

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      const initialType = result.current;
      expect(initialType).toBe('tablet');

      // Change width but stay in tablet range
      act(() => {
        mockWindowWidth(900);
        window.dispatchEvent(new Event('resize'));
        deviceTypeStore.forceUpdate();
      });

      expect(result.current).toBe('tablet');
    });
  });

  describe('SSR Compatibility', () => {
    it('should return desktop as default during SSR', () => {
      // Mock SSR environment by temporarily removing window
      const originalWindow = global.window;
      const originalDocument = global.document;

      // @ts-ignore - intentionally deleting for test
      delete global.window;
      // @ts-ignore - intentionally deleting for test
      delete global.document;

      try {
        // Create a new store instance for SSR test
        const serverSnapshot = deviceTypeStore.getServerSnapshot();
        expect(serverSnapshot).toBe('desktop');
      } finally {
        // Restore window and document
        global.window = originalWindow;
        global.document = originalDocument;
      }
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders for same device type', () => {
      mockWindowWidth(800); // Tablet
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ); // Desktop user agent

      const renderSpy = vi.fn();
      const { result } = renderHook(() => {
        renderSpy();
        return useDeviceType();
      });

      forceHookUpdate();

      const initialRenderCount = renderSpy.mock.calls.length;
      expect(result.current).toBe('tablet');

      // Trigger resize but keep same device type
      act(() => {
        mockWindowWidth(850); // Still tablet
        window.dispatchEvent(new Event('resize'));
      });

      // Should not re-render since device type didn't change
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small viewport widths', () => {
      mockWindowWidth(1); // Extremely small width
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ); // Desktop user agent

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('mobile');
    });

    it('should handle very large viewport widths', () => {
      mockWindowWidth(5000); // Extremely large width
      mockUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ); // Desktop user agent

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('desktop');
    });

    it('should handle malformed user agent strings', () => {
      mockWindowWidth(1200); // Desktop width
      mockUserAgent(''); // Empty user agent

      const { result } = renderHook(() => useDeviceType());
      forceHookUpdate();

      expect(result.current).toBe('desktop');
    });
  });
});
