import {
  createDefaultNxdsAppearanceSnapshot,
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
} from '@nxds/core';

export interface NxdsAppearanceScriptProps {
  storageKey?: string | false;
  defaultState?: NxdsAppearanceState;
  nonce?: string;
}

export interface CreateNxdsAppearanceScriptOptions {
  storageKey?: string | false;
  defaultState?: NxdsAppearanceState;
}

function defaultSnapshotFor(defaultState: NxdsAppearanceState | undefined) {
  return defaultState
    ? createNxdsAppearanceSnapshotFromState(
        sanitizeNxdsAppearance(defaultState)
      )
    : createDefaultNxdsAppearanceSnapshot();
}

export function NxdsAppearanceScript({
  storageKey,
  defaultState,
  nonce,
}: NxdsAppearanceScriptProps) {
  return (
    <script
      data-nxds-appearance-script=""
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: createNxdsAppearanceBootstrapScript({
          storageKey,
          defaultSnapshot: defaultSnapshotFor(defaultState),
        }),
      }}
    />
  );
}

export function createNxdsAppearanceScript({
  storageKey,
  defaultState,
}: CreateNxdsAppearanceScriptOptions = {}) {
  function ConfiguredNxdsAppearanceScript({
    nonce,
  }: Pick<NxdsAppearanceScriptProps, 'nonce'>) {
    return (
      <NxdsAppearanceScript
        nonce={nonce}
        storageKey={storageKey}
        defaultState={defaultState}
      />
    );
  }

  return ConfiguredNxdsAppearanceScript;
}
