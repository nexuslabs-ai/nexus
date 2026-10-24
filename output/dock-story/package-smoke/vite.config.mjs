import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const repo = '/Users/temp/.codex/worktrees/d12c/nexus';
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: /^@nxds\/tailwind$/,
        replacement: `${repo}/packages/tailwind/nxds.css`,
      },
      {
        find: '@nxds/react/styles.css',
        replacement: `${repo}/packages/react/dist/react.css`,
      },
      {
        find: '@nxds/react/appearance',
        replacement: `${repo}/packages/react/dist/appearance.mjs`,
      },
      {
        find: /^@nxds\/react$/,
        replacement: `${repo}/packages/react/dist/index.mjs`,
      },
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 4192,
    strictPort: true,
    fs: { allow: [repo] },
  },
  build: { outDir: '/tmp/nexus-owned-package-smoke' },
});
