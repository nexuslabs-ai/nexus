import {
  createNexusThemeContract,
  inspectTheme,
  themeToCss,
} from '@nexus_ds/core';
import { describe, expect, it } from 'vitest';

import { exportAppearance } from './appearance-state';
import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
  updatePreviewResult,
} from './preview/accepted-result';
describe('playground appearance', () => {
  it('resolves system mode consistently for preview and export', () => {
    const state = { ...PREVIEW_DEFAULT_STATE, mode: 'system' as const };
    const accepted = createPreviewResult(state, 1, undefined, true);
    expect(accepted.render.appearance.colorScheme).toBe('dark');
    expect(exportAppearance(accepted).appearance.mode).toBe('system');
    expect(exportAppearance(accepted).root.className).toBe('dark');
  });
  it('rederives tone and contrast while export exactly matches accepted preview', () => {
    const initial = createPreviewResult(PREVIEW_DEFAULT_STATE, 1);
    for (const patch of [
      { surfaceTone: 'slate' } as const,
      { lightContrast: 80 },
      { darkContrast: 75 },
    ]) {
      const next = updatePreviewResult(initial, patch);
      expect(next.inspection.theme).toEqual(
        inspectTheme(createNexusThemeContract(next.state)).theme
      );
      expect(exportAppearance(next).themeCss).toBe(
        themeToCss(next.inspection.theme)
      );
      expect(exportAppearance(next).prefsCss).toBe(
        next.render.appearance.prefsCss
      );
    }
  });
});
