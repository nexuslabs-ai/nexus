import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..'
);
export const reactRoot = path.join(repoRoot, 'packages', 'react');
export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');
export const blocksRoot = path.join(reactSrc, 'blocks');
export const react18Root = path.join(repoRoot, 'packages', 'react-18');
export const react18Src = path.join(react18Root, 'src');
export const vueRoot = path.join(repoRoot, 'packages', 'vue');
export const vueSrc = path.join(vueRoot, 'src');
export const vueComponentsRoot = path.join(vueSrc, 'components');

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
