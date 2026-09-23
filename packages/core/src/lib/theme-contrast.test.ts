import { describe, expect, it } from 'vitest';

import { APCA_PAIRS, type ApcaPair } from './apca-pairs';
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { contrastForPair } from './contrast';
import { deriveTheme } from './derive-theme';
import { TIER_THRESHOLDS } from './palette';
import {
  measureThemeContrast,
  type ThemeContrastCheck,
} from './theme-contrast';

const MODES = ['light', 'dark'] as const;

const key = (
  mode: string,
  { fg, bg, backdrop }: Pick<ApcaPair, 'fg' | 'bg' | 'backdrop'>
) => `${mode}:${fg}/${bg}@${backdrop ?? ''}`;

describe.each(BRAND_COLOR_PRESETS)(
  'measureThemeContrast for the $label brand preset',
  ({ color }) => {
    const input = createNexusThemeContract({
      ...DEFAULT_NEXUS_APPEARANCE,
      brandColor: color,
    });
    const theme = deriveTheme(input);
    const report = measureThemeContrast(theme, input.contrast);
    const byPair = new Map<string, ThemeContrastCheck>(
      report.map((check) => [key(check.mode, check), check])
    );

    it('reports each registered pair exactly once per mode', () => {
      expect(report).toHaveLength(APCA_PAIRS.length * MODES.length);
      expect(byPair.size).toBe(report.length);
    });

    it.each(MODES)(
      'measures every pair in %s mode with the shared APCA measurement',
      (mode) => {
        for (const pair of APCA_PAIRS) {
          const check = byPair.get(key(mode, pair));
          expect(check, key(mode, pair)).toMatchObject({
            tier: pair.tier,
            floor: TIER_THRESHOLDS[pair.tier],
            lc: contrastForPair(theme[mode], pair),
          });
        }
      }
    );

    it('finds every pair at or above its tier floor', () => {
      for (const check of report) {
        expect(check.lc, key(check.mode, check)).toBeGreaterThanOrEqual(
          check.floor
        );
        expect(check.pass).toBe(true);
        expect(check.target).toBeGreaterThanOrEqual(check.floor);
      }
    });
  }
);
