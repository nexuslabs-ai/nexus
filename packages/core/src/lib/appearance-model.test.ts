import { describe, expect, it } from 'vitest';

import {
  BASE_TONE_OPTIONS,
  BASE_TONE_SEEDS,
  CORNER_OPTIONS,
  DEFAULT_BRAND_COLOR,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
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
