// packages/test-utils/src/index.ts

/**
 * @nexus/test-utils
 *
 * Testing utilities for hooks and utility functions.
 *
 * FOR COMPONENT TESTING: Use Storybook play functions with @storybook/test
 * FOR HOOK/UTILITY TESTING: Use this package
 */

// Hook testing
export { act, renderHook, waitFor } from '@testing-library/react';

// Re-export vitest for convenience
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
