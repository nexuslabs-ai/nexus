'use client';

import type { NexusAppearanceState } from '@nexus/core';

import {
  type NexusAppearanceCookieOptions,
  NexusAppearanceProvider,
  type NexusAppearanceProviderProps,
} from './provider';

export interface CreateNexusAppearanceOptions {
  storageKey?: string | false;
  cookieWriteKey?: string | false;
  cookieOptions?: NexusAppearanceCookieOptions;
  defaultState?: NexusAppearanceState;
}

type ConfiguredProviderProps = Omit<
  NexusAppearanceProviderProps,
  'storageKey' | 'cookieWriteKey' | 'cookieOptions' | 'defaultState'
>;

export function createNexusAppearance({
  storageKey,
  cookieWriteKey,
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
        cookieWriteKey={cookieWriteKey}
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
