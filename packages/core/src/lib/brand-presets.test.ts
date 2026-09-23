import { describe, expect, it } from 'vitest';

import { DEFAULT_NEXUS_APPEARANCE } from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';

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
});
