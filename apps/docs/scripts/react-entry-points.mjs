import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const repoRoot = path.resolve(docsRoot, '..', '..');
export const reactRoot = path.join(repoRoot, 'packages', 'react');

/**
 * The `exports` map points at built declarations; the same subpaths under
 * `src/` are what the program is built from, so a new public subentry is picked
 * up without a second list to maintain. Shared with the test so the generator
 * and the yardstick it is measured against cannot disagree about the surface.
 */
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
 * A subpath the package deliberately does not export (`null`), or one pointing
 * straight at an asset (`"./styles.css": "./dist/react.css"`), carries no
 * module surface. Both are read off the target rather than the subpath name, so
 * a dotted name such as `"./v1.2"` is still treated as code.
 */
function isModuleSurface(target) {
  if (target === null) return false;
  if (typeof target === 'string') {
    return CODE_EXTENSIONS.has(path.extname(target));
  }
  return true;
}

export function reactEntryPoints() {
  const manifest = JSON.parse(
    readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
  );

  return Object.entries(manifest.exports)
    .filter(([, target]) => isModuleSurface(target))
    .map(([subpath, target]) => {
      if (typeof target?.types !== 'string') {
        throw new Error(
          `@nexus_ds/react exports "${subpath}" without a "types" entry; its components would be dropped from the props JSON.`
        );
      }
      return path.join(
        reactRoot,
        target.types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts')
      );
    })
    .sort();
}
