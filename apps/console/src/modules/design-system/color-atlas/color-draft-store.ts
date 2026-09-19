import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type ColorDraftOverride,
  type ColorDraftOverrides,
  sanitizeOverrides,
} from './color-draft';

interface ColorDraftState {
  overrides: ColorDraftOverrides;
  setOverride: (token: string, override: ColorDraftOverride) => void;
  removeOverride: (token: string) => void;
  resetAll: () => void;
}

type PersistedColorDraftState = Pick<ColorDraftState, 'overrides'>;

export const COLOR_DRAFT_STORAGE_KEY = 'nexus-console-color-draft';

export const useColorDraftStore = create<ColorDraftState>()(
  persist<ColorDraftState, [], [], PersistedColorDraftState>(
    (set) => ({
      overrides: {},
      setOverride: (token, override) =>
        set((state) => ({
          overrides: { ...state.overrides, [token]: override },
        })),
      removeOverride: (token) =>
        set((state) => {
          const { [token]: _removed, ...overrides } = state.overrides;
          return { overrides };
        }),
      resetAll: () => set({ overrides: {} }),
    }),
    {
      name: COLOR_DRAFT_STORAGE_KEY,
      partialize: (state) => ({ overrides: state.overrides }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<PersistedColorDraftState>
          | undefined;

        return {
          ...currentState,
          overrides: sanitizeOverrides(persisted?.overrides),
        };
      },
    }
  )
);
