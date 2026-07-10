import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs', 'esm'],
  outDir: 'dist/runtime',
  dts: true,
  splitting: false,
  sourcemap: true,
  // Sibling output `dist/tailwind/` is written by
  // scripts/generate-tailwind-package.js; flipping this to `true` would
  // silently delete it on every tsup run.
  clean: false,
});
