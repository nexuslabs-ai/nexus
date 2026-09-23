import path from 'node:path';

import { reactRoot } from './roots.mjs';

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

function targetFiles(target) {
  if (typeof target === 'string') return [target];
  if (target === null || typeof target !== 'object') return [];
  return Object.values(target).flatMap(targetFiles);
}

function isModuleSurface(target) {
  return targetFiles(target).some((file) =>
    CODE_EXTENSIONS.has(path.extname(file))
  );
}

const CONDITION_PRIORITY = ['import', 'module', 'require', 'node', 'default'];

// Named conditions first, in a fixed order; any others after, as listed.
function typesCondition(target) {
  if (target === null || typeof target !== 'object') return null;
  if (typeof target.types === 'string') return target.types;

  const named = CONDITION_PRIORITY.filter((condition) => condition in target);
  const rest = Object.keys(target).filter(
    (key) => !CONDITION_PRIORITY.includes(key)
  );

  for (const condition of [...named, ...rest]) {
    const nested = typesCondition(target[condition]);
    if (nested) return nested;
  }
  return null;
}

// Maps each `exports` subpath's `dist/*.d.ts` back to its `src/*.ts`.
export function reactEntryPoints(manifest) {
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
