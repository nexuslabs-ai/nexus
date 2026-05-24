import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs', 'esm'],
  outDir: 'dist/runtime',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
});
