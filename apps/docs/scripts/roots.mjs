import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const repoRoot = path.resolve(docsRoot, '..', '..');
export const reactRoot = path.join(repoRoot, 'packages', 'react');
