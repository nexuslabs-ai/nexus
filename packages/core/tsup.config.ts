import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs', 'esm'],
  outDir: 'dist/runtime',
  dts: true,
  splitting: false,
  sourcemap: true,
  // Sibling outputs `dist/modular/` and `dist/tailwind/` are written by
  // scripts/generate-modular.js and scripts/generate-tailwind-package.js;
  // flipping this to `true` would silently delete them on every tsup run.
  clean: false,
});
