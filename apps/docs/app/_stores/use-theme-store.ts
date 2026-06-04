'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Theme picker state.
 *
 * Zustand + persist replaces the hand-rolled useLocalStoragePref hook.
 * The React binding uses useSyncExternalStore under the hood (same
 * primitive recommended by `.claude/rules/useeffect-escape-hatch.md`),
 * so no useEffect is needed anywhere in consumers.
 *
 * `skipHydration: true` means persist doesn't auto-read localStorage at
 * module init — we trigger rehydration explicitly below, on the client
 * only, so the SSR and first-client render produce matching defaults
 * (no hydration warning), and the real values land in a second render
 * after rehydration commits.
 */

export const STORAGE_KEY = 'nexus-docs-tokens';

export type ThemeState = {
  base: string;
  brand: string;
  spacing: string;
  typography: string;
  shadow: string;
  radius: string;
  borderwidth: string;
};

const THEME_MODE_VALUES = {
  base: ['slate', 'stone', 'neutral', 'gray', 'zinc'],
  brand: ['blue', 'purple', 'pink', 'teal', 'orange', 'black'],
  spacing: ['vega', 'lyra', 'maia', 'mira', 'nova', 'luma', 'sera'],
  typography: ['vega', 'nova', 'maia'],
  shadow: ['vega', 'lyra', 'maia', 'mira', 'nova'],
  radius: ['sharp', 'subtle', 'smooth', 'mellow', 'blunt'],
  borderwidth: ['vega', 'lyra', 'maia', 'mira', 'nova'],
} as const satisfies Record<keyof ThemeState, readonly string[]>;

export const DEFAULTS: ThemeState = {
  base: 'stone',
  brand: 'blue',
  spacing: 'vega',
  typography: 'vega',
  shadow: 'vega',
  radius: 'sharp',
  borderwidth: 'vega',
};

type ThemeStore = ThemeState & {
  update: <K extends keyof ThemeState>(key: K, value: ThemeState[K]) => void;
};

function sanitizeMode<K extends keyof ThemeState>(
  key: K,
  value: unknown
): ThemeState[K] {
  return typeof value === 'string' &&
    (THEME_MODE_VALUES[key] as readonly string[]).includes(value)
    ? value
    : DEFAULTS[key];
}

function sanitizeThemeState(raw: unknown): ThemeState {
  const state = (raw ?? {}) as Partial<Record<keyof ThemeState, unknown>>;
  return {
    base: sanitizeMode('base', state.base),
    brand: sanitizeMode('brand', state.brand),
    spacing: sanitizeMode('spacing', state.spacing),
    typography: sanitizeMode('typography', state.typography),
    shadow: sanitizeMode('shadow', state.shadow),
    radius: sanitizeMode('radius', state.radius),
    borderwidth: sanitizeMode('borderwidth', state.borderwidth),
  };
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      update: (key, value) => set({ [key]: value } as Partial<ThemeStore>),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
      migrate: (persisted) => sanitizeThemeState(persisted),
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeThemeState(persisted),
      }),
      partialize: ({ update: _update, ...rest }) => rest,
    }
  )
);

if (typeof window !== 'undefined') {
  void useThemeStore.persist.rehydrate();
}
