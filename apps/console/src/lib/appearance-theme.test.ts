import { describe, expect, it } from 'vitest';

import {
  applyBaseTone,
  applyBrandColor,
  BASE_TONE_SEEDS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  STROKE_OPTIONS,
} from './appearance-theme';
import { DEFAULT_CODEX_CONTRACT } from './codex-contract';

describe('appearance theme helpers', () => {
  it('maps curated labels to the approved token modes', () => {
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

  it('applies one brand color to both light and dark modes', () => {
    const contract = applyBrandColor(DEFAULT_CODEX_CONTRACT, '#22c55e');
    expect(contract.light.accent).toBe('#22c55e');
    expect(contract.dark.accent).toBe('#22c55e');
  });

  it('applies the selected neutral base tone to both mode seed blocks', () => {
    const contract = applyBaseTone(DEFAULT_CODEX_CONTRACT, 'slate');
    expect(contract.light).toMatchObject(BASE_TONE_SEEDS.slate.light);
    expect(contract.dark).toMatchObject(BASE_TONE_SEEDS.slate.dark);
  });
});
