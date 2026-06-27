import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import {
  CONSOLE_APPEARANCE_DEFAULT,
  CONSOLE_STORAGE_KEY,
} from './src/app/appearance-defaults';
import { injectAppearanceBootstrap } from './src/app/inject-appearance-bootstrap';

export default defineConfig({
  plugins: [
    {
      name: 'console-appearance-bootstrap',
      transformIndexHtml: (html) =>
        injectAppearanceBootstrap(html, {
          storageKey: CONSOLE_STORAGE_KEY,
          defaultState: CONSOLE_APPEARANCE_DEFAULT,
        }),
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@nexus/react/appearance': fileURLToPath(
        new URL('../../packages/react/src/appearance/index.ts', import.meta.url)
      ),
    },
  },
});
