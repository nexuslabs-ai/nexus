import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/react/src'),
      '@nexus/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@nexus/react/appearance': path.resolve(
        __dirname,
        './packages/react/src/appearance/index.ts'
      ),
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
            'apps/**/app/**/*.test.{ts,tsx}',
            'apps/**/src/**/*.test.{ts,tsx}',
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
            storybookScript: 'pnpm storybook --no-open',
          }),
        ],
        root: path.resolve(__dirname, 'packages/react'),
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: [
            path.resolve(
              __dirname,
              'packages/react/.storybook/vitest.setup.ts'
            ),
          ],
        },
      },
    ],

    // Reporter configuration
    reporters: ['default'],

    // Timeout
    testTimeout: 10000,

    // Fail loudly if a project collects zero tests. A 0-collection in the
    // storybook project was silently green for months (root/path mismatch);
    // both projects now collect (unit + storybook), so a future 0 is a real bug.
    passWithNoTests: false,
  },
});
