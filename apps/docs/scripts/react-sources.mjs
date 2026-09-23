import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { isComponentSource } from './props-contract.mjs';
import { reactRoot } from './roots.mjs';

export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');

export function componentSlugs() {
  return readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    return [entryPath];
  });
}

export function collectSourceFiles(dir) {
  return collectFiles(dir).filter(isComponentSource);
}

export function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
