import { describe, expect, it } from 'vitest';

import { DEFAULT_NEXUS_APPEARANCE } from './appearance-model';
import { BRAND_COLOR_PRESETS, findBrandColorPreset } from './brand-presets';
import { isColor } from './perceptual-ramp';

describe('brand color presets', () => {
  it('leads with the default appearance brand color', () => {
    expect(BRAND_COLOR_PRESETS[0]).toMatchObject({
      value: 'default',
      color: DEFAULT_NEXUS_APPEARANCE.brandColor,
    });
  });

  it('gives every preset a distinct normalized hex so its label can be inferred', () => {
    const colors = BRAND_COLOR_PRESETS.map((preset) => preset.color);
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('finds a preset from any saved spelling the appearance sanitizer accepts', () => {
    for (const preset of BRAND_COLOR_PRESETS) {
      for (const saved of [preset.color.toUpperCase(), preset.color.slice(1)]) {
        expect(isColor(saved)).toBe(true);
        expect(findBrandColorPreset(saved)).toBe(preset);
      }
    }
    expect(findBrandColorPreset('rgb(79 70 229)')).toMatchObject({
      value: 'indigo',
    });
  });

  it('ignores whitespace around a saved color', () => {
    for (const preset of BRAND_COLOR_PRESETS) {
      expect(findBrandColorPreset(`  ${preset.color} `)).toBe(preset);
    }
  });

  it('returns undefined for a custom brand color', () => {
    expect(findBrandColorPreset('#ff5733')).toBeUndefined();
    expect(findBrandColorPreset('fff')).toBeUndefined();
    expect(findBrandColorPreset('oklch(0.62 0.2 140)')).toBeUndefined();
  });

  it('returns undefined for a translucent preset color', () => {
    expect(findBrandColorPreset('#4f46e580')).toBeUndefined();
  });

  it('returns undefined for a value that is not a color', () => {
    expect(findBrandColorPreset('not-a-color')).toBeUndefined();
    expect(findBrandColorPreset('')).toBeUndefined();
  });
});
