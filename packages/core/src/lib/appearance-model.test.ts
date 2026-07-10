import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  appearancePrefsToCss,
  BASE_TONE_OPTIONS,
  BASE_TONE_SEEDS,
  CORNER_OPTIONS,
  createNexusThemeContract,
  DEFAULT_BRAND_COLOR,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  normalizeAppearanceModeIds,
  sanitizeNexusAppearance,
  sanitizeNexusAppearancePrefs,
  STROKE_OPTIONS,
} from './appearance-model';
import { deriveTheme } from './derive-theme';

describe('appearance model', () => {
  it('uses the agreed package defaults', () => {
    expect(DEFAULT_NEXUS_APPEARANCE).toMatchObject({
      mode: 'light',
      brandColor: DEFAULT_BRAND_COLOR,
      surfaceTone: 'stone',
      lightContrast: 60,
      darkContrast: 0,
      density: 'default',
      corners: 'square',
      elevation: 'quiet',
      stroke: 'normal',
      prefs: {
        uiFontSize: 14,
        codeFontSize: 12,
        reduceMotion: 'system',
        pointerCursors: false,
        fontSmoothing: true,
      },
    });
  });

  it('offers only the supported neutral surface tones', () => {
    expect(BASE_TONE_OPTIONS.map((option) => option.value)).toEqual([
      'stone',
      'neutral',
      'zinc',
      'slate',
      'gray',
    ]);

    expect(Object.keys(BASE_TONE_SEEDS).sort()).toEqual(
      BASE_TONE_OPTIONS.map((option) => option.value).sort()
    );
  });

  it('keeps every surface tone seed shaped for light and dark derivation', () => {
    for (const seeds of Object.values(BASE_TONE_SEEDS)) {
      expect(Object.keys(seeds.light).sort()).toEqual([
        'background',
        'foreground',
      ]);
      expect(Object.keys(seeds.dark).sort()).toEqual([
        'background',
        'foreground',
      ]);
    }
  });

  it('maps friendly layout labels to token axes', () => {
    expect(DENSITY_OPTIONS).toEqual([
      { value: 'tight', label: 'Tight' },
      { value: 'compact', label: 'Compact' },
      { value: 'default', label: 'Default' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'relaxed', label: 'Relaxed' },
      { value: 'spacious', label: 'Spacious' },
    ]);
    expect(CORNER_OPTIONS).toEqual([
      { value: 'square', label: 'Square' },
      { value: 'subtle', label: 'Subtle' },
      { value: 'smooth', label: 'Smooth' },
      { value: 'round', label: 'Round' },
      { value: 'extra-round', label: 'Extra Round' },
    ]);
    expect(ELEVATION_OPTIONS).toEqual([
      { value: 'flat', label: 'Flat' },
      { value: 'quiet', label: 'Quiet' },
      { value: 'soft', label: 'Soft' },
      { value: 'standard', label: 'Standard' },
      { value: 'strong', label: 'Strong' },
    ]);
    expect(STROKE_OPTIONS).toEqual([
      { value: 'fine', label: 'Fine' },
      { value: 'normal', label: 'Normal' },
      { value: 'strong', label: 'Strong' },
    ]);
  });
});

describe('sanitizeNexusAppearance', () => {
  it('falls back to default on non-object payloads', () => {
    expect(sanitizeNexusAppearance(null)).toEqual(DEFAULT_NEXUS_APPEARANCE);
    expect(sanitizeNexusAppearance('x')).toEqual(DEFAULT_NEXUS_APPEARANCE);
  });

  it('passes a valid state through unchanged', () => {
    const valid = {
      ...DEFAULT_NEXUS_APPEARANCE,
      mode: 'system' as const,
      brandColor: '#2563eb',
      surfaceTone: 'slate' as const,
      lightContrast: 42,
      darkContrast: 42,
      density: 'tight' as const,
      corners: 'extra-round' as const,
      elevation: 'flat' as const,
      stroke: 'fine' as const,
      prefs: {
        ...DEFAULT_NEXUS_APPEARANCE.prefs,
        uiFontSize: 16,
        codeFontSize: 13,
        reduceMotion: 'on' as const,
        pointerCursors: true,
      },
    };

    expect(sanitizeNexusAppearance(valid)).toEqual(valid);
  });

  it('accepts every shipped layout mode', () => {
    for (const option of DENSITY_OPTIONS) {
      expect(sanitizeNexusAppearance({ density: option.value }).density).toBe(
        option.value
      );
    }

    for (const option of CORNER_OPTIONS) {
      expect(sanitizeNexusAppearance({ corners: option.value }).corners).toBe(
        option.value
      );
    }

    for (const option of ELEVATION_OPTIONS) {
      expect(
        sanitizeNexusAppearance({ elevation: option.value }).elevation
      ).toBe(option.value);
    }
  });

  it('rejects prototype-chain keys as tones', () => {
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone: 'toString',
      }).surfaceTone
    ).toBe('stone');
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone: 'hasOwnProperty',
      }).surfaceTone
    ).toBe('stone');
  });

  it('rejects invalid brand color, contrast, and enum values', () => {
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        brandColor: 'not-a-color',
      }).brandColor
    ).toBe(DEFAULT_BRAND_COLOR);
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        lightContrast: 999,
      }).lightContrast
    ).toBe(60);
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        density: 'wat',
      }).density
    ).toBe('default');
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        corners: 'pill',
      }).corners
    ).toBe('square');
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        elevation: 'dramatic',
      }).elevation
    ).toBe('quiet');
  });

  it('normalizes a persisted density codename to its friendly value', () => {
    expect(sanitizeNexusAppearance({ density: 'nova' }).density).toBe(
      'compact'
    );
  });

  it('normalizes a persisted elevation codename to its friendly value', () => {
    expect(sanitizeNexusAppearance({ elevation: 'maia' }).elevation).toBe(
      'quiet'
    );
  });

  it('normalizes a persisted corner codename to its friendly value', () => {
    expect(sanitizeNexusAppearance({ corners: 'mellow' }).corners).toBe(
      'round'
    );
  });

  it('normalizes a persisted stroke codename to its friendly value', () => {
    expect(sanitizeNexusAppearance({ stroke: 'maia' }).stroke).toBe('fine');
  });

  it('preserves system mode verbatim', () => {
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        mode: 'system',
      }).mode
    ).toBe('system');
  });
});

describe('normalizeAppearanceModeIds', () => {
  it('is identity on already-friendly values and non-strings', () => {
    expect(
      normalizeAppearanceModeIds({ density: 'compact', corners: 7 })
    ).toMatchObject({ density: 'compact', corners: 7 });
  });

  it('passes non-records through unchanged', () => {
    expect(normalizeAppearanceModeIds('nope')).toBe('nope');
  });
});

describe('sanitizeNexusAppearancePrefs', () => {
  it('clamps font sizes into [8,32] and falls back per field', () => {
    expect(sanitizeNexusAppearancePrefs({ uiFontSize: 99 }).uiFontSize).toBe(
      32
    );
    expect(sanitizeNexusAppearancePrefs({ codeFontSize: 2 }).codeFontSize).toBe(
      8
    );
    expect(sanitizeNexusAppearancePrefs({ uiFontSize: 0 }).uiFontSize).toBe(14);
    expect(sanitizeNexusAppearancePrefs({ codeFontSize: 0 }).codeFontSize).toBe(
      12
    );
  });

  it('falls back per preference field without restoring the whole object', () => {
    const result = sanitizeNexusAppearancePrefs({
      uiFont: 'Inter',
      codeFont: 123,
      reduceMotion: 'off',
      pointerCursors: true,
      fontSmoothing: 'yes',
    });

    expect(result).toEqual({
      ...DEFAULT_NEXUS_APPEARANCE.prefs,
      uiFont: 'Inter',
      reduceMotion: 'off',
      pointerCursors: true,
    });
  });

  it('rejects font families with CSS-breaking characters', () => {
    // appearancePrefsToCss interpolates these into a <style> rule.
    expect(
      sanitizeNexusAppearancePrefs({ uiFont: 'Inter } body { display:none' })
        .uiFont
    ).toBe(DEFAULT_NEXUS_APPEARANCE.prefs.uiFont);
    expect(
      sanitizeNexusAppearancePrefs({ codeFont: 'Mono; color:red' }).codeFont
    ).toBe(DEFAULT_NEXUS_APPEARANCE.prefs.codeFont);
  });
});

describe('createNexusThemeContract', () => {
  it('puts brand color on both light and dark accent seeds', () => {
    const contract = createNexusThemeContract({
      ...DEFAULT_NEXUS_APPEARANCE,
      brandColor: '#ff0000',
    });

    expect(contract.light.accent).toBe('#ff0000');
    expect(contract.dark.accent).toBe('#ff0000');
  });

  it('pulls background and foreground seeds from the selected surface tone', () => {
    const contract = createNexusThemeContract({
      ...DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: 'slate',
    });

    expect(contract.light.background).toBe(
      BASE_TONE_SEEDS.slate.light.background
    );
    expect(contract.dark.foreground).toBe(
      BASE_TONE_SEEDS.slate.dark.foreground
    );
    expect(contract.surfaceTone).toBe('slate');
    expect(contract.contrast).toEqual({ light: 60, dark: 0 });
  });

  it.each(['stone', 'neutral', 'zinc', 'slate', 'gray'] as const)(
    'round-trips through deriveTheme without missing keys (%s)',
    (surfaceTone) => {
      const contract = createNexusThemeContract({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone,
      });
      const theme = deriveTheme(contract);

      expect(Object.keys(theme.light).length).toBeGreaterThan(60);
      expect(Object.keys(theme.dark).length).toBe(
        Object.keys(theme.light).length
      );
    }
  );

  describe('contrast fields', () => {
    const clean = (patch: Record<string, unknown>) =>
      sanitizeNexusAppearance({ ...DEFAULT_NEXUS_APPEARANCE, ...patch });

    it('accepts independent in-range light/dark values', () => {
      expect(clean({ lightContrast: 40, darkContrast: 80 })).toMatchObject({
        lightContrast: 40,
        darkContrast: 80,
      });
    });

    it('falls back per-field on out-of-range, NaN, and wrong type', () => {
      expect(clean({ lightContrast: 999, darkContrast: -5 })).toMatchObject({
        lightContrast: 60,
        darkContrast: 0,
      });
      expect(
        clean({ lightContrast: Number.NaN, darkContrast: 42 })
      ).toMatchObject({
        lightContrast: 60,
        darkContrast: 42,
      });
      expect(clean({ lightContrast: 'x', darkContrast: 30 })).toMatchObject({
        lightContrast: 60,
        darkContrast: 30,
      });
    });

    it('does NOT migrate the legacy scalar `contrast` key — resets to defaults', () => {
      const result = sanitizeNexusAppearance({
        mode: 'light',
        brandColor: '#0a0a0a',
        surfaceTone: 'stone',
        contrast: 85, // pre-flat persisted value; intentionally dropped (pre-production, no shim)
        density: 'default',
        corners: 'square',
        elevation: 'quiet',
        stroke: 'normal',
        prefs: DEFAULT_NEXUS_APPEARANCE.prefs,
      });
      expect(result).toMatchObject({ lightContrast: 60, darkContrast: 0 });
    });
  });
});

describe('appearancePrefsToCss', () => {
  const prefs = DEFAULT_NEXUS_APPEARANCE.prefs;
  const typographyVarPattern =
    /--nx-typography-(?:size|line-height)-[a-z0-9]+:\s*[^;]+;/g;

  function typographyDeclarations(css: string) {
    return (css.match(typographyVarPattern) ?? []).sort();
  }

  it('emits font variables, clamped root size, code size, and smoothing', () => {
    const css = appearancePrefsToCss({
      ...prefs,
      uiFont: 'Inter',
      codeFont: 'JetBrains Mono',
      uiFontSize: 99,
      codeFontSize: 0,
    });

    expect(css).toContain('--nx-typography-family-font-sans: Inter;');
    expect(css).toContain('--nx-typography-family-font-mono: JetBrains Mono;');
    expect(css).toContain('font-size: 32px;');
    expect(css).toContain('--nx-typography-size-sm: 32px;');
    expect(css).toContain('--nx-typography-line-height-sm: 45.7143px;');
    expect(css).toContain(
      'code, pre, .nx\\:font-mono, .nx\\:typography-code-block, .nx\\:typography-code-inline { font-size: 12px; }'
    );
    expect(css).toContain('-webkit-font-smoothing: antialiased');
  });

  it('pairs -moz-osx-font-smoothing with the -webkit property', () => {
    const on = appearancePrefsToCss({
      ...prefs,
      fontSmoothing: true,
    });
    expect(on).toContain('-webkit-font-smoothing: antialiased');
    expect(on).toContain('-moz-osx-font-smoothing: grayscale');

    const off = appearancePrefsToCss({
      ...prefs,
      fontSmoothing: false,
    });
    expect(off).toContain('-webkit-font-smoothing: auto');
    expect(off).toContain('-moz-osx-font-smoothing: auto');
  });

  it('keeps default runtime typography variables in parity with generated tokens', () => {
    const generatedCss = readFileSync(
      resolve(process.cwd(), 'packages/tailwind/variables.css'),
      'utf8'
    );

    expect(typographyDeclarations(appearancePrefsToCss(prefs))).toEqual(
      typographyDeclarations(generatedCss)
    );
  });

  it('emits the reduced-motion block only when reduceMotion is on', () => {
    expect(appearancePrefsToCss({ ...prefs, reduceMotion: 'on' })).toContain(
      'transition-duration: 0.01ms'
    );
    expect(
      appearancePrefsToCss({ ...prefs, reduceMotion: 'off' })
    ).not.toContain('0.01ms');
    expect(
      appearancePrefsToCss({ ...prefs, reduceMotion: 'system' })
    ).not.toContain('0.01ms');
  });

  it('emits the pointer cursor rule only when pointer cursors are enabled', () => {
    expect(appearancePrefsToCss({ ...prefs, pointerCursors: true })).toContain(
      'cursor: pointer'
    );
    expect(
      appearancePrefsToCss({ ...prefs, pointerCursors: false })
    ).not.toContain('cursor: pointer');
  });

  it('never emits console-only selectors', () => {
    const css = appearancePrefsToCss(prefs);

    expect(css).not.toContain('sidebar-container');
    expect(css).not.toContain('diff');
  });
});
