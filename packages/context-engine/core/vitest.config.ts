import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(() => {
  // Load env.test from parent directory (packages/context-engine/)
  const env = loadEnv('test', resolve(__dirname, '..'), '');

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['test/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      setupFiles: ['./test/setup.ts'],
      env,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      },
      testTimeout: 30000,
      hookTimeout: 30000,
    },
    resolve: {
      alias: {
        '@context-engine/core': './src',
      },
    },
  };
});
