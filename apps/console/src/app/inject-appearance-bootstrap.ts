import {
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromState,
  type NexusAppearanceState,
} from '@nexus_ds/core';

export interface InjectAppearanceBootstrapOptions {
  storageKey: string;
  defaultState: NexusAppearanceState;
}

export function injectAppearanceBootstrap(
  html: string,
  { storageKey, defaultState }: InjectAppearanceBootstrapOptions
): string {
  const defaultSnapshot = createNexusAppearanceSnapshotFromState(defaultState);
  const script = createNexusAppearanceBootstrapScript({
    storageKey,
    defaultSnapshot,
  });

  return html.replace(
    /<head(\s[^>]*)?>/i,
    (match) => `${match}<script>${script}</script>`
  );
}
