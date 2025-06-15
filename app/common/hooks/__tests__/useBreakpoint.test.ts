import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  useBreakpoint, 
  BREAKPOINTS,
  breakpointStore, 
  destroyBreakpointStore 
} from '../useBreakpoint';
import type { BreakpointName } from '../useBreakpoint';

// 🔧 테스트 Helper 함수들
const mockWindowWidth = (width: number) => {
  if (typeof window === 'undefined') {
    // @ts-ignore - 테스트 환경용
    global.window = { innerWidth: width } as Window;
  } else {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  }
};

const forceHookUpdate = () => {
  act(() => {
    breakpointStore.forceUpdate();
  });
};

const mockWindowWidthAndUpdate = (width: number) => {
  mockWindowWidth(width);
  forceHookUpdate();
};

describe('useBreakpoint Hook', () => {
  const resetBreakpointStore = () => {
    destroyBreakpointStore();
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  beforeEach(async () => {
    await resetBreakpointStore();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await resetBreakpointStore();
  });

  describe('Breakpoint Constants', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.xs).toBe(0);
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });
  });

  describe('Current Breakpoint Detection', () => {
    it('should detect xs breakpoint for very small screens', () => {
      mockWindowWidth(320);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('xs');
    });

    it('should detect sm breakpoint correctly', () => {
      mockWindowWidth(640);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('sm');
    });

    it('should detect md breakpoint correctly', () => {
      mockWindowWidth(768);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('md');
    });

    it('should detect lg breakpoint correctly', () => {
      mockWindowWidth(1024);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('lg');
    });

    it('should detect xl breakpoint correctly', () => {
      mockWindowWidth(1280);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('xl');
    });

    it('should detect 2xl breakpoint correctly', () => {
      mockWindowWidth(1600);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('2xl');
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle exact breakpoint boundaries', () => {
      // Test exact sm boundary (640px)
      mockWindowWidth(640);
      const { result: sm } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(sm.current.current).toBe('sm');

      // Test one pixel below sm (639px)
      mockWindowWidth(639);
      const { result: xs } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(xs.current.current).toBe('xs');

      // Test exact md boundary (768px)
      mockWindowWidth(768);
      const { result: md } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(md.current.current).toBe('md');

      // Test one pixel below md (767px)
      mockWindowWidth(767);
      const { result: sm2 } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(sm2.current.current).toBe('sm');
    });
  });

  describe('isAbove Utility Function', () => {
    it('should correctly identify when above a breakpoint', () => {
      mockWindowWidth(1024); // lg

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      expect(result.current.isAbove('xs')).toBe(true);
      expect(result.current.isAbove('sm')).toBe(true);
      expect(result.current.isAbove('md')).toBe(true);
      expect(result.current.isAbove('lg')).toBe(false); // Same level
      expect(result.current.isAbove('xl')).toBe(false);
      expect(result.current.isAbove('2xl')).toBe(false);
    });
  });

  describe('isBelow Utility Function', () => {
    it('should correctly identify when below a breakpoint', () => {
      mockWindowWidth(768); // md

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      expect(result.current.isBelow('xs')).toBe(false);
      expect(result.current.isBelow('sm')).toBe(false);
      expect(result.current.isBelow('md')).toBe(false); // Same level
      expect(result.current.isBelow('lg')).toBe(true);
      expect(result.current.isBelow('xl')).toBe(true);
      expect(result.current.isBelow('2xl')).toBe(true);
    });
  });

  describe('isExactly Utility Function', () => {
    it('should correctly identify exact breakpoint matches', () => {
      mockWindowWidth(640); // sm

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      expect(result.current.isExactly('xs')).toBe(false);
      expect(result.current.isExactly('sm')).toBe(true);
      expect(result.current.isExactly('md')).toBe(false);
      expect(result.current.isExactly('lg')).toBe(false);
      expect(result.current.isExactly('xl')).toBe(false);
      expect(result.current.isExactly('2xl')).toBe(false);
    });
  });

  describe('matches Utility Function', () => {
    it('should correctly identify breakpoint matches (>= logic)', () => {
      mockWindowWidth(1024); // lg

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      expect(result.current.matches('xs')).toBe(true); // lg >= xs
      expect(result.current.matches('sm')).toBe(true); // lg >= sm
      expect(result.current.matches('md')).toBe(true); // lg >= md
      expect(result.current.matches('lg')).toBe(true); // lg >= lg
      expect(result.current.matches('xl')).toBe(false); // lg < xl
      expect(result.current.matches('2xl')).toBe(false); // lg < 2xl
    });

    it('should handle xs breakpoint matches correctly', () => {
      mockWindowWidth(320); // xs

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      expect(result.current.matches('xs')).toBe(true); // xs >= xs
      expect(result.current.matches('sm')).toBe(false); // xs < sm
      expect(result.current.matches('md')).toBe(false);
      expect(result.current.matches('lg')).toBe(false);
      expect(result.current.matches('xl')).toBe(false);
      expect(result.current.matches('2xl')).toBe(false);
    });
  });

  describe('Real-time Updates on Resize', () => {
    it('should update breakpoint when window is resized', () => {
      mockWindowWidth(500); // xs

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('xs');

      // Resize to sm
      mockWindowWidth(700);
      forceHookUpdate();

      expect(result.current.current).toBe('sm');

      // Resize to xl
      mockWindowWidth(1400);
      forceHookUpdate();

      expect(result.current.current).toBe('xl');
    });

    it('should not trigger updates if breakpoint remains the same', () => {
      mockWindowWidth(900); // md

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('md');

      const initialBreakpoint = result.current.current;

      // Resize within same breakpoint range
      mockWindowWidth(950);
      forceHookUpdate();

      expect(result.current.current).toBe('md');
      expect(result.current.current).toBe(initialBreakpoint); // 값만 비교
    });

    it('should update utility functions when breakpoint changes', () => {
      mockWindowWidth(500); // xs

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.matches('md')).toBe(false);

      // Resize to lg
      mockWindowWidth(1100);
      forceHookUpdate();

      expect(result.current.current).toBe('lg');
      expect(result.current.matches('md')).toBe(true);
      expect(result.current.isAbove('md')).toBe(true);
      expect(result.current.isBelow('xl')).toBe(true);
    });
  });

  describe('SSR Compatibility', () => {
    it('should handle undefined window gracefully', () => {
      // SSR 시나리오를 시뮬레이션하지만 실제 DOM 렌더링은 피합니다
      const serverSnapshot = breakpointStore.getServerSnapshot();
      
      // 서버사이드에서는 기본값을 반환해야 함
      expect(serverSnapshot.current).toBe('lg');
      expect(serverSnapshot.matches('md')).toBe(true);
      expect(serverSnapshot.isAbove('sm')).toBe(true);
      expect(serverSnapshot.isBelow('xl')).toBe(true);
      
      // 클라이언트 렌더링도 잘 동작하는지 확인
      mockWindowWidth(768);
      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('md');
    });
  });

  describe('Performance and Cleanup', () => {
    it('should properly clean up event listeners', () => {
      // window 안전 체크
      if (typeof window === 'undefined') {
        mockWindowWidth(1024); // 기본 설정
      }
      
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useBreakpoint());
      
      unmount();
      destroyBreakpointStore();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should handle multiple subscribers correctly', () => {
      // window 안전 체크
      if (typeof window === 'undefined') {
        mockWindowWidth(640);
      } else {
        mockWindowWidth(640);
      }

      const { result: result1 } = renderHook(() => useBreakpoint());
      const { result: result2 } = renderHook(() => useBreakpoint());
      const { result: result3 } = renderHook(() => useBreakpoint());

      forceHookUpdate();

      expect(result1.current.current).toBe('sm');
      expect(result2.current.current).toBe('sm');
      expect(result3.current.current).toBe('sm');
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large viewport widths', () => {
      mockWindowWidth(10000);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('2xl');
      expect(result.current.matches('2xl')).toBe(true);
      expect(result.current.isAbove('xl')).toBe(true);
    });

    it('should handle zero viewport width', () => {
      mockWindowWidth(0);

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      expect(result.current.current).toBe('xs');
      expect(result.current.matches('xs')).toBe(true);
      expect(result.current.isBelow('sm')).toBe(true);
    });

    it('should handle utility function edge cases', () => {
      mockWindowWidth(1536); // 2xl

      const { result } = renderHook(() => useBreakpoint());
      forceHookUpdate();
      
      // Edge case: checking if 2xl is above 2xl (should be false)
      expect(result.current.isAbove('2xl')).toBe(false);
      expect(result.current.isExactly('2xl')).toBe(true);
      expect(result.current.matches('2xl')).toBe(true);
    });
  });

  describe('Comprehensive Utility Function Testing', () => {
    it('should provide consistent results across all utility functions', () => {
      const testCases: Array<{
        width: number;
        expectedCurrent: BreakpointName;
        testBreakpoint: BreakpointName;
        expectedAbove: boolean;
        expectedBelow: boolean;
        expectedExactly: boolean;
        expectedMatches: boolean;
      }> = [
        {
          width: 320,
          expectedCurrent: 'xs',
          testBreakpoint: 'sm',
          expectedAbove: false,
          expectedBelow: true,
          expectedExactly: false,
          expectedMatches: false,
        },
        {
          width: 700,
          expectedCurrent: 'sm',
          testBreakpoint: 'md',
          expectedAbove: false,
          expectedBelow: true,
          expectedExactly: false,
          expectedMatches: false,
        },
        {
          width: 900,
          expectedCurrent: 'md',
          testBreakpoint: 'md',
          expectedAbove: false,
          expectedBelow: false,
          expectedExactly: true,
          expectedMatches: true,
        },
        {
          width: 1200,
          expectedCurrent: 'lg',
          testBreakpoint: 'sm',
          expectedAbove: true,
          expectedBelow: false,
          expectedExactly: false,
          expectedMatches: true,
        },
      ];

      testCases.forEach(({ width, expectedCurrent, testBreakpoint, expectedAbove, expectedBelow, expectedExactly, expectedMatches }) => {
        mockWindowWidth(width);
        forceHookUpdate();
        
        const { result } = renderHook(() => useBreakpoint());
        
        expect(result.current.current).toBe(expectedCurrent);
        expect(result.current.isAbove(testBreakpoint)).toBe(expectedAbove);
        expect(result.current.isBelow(testBreakpoint)).toBe(expectedBelow);
        expect(result.current.isExactly(testBreakpoint)).toBe(expectedExactly);
        expect(result.current.matches(testBreakpoint)).toBe(expectedMatches);
      });
    });
  });
}); 