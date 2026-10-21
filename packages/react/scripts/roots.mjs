import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const reactRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const repoRoot = path.resolve(reactRoot, '..', '..');
export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');
export const blocksRoot = path.join(reactSrc, 'blocks');
export const vueRoot = path.join(repoRoot, 'packages', 'vue');
export const vueSrc = path.join(vueRoot, 'src');
export const vueComponentsRoot = path.join(vueSrc, 'components');
/** Written by `generate-catalog.mjs`. */
export const CATALOG_FILE = path.join(reactRoot, 'generated', 'catalog.json');

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
