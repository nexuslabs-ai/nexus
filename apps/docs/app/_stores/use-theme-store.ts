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
      partialize: ({ update: _update, ...rest }) => rest,
    }
  )
);

if (typeof window !== 'undefined') {
  void useThemeStore.persist.rehydrate();
}
