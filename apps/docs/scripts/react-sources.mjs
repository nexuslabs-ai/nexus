import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { pascal } from './humanize.mjs';
import { blocksRoot, componentsRoot, reactSrc } from './roots.mjs';

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

/**
 * @typedef {{ slug: string; source: string; stories: string }} BlockSource
 */

/**
 * Every copy-source block: a `blocks/{slug}/` folder holding `{slug}.tsx` and
 * `{Slug}.stories.tsx`, sorted by slug. A folder without stories is a helper
 * the blocks share, not a block.
 * @returns {BlockSource[]}
 */
export function blockSources() {
  return readdirSync(blocksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name: slug }) => ({
      slug,
      source: path.join(blocksRoot, slug, `${slug}.tsx`),
      stories: path.join(blocksRoot, slug, `${pascal(slug)}.stories.tsx`),
    }))
    .filter((block) => existsSync(block.stories))
    .sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
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
