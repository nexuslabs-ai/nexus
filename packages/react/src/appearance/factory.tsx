import type { NexusAppearanceState } from '@nexus/core';

import {
  NexusAppearanceProvider,
  type NexusAppearanceProviderProps,
} from './provider';
import {
  NexusAppearanceScript,
  type NexusAppearanceScriptProps,
} from './script';

export interface CreateNexusAppearanceOptions {
  storageKey?: string | false;
  cookieKey?: string | false;
  defaultState?: NexusAppearanceState;
}

type ConfiguredProviderProps = Omit<
  NexusAppearanceProviderProps,
  'storageKey' | 'cookieKey' | 'defaultState'
>;

export function createNexusAppearance({
  storageKey,
  cookieKey,
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
        cookieKey={cookieKey}
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
