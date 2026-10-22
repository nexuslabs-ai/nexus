import { type Catalog, installedVariants } from '@nxds/catalog';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string;
};

/** The catalog with only the variants the CLI installs. */
function installedCatalog(): Catalog {
  const require = createRequire(import.meta.url);
  const catalog = JSON.parse(
    readFileSync(require.resolve('@nxds/catalog/catalog.json'), 'utf8')
  ) as Catalog;
  for (const item of catalog.items) {
    item.variants = installedVariants(item.variants, catalog.frameworks);
  }
  return catalog;
}

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
    writeFileSync('dist/catalog.json', JSON.stringify(installedCatalog()));
  },
});
