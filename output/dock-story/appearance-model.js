import { DEFAULT_NXDS_APPEARANCE, sanitizeNxdsAppearance } from '@nxds/core';

export const PREVIEW_CHANNEL = 'nexus-appearance-preview-v1';

export function initialPreviewAppearance(mode = 'dark') {
  return sanitizeNxdsAppearance({
    ...DEFAULT_NXDS_APPEARANCE,
    mode,
    surfaceTone: 'neutral',
    corners: 'smooth',
    prefs: {
      ...DEFAULT_NXDS_APPEARANCE.prefs,
      uiFont: 'DM Sans, Arial, sans-serif',
      uiFontSize: 16,
    },
  });
}
