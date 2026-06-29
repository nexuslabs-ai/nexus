import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const require = createRequire(
  path.join(repoRoot, 'packages/react/package.json')
);
const targets = [
  '@nexus/tailwind',
  '@nexus/tailwind/nexus.css',
  '@nexus/tailwind/variables.css',
  '@nexus/react/styles.css',
];

const failures = [];

for (const target of targets) {
  try {
    const resolved = require.resolve(target);
    if (!existsSync(resolved)) {
      failures.push(
        `${target} resolved to missing file ${path.relative(repoRoot, resolved)}`
      );
    }
  } catch (error) {
    failures.push(
      `${target} did not resolve: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

if (failures.length) {
  throw new Error(failures.join('\n'));
}

console.log('Tailwind/css package exports resolve cleanly.');
