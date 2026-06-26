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

function lOf(oklchStr: string | undefined): number {
  return oklch(parse(oklchStr!)!)!.l!;
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
      apcaLc(t['--nx-color-foreground']!, surfaces['--nx-color-background']!)
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.body);
  });

  it('muted-foreground is quieter than foreground but still clears ui', () => {
    const t = deriveText('#ffffff', surfaces);
    const bg = surfaces['--nx-color-background']!;
    expect(
      apcaLc(t['--nx-color-muted-foreground']!, bg)
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
    // genuinely muted: lower contrast than the body foreground (this is what the
    // adjustContrast approach got wrong on dark surfaces — it returned max contrast).
    expect(apcaLc(t['--nx-color-muted-foreground']!, bg)).toBeLessThan(
      apcaLc(t['--nx-color-foreground']!, bg)
    );
  });

  it('does not throw on a pathological mid-grey pairing', () => {
    const mid = deriveSurfaces('#7d7d7d', 'light', 0.05);
    expect(() => deriveText('#808080', mid)).not.toThrow();
  });
});

describe('deriveFamily / derivePrimary snapshot', () => {
  it('primary token values are unchanged by the deriveFamily refactor', () => {
    expect(derivePrimary('#2563eb', 'light')).toMatchInlineSnapshot(`
      {
        "--nx-color-border-primary": "oklch(0.87 0.066 262.881)",
        "--nx-color-border-primary-active": "oklch(0.66 0.1849 262.881)",
        "--nx-color-primary-background": "oklch(0.46 0.2152 262.881)",
        "--nx-color-primary-background-active": "oklch(0.297 0.173 262.881)",
        "--nx-color-primary-background-hover": "oklch(0.385 0.2152 262.881)",
        "--nx-color-primary-disabled": "oklch(0.765 0.1236 262.881)",
        "--nx-color-primary-foreground": "oklch(1 0 0)",
        "--nx-color-primary-subtle": "oklch(0.985 0.0073 262.881)",
        "--nx-color-primary-subtle-active": "oklch(0.87 0.066 262.881)",
        "--nx-color-primary-subtle-foreground": "oklch(0.46 0.2152 262.881)",
        "--nx-color-primary-subtle-hover": "oklch(0.945 0.0273 262.881)",
      }
    `);
    expect(derivePrimary('#2563eb', 'dark')).toMatchInlineSnapshot(`
      {
        "--nx-color-border-primary": "oklch(0.385 0.2152 262.881)",
        "--nx-color-border-primary-active": "oklch(0.553 0.2152 262.881)",
        "--nx-color-primary-background": "oklch(0.46 0.2152 262.881)",
        "--nx-color-primary-background-active": "oklch(0.297 0.173 262.881)",
        "--nx-color-primary-background-hover": "oklch(0.385 0.2152 262.881)",
        "--nx-color-primary-disabled": "oklch(0.118 0.0687 262.881)",
        "--nx-color-primary-foreground": "oklch(1 0 0)",
        "--nx-color-primary-subtle": "oklch(0.118 0.0687 262.881)",
        "--nx-color-primary-subtle-active": "oklch(0.297 0.173 262.881)",
        "--nx-color-primary-subtle-foreground": "oklch(0.765 0.1236 262.881)",
        "--nx-color-primary-subtle-hover": "oklch(0.207 0.1206 262.881)",
      }
    `);
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
        p['--nx-color-primary-foreground']!,
        p['--nx-color-primary-background']!
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
  it('emits :root and :root.dark blocks', () => {
    const css = themeToCss(deriveTheme(CONTRACT));
    expect(css).toMatch(/:root\s*\{/);
    expect(css).toMatch(/:root\.dark\s*\{/);
    expect(css).toContain('--nx-color-background:');
  });
});

// Deterministic spread of dark + light contracts (no RNG — reproducible).
const SWEEP_SEEDS: ReadonlyArray<{
  accent: string;
  background: string;
  foreground: string;
  mode: 'light' | 'dark';
}> = [
  {
    accent: '#339cff',
    background: '#181818',
    foreground: '#ffffff',
    mode: 'dark',
  },
  {
    accent: '#0ea5e9',
    background: '#0b0f14',
    foreground: '#e6edf3',
    mode: 'dark',
  },
  {
    accent: '#e0651a',
    background: '#faf9f7',
    foreground: '#1a1714',
    mode: 'light',
  },
  {
    accent: '#16a34a',
    background: '#ffffff',
    foreground: '#0a0a0a',
    mode: 'light',
  },
  {
    accent: '#a855f7',
    background: '#101014',
    foreground: '#f5f3ff',
    mode: 'dark',
  },
  {
    accent: '#db2777',
    background: '#1c1117',
    foreground: '#fde7f1',
    mode: 'dark',
  },
];

describe('legibility invariant: every text tier clears its APCA floor', () => {
  it.each(SWEEP_SEEDS)(
    'contract %#',
    ({ accent, background, foreground, mode }) => {
      const seeds = { accent, background, foreground };
      const contract: CodexThemeContract = {
        appearance: mode,
        light: seeds,
        dark: seeds,
        contrast: 55,
      };
      const map = deriveTheme(contract)[mode];

      const checks: Array<[string, string, keyof typeof TIER_THRESHOLDS]> = [
        ['--nx-color-foreground', '--nx-color-background', 'body'],
        ['--nx-color-container-foreground', '--nx-color-container', 'body'],
        ['--nx-color-popover-foreground', '--nx-color-popover', 'body'],
        ['--nx-color-nav-foreground', '--nx-color-nav-background', 'body'],
        ['--nx-color-muted-foreground', '--nx-color-background', 'ui'],
        [
          '--nx-color-muted-foreground-subtle',
          '--nx-color-background',
          'incidental',
        ],
        [
          '--nx-color-primary-foreground',
          '--nx-color-primary-background',
          'ui',
        ],
        [
          '--nx-color-primary-subtle-foreground',
          '--nx-color-primary-subtle',
          'ui',
        ],
      ];

      for (const [fg, bg, tier] of checks) {
        expect(
          apcaLc(map[fg]!, map[bg]!),
          `${fg} on ${bg}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[tier]);
      }
    }
  );
});
