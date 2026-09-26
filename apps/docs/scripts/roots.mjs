import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const repoRoot = path.resolve(docsRoot, '..', '..');
export const reactRoot = path.join(repoRoot, 'packages', 'react');
export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');

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
