import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/react/src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-dev-runtime',
      '@storybook/addon-a11y/preview',
      '@storybook/react',
    ],
  },
  test: {
    // Use projects feature (Vitest 4)
    projects: [
      // Unit tests (hooks, utilities) - jsdom
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: [
            'packages/**/src/**/*.test.{ts,tsx}',
            'packages/**/scripts/**/*.test.{js,ts}',
            'packages/eslint-plugin-nexus/__tests__/**/*.test.js',
            'scripts/**/*.test.js',
            // Exclude component tests - they're now in stories
            '!packages/react/src/components/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['./packages/test-utils/src/setup.ts'],
        },
      },
      // Story tests - real browser via Playwright
      {
        extends: true, // Inherit resolve.alias from root config
        plugins: [
          storybookTest({
            configDir: path.resolve(__dirname, 'packages/react/.storybook'),
            // Auto-start Storybook in watch mode for debugging links
            storybookScript: 'yarn storybook --no-open',
            // Explicitly include all stories (test tag is auto-applied)
            // Use exclude/skip for stories that shouldn't run
            tags: {
              include: ['test'],
              exclude: [],
              skip: [],
            },
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./packages/react/.storybook/vitest.setup.ts'],
        },
      },
    ],

    // Reporter configuration
    reporters: ['default'],

    // Timeout
    testTimeout: 10000,

    // Don't fail when no tests found (useful during setup)
    passWithNoTests: true,
  },
});
