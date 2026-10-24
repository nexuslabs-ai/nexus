import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
} from '@nxds/core';
import type { Plugin } from 'vite';

import { defaultAppearance } from './src/appearance-state';

/** Adds the nxds theme script to index.html, so the page doesn't flash the wrong theme. */
export function nxdsAppearance(): Plugin {
  const script = createNxdsAppearanceBootstrapScript({
    storageKey: 'nxds-appearance',
    defaultSnapshot: createNxdsAppearanceSnapshotFromState(defaultAppearance),
  });
  return {
    name: 'nxds-appearance',
    transformIndexHtml: (html) =>
      html.replace('</head>', `<script>${script}</script></head>`),
  };
}
