import {
  appearancePrefsToCss,
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshot,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  deriveTheme,
  type NexusAppearanceState,
  sanitizeNexusAppearance,
  themeToCss,
} from '@nexus/core';

import {
  NexusAppearanceProvider,
  type NexusAppearanceProviderProps,
} from './provider';

export interface NexusAppearanceScriptProps {
  storageKey?: string;
  defaultState?: NexusAppearanceState;
  nonce?: string;
}

export interface CreateNexusAppearanceOptions {
  storageKey?: string;
  defaultState?: NexusAppearanceState;
}

type ConfiguredProviderProps = Omit<
  NexusAppearanceProviderProps,
  'storageKey' | 'defaultState'
>;

function defaultSnapshotFor(defaultState: NexusAppearanceState | undefined) {
  const state = sanitizeNexusAppearance(
    defaultState ?? DEFAULT_NEXUS_APPEARANCE
  );

  return createNexusAppearanceSnapshot(
    state,
    themeToCss(deriveTheme(createNexusThemeContract(state))),
    appearancePrefsToCss(state.prefs)
  );
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

export function createNexusAppearance({
  storageKey,
  defaultState,
}: CreateNexusAppearanceOptions = {}) {
  function ConfiguredNexusAppearanceProvider({
    children,
    ...props
  }: ConfiguredProviderProps) {
    return (
      <NexusAppearanceProvider
        {...props}
        storageKey={storageKey}
        defaultState={defaultState}
      >
        {children}
      </NexusAppearanceProvider>
    );
  }

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

  return {
    NexusAppearanceProvider: ConfiguredNexusAppearanceProvider,
    NexusAppearanceScript: ConfiguredNexusAppearanceScript,
  };
}
