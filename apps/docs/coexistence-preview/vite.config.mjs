import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const path = (value) => fileURLToPath(new URL(value, import.meta.url));
export default defineConfig({
  root: path('./'),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@nxds/react/appearance',
        replacement: path(
          '../../../packages/react/src/components/appearance/provider/index.ts'
        ),
      },
      {
        find: /^@nxds\/react$/,
        replacement: path('../../../packages/react/src/index.ts'),
      },
      {
        find: /^@nxds\/core$/,
        replacement: path('../../../packages/core/src/index.ts'),
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: path('./index.html'),
        hero: path('./hero.html'),
        adoption: path('./adoption.html'),
        comparison: path('./comparison.html'),
      },
    },
    outDir: path('../public/coexistence-preview'),
    emptyOutDir: true,
  },
});
