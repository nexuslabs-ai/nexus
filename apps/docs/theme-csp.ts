import {
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromState,
} from '@nexus_ds/core';
import { createHash } from 'node:crypto';

import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './app/_lib/appearance-controls';

export function getSha256CspHash(source: string) {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
}

export const DOCS_APPEARANCE_BOOTSTRAP_SCRIPT =
  createNexusAppearanceBootstrapScript({
    storageKey: DOCS_APPEARANCE_STORAGE_KEY,
    defaultSnapshot: createNexusAppearanceSnapshotFromState(
      DOCS_APPEARANCE_DEFAULT_STATE
    ),
  });

export const DOCS_APPEARANCE_BOOTSTRAP_CSP_HASH = getSha256CspHash(
  DOCS_APPEARANCE_BOOTSTRAP_SCRIPT
);
