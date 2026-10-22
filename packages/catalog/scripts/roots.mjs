import path from 'node:path';
import { fileURLToPath } from 'node:url';

const catalogRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const repoRoot = path.resolve(catalogRoot, '..', '..');
/** Written by `generate-catalog.mjs`. */
export const CATALOG_FILE = path.join(catalogRoot, 'generated', 'catalog.json');

export function toRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

export function isUnder(filePath, directory) {
  const relative = path.relative(directory, filePath);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}
