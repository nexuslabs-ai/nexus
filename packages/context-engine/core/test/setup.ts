/**
 * Test Setup
 *
 * Global setup for Vitest tests. Runs before all test files.
 *
 * Environment variables are loaded from `packages/context-engine/env.test`
 * via vitest.config.ts. To run real LLM tests, uncomment ANTHROPIC_API_KEY
 * in that file.
 */

import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Ensure deterministic timestamps for reproducible tests
const MOCK_DATE = new Date('2025-01-15T10:00:00.000Z');

beforeAll(() => {
  // Mock Date for deterministic timestamps in tests
  // Note: We only mock Date.now(), not the Date constructor
  // to avoid breaking other date operations
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_DATE);
});

afterEach(() => {
  // Reset all mocks between tests
  vi.clearAllMocks();
});

afterAll(() => {
  // Restore real timers
  vi.useRealTimers();
});
