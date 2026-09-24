import { describe, expect, it } from 'vitest';

import { APCA_PAIRS } from './apca-pairs';
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { deriveTheme } from './derive-theme';
import { type Mode, TIER_THRESHOLDS } from './palette';
import {
  measureThemeContrast,
  type ThemeContrastCheck,
} from './theme-contrast';

const MODES = ['light', 'dark'] as const;

const key = ({ mode, fg, bg, backdrop }: ThemeContrastCheck) =>
  `${mode}:${fg}/${bg}@${backdrop ?? ''}`;

describe.each(BRAND_COLOR_PRESETS)(
  'measureThemeContrast for the $label brand preset',
  ({ color }) => {
    const theme = deriveTheme(
      createNexusThemeContract({
        ...DEFAULT_NEXUS_APPEARANCE,
        brandColor: color,
      })
    );
    const report = measureThemeContrast(theme);

    it('reports each registered pair exactly once per mode', () => {
      expect(report).toHaveLength(APCA_PAIRS.length * MODES.length);
      expect(new Set(report.map(key)).size).toBe(report.length);
    });

    it('names tokens by the CSS variables the theme declares', () => {
      for (const check of report) {
        expect(theme[check.mode], key(check)).toHaveProperty([check.fg]);
        expect(theme[check.mode], key(check)).toHaveProperty([check.bg]);
        if (check.backdrop?.startsWith('--')) {
          expect(theme[check.mode], key(check)).toHaveProperty([
            check.backdrop,
          ]);
        }
      }
    });

    it('finds every pair at or above its tier floor', () => {
      for (const check of report) {
        expect(check.floor, key(check)).toBe(TIER_THRESHOLDS[check.tier]);
        expect(check.lc, key(check)).toBeGreaterThanOrEqual(check.floor);
        expect(check.pass, key(check)).toBe(true);
      }
    });
  }
);

describe('measureThemeContrast on a broken theme', () => {
  const theme = deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE));
  const report = measureThemeContrast({
    ...theme,
    dark: {
      ...theme.dark,
      '--nx-color-foreground': theme.dark['--nx-color-background']!,
    },
  });
  const bodyText = (mode: Mode) =>
    report.find(
      (check) =>
        check.mode === mode &&
        check.fg === '--nx-color-foreground' &&
        check.bg === '--nx-color-background'
    );

  it('fails the broken pair in the broken mode only', () => {
    expect(bodyText('dark')).toMatchObject({ lc: 0, pass: false });
    expect(bodyText('light')).toMatchObject({ pass: true });
    expect(
      report.filter((check) => check.mode === 'light' && !check.pass)
    ).toEqual([]);
  });
});
