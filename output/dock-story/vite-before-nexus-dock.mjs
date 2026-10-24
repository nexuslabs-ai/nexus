import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '/Users/temp/.codex/worktrees/nexus-homepage/nexus/node_modules/@tailwindcss/vite/dist/index.mjs';
import { fileURLToPath } from 'node:url';
const repository = '/Users/temp/.codex/worktrees/nexus-homepage/nexus';
const local = (p) => fileURLToPath(new URL(p, import.meta.url));
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: /^recharts$/,
        replacement: `${repository}/node_modules/recharts/es6/index.js`,
      },
      {
        find: '@nexus_ds/react/utils',
        replacement: `${repository}/packages/react/src/lib/utils.ts`,
      },
      {
        find: '@nexus_ds/react/appearance',
        replacement: `${repository}/packages/react/src/components/appearance/provider/index.ts`,
      },
      {
        find: /^@nexus_ds\/react$/,
        replacement: `${repository}/packages/react/src/index.ts`,
      },
      {
        find: /^@nexus_ds\/core$/,
        replacement: `${repository}/packages/core/src/index.ts`,
      },
    ],
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        main: local('./index.html'),
        heroPreview: local('./hero-preview.html'),
        showcase: local('./showcase.html'),
        specimen: local('./specimen.html'),
        playground: local('./playground.html'),
        workspace: local('./workspace.html'),
        cards: local('./cards.html'),
        range: local('./range.html'),
      },
    },
  },
  optimizeDeps: { include: ['react', 'react-dom/client'] },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
    fs: { allow: [local('.'), repository] },
    warmup: { clientFiles: ['./src/main.jsx'] },
  },
  plugins: [react(), tailwindcss()],
});
