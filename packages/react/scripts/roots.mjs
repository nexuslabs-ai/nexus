import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const reactRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');
export const blocksRoot = path.join(reactSrc, 'blocks');
