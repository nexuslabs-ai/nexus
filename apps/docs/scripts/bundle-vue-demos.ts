// Compiles generated/vue/entry.js, which generate:vue writes, into the bundle
// the live Vue previews load from public/vue-demos/.
// usage: node scripts/bundle-vue-demos.ts
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { build } from 'vite';

import {
  toRepoPath,
  vueSrc,
} from '../../../packages/catalog/scripts/roots.mjs';

import { docsRoot } from './roots.mjs';

const entry = path.join(docsRoot, 'generated', 'vue', 'entry.js');
const bundleDir = path.join(docsRoot, 'public', 'vue-demos');

await build({
  configFile: false,
  logLevel: 'warn',
  root: docsRoot,
  publicDir: false,
  plugins: [vue()],
  resolve: { alias: { '@': vueSrc } },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    lib: { entry, formats: ['es'], fileName: 'entry' },
  },
});

console.log(`Vue demos bundle -> ${toRepoPath(bundleDir)}`);
