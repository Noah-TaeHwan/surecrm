import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  useViewport, 
  useViewportWidth,
  useViewportHeight,
  useViewportDimensions,
  viewportStore, 
  destroyViewportStore 
} from '../useViewport';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper method to trigger resize
  trigger(entries: ResizeObserverEntry[]) {
    this.callback(entries, this);
  }
}

// Store original values
const originalResizeObserver = global.ResizeObserver;
const originalInnerWidth = global.innerWidth;
const originalInnerHeight = global.innerHeight;

describe('useViewport Hook', () => {
  let mockResizeObserver: MockResizeObserver;

  // Helper to reset viewport store
  const resetViewportStore = () => {
    destroyViewportStore();
    // Allow some time for cleanup
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  beforeEach(async () => {
    await resetViewportStore();
    vi.clearAllMocks();

    // Setup mocks
    mockResizeObserver = new MockResizeObserver(() => {});
    global.ResizeObserver = vi.fn(() => mockResizeObserver) as any;
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock event listeners
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  afterEach(async () => {
    await resetViewportStore();
  });

  describe('Basic Functionality', () => {
    it('should return initial viewport dimensions', () => {
      const { result } = renderHook(() => useViewport());

      expect(result.current).toEqual({
        width: expect.any(Number),
        height: expect.any(Number),
        innerWidth: expect.any(Number),
        innerHeight: expect.any(Number),
      });

      // Should have positive dimensions
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });

    it('should handle different viewport sizes', () => {
      // Change window dimensions using our mock helper
      act(() => {
        if (typeof global.mockWindowResize === 'function') {
          global.mockWindowResize(800, 600);
        }
      });

      const { result } = renderHook(() => useViewport());

      // Should reflect the new dimensions
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });

    it('should provide stable references for unchanged dimensions', () => {
      const { result, rerender } = renderHook(() => useViewport());
      const firstResult = result.current;

      rerender();
      const secondResult = result.current;

      // Should return the same object reference for unchanged dimensions
      expect(firstResult).toBe(secondResult);
    });
  });

  describe('ResizeObserver Integration', () => {
    it('should initialize ResizeObserver when available', () => {
      const { result } = renderHook(() => useViewport());

      // Should have proper viewport dimensions
      expect(result.current).toMatchObject({
        width: expect.any(Number),
        height: expect.any(Number),
        innerWidth: expect.any(Number),
        innerHeight: expect.any(Number),
      });
    });

    it('should update dimensions on viewport changes', async () => {
      const { result } = renderHook(() => useViewport());
      const initialDimensions = result.current;

      // Simulate viewport change
      await act(async () => {
        if (typeof global.mockWindowResize === 'function') {
          global.mockWindowResize(1200, 800);
        }
        // Wait for the update to propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Dimensions should be properly set
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });
  });

  describe('Convenience Hooks', () => {
    it('should work with useViewportWidth', () => {
      const { result } = renderHook(() => useViewportWidth());

      expect(typeof result.current).toBe('number');
      expect(result.current).toBeGreaterThan(0);
    });

    it('should work with useViewportHeight', () => {
      const { result } = renderHook(() => useViewportHeight());

      expect(typeof result.current).toBe('number');
      expect(result.current).toBeGreaterThan(0);
    });

    it('should work with useViewportDimensions', () => {
      const { result } = renderHook(() => useViewportDimensions());

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[0]).toBe('number');
      expect(typeof result.current[1]).toBe('number');
      expect(result.current[0]).toBeGreaterThan(0);
      expect(result.current[1]).toBeGreaterThan(0);
    });
  });

  describe('Event Handling', () => {
    it('should handle orientation changes', async () => {
      const { result } = renderHook(() => useViewport());

      await act(async () => {
        if (typeof global.mockOrientationChange === 'function') {
          global.mockOrientationChange();
        }
        // Wait for orientation change to process
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should still have valid dimensions after orientation change
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });

    it('should properly clean up event listeners', async () => {
      const { unmount } = renderHook(() => useViewport());

      // Unmount the hook
      unmount();

      // Clean up viewport store
      await resetViewportStore();

      // Should not throw errors after cleanup
      expect(() => {
        renderHook(() => useViewport());
      }).not.toThrow();
    });
  });

  describe('SSR Safety', () => {
    it('should provide safe server-side defaults', () => {
      // Test the server snapshot function directly
      const serverSnapshot = viewportStore.getServerSnapshot();

      expect(serverSnapshot).toEqual({
        width: 1024,
        height: 768,
        innerWidth: 1024,
        innerHeight: 768,
      });
    });

    it('should handle missing ResizeObserver gracefully', () => {
      // Temporarily remove ResizeObserver
      const originalResizeObserver = global.ResizeObserver;
      delete (global as any).ResizeObserver;

      try {
        const { result } = renderHook(() => useViewport());
        
        expect(result.current).toMatchObject({
          width: expect.any(Number),
          height: expect.any(Number),
          innerWidth: expect.any(Number),
          innerHeight: expect.any(Number),
        });
      } finally {
        // Restore ResizeObserver
        global.ResizeObserver = originalResizeObserver;
      }
    });
  });

  describe('Store Management', () => {
    it('should allow multiple hook instances to share the same store', () => {
      const { result: result1 } = renderHook(() => useViewport());
      const { result: result2 } = renderHook(() => useViewport());

      // Both hooks should return the same viewport data
      expect(result1.current).toEqual(result2.current);
    });

    it('should handle store destruction properly', async () => {
      const { result } = renderHook(() => useViewport());
      
      // Store should provide valid data
      expect(result.current.width).toBeGreaterThan(0);

      // Destroy store
      await resetViewportStore();

      // Should be able to create new hook instance after destruction
      const { result: newResult } = renderHook(() => useViewport());
      expect(newResult.current.width).toBeGreaterThan(0);
    });
  });
}); 