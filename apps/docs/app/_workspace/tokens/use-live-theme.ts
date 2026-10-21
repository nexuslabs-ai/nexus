'use client';

import { useMemo } from 'react';

import {
  createNxdsThemeContract,
  deriveTheme,
  measureThemeContrast,
  type Mode,
  type ThemeContrastCheck,
  type TokenMap,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

/** The theme the docs page is showing right now, in its resolved mode. */
export interface LiveTheme {
  mode: Mode;
  tokens: TokenMap;
  contrast: ThemeContrastCheck[];
}

/** `overrides` replaces derived values per mode before contrast is measured. */
export function useLiveTheme(
  overrides?: Partial<Record<Mode, TokenMap>>
): LiveTheme {
  const { state, resolvedMode } = useNxdsAppearance();
  const derived = useMemo(() => {
    const base = deriveTheme(createNxdsThemeContract(state));
    const theme = {
      light: { ...base.light, ...overrides?.light },
      dark: { ...base.dark, ...overrides?.dark },
    };
    return { theme, contrast: measureThemeContrast(theme) };
  }, [state, overrides]);
  return {
    mode: resolvedMode,
    tokens: derived.theme[resolvedMode],
    contrast: derived.contrast.filter((check) => check.mode === resolvedMode),
  };
}
