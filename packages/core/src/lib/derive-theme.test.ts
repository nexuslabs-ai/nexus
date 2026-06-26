import { simulate } from '@bjornlu/colorblind';
import {
  clampChroma,
  converter,
  differenceEuclidean,
  oklch,
  parse,
} from 'culori';
import { describe, expect, it } from 'vitest';

import { apcaLc } from './apca';
import {
  type CodexThemeContract,
  derivePrimary,
  deriveSurfaces,
  deriveText,
  deriveTheme,
  type SurfaceTone,
  themeToCss,
} from './derive-theme';
import { TIER_THRESHOLDS } from './palette';

function lOf(oklchStr: string | undefined): number {
  return oklch(parse(oklchStr!)!)!.l!;
}

function hOf(oklchStr: string | undefined): number {
  return oklch(parse(oklchStr!)!)!.h!;
}

const toRgb = converter('rgb');
const oklabDelta = differenceEuclidean('oklab');
const COLORBLIND_DELTA_E = 0.02;
const VISION_TYPES = [
  'normal',
  'deuteranopia',
  'protanopia',
  'tritanopia',
] as const;

function toSrgbInts(input: string): [number, number, number] {
  const parsed = parse(input);
  if (!parsed) throw new Error(`cannot parse color '${input}'`);
  const rgb = toRgb(clampChroma(oklch(parsed)!, 'oklch', 'rgb'));
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

function simulatedRgb(
  color: string,
  visionType: (typeof VISION_TYPES)[number]
): [number, number, number] {
  const rgb = toSrgbInts(color);
  if (visionType === 'normal') return rgb;
  const sim = simulate({ r: rgb[0], g: rgb[1], b: rgb[2] }, visionType);
  return [sim.r, sim.g, sim.b];
}

function rgbToCulori([r, g, b]: [number, number, number]) {
  return { mode: 'rgb' as const, r: r / 255, g: g / 255, b: b / 255 };
}

function deltaE(
  colorA: string,
  colorB: string,
  visionType: (typeof VISION_TYPES)[number]
): number {
  return oklabDelta(
    rgbToCulori(simulatedRgb(colorA, visionType)),
    rgbToCulori(simulatedRgb(colorB, visionType))
  );
}

function expectPairwiseDistinguishable(
  label: string,
  colors: Record<string, string>
): void {
  const entries = Object.entries(colors);
  for (const visionType of VISION_TYPES) {
    for (let i = 0; i < entries.length - 1; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const [nameA, colorA] = entries[i]!;
        const [nameB, colorB] = entries[j]!;
        expect(
          deltaE(colorA, colorB, visionType),
          `${label} ${nameA} vs ${nameB} under ${visionType}`
        ).toBeGreaterThanOrEqual(COLORBLIND_DELTA_E);
      }
    }
  }
}

describe('deriveSurfaces', () => {
  const surfaceTone: SurfaceTone = 'neutral';

  it('keeps background at the seed lightness', () => {
    const s = deriveSurfaces('#181818', surfaceTone, 'dark', 0.05);
    expect(lOf(s['--nx-color-background'])).toBeCloseTo(lOf('#181818'), 1);
  });

  it('elevates container lighter than background in dark mode', () => {
    const s = deriveSurfaces('#181818', surfaceTone, 'dark', 0.05);
    expect(lOf(s['--nx-color-container'])).toBeGreaterThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('recedes hover darker than background in light mode', () => {
    const s = deriveSurfaces('#ffffff', surfaceTone, 'light', 0.05);
    expect(lOf(s['--nx-color-background-hover'])).toBeLessThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('widens the ladder as contrast (delta) grows', () => {
    const lo = deriveSurfaces('#181818', surfaceTone, 'dark', 0.02);
    const hi = deriveSurfaces('#181818', surfaceTone, 'dark', 0.08);
    const spread = (s: Record<string, string>) =>
      lOf(s['--nx-color-popover']) - lOf(s['--nx-color-background']);
    expect(spread(hi)).toBeGreaterThan(spread(lo));
  });
});

describe('deriveText', () => {
  const surfaces = deriveSurfaces('#181818', 'neutral', 'dark', 0.05);

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
    const mid = deriveSurfaces('#7d7d7d', 'neutral', 'light', 0.05);
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

const SURFACE_TONE_SEEDS = {
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
  contrast: 60,
} as const;

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

describe('deriveSecondary', () => {
  const N = {
    '50': 'oklch(0.985 0 0)',
    '100': 'oklch(0.945 0 0)',
    '200': 'oklch(0.87 0 0)',
    '300': 'oklch(0.765 0 0)',
    '600': 'oklch(0.46 0 0)',
    '700': 'oklch(0.385 0 0)',
    '800': 'oklch(0.297 0 0)',
    '900': 'oklch(0.207 0 0)',
    '950': 'oklch(0.118 0 0)',
  };

  it('secondary exactly matches the curated neutral map (both modes)', () => {
    const { light, dark } = deriveTheme({
      appearance: 'light',
      light: {
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#181818',
      },
      dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
      contrast: 60,
    });
    expect(light['--nx-color-secondary-background']).toBe(N['100']);
    expect(light['--nx-color-secondary-foreground']).toBe(N['900']);
    expect(light['--nx-color-secondary-subtle-foreground']).toBe(N['600']);
    expect(dark['--nx-color-secondary-background']).toBe(N['900']);
    expect(dark['--nx-color-secondary-foreground']).toBe(N['100']);
    expect(dark['--nx-color-secondary-subtle']).toBe(N['800']);
    expect(light['--nx-color-border-secondary']).toBeUndefined();
  });
});

describe('status families', () => {
  const STATUS_HUES = {
    success: 140.055,
    warning: 38.402,
    error: 27.926,
    information: 255.276,
  };

  it.each(['light', 'dark'] as const)(
    'uses curated hues + is APCA-legible on background and subtle in %s mode',
    (mode) => {
      const theme = deriveTheme({
        appearance: mode,
        light: {
          accent: '#2563eb',
          background: '#ffffff',
          foreground: '#181818',
        },
        dark: {
          accent: '#2563eb',
          background: '#181818',
          foreground: '#ffffff',
        },
        contrast: 60,
      })[mode];

      for (const [status, hue] of Object.entries(STATUS_HUES)) {
        expect(
          hOf(theme[`--nx-color-${status}-background`]),
          `${status} background hue`
        ).toBeCloseTo(hue, 0);
        expect(
          apcaLc(
            theme[`--nx-color-${status}-foreground`]!,
            theme[`--nx-color-${status}-background`]!
          ),
          `${status} foreground on background`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
        expect(
          apcaLc(
            theme[`--nx-color-${status}-subtle-foreground`]!,
            theme[`--nx-color-${status}-subtle`]!
          ),
          `${status} subtle foreground on subtle`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
      }
    }
  );
});

describe('surfaceTone surfaces', () => {
  it('keeps light base flat while tone tints light paper and stepped surfaces', () => {
    const slate = deriveTheme({
      appearance: 'light',
      surfaceTone: 'slate',
      ...SURFACE_TONE_SEEDS,
    }).light;
    const neutral = deriveTheme({
      appearance: 'light',
      surfaceTone: 'neutral',
      ...SURFACE_TONE_SEEDS,
    }).light;

    expect(slate['--nx-color-container']).toBe(slate['--nx-color-background']);
    expect(slate['--nx-color-background']).not.toBe(
      neutral['--nx-color-background']
    );
    expect(lOf(slate['--nx-color-background'])).toBeCloseTo(0.987, 3);
    expect(lOf(neutral['--nx-color-background'])).toBeCloseTo(1, 3);
    expect(slate['--nx-color-muted']).not.toBe(slate['--nx-color-background']);
    expect(slate['--nx-color-container-hover']).not.toBe(
      slate['--nx-color-container']
    );
    expect(slate['--nx-color-muted']).not.toBe(neutral['--nx-color-muted']);
  });
});

describe('chart colors', () => {
  const CHART_LIGHT = [
    'oklch(0.62 0.1405 184.704)',
    'oklch(0.73 0.2243 131.684)',
    'oklch(0.62 0.2044 41.116)',
    'oklch(0.58 0.2489 17.585)',
    'oklch(0.49 0.2912 276.966)',
  ];
  const CHART_DARK = [
    'oklch(0.9 0.1682 180.426)',
    'oklch(0.93 0.2278 124.321)',
    'oklch(0.91 0.0819 70.697)',
    'oklch(0.885 0.0771 10.001)',
    'oklch(0.865 0.069 274.039)',
  ];

  const chartTokens = (map: Record<string, string>) =>
    Array.from(
      { length: 5 },
      (_, index) => map[`--nx-color-chart-categorical-${index + 1}`]
    );

  it('emits the fixed 5-color chart set, distinct per mode', () => {
    const { light, dark } = deriveTheme({
      appearance: 'light',
      surfaceTone: 'neutral',
      ...SURFACE_TONE_SEEDS,
    });

    expect(chartTokens(light)).toEqual(CHART_LIGHT);
    expect(chartTokens(dark)).toEqual(CHART_DARK);
    expect(light['--nx-color-chart-categorical-1']).not.toBe(
      dark['--nx-color-chart-categorical-1']
    );
  });
});

describe('derived colorblind distinguishability', () => {
  it.each(['light', 'dark'] as const)(
    'keeps emitted chart and status colors distinguishable in %s mode',
    (mode) => {
      const map = deriveTheme({
        appearance: mode,
        surfaceTone: 'slate',
        ...SURFACE_TONE_SEEDS,
      })[mode];

      expectPairwiseDistinguishable(
        `${mode} chart`,
        Object.fromEntries(
          Array.from({ length: 5 }, (_, index) => [
            `chart-${index + 1}`,
            map[`--nx-color-chart-categorical-${index + 1}`]!,
          ])
        )
      );
      expectPairwiseDistinguishable(`${mode} status`, {
        success: map['--nx-color-success-background']!,
        warning: map['--nx-color-warning-background']!,
        error: map['--nx-color-error-background']!,
        information: map['--nx-color-information-background']!,
      });
    }
  );
});

describe('alpha and translucent colors', () => {
  it('emits tone-ink + contrast-ink alpha tokens with correct L C H alpha in both modes', () => {
    const { light, dark } = deriveTheme({
      appearance: 'light',
      surfaceTone: 'slate',
      ...SURFACE_TONE_SEEDS,
    });

    expect(light['--nx-color-overlay']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.7529)'
    );
    expect(dark['--nx-color-overlay']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.8471)'
    );
    expect(light['--nx-color-popover-backdrop']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.9098)'
    );
    expect(dark['--nx-color-popover-backdrop']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.9098)'
    );
    expect(light['--nx-color-border-default-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0941)'
    );
    expect(dark['--nx-color-border-default-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.1882)'
    );
    expect(light['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0627)'
    );
    expect(dark['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0627)'
    );
    expect(light['--nx-color-popover-alpha']).toBe('oklch(1 0 0 / 0.9098)');
    expect(dark['--nx-color-popover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.8471)'
    );
    expect(light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(dark['--nx-color-border-default']).toBe('oklch(1 0 0 / 0.1882)');
    expect(light['--nx-color-border-disabled']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(dark['--nx-color-border-disabled']).toBe('oklch(1 0 0 / 0.1882)');
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

const DERIVED_FAMILIES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
] as const;

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
      ];
      for (const family of DERIVED_FAMILIES) {
        checks.push(
          [
            `--nx-color-${family}-foreground`,
            `--nx-color-${family}-background`,
            'ui',
          ],
          [
            `--nx-color-${family}-subtle-foreground`,
            `--nx-color-${family}-subtle`,
            'ui',
          ]
        );
      }

      for (const [fg, bg, tier] of checks) {
        expect(
          apcaLc(map[fg]!, map[bg]!),
          `${fg} on ${bg}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[tier]);
      }
    }
  );
});
