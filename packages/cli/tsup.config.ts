import { copyFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string;
};

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  define: { __VERSION__: JSON.stringify(version) },
  // `loadCatalog` reads the catalog from beside the built CLI.
  onSuccess: async () => {
    const require = createRequire(import.meta.url);
    copyFileSync(
      require.resolve('@nxds/react/catalog.json'),
      'dist/catalog.json'
    );
  },
});
