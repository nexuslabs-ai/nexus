import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { pascal } from './humanize.ts';
import { blocksRoot, componentsRoot, isUnder, reactSrc } from './roots.mjs';

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

/** The modules `source` imports or re-exports, read by the TypeScript scanner. */
export function importSpecifiers(source) {
  return ts
    .preProcessFile(source, true, true)
    .importedFiles.map(({ fileName }) => fileName);
}

const COMPONENT_SPECIFIER = './components/';

/** Every component `@nexus_ds/react` exports, by its folder slug, sorted. */
export function exportedComponentSlugs() {
  const index = readFileSync(path.join(reactSrc, 'index.ts'), 'utf8');
  const slugs = importSpecifiers(index)
    .filter((fileName) => fileName.startsWith(COMPONENT_SPECIFIER))
    .map((fileName) => {
      const specifier = fileName.slice(COMPONENT_SPECIFIER.length);
      const [slug, ...rest] = specifier.split('/');
      if (slug !== 'appearance' && rest.join('/') !== slug) {
        throw new Error(
          `src/index.ts exports './components/${specifier}'. A component's entry file is components/${slug}/${slug}.tsx, so its page can link it — rename the file.`
        );
      }
      return slug;
    });
  return new Set(slugs.sort());
}

/**
 * The exported component whose own file `filePath` is
 * (`components/button/button.tsx` → `button`), or null. A docs page links that
 * component instead of listing its files.
 * @param {string} filePath
 * @param {Set<string>} exported from `exportedComponentSlugs()`
 */
export function linkedComponentSlug(filePath, exported) {
  if (!isUnder(filePath, componentsRoot)) return null;
  const [slug, name, ...nested] = path
    .relative(componentsRoot, filePath)
    .split(path.sep);
  if (nested.length > 0 || name.replace(/\.tsx?$/, '') !== slug) return null;
  return exported.has(slug) ? slug : null;
}

/**
 * @typedef {{ family: string; slug: string; source: string; stories: string }} BlockSource
 */

/**
 * Every copy-source block: a `blocks/{family}/{slug}/` folder holding
 * `{slug}.tsx` and `{Slug}.stories.tsx`, sorted by family then slug. Files
 * directly in a family folder are helpers its blocks share.
 * @returns {BlockSource[]}
 */
export function blockSources() {
  return subfolders(blocksRoot)
    .flatMap((family) =>
      subfolders(path.join(blocksRoot, family)).map((slug) => ({
        family,
        slug,
        source: path.join(blocksRoot, family, slug, `${slug}.tsx`),
        stories: path.join(
          blocksRoot,
          family,
          slug,
          `${pascal(slug)}.stories.tsx`
        ),
      }))
    )
    .filter((block) => existsSync(block.stories));
}

function subfolders(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
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

export function readCanonical(file) {
  return readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

// Renames a temp file into place, so a concurrent reader never sees a partial write.
export function writeIfChanged(file, content) {
  if (existsSync(file) && readCanonical(file) === content) return;

  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, file);
}

export function writeJson(filePath, value) {
  writeIfChanged(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
