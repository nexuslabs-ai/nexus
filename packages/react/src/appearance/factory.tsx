'use client';

import type { NexusAppearanceState } from '@nexus/core';

import {
  type NexusAppearanceCookieOptions,
  NexusAppearanceProvider,
  type NexusAppearanceProviderProps,
} from './provider';

export interface CreateNexusAppearanceOptions {
  storageKey?: string | false;
  cookieKey?: string | false;
  cookieOptions?: NexusAppearanceCookieOptions;
  defaultState?: NexusAppearanceState;
}

type ConfiguredProviderProps = Omit<
  NexusAppearanceProviderProps,
  'storageKey' | 'cookieKey' | 'cookieOptions' | 'defaultState'
>;

export function createNexusAppearance({
  storageKey,
  cookieKey,
  cookieOptions,
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
        cookieOptions={cookieOptions}
        defaultState={defaultState}
      >
        {children}
      </NexusAppearanceProvider>
    );
  }

  return {
    NexusAppearanceProvider: ConfiguredNexusAppearanceProvider,
  };
}
