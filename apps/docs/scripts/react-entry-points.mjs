import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const repoRoot = path.resolve(docsRoot, '..', '..');
export const reactRoot = path.join(repoRoot, 'packages', 'react');

const CODE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

/**
 * Every file a subpath can resolve to, flattened out of however many condition
 * objects it is nested in.
 */
function targetFiles(target) {
  if (typeof target === 'string') return [target];
  if (target === null || typeof target !== 'object') return [];
  return Object.values(target).flatMap(targetFiles);
}

/**
 * A subpath the package deliberately does not export (`null`), or one that only
 * ever lands on an asset (`"./styles.css": "./dist/react.css"`), carries no
 * module surface. Read off the files the target resolves to rather than the
 * subpath name, so a dotted name such as `"./v1.2"` is still treated as code.
 */
function isModuleSurface(target) {
  return targetFiles(target).some((file) =>
    CODE_EXTENSIONS.has(path.extname(file))
  );
}

const CONDITION_PRIORITY = ['import', 'module', 'require', 'node', 'default'];

/**
 * The declarations for a subpath: a `types` condition at the top of its object,
 * or inside a nested one (`{ import: { types, default } }`). A manifest can
 * spell `types` under more than one condition, so the nested ones are walked in
 * a fixed order rather than whichever the object happens to list first.
 */
function typesCondition(target) {
  if (target === null || typeof target !== 'object') return null;
  if (typeof target.types === 'string') return target.types;

  for (const condition of CONDITION_PRIORITY) {
    const nested = typesCondition(target[condition]);
    if (nested) return nested;
  }
  return null;
}

/**
 * The `exports` map points at built declarations; the same subpaths under
 * `src/` are what the program is built from, so a new public subentry is picked
 * up without a second list to maintain. Shared with the test so the generator
 * and the yardstick it is measured against cannot disagree about the surface.
 */
export function entryPointsFromManifest(manifest) {
  return Object.entries(manifest.exports)
    .filter(([, target]) => isModuleSurface(target))
    .map(([subpath, target]) => {
      const types = typesCondition(target);
      if (!types) {
        throw new Error(
          `@nexus_ds/react exports "${subpath}" without a "types" entry; its components would be dropped from the props JSON.`
        );
      }
      return path.join(
        reactRoot,
        types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts')
      );
    })
    .sort();
}

export function reactEntryPoints() {
  return entryPointsFromManifest(
    JSON.parse(readFileSync(path.join(reactRoot, 'package.json'), 'utf8'))
  );
}
