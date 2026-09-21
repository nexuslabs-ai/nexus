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
export function reactEntryPoints() {
  const manifest = JSON.parse(
    readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
  );

  return (
    Object.entries(manifest.exports)
      // `./styles.css` ships an asset, not a module surface.
      .filter(([subpath]) => !path.extname(subpath))
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
      .sort()
  );
}
