'use client';

import type {
  NxdsAppearanceCookieOptions,
  NxdsAppearanceState,
} from '@nxds/core';

import {
  NxdsAppearanceProvider,
  type NxdsAppearanceProviderProps,
} from './provider';

export interface CreateNxdsAppearanceOptions {
  storageKey?: string | false;
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
  defaultState?: NxdsAppearanceState;
}

type ConfiguredProviderProps = Omit<
  NxdsAppearanceProviderProps,
  'storageKey' | 'cookieWriteKey' | 'cookieOptions' | 'defaultState'
>;

export function createNxdsAppearance({
  storageKey,
  cookieWriteKey,
  cookieOptions,
  defaultState,
}: CreateNxdsAppearanceOptions = {}) {
  function ConfiguredNxdsAppearanceProvider({
    children,
    ...props
  }: ConfiguredProviderProps) {
    return (
      <NxdsAppearanceProvider
        {...props}
        storageKey={storageKey}
        cookieWriteKey={cookieWriteKey}
        cookieOptions={cookieOptions}
        defaultState={defaultState}
      >
        {children}
      </NxdsAppearanceProvider>
    );
  }

  return {
    NxdsAppearanceProvider: ConfiguredNxdsAppearanceProvider,
  };
}
