import { describe, expect, it } from 'vitest';

import {
  BASE_TONE_OPTIONS,
  BASE_TONE_SEEDS,
  CORNER_OPTIONS,
  DEFAULT_BRAND_COLOR,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  sanitizeNexusAppearance,
  sanitizeNexusAppearancePrefs,
  STROKE_OPTIONS,
} from './appearance-model';

describe('appearance model', () => {
  it('uses the agreed package defaults', () => {
    expect(DEFAULT_NEXUS_APPEARANCE).toMatchObject({
      mode: 'light',
      brandColor: DEFAULT_BRAND_COLOR,
      surfaceTone: 'stone',
      contrast: 60,
      density: 'mira',
      corners: 'sharp',
      elevation: 'maia',
      stroke: 'vega',
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
      { value: 'nova', label: 'Compact' },
      { value: 'mira', label: 'Default' },
      { value: 'luma', label: 'Comfortable' },
      { value: 'sera', label: 'Spacious' },
    ]);
    expect(CORNER_OPTIONS).toEqual([
      { value: 'sharp', label: 'Square' },
      { value: 'subtle', label: 'Subtle' },
      { value: 'smooth', label: 'Smooth' },
      { value: 'mellow', label: 'Round' },
    ]);
    expect(ELEVATION_OPTIONS).toEqual([
      { value: 'maia', label: 'Quiet' },
      { value: 'mira', label: 'Standard' },
      { value: 'nova', label: 'Strong' },
    ]);
    expect(STROKE_OPTIONS).toEqual([
      { value: 'maia', label: 'Fine' },
      { value: 'vega', label: 'Normal' },
      { value: 'nova', label: 'Strong' },
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
      contrast: 42,
      density: 'sera' as const,
      corners: 'mellow' as const,
      elevation: 'nova' as const,
      stroke: 'maia' as const,
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
    ).toBe('#339cff');
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        contrast: 999,
      }).contrast
    ).toBe(60);
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        density: 'wat',
      }).density
    ).toBe('mira');
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
});
