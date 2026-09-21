import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import { tokenCatalogPlugin } from './scripts/token-catalog-plugin';
import {
  CONSOLE_APPEARANCE_DEFAULT,
  CONSOLE_STORAGE_KEY,
} from './src/app/appearance-defaults';
import { injectAppearanceBootstrap } from './src/app/inject-appearance-bootstrap';

export default defineConfig(({ command }) => ({
  resolve: {
    alias:
      command === 'serve'
        ? [
            {
              find: /^@nexus_ds\/core\/palette$/,
              replacement: fileURLToPath(
                new URL('../../packages/core/src/palette.ts', import.meta.url)
              ),
            },
            {
              find: /^@nexus_ds\/core$/,
              replacement: fileURLToPath(
                new URL('../../packages/core/src/index.ts', import.meta.url)
              ),
            },
          ]
        : [],
  },
  build: {
    target: ['chrome111', 'edge111', 'firefox113', 'safari15.4'],
    rollupOptions: {
      input: {
        console: fileURLToPath(new URL('./index.html', import.meta.url)),
        preview: fileURLToPath(
          new URL('./component-preview.html', import.meta.url)
        ),
      },
    },
  },
  plugins: [
    tokenCatalogPlugin(),
    {
      name: 'console-appearance-bootstrap',
      transformIndexHtml: (html, context) => {
        if (
          context.filename !==
          fileURLToPath(new URL('./index.html', import.meta.url))
        )
          return html;
        return injectAppearanceBootstrap(html, {
          storageKey: CONSOLE_STORAGE_KEY,
          defaultState: CONSOLE_APPEARANCE_DEFAULT,
        });
      },
    },
    react(),
    tailwindcss(),
  ],
}));
