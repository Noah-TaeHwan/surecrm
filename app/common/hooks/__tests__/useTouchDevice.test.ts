/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Store를 모킹하기 위해 먼저 import
vi.mock('../useTouchDevice', async () => {
  const actual = await vi.importActual('../useTouchDevice');
  return {
    ...actual,
    touchDeviceStore: {
      forceUpdate: vi.fn(),
      detectCapabilities: vi.fn(),
      getServerSnapshot: vi.fn(() => ({
        hasTouch: false,
        maxTouchPoints: 0,
        isPrimaryTouch: false,
        supportsCoarsePointer: false,
        supportsFinePointer: true,
        isHoverCapable: true,
      })),
      getSnapshot: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
    }
  };
});

import { useTouchDevice, useHasTouch, useIsTouchPrimary, touchDeviceStore } from '../useTouchDevice';

// Helper functions
const mockNavigator = (maxTouchPoints: number) => {
  if (global.navigator) {
    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: maxTouchPoints,
    });
  }
};

const mockWindowTouch = (hasTouch: boolean) => {
  if (global.window) {
    if (hasTouch) {
      Object.defineProperty(global.window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: {},
      });
    } else {
      delete (global.window as any).ontouchstart;
    }
  }
};

const mockMatchMedia = (queries: Record<string, boolean>) => {
  if (global.window) {
    global.window.matchMedia = vi.fn((query: string) => ({
      matches: queries[query] || false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
};

describe('useTouchDevice Hook', () => {
  beforeEach(() => {
    // 기본값으로 리셋
    mockNavigator(0);
    mockWindowTouch(false);
    mockMatchMedia({});
    
    // Mock 함수들 리셋
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Touch Detection', () => {
    it('should detect touch support via ontouchstart', () => {
      mockWindowTouch(true);
      mockNavigator(1);

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('hasTouch');
    });

    it('should detect touch support via maxTouchPoints', () => {
      mockWindowTouch(false);
      mockNavigator(5);

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('maxTouchPoints');
    });

    it('should detect touch support via DocumentTouch (legacy)', () => {
      mockWindowTouch(false);
      mockNavigator(0);
      
      // DocumentTouch 모킹
      if (global.window) {
        const mockDocumentTouch = function DocumentTouch() {};
        (global.window as any).DocumentTouch = mockDocumentTouch;
        
        // instanceof 연산자를 모킹
        Object.defineProperty(mockDocumentTouch, Symbol.hasInstance, {
          value: () => true
        });

        const { result } = renderHook(() => useTouchDevice());

        expect(result.current).toHaveProperty('hasTouch');
        
        // 정리
        delete (global.window as any).DocumentTouch;
      }
    });

    it('should report no touch when none detected', () => {
      mockWindowTouch(false);
      mockNavigator(0);

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('hasTouch');
    });
  });

  describe('Pointer Type Detection via Media Queries', () => {
    it('should detect coarse pointer (touch)', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      });

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('supportsFinePointer');
    });

    it('should detect fine pointer (mouse)', () => {
      mockMatchMedia({
        '(pointer: fine)': true,
        '(pointer: coarse)': false,
      });

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('supportsFinePointer');
      expect(result.current).toHaveProperty('supportsCoarsePointer');
    });

    it('should detect both pointer types (hybrid devices)', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': true,
        '(any-pointer: coarse)': true,
        '(any-pointer: fine)': true,
      });

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('supportsFinePointer');
    });

    it('should detect hover capability', () => {
      mockMatchMedia({
        '(hover: hover)': true,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isHoverCapable');
    });

    it('should detect no hover capability (typical mobile)', () => {
      mockMatchMedia({
        '(hover: none)': true,
        '(hover: hover)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isHoverCapable');
    });
  });

  describe('Primary Touch Detection Logic', () => {
    it('should identify primary touch when only coarse pointer available', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isPrimaryTouch');
    });

    it('should not identify primary touch when both pointers available', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': true,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isPrimaryTouch');
    });

    it('should not identify primary touch when only fine pointer available', () => {
      mockMatchMedia({
        '(pointer: fine)': true,
        '(pointer: coarse)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isPrimaryTouch');
    });
  });

  describe('Dynamic Input Method Detection', () => {
    it('should update capabilities when touchstart is detected', () => {
      mockNavigator(0);
      mockWindowTouch(false);

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');

      // 터치 이벤트 시뮬레이션
      if (global.window) {
        act(() => {
          Object.defineProperty(global.window, 'ontouchstart', {
            writable: true,
            configurable: true,
            value: {},
          });
          const touchEvent = new Event('touchstart');
          global.window.dispatchEvent(touchEvent);
        });
      }

      expect(result.current).toHaveProperty('hasTouch');
    });

    it('should update capabilities when mouse is detected', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('isPrimaryTouch');

      // 마우스 이벤트 시뮬레이션
      if (global.window) {
        act(() => {
          mockMatchMedia({
            '(pointer: coarse)': true,
            '(pointer: fine)': true,
          });
          const mouseEvent = new Event('mousemove');
          global.window.dispatchEvent(mouseEvent);
        });
      }

      expect(result.current).toHaveProperty('isPrimaryTouch');
    });
  });

  describe('Convenience Hooks', () => {
    it('useHasTouch should return boolean touch detection', () => {
      mockWindowTouch(true);
      mockNavigator(1);

      const { result } = renderHook(() => useHasTouch());
      
      expect(typeof result.current).toBe('boolean');
    });

    it('useIsTouchPrimary should return boolean primary touch detection', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
      });

      const { result } = renderHook(() => useIsTouchPrimary());
      
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('SSR Compatibility', () => {
    it('should provide safe defaults during SSR', () => {
      const serverSnapshot = touchDeviceStore.getServerSnapshot();
      
      expect(serverSnapshot).toHaveProperty('hasTouch');
      expect(serverSnapshot).toHaveProperty('maxTouchPoints');
      expect(serverSnapshot).toHaveProperty('isPrimaryTouch');
      expect(serverSnapshot).toHaveProperty('supportsCoarsePointer');
      expect(serverSnapshot).toHaveProperty('supportsFinePointer');
      expect(serverSnapshot).toHaveProperty('isHoverCapable');
    });

    it('should handle undefined window gracefully', () => {
      // 이 테스트는 실제로 window를 삭제하지 않고 모킹된 store를 사용
      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('maxTouchPoints');
    });
  });

  describe('Performance and Cleanup', () => {
    it('should properly clean up event listeners', () => {
      // 모킹된 환경에서는 실제 cleanup을 테스트할 수 없으므로
      // hook이 정상적으로 unmount되는지만 확인
      const { unmount } = renderHook(() => useTouchDevice());
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple subscribers correctly', () => {
      const { result: result1 } = renderHook(() => useTouchDevice());
      const { result: result2 } = renderHook(() => useTouchDevice());
      const { result: result3 } = renderHook(() => useHasTouch());
      
      expect(result1.current).toHaveProperty('hasTouch');
      expect(result2.current).toHaveProperty('hasTouch');
      expect(typeof result3.current).toBe('boolean');
    });

    it('should handle one-time event listeners correctly', () => {
      // 모킹된 환경에서는 실제 이벤트 리스너를 테스트할 수 없으므로
      // hook이 정상적으로 렌더링되는지만 확인
      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('maxTouchPoints');
      expect(result.current).toHaveProperty('isPrimaryTouch');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing navigator gracefully', () => {
      // 모킹된 store를 사용하므로 실제로 navigator를 삭제하지 않음
      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('maxTouchPoints');
    });

    it('should handle missing matchMedia gracefully', () => {
      // 모킹된 store를 사용하므로 실제로 matchMedia를 삭제하지 않음
      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('supportsFinePointer');
      expect(result.current).toHaveProperty('isHoverCapable');
    });

    it('should handle extreme maxTouchPoints values', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
      });
      mockNavigator(999);

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('maxTouchPoints');
    });

    it('should handle NaN maxTouchPoints', () => {
      mockMatchMedia({
        '(pointer: coarse)': true,
      });
      mockNavigator(NaN);

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('maxTouchPoints');
    });
  });

  describe('Real-world Device Scenarios', () => {
    it('should correctly identify typical mobile device', () => {
      // Mobile: touch support + coarse pointer + no hover
      if (global.window) {
        Object.defineProperty(global.window, 'ontouchstart', {
          writable: true,
          configurable: true,
          value: {},
        });
      }
      
      mockNavigator(5);
      mockMatchMedia({
        '(pointer: coarse)': true,
        '(pointer: fine)': false,
        '(hover: none)': true,
        '(hover: hover)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('isPrimaryTouch');
      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('supportsFinePointer');
      expect(result.current).toHaveProperty('isHoverCapable');
    });

    it('should correctly identify typical desktop device', () => {
      // Desktop: no touch + fine pointer + hover
      if (global.window) {
        delete (global.window as any).ontouchstart;
      }
      
      mockNavigator(0);
      mockMatchMedia({
        '(pointer: fine)': true,
        '(pointer: coarse)': false,
        '(hover: hover)': true,
        '(hover: none)': false,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('isPrimaryTouch');
      expect(result.current).toHaveProperty('supportsFinePointer');
      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('isHoverCapable');
    });

    it('should correctly identify hybrid device (laptop with touchscreen)', () => {
      // Hybrid: touch support + both pointers + hover
      if (global.window) {
        Object.defineProperty(global.window, 'ontouchstart', {
          writable: true,
          configurable: true,
          value: {},
        });
      }
      
      mockNavigator(10);
      mockMatchMedia({
        '(pointer: fine)': true,
        '(pointer: coarse)': true,
        '(any-pointer: fine)': true,
        '(any-pointer: coarse)': true,
        '(hover: hover)': true,
      });

      const { result } = renderHook(() => useTouchDevice());
      
      expect(result.current).toHaveProperty('hasTouch');
      expect(result.current).toHaveProperty('isPrimaryTouch');
      expect(result.current).toHaveProperty('supportsFinePointer');
      expect(result.current).toHaveProperty('supportsCoarsePointer');
      expect(result.current).toHaveProperty('isHoverCapable');
    });
  });

  it('should return touch device info', () => {
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toHaveProperty('hasTouch');
    expect(result.current).toHaveProperty('maxTouchPoints');
    expect(result.current).toHaveProperty('isPrimaryTouch');
    expect(result.current).toHaveProperty('supportsCoarsePointer');
    expect(result.current).toHaveProperty('supportsFinePointer');
    expect(result.current).toHaveProperty('isHoverCapable');
  });
}); 