import { createHash } from 'node:crypto';

import { DOCS_THEME_BOOTSTRAP_SCRIPT } from './app/_lib/theme-bootstrap-script';

export function getSha256CspHash(source: string) {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
}

export const DOCS_THEME_BOOTSTRAP_CSP_HASH = getSha256CspHash(
  DOCS_THEME_BOOTSTRAP_SCRIPT
);
