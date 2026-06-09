import { oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { apcaLc } from './apca';
import {
  type CodexThemeContract,
  derivePrimary,
  deriveSurfaces,
  deriveText,
  deriveTheme,
  themeToCss,
} from './derive-theme';
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

describe('derivePrimary', () => {
  it('maps primary-background to the 600 shade of the accent ramp', () => {
    const p = derivePrimary('#339cff', 'light');
    expect(p['--nx-color-primary-background']).toBeDefined();
    // hover is darker (700) than background (600)
    expect(lOf(p['--nx-color-primary-background-hover'])).toBeLessThan(
      lOf(p['--nx-color-primary-background'])
    );
  });

  it('picks an on-primary foreground that clears the ui tier', () => {
    const p = derivePrimary('#339cff', 'light');
    expect(
      apcaLc(
        p['--nx-color-primary-foreground'],
        p['--nx-color-primary-background']
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  });
});

const CONTRACT: CodexThemeContract = {
  appearance: 'dark',
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#0a0a0a' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
  contrast: 60,
};

describe('deriveTheme', () => {
  it('returns light and dark maps with the core tokens', () => {
    const d = deriveTheme(CONTRACT);
    for (const map of [d.light, d.dark]) {
      expect(map['--nx-color-background']).toBeDefined();
      expect(map['--nx-color-foreground']).toBeDefined();
      expect(map['--nx-color-primary-background']).toBeDefined();
      expect(map['--nx-color-container']).toBeDefined();
    }
  });

  it('uses the per-theme seed blocks', () => {
    const d = deriveTheme(CONTRACT);
    expect(lOf(d.dark['--nx-color-background'])).toBeLessThan(0.3); // dark seed
    expect(lOf(d.light['--nx-color-background'])).toBeGreaterThan(0.9); // light seed
  });
});

describe('themeToCss', () => {
  it('emits html and html.dark blocks', () => {
    const css = themeToCss(deriveTheme(CONTRACT));
    expect(css).toMatch(/html\s*\{/);
    expect(css).toMatch(/html\.dark\s*\{/);
    expect(css).toContain('--nx-color-background:');
  });
});
