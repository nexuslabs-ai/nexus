import {
  type NexusAppearanceState,
  sanitizeNexusAppearance,
} from '@nexus_ds/core';

import {
  type AcceptedPreview,
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
} from './preview/accepted-result';

export const CREATE_STORAGE_KEY = 'nexus-create-appearance-v1';
export function restoreAppearance(raw: string | null): NexusAppearanceState {
  if (!raw) return PREVIEW_DEFAULT_STATE;
  try {
    const stored: unknown = JSON.parse(raw);
    if (!stored || typeof stored !== 'object' || !('brandColor' in stored))
      return PREVIEW_DEFAULT_STATE;
    const state = sanitizeNexusAppearance(stored);
    return { ...state, mode: state.mode === 'dark' ? 'dark' : 'light' };
  } catch {
    return PREVIEW_DEFAULT_STATE;
  }
}
export function exportAppearance(accepted: AcceptedPreview) {
  return {
    appearance: accepted.state,
    themeCss: accepted.render.appearance.themeCss,
    prefsCss: accepted.render.appearance.prefsCss,
    root: {
      className: accepted.render.appearance.className,
      ...accepted.render.appearance.dataAttrs,
    },
  };
}
export function restoreResult(raw: string | null, revision: number) {
  try {
    return createPreviewResult(restoreAppearance(raw), revision);
  } catch {
    return createPreviewResult(PREVIEW_DEFAULT_STATE, revision);
  }
}
