// packages/test-utils/src/setup.ts
import '@testing-library/jest-dom/vitest';

/**
 * Browser mocks for jsdom environment (hook tests)
 * These are needed when hooks use browser APIs
 */

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

if (typeof window !== 'undefined') {
  // Mock matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Mock IntersectionObserver for lazy-loading components
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver = IntersectionObserverMock;
