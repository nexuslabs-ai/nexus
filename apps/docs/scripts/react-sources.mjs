import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { componentsRoot, reactSrc } from './roots.mjs';

export function isModuleSource(filePath) {
  const name = path.basename(filePath);
  if (!/\.tsx?$/.test(name)) return false;
  if (/\.(?:stories|test)\.tsx?$/.test(name)) return false;
  return !/-fixtures\.tsx?$/.test(name);
}

export function isComponentSource(filePath) {
  return (
    isModuleSource(filePath) && !/^index\.tsx?$/.test(path.basename(filePath))
  );
}

export function componentSlugs() {
  return readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const EXPORTED_COMPONENT = /from '\.\/components\/([^/']+)/g;

/** Every component `@nexus_ds/react` exports, by its folder slug, sorted. */
export function exportedComponentSlugs() {
  const index = readFileSync(path.join(reactSrc, 'index.ts'), 'utf8');
  return [
    ...new Set([...index.matchAll(EXPORTED_COMPONENT)].map(([, slug]) => slug)),
  ].sort();
}

export function collectSourceFiles(dir, include) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath, include);
      return [entryPath];
    })
    .filter(include);
}

export function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
