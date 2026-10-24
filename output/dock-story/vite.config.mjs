import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (value) => fileURLToPath(new URL(value, import.meta.url));
const repo = path('../../');
const dock = '/Users/temp/.codex/worktrees/nexus-dock/nexus';
const radix = `${repo}node_modules/@radix-ui`;

// Files from the Dock checkout import Radix too. Point every Radix import at
// this repo's single copy so popovers and dialogs share one layer stack.
const radixAliases = readdirSync(radix)
  .filter((name) => existsSync(`${radix}/${name}/dist/index.mjs`))
  .map((name) => ({
    find: new RegExp(`^@radix-ui/${name}$`),
    replacement: `${radix}/${name}/dist/index.mjs`,
  }));

export default defineConfig({
  root: path('./'),
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@nexus-dock/source',
        replacement: `${dock}/output/dock-retired/preview-dock.tsx`,
      },
      {
        find: '@nexus-dock/property-slider',
        replacement: `${dock}/packages/react/src/components/property-slider/property-slider.tsx`,
      },
      {
        find: '@nexus-dock/color-field',
        replacement: `${dock}/packages/react/src/components/appearance/color-field/color-field.tsx`,
      },
      {
        find: '@nxds/react/appearance',
        replacement: `${repo}packages/react/src/components/appearance/provider/index.ts`,
      },
      {
        find: '@nxds/react/utils',
        replacement: `${repo}packages/react/src/lib/utils.ts`,
      },
      {
        find: /^@nxds\/react$/,
        replacement: `${repo}packages/react/src/index.ts`,
      },
      {
        find: /^@nxds\/core$/,
        replacement: `${repo}packages/core/src/index.ts`,
      },
      ...radixAliases,
    ],
  },
  optimizeDeps: {
    entries: [
      'index.html',
      'appearance-preview.html',
      'hero-adoption-preview/index.html',
    ],
  },
  server: { fs: { allow: [repo, dock] } },
});
