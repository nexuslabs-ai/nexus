/**
 * The directories every other script in here resolves paths against. A leaf so
 * that reading the package manifest and deciding what the props JSON documents
 * stay independent of each other.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const repoRoot = path.resolve(docsRoot, '..', '..');
export const reactRoot = path.join(repoRoot, 'packages', 'react');
