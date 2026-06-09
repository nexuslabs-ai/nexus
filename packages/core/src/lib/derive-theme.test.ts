import { oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { deriveSurfaces } from './derive-theme';

function lOf(oklchStr: string): number {
  return oklch(parse(oklchStr)!)!.l!;
}

describe('deriveSurfaces', () => {
  it('keeps background at the seed lightness', () => {
    const s = deriveSurfaces('#181818', 'dark', 0.05);
    expect(lOf(s['--nx-color-background'])).toBeCloseTo(lOf('#181818'), 1);
  });

  it('elevates container lighter than background in dark mode', () => {
    const s = deriveSurfaces('#181818', 'dark', 0.05);
    expect(lOf(s['--nx-color-container'])).toBeGreaterThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('recedes hover darker than background in light mode', () => {
    const s = deriveSurfaces('#ffffff', 'light', 0.05);
    expect(lOf(s['--nx-color-background-hover'])).toBeLessThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('widens the ladder as contrast (delta) grows', () => {
    const lo = deriveSurfaces('#181818', 'dark', 0.02);
    const hi = deriveSurfaces('#181818', 'dark', 0.08);
    const spread = (s: Record<string, string>) =>
      lOf(s['--nx-color-popover']) - lOf(s['--nx-color-background']);
    expect(spread(hi)).toBeGreaterThan(spread(lo));
  });
});
