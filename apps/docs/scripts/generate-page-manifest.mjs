/**
 * Writes the docs page manifest. Run before `next build` / `next dev`; see
 * `page-manifest.mjs` for how the manifest is derived from the filesystem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPageManifest, MANIFEST_FILE } from './page-manifest.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

fs.writeFileSync(
  path.join(docsRoot, MANIFEST_FILE),
  await buildPageManifest(docsRoot)
);
console.log(`Wrote ${MANIFEST_FILE}`);
