// @ts-check
/**
 * The registry the `nxds` CLI fetches: `<version>.json` for each release
 * catalog, and `latest.json`, a copy of the newest one.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { writeJson } from './files.mjs';
import { RELEASES_DIR } from './roots.mjs';

/** @typedef {import('./catalog-schema').Catalog} Catalog */

/**
 * @param {string} a
 * @param {string} b
 */
function compareVersions(a, b) {
  const [left, right] = [a, b].map((version) => version.split('.').map(Number));
  for (let index = 0; index < 3; index += 1) {
    const difference = (left?.[index] ?? 0) - (right?.[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** @returns {Catalog[]} Every committed release catalog, oldest first. */
export function readReleases() {
  // The folder appears with the first release that has the CLI.
  if (!existsSync(RELEASES_DIR)) return [];
  return readdirSync(RELEASES_DIR)
    .filter((name) => name.endsWith('.json'))
    .map(
      (name) =>
        /** @type {Catalog} */ (
          JSON.parse(readFileSync(path.join(RELEASES_DIR, name), 'utf8'))
        )
    )
    .sort((a, b) => compareVersions(a.version, b.version));
}

/**
 * @param {string} outDir
 * @param {Catalog[]} catalogs Oldest first; the last one is `latest.json`.
 */
export function writeRegistry(outDir, catalogs) {
  for (const catalog of catalogs) {
    writeJson(path.join(outDir, `${catalog.version}.json`), catalog);
  }
  const latest = catalogs.at(-1);
  if (latest) writeJson(path.join(outDir, 'latest.json'), latest);
}
