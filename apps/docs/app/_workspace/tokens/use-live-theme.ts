'use client';

import { useMemo } from 'react';

import {
  createNexusThemeContract,
  deriveTheme,
  measureThemeContrast,
  type Mode,
  type ThemeContrastCheck,
  type TokenMap,
} from '@nexus_ds/core';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

/** The theme the docs page is showing right now, in its resolved mode. */
export interface LiveTheme {
  mode: Mode;
  tokens: TokenMap;
  contrast: ThemeContrastCheck[];
}

export function useLiveTheme(): LiveTheme {
  const { state, resolvedMode } = useNexusAppearance();
  const derived = useMemo(() => {
    const theme = deriveTheme(createNexusThemeContract(state));
    return { theme, contrast: measureThemeContrast(theme) };
  }, [state]);
  return {
    mode: resolvedMode,
    tokens: derived.theme[resolvedMode],
    contrast: derived.contrast.filter((check) => check.mode === resolvedMode),
  };
}
