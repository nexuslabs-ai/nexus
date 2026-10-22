import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const vueRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const vueSrc = path.join(vueRoot, 'src');
export const vueComponentsRoot = path.join(vueSrc, 'components');
