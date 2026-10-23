// Serves each committed release catalog at /r/<version>.json, and the newest
// at /r/latest.json, for the `nxds` CLI.
import path from 'node:path';

import {
  readReleases,
  writeRegistry,
} from '../../../packages/catalog/scripts/registry.mjs';

import { docsRoot } from './docs-root.mjs';

const releases = readReleases();
writeRegistry(path.join(docsRoot, 'out', 'r'), releases);
console.log(`registry: ${releases.length} release catalogs -> out/r`);
