import { defineConfig } from 'tsup';

export default defineConfig([
  // Library exports (no shebang)
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node20',
    outDir: 'dist',
  },
  // CLI entry point (with shebang)
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    target: 'node20',
    outDir: 'dist',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
