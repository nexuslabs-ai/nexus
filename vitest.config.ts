import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/react/src'),
    },
  },
  test: {
    // Global test configuration
    globals: true,
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./packages/test-utils/src/setup.ts'],

    // Include patterns
    include: ['packages/**/*.test.{ts,tsx,js}'],

    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Coverage configuration
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['packages/react/src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/generated/**',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },

    // Reporter configuration
    reporters: ['default'],

    // Timeout
    testTimeout: 10000,

    // Don't fail when no tests found (useful during setup)
    passWithNoTests: true,
  },
});
