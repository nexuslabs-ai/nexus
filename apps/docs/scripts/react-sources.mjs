import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { reactRoot, repoRoot } from './roots.mjs';

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

export function isComponentSource(filePath) {
  const name = path.basename(filePath);
  if (!/\.tsx?$/.test(name)) return false;
  if (/\.(?:stories|test)\.tsx?$/.test(name)) return false;
  if (/-fixtures\.tsx?$/.test(name)) return false;
  return !/^index\.tsx?$/.test(name);
}

export function componentSlugs() {
  return readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function collectSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);
      return [entryPath];
    })
    .filter(isComponentSource);
}

export function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
