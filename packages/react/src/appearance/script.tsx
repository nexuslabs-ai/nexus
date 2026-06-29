import {
  createDefaultNexusAppearanceSnapshot,
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromState,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from '@nexus/core';

export interface NexusAppearanceScriptProps {
  storageKey?: string | false;
  defaultState?: NexusAppearanceState;
  nonce?: string;
}

export interface CreateNexusAppearanceScriptOptions {
  storageKey?: string | false;
  defaultState?: NexusAppearanceState;
}

function defaultSnapshotFor(defaultState: NexusAppearanceState | undefined) {
  return defaultState
    ? createNexusAppearanceSnapshotFromState(
        sanitizeNexusAppearance(defaultState)
      )
    : createDefaultNexusAppearanceSnapshot();
}

export function NexusAppearanceScript({
  storageKey,
  defaultState,
  nonce,
}: NexusAppearanceScriptProps) {
  return (
    <script
      data-nexus-appearance-script=""
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: createNexusAppearanceBootstrapScript({
          storageKey,
          defaultSnapshot: defaultSnapshotFor(defaultState),
        }),
      }}
    />
  );
}

export function createNexusAppearanceScript({
  storageKey,
  defaultState,
}: CreateNexusAppearanceScriptOptions = {}) {
  function ConfiguredNexusAppearanceScript({
    nonce,
  }: Pick<NexusAppearanceScriptProps, 'nonce'>) {
    return (
      <NexusAppearanceScript
        nonce={nonce}
        storageKey={storageKey}
        defaultState={defaultState}
      />
    );
  }

  return ConfiguredNexusAppearanceScript;
}
