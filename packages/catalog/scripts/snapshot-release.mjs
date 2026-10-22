// @ts-check
/**
 * Commits this release's catalog to `releases/<version>.json`, which the docs
 * site serves at `/r/<version>.json`. Runs after `changeset version`, so the
 * version is the one being released. A release catalog never changes once
 * written: `nxds update` compares an app's files with it.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

import { releaseCatalog } from './catalog-schema.ts';
import { writeJson } from './files.mjs';
import { buildCatalog } from './generate-catalog.mjs';
import { RELEASES_DIR, toRepoPath } from './roots.mjs';

const catalog = releaseCatalog(buildCatalog());
const file = path.join(RELEASES_DIR, `${catalog.version}.json`);
if (existsSync(file)) {
  console.log(`release catalog: ${toRepoPath(file)} already exists.`);
} else {
  writeJson(file, catalog);
  console.log(`release catalog: wrote ${toRepoPath(file)}`);
}
