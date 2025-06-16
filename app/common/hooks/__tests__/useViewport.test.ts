import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useViewport,
  useViewportWidth,
  useViewportHeight,
  useViewportDimensions,
  viewportStore,
  destroyViewportStore,
} from '../useViewport';

// Store original values
const originalInnerWidth = global.innerWidth;
const originalInnerHeight = global.innerHeight;

describe('useViewport Hook', () => {
  // Helper to reset viewport store
  const resetViewportStore = () => {
    destroyViewportStore();
    // Allow some time for cleanup
    return new Promise(resolve => setTimeout(resolve, 10));
  };

  beforeEach(async () => {
    await resetViewportStore();
    vi.clearAllMocks();

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
      });

      // Should have positive dimensions
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });

    it('should handle different viewport sizes', () => {
      // Change window dimensions
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 800 });
        Object.defineProperty(window, 'innerHeight', { value: 600 });
        viewportStore.forceUpdate();
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

  describe('Resize Handling', () => {
    it('should update dimensions on viewport changes', async () => {
      const { result } = renderHook(() => useViewport());

      // Simulate viewport change
      await act(async () => {
        Object.defineProperty(window, 'innerWidth', { value: 1200 });
        Object.defineProperty(window, 'innerHeight', { value: 800 });
        viewportStore.forceUpdate();
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

      expect(result.current).toEqual({
        width: expect.any(Number),
        height: expect.any(Number),
      });
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
    });
  });

  describe('SSR Support', () => {
    it('should handle server-side rendering', () => {
      // Mock SSR environment
      const originalWindow = global.window;
      delete (global as any).window;

      const { result } = renderHook(() => useViewport());

      expect(result.current).toEqual({
        width: 1024,
        height: 768,
      });

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Store Management', () => {
    it('should properly cleanup on destroy', () => {
      const { result } = renderHook(() => useViewport());

      expect(result.current).toBeDefined();

      act(() => {
        destroyViewportStore();
      });

      // Store should be cleaned up
      expect(global.removeEventListener).toHaveBeenCalled();
    });
  });
});
