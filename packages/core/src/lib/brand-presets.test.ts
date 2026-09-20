import { describe, expect, it } from 'vitest';

import primitiveColors from '../../tokens/primitives/color.json';
import { BRAND_COLOR_PRESETS } from '../palette';

import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { getPaletteShade } from './primitive-palette';

describe('brand color presets', () => {
  it('keeps the default and uses authored 600 hex seeds for the eight color choices', () => {
    expect(BRAND_COLOR_PRESETS.map((preset) => preset.value)).toEqual([
      'default',
      'indigo',
      'blue',
      'violet',
      'rose',
      'orange',
      'amber',
      'green',
      'teal',
    ]);
    expect(BRAND_COLOR_PRESETS[0]?.color).toBe(DEFAULT_BRAND_COLOR);
    expect(DEFAULT_NEXUS_APPEARANCE.brandColor).toBe(DEFAULT_BRAND_COLOR);
    for (const family of [
      'indigo',
      'blue',
      'violet',
      'rose',
      'orange',
      'amber',
      'green',
      'teal',
    ] as const) {
      const preset = BRAND_COLOR_PRESETS.find(
        (option) => option.value === family
      );
      expect(preset?.color).toBe(primitiveColors[family]['600'].$value);
      expect(preset?.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(preset?.color).not.toBe(getPaletteShade(family, '600'));
    }
  });

  it('cannot mutate shared preset entries or the catalog', () => {
    const first = BRAND_COLOR_PRESETS[0]!;
    expect(Reflect.set(first, 'color', '#ffffff')).toBe(false);
    expect(Reflect.set(BRAND_COLOR_PRESETS, '0', {})).toBe(false);
    expect(first.color).toBe(DEFAULT_BRAND_COLOR);
    expect(Object.isFrozen(BRAND_COLOR_PRESETS)).toBe(true);
    expect(BRAND_COLOR_PRESETS.every(Object.isFrozen)).toBe(true);
  });
});
