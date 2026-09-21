import { createContext, useContext } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
export const PreviewAppearanceContext = createContext<{
  state: NexusAppearanceState;
  resolvedMode: 'light' | 'dark';
  onChange: (state: NexusAppearanceState) => void;
} | null>(null);
export function usePreviewAppearance() {
  const value = useContext(PreviewAppearanceContext);
  if (!value) throw new Error('Missing preview appearance');
  return value;
}
