import path from 'node:path';
import { fileURLToPath } from 'node:url';

const catalogRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
/** Written by `generate-catalog.mjs`. */
export const CATALOG_FILE = path.join(catalogRoot, 'generated', 'catalog.json');
/** One committed catalog per `@nxds/react` release, written by `snapshot-release.mjs`. */
export const RELEASES_DIR = path.join(catalogRoot, 'releases');
