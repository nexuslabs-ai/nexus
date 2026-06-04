'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_THEME_STATE,
  DOCS_THEME_STORAGE_KEY,
  sanitizeMode,
  sanitizeThemeState,
  type ThemeMode,
  type ThemeState,
} from '../_lib/theme-modes';

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

export {
  DEFAULT_THEME_STATE as DEFAULTS,
  DOCS_THEME_STORAGE_KEY as STORAGE_KEY,
};
export type { ThemeState };

type ThemeStore = ThemeState & {
  update: <K extends ThemeMode>(key: K, value: unknown) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_THEME_STATE,
      update: (key, value) =>
        set({ [key]: sanitizeMode(key, value) } as Partial<ThemeStore>),
    }),
    {
      name: DOCS_THEME_STORAGE_KEY,
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
