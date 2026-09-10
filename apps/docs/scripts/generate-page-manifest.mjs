/**
 * Writes the docs page manifest and its loader map. Run before `next build` /
 * `next dev`; see `page-manifest.mjs` for how both are derived from the
 * filesystem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPageManifest } from './page-manifest.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const modules = await buildPageManifest(docsRoot);
for (const [file, contents] of Object.entries(modules)) {
  fs.writeFileSync(path.join(docsRoot, file), contents);
}
console.log(`Wrote ${Object.keys(modules).join(', ')}`);
