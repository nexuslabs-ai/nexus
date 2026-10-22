import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@nxds\/core$/,
        replacement: path.resolve(__dirname, './packages/core/src/index.ts'),
      },
      {
        find: /^@\//,
        replacement: `${path.resolve(__dirname, './packages/react/src')}/`,
      },
    ],
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
      // Core engine, the `cn` merge, ESLint rules and cross-framework parity -
      // jsdom for the first-paint script tests. One glob per non-story row of
      // testing.md § Scope; the stories row belongs to the `storybook` projects.
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: [
            'packages/core/src/lib/*.test.ts',
            'packages/react/src/lib/utils.test.ts',
            'packages/eslint-plugin/__tests__/*.test.js',
            'parity/*.test.ts',
          ],
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
      // Vue story tests - the same play-function and axe checks for @nxds/vue
      {
        extends: true,
        plugins: [
          vue(),
          storybookTest({
            configDir: path.resolve(__dirname, 'packages/vue/.storybook'),
            storybookScript: 'pnpm --filter @nxds/vue storybook --no-open',
          }),
        ],
        root: path.resolve(__dirname, 'packages/vue'),
        test: {
          name: 'storybook-vue',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
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
