import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure window is properly defined before any setup
if (typeof window === 'undefined') {
  // This should not happen in jsdom, but add extra safety
  throw new Error('Window object not available in jsdom environment');
}

// Mock ResizeObserver with proper callback handling
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  private entries: ResizeObserverEntry[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Create a mock DOMRectReadOnly
    const mockContentRect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
      toJSON: () => ({}),
    } as DOMRectReadOnly;

    // Create a mock ResizeObserverEntry
    const mockEntry = {
      target,
      contentRect: mockContentRect,
      contentBoxSize: [{
        inlineSize: window.innerWidth,
        blockSize: window.innerHeight,
      }],
      borderBoxSize: [{
        inlineSize: window.innerWidth,
        blockSize: window.innerHeight,
      }],
      devicePixelContentBoxSize: [{
        inlineSize: window.innerWidth,
        blockSize: window.innerHeight,
      }],
    } as unknown as ResizeObserverEntry;

    this.entries = [mockEntry];
    
    // Simulate immediate callback execution for testing
    setTimeout(() => {
      this.callback(this.entries, this);
    }, 0);
  }

  unobserve() {
    this.entries = [];
  }

  disconnect() {
    this.entries = [];
  }

  // Method to trigger resize for testing
  trigger() {
    if (this.entries.length > 0) {
      this.callback(this.entries, this);
    }
  }
}

// Set up global mocks
global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set up window dimensions with proper getters/setters
let windowWidth = 1024;
let windowHeight = 768;

Object.defineProperty(window, 'innerWidth', {
  get() {
    return windowWidth;
  },
  set(value) {
    windowWidth = value;
  },
  configurable: true,
});

Object.defineProperty(window, 'innerHeight', {
  get() {
    return windowHeight;
  },
  set(value) {
    windowHeight = value;
  },
  configurable: true,
});

// Mock screen object with orientation
Object.defineProperty(window, 'screen', {
  writable: true,
  configurable: true,
  value: {
    orientation: {
      angle: 0,
      type: 'landscape-primary',
    },
  },
});

// Mock navigator.maxTouchPoints
Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  configurable: true,
  value: 0,
});

// Mock document.documentElement for ResizeObserver
if (!document.documentElement) {
  (document as any).documentElement = document.createElement('html');
}

// Extend global interface for test helpers
declare global {
  var mockWindowResize: (width: number, height: number) => void;
  var mockOrientationChange: () => void;
}

// Helper function to simulate window resize for tests
(global as any).mockWindowResize = (width: number, height: number) => {
  windowWidth = width;
  windowHeight = height;
  
  // Trigger resize event
  const resizeEvent = new Event('resize');
  window.dispatchEvent(resizeEvent);
};

// Helper function to simulate orientation change for tests
(global as any).mockOrientationChange = () => {
  const orientationEvent = new Event('orientationchange');
  window.dispatchEvent(orientationEvent);
};

// Set up test environment before each test
beforeEach(() => {
  // Reset window dimensions to default
  windowWidth = 1024;
  windowHeight = 768;
  
  // Clear all mocks
  vi.clearAllMocks();
}); 