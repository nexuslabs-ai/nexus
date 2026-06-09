import { oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { apcaLc } from './apca';
import { deriveSurfaces, deriveText } from './derive-theme';
import { TIER_THRESHOLDS } from './palette';

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

describe('deriveText', () => {
  const surfaces = deriveSurfaces('#181818', 'dark', 0.05);

  it('keeps a white foreground that already passes body', () => {
    const t = deriveText('#ffffff', surfaces);
    expect(lOf(t['--nx-color-foreground'])).toBeGreaterThan(0.97);
  });

  it('produces foreground that clears the body tier on background', () => {
    const t = deriveText('#ffffff', surfaces);
    expect(
      apcaLc(t['--nx-color-foreground'], surfaces['--nx-color-background'])
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.body);
  });

  it('muted-foreground is quieter than foreground but still clears ui', () => {
    const t = deriveText('#ffffff', surfaces);
    const bg = surfaces['--nx-color-background'];
    expect(apcaLc(t['--nx-color-muted-foreground'], bg)).toBeGreaterThanOrEqual(
      TIER_THRESHOLDS.ui
    );
    // genuinely muted: lower contrast than the body foreground (this is what the
    // adjustContrast approach got wrong on dark surfaces — it returned max contrast).
    expect(apcaLc(t['--nx-color-muted-foreground'], bg)).toBeLessThan(
      apcaLc(t['--nx-color-foreground'], bg)
    );
  });

  it('does not throw on a pathological mid-grey pairing', () => {
    const mid = deriveSurfaces('#7d7d7d', 'light', 0.05);
    expect(() => deriveText('#808080', mid)).not.toThrow();
  });
});
