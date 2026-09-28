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
import { APCA_PAIRS } from './apca-pairs';
import {
  BASE_TONE_OPTIONS,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { contrastForPair } from './contrast';
import {
  derivePrimary,
  deriveSurfaces,
  deriveText,
  deriveTheme,
  type ThemeDerivationInput,
  themeToCss,
} from './derive-theme';
import { type NexusSurfaceTone, TIER_THRESHOLDS } from './palette';
import { getPaletteRamp } from './primitive-palette';
import { STATUS_PALETTE_FAMILIES } from './semantic-palette-references';

function lOf(oklchStr: string | undefined): number {
  return oklch(parse(oklchStr!)!)!.l!;
}

function hOf(oklchStr: string | undefined): number {
  return oklch(parse(oklchStr!)!)!.h!;
}

const toRgb = converter('rgb');
const oklabDelta = differenceEuclidean('oklab');
const COLORBLIND_DELTA_E = 0.02;
const RUNTIME_SEMANTIC_COLOR_COUNT = 107;
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

function compositeOver(
  foreground: [number, number, number],
  alpha: number,
  background: [number, number, number]
): [number, number, number] {
  return [
    Math.round(foreground[0] * alpha + background[0] * (1 - alpha)),
    Math.round(foreground[1] * alpha + background[1] * (1 - alpha)),
    Math.round(foreground[2] * alpha + background[2] * (1 - alpha)),
  ];
}

function alphaOf(color: string): number {
  const match = color.match(/\/\s*([0-9.]+)\s*\)/);
  return match ? Number(match[1]) : 1;
}

function rgbString([r, g, b]: [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`;
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
  colors: Record<string, string>,
  exceptions: ReadonlySet<string> = new Set()
): void {
  const entries = Object.entries(colors);
  for (const visionType of VISION_TYPES) {
    for (let i = 0; i < entries.length - 1; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const [nameA, colorA] = entries[i]!;
        const [nameB, colorB] = entries[j]!;
        const pair = `${label} ${nameA} vs ${nameB} under ${visionType}`;
        if (exceptions.has(pair)) {
          expect(deltaE(colorA, colorB, visionType), pair).toBeGreaterThan(0);
          continue;
        }
        expect(deltaE(colorA, colorB, visionType), pair).toBeGreaterThanOrEqual(
          COLORBLIND_DELTA_E
        );
      }
    }
  }
}

describe('deriveSurfaces', () => {
  const surfaceTone: NexusSurfaceTone = 'neutral';

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

  it('derives dark nav and disabled surfaces from the contrast ladder', () => {
    const soft = deriveSurfaces('#181818', surfaceTone, 'dark', 0.02);
    const strong = deriveSurfaces('#181818', surfaceTone, 'dark', 0.08);

    for (const token of [
      '--nx-color-disabled',
      '--nx-color-nav-background',
      '--nx-color-nav-item-hover',
      '--nx-color-nav-item-active',
      '--nx-color-nav-border',
    ]) {
      expect(strong[token], token).not.toBe(soft[token]);
    }

    for (const s of [soft, strong]) {
      expect(s['--nx-color-disabled']).toBe(s['--nx-color-container']);
      expect(s['--nx-color-nav-background']).toBe(s['--nx-color-container']);
      expect(s['--nx-color-nav-item-hover']).toBe(
        s['--nx-color-container-hover']
      );
      expect(s['--nx-color-nav-item-active']).toBe(
        s['--nx-color-container-hover']
      );
      expect(s['--nx-color-nav-border']).toBe(s['--nx-color-container-hover']);
      expect(lOf(s['--nx-color-nav-background'])).toBeGreaterThan(
        lOf(s['--nx-color-background'])
      );
      expect(lOf(s['--nx-color-nav-item-hover'])).toBeGreaterThan(
        lOf(s['--nx-color-nav-background'])
      );
    }
  });

  it('recedes hover darker than background in light mode', () => {
    const s = deriveSurfaces('#ffffff', surfaceTone, 'light', 0.05);
    expect(lOf(s['--nx-color-background-hover'])).toBeLessThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('keeps the light container and popover on the page plane', () => {
    const s = deriveSurfaces('#ffffff', 'stone', 'light', 0.056);
    expect(s['--nx-color-container']).toBe(s['--nx-color-background']);
    expect(s['--nx-color-popover']).toBe(s['--nx-color-background']);
    expect(lOf(s['--nx-color-background'])).toBeCloseTo(1, 3);
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

  it('uses foreground seeds and surface-relative muted candidates', () => {
    const light = deriveText(
      '#0a0a0a',
      deriveSurfaces('#ffffff', 'neutral', 'light', 0.05),
      'light'
    );
    const dark = deriveText('#ffffff', surfaces, 'dark');
    expect(lOf(light['--nx-color-foreground'])).toBeCloseTo(
      lOf('oklch(0.1448 0 0)')
    );
    expect(dark['--nx-color-foreground']).toBe('oklch(1 0 0)');
    expect(lOf(light['--nx-color-muted-foreground'])).toBeGreaterThan(
      lOf(light['--nx-color-foreground'])
    );
    expect(lOf(dark['--nx-color-muted-foreground'])).toBeLessThan(
      lOf(dark['--nx-color-foreground'])
    );
  });

  it('does not throw on a pathological mid-grey pairing', () => {
    const mid = deriveSurfaces('#7d7d7d', 'neutral', 'light', 0.05);
    expect(() => deriveText('#808080', mid, 'light')).not.toThrow();
  });
});

describe('derivePrimary', () => {
  it('follows the seed lightness — a dark seed yields a dark fill, a light seed a light fill', () => {
    const nearBlack = derivePrimary('#0a0a0a', 'light');
    const lightBlue = derivePrimary('#339cff', 'light');
    expect(lOf(nearBlack['--nx-color-primary-background'])).toBeLessThan(0.25);
    expect(lOf(lightBlue['--nx-color-primary-background'])).toBeGreaterThan(
      0.6
    );
  });

  it('deep navy stays deep navy in light mode and lifts to stay legible in dark mode', () => {
    const light = derivePrimary('#1b2a4a', 'light');
    const dark = derivePrimary('#1b2a4a', 'dark');
    // Light mode honors the deep, dark seed.
    expect(lOf(light['--nx-color-primary-background'])).toBeLessThan(0.4);
    // Dark mode lifts it so it reads on a dark surface, keeping the hue.
    expect(lOf(dark['--nx-color-primary-background'])).toBeGreaterThan(
      lOf(light['--nx-color-primary-background'])
    );
    expect(hOf(dark['--nx-color-primary-background'])).toBeCloseTo(
      hOf(light['--nx-color-primary-background']),
      0
    );
  });
});

describe('primary fills after contrast solving', () => {
  const PRIMARY_SEEDS = ['#1b2a4a', '#0a0a0a', '#2563eb', '#339cff', '#7c3aed'];
  const FILLS = [
    '--nx-color-primary-background',
    '--nx-color-primary-background-hover',
    '--nx-color-primary-background-active',
  ] as const;
  const themeFor = (accent: string, contrast = 50) =>
    deriveTheme({
      ...CONTRACT,
      light: { ...CONTRACT.light, accent },
      dark: { ...CONTRACT.dark, accent },
      contrast: { light: contrast, dark: contrast },
    });

  it('keeps the shared label legible on the base, hover, and active fills', () => {
    for (const seed of PRIMARY_SEEDS) {
      for (const mode of ['light', 'dark'] as const) {
        const map = themeFor(seed)[mode];
        const label = map['--nx-color-primary-foreground']!;
        for (const fill of FILLS) {
          expect(
            apcaLc(label, map[fill]!),
            `${seed} ${mode} ${fill}`
          ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
        }
      }
    }
  });

  it('leaves the brand fills unchanged as the contrast slider moves', () => {
    for (const seed of PRIMARY_SEEDS) {
      const low = themeFor(seed, 0);
      const high = themeFor(seed, 100);
      for (const mode of ['light', 'dark'] as const) {
        for (const fill of FILLS) {
          expect(high[mode][fill], `${seed} ${mode} ${fill}`).toBe(
            low[mode][fill]
          );
        }
      }
    }
  });

  it('keeps a black brand black in light mode and flips it to white in dark mode', () => {
    const { light, dark } = themeFor('#0a0a0a');
    expect(lOf(light['--nx-color-primary-background'])).toBeLessThan(0.2);
    expect(lOf(light['--nx-color-primary-background-active'])).toBeLessThan(
      lOf(light['--nx-color-primary-background'])
    );
    expect(light['--nx-color-primary-foreground']).toBe('oklch(1 0 0)');

    expect(lOf(dark['--nx-color-primary-background'])).toBeCloseTo(1, 3);
    expect(dark['--nx-color-primary-foreground']).toBe('oklch(0 0 0)');
  });
});

const CONTRACT: ThemeDerivationInput = {
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#0a0a0a' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
  contrast: { light: 50, dark: 50 },
};

const SURFACE_TONE_SEEDS = {
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
  contrast: { light: 50, dark: 50 },
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

  it('derives both modes from seeds alone — no appearance field', () => {
    // The engine takes ThemeDerivationInput, not the full contract: it always
    // derives light + dark; the consumer's `appearance` choice selects one at
    // runtime, outside deriveTheme. This is the engine/preference decoupling.
    const seedsOnly: ThemeDerivationInput = {
      surfaceTone: 'slate',
      light: {
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#181818',
      },
      dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
      contrast: { light: 50, dark: 50 },
    };
    const { light, dark } = deriveTheme(seedsOnly);
    expect(light['--nx-color-background']).toBeDefined();
    expect(dark['--nx-color-background']).toBeDefined();
    expect(Object.keys(dark)).toEqual(Object.keys(light));
  });

  it('uses the per-theme seed blocks', () => {
    const d = deriveTheme(CONTRACT);
    expect(lOf(d.dark['--nx-color-background'])).toBeLessThan(0.3); // dark seed
    expect(lOf(d.light['--nx-color-background'])).toBeGreaterThan(0.9); // light seed
  });

  it('emits all semantic colors, including runtime focus tokens', () => {
    const d = deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE));

    for (const map of [d.light, d.dark]) {
      const colorKeys = Object.keys(map).filter((key) =>
        key.startsWith('--nx-color-')
      );
      expect(colorKeys).toHaveLength(RUNTIME_SEMANTIC_COLOR_COUNT);
      expect(map['--nx-color-focus-default']).toBeDefined();
      expect(map['--nx-color-focus-error']).toBeDefined();
    }
  });

  it('keeps runtime error focus aligned with the shipped red primitives', () => {
    const d = deriveTheme(createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE));

    expect(hOf(d.light['--nx-color-focus-error'])).toBeCloseTo(
      hOf(getPaletteRamp(STATUS_PALETTE_FAMILIES.error)['600']),
      2
    );
    expect(hOf(d.dark['--nx-color-focus-error'])).toBeCloseTo(
      hOf(getPaletteRamp(STATUS_PALETTE_FAMILIES.error)['300']),
      2
    );
  });

  it.each(['light', 'dark'] as const)(
    'uses primary accent for shipped default focus and keeps focus colors APCA-safe in %s mode',
    (mode) => {
      const map = deriveTheme(
        createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)
      )[mode];
      const surfaces = [
        '--nx-color-background',
        '--nx-color-container',
        '--nx-color-popover',
        '--nx-color-nav-background',
        '--nx-color-muted',
      ];

      expect(map['--nx-color-focus-default']).toBe(
        map['--nx-color-primary-subtle-foreground']
      );

      for (const surface of surfaces) {
        expect(
          apcaLc(map['--nx-color-focus-default']!, map[surface]!),
          `${mode}: --nx-color-focus-default on ${surface}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.incidental);
        expect(
          apcaLc(map['--nx-color-focus-error']!, map[surface]!),
          `${mode}: --nx-color-focus-error on ${surface}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.incidental);
      }
    }
  );

  it.each(['light', 'dark'] as const)(
    'keeps a colored brand focus ring legible on page surfaces in %s mode',
    (mode) => {
      // focus-default is solved together with primary-subtle-foreground, so a
      // colored brand's ring must clear both the subtle fills and the page
      // surfaces the ring actually paints on.
      const map = deriveTheme({
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
        contrast: { light: 50, dark: 50 },
      })[mode];

      expect(map['--nx-color-focus-default']).toBe(
        map['--nx-color-primary-subtle-foreground']
      );

      for (const surface of [
        '--nx-color-background',
        '--nx-color-container',
        '--nx-color-popover',
        '--nx-color-nav-background',
        '--nx-color-nav-item-hover',
        '--nx-color-nav-item-active',
        '--nx-color-nav-border',
      ]) {
        expect(
          apcaLc(map['--nx-color-focus-default']!, map[surface]!),
          `${mode}: colored focus-default on ${surface}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.incidental);
      }
    }
  );

  it.each(['light', 'dark'] as const)(
    'moves structure tokens as contrast changes in %s mode',
    (mode) => {
      const at = (contrast: number) =>
        deriveTheme({
          surfaceTone: 'stone',
          ...SURFACE_TONE_SEEDS,
          contrast: { light: contrast, dark: contrast },
        })[mode];
      const standard = at(50);
      const increased = at(100);

      const sharedContrastSteppedTokens = [
        '--nx-color-control-background',
        '--nx-color-muted',
      ];
      const modeSteppedTokens =
        mode === 'light'
          ? [
              '--nx-color-background-hover',
              '--nx-color-container-hover',
              '--nx-color-nav-border',
              '--nx-color-nav-item-active',
              '--nx-color-popover-hover',
              ...sharedContrastSteppedTokens,
            ]
          : [
              '--nx-color-container-hover',
              '--nx-color-disabled',
              '--nx-color-nav-background',
              '--nx-color-nav-border',
              '--nx-color-nav-item-active',
              '--nx-color-nav-item-hover',
              ...sharedContrastSteppedTokens,
            ];

      for (const token of modeSteppedTokens) {
        expect(increased[token], `${mode} ${token}`).not.toBe(standard[token]);
      }

      if (mode === 'dark') {
        expect(increased['--nx-color-disabled']).toBe(
          increased['--nx-color-container']
        );
        expect(increased['--nx-color-nav-background']).toBe(
          increased['--nx-color-container']
        );
        expect(increased['--nx-color-nav-item-active']).toBe(
          increased['--nx-color-container-hover']
        );
        expect(increased['--nx-color-nav-border']).toBe(
          increased['--nx-color-container-hover']
        );
      } else {
        expect(lOf(increased['--nx-color-container-hover'])).toBeLessThan(
          lOf(increased['--nx-color-background'])
        );
        expect(lOf(increased['--nx-color-popover-hover'])).toBeLessThan(
          lOf(increased['--nx-color-background-hover'])
        );
      }
    }
  );

  it.each(['light', 'dark'] as const)(
    'increases background-anchored text contrast as requested in %s mode',
    (mode) => {
      const at = (contrast: number) =>
        deriveTheme({
          surfaceTone: 'slate',
          ...SURFACE_TONE_SEEDS,
          contrast: { light: contrast, dark: contrast },
        })[mode];
      const standard = at(50);
      const increased = at(100);

      for (const token of [
        '--nx-color-foreground',
        '--nx-color-muted-foreground',
      ]) {
        const surface = '--nx-color-background';
        const scores = [standard, increased].map((map) =>
          apcaLc(map[token]!, map[surface]!)
        );
        expect(scores[1]).toBeGreaterThanOrEqual(scores[0]!);
      }
    }
  );
});

describe('themeToCss', () => {
  it('emits :root and :root.dark blocks', () => {
    const css = themeToCss(deriveTheme(CONTRACT));
    expect(css).toMatch(/:root\s*\{/);
    expect(css).toMatch(/:root\.dark\s*\{/);
    expect(css).toContain('--nx-color-background:');
    expect(css).not.toContain('light-dark(');
  });
});

describe('deriveSecondary', () => {
  it('keeps secondary neutral while resolving shared labels across states', () => {
    const theme = deriveTheme({
      ...SURFACE_TONE_SEEDS,
    });
    for (const mode of ['light', 'dark'] as const) {
      for (const [key, value] of Object.entries(theme[mode])) {
        if (key.startsWith('--nx-color-secondary-'))
          expect(seedChroma(value)).toBe(0);
      }
      for (const pair of APCA_PAIRS.filter((pair) =>
        pair.fg.startsWith('secondary-')
      )) {
        expect(contrastForPair(theme[mode], pair)).toBeGreaterThanOrEqual(
          TIER_THRESHOLDS[pair.tier]
        );
      }
      expect(theme[mode]['--nx-color-border-secondary']).toBeUndefined();
    }
  });
});

const seedChroma = (value: string) => oklch(parse(value)!)!.c;

describe('status families', () => {
  const STATUS_HUES = {
    success: 140.055,
    warning: 41.116,
    error: 27.926,
    information: 255.276,
  };

  it.each(['light', 'dark'] as const)(
    'uses curated hues + is APCA-legible on background and subtle in %s mode',
    (mode) => {
      const theme = deriveTheme({
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
        contrast: { light: 50, dark: 50 },
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
  it('keeps a shared white light plane with tinted interaction states', () => {
    const slate = deriveTheme({
      surfaceTone: 'slate',
      ...SURFACE_TONE_SEEDS,
    }).light;
    const neutral = deriveTheme({
      surfaceTone: 'neutral',
      ...SURFACE_TONE_SEEDS,
    }).light;

    expect(slate['--nx-color-container']).toBe(slate['--nx-color-background']);
    expect(slate['--nx-color-popover']).toBe(slate['--nx-color-background']);
    expect(slate['--nx-color-background']).toBe(
      neutral['--nx-color-background']
    );
    expect(lOf(slate['--nx-color-background'])).toBeCloseTo(1, 3);
    expect(lOf(neutral['--nx-color-background'])).toBeCloseTo(1, 3);
    expect(lOf(slate['--nx-color-muted'])).toBeLessThan(
      lOf(slate['--nx-color-background'])
    );
    expect(lOf(slate['--nx-color-container-hover'])).toBeLessThan(
      lOf(slate['--nx-color-container'])
    );
    expect(slate['--nx-color-container-hover']).toBe(slate['--nx-color-muted']);
    expect(slate['--nx-color-muted']).not.toBe(neutral['--nx-color-muted']);
  });
});

describe('chart colors', () => {
  // Exact chart values are ground-truthed by the engine matrix snapshot; here
  // we assert structure, not a copy.
  const OKLCH_RE = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

  const chartTokens = (map: Record<string, string>) =>
    Array.from(
      { length: 5 },
      (_, index) => map[`--nx-color-chart-categorical-${index + 1}`]
    );

  it('emits 5 valid, mutually distinct chart colors per mode', () => {
    const { light, dark } = deriveTheme({
      surfaceTone: 'neutral',
      ...SURFACE_TONE_SEEDS,
    });
    const lightSet = chartTokens(light);
    const darkSet = chartTokens(dark);

    for (const set of [lightSet, darkSet]) {
      expect(set).toHaveLength(5);
      for (const value of set) expect(value).toMatch(OKLCH_RE);
      expect(new Set(set).size, 'distinct within mode').toBe(5);
    }
    // every series is re-toned per mode
    lightSet.forEach((value, index) =>
      expect(value, `chart ${index + 1}`).not.toBe(darkSet[index])
    );
  });
});

describe('derived colorblind distinguishability', () => {
  it.each(
    BASE_TONE_OPTIONS.flatMap(({ value: surfaceTone }) =>
      ([0, 25, 50, 75, 100] as const).flatMap((contrast) =>
        (['light', 'dark'] as const).map((mode) => ({
          surfaceTone,
          contrast,
          mode,
        }))
      )
    )
  )(
    'keeps chart and status colors distinguishable in $surfaceTone $mode $contrast outside approved JSON exceptions',
    ({ surfaceTone, contrast, mode }) => {
      const map = deriveTheme(
        createNexusThemeContract({
          ...DEFAULT_NEXUS_APPEARANCE,
          surfaceTone,
          lightContrast: contrast,
          darkContrast: contrast,
        })
      )[mode];
      // Accepted (not deferred): these deuteranopia-ambiguous pairs stay in
      // canon because charts and status never rely on hue alone — each carries
      // an icon + label, so the pair stays distinguishable in product. The
      // exception still asserts ΔE > 0 (never identical), only relaxing the floor.
      const exceptions = new Set(
        mode === 'light'
          ? [
              'light chart chart-2 vs chart-3 under deuteranopia',
              'light status success vs warning under deuteranopia',
            ]
          : ['dark status success vs warning under deuteranopia']
      );

      expectPairwiseDistinguishable(
        `${mode} chart`,
        Object.fromEntries(
          Array.from({ length: 5 }, (_, index) => [
            `chart-${index + 1}`,
            map[`--nx-color-chart-categorical-${index + 1}`]!,
          ])
        ),
        exceptions
      );
      expectPairwiseDistinguishable(
        `${mode} status`,
        {
          success: map['--nx-color-success-background']!,
          warning: map['--nx-color-warning-background']!,
          error: map['--nx-color-error-background']!,
          information: map['--nx-color-information-background']!,
        },
        exceptions
      );
    }
  );
});

describe('alpha and translucent colors', () => {
  const at = (contrast: number) =>
    deriveTheme({
      surfaceTone: 'slate',
      ...SURFACE_TONE_SEEDS,
      contrast: { light: contrast, dark: contrast },
    });

  it('preserves tone-ink opacity and curated border strength at default and maximum contrast', () => {
    for (const contrast of [50, 100] as const) {
      const { light, dark } = at(contrast);
      expect(light['--nx-color-overlay']).toBe(
        'oklch(0.13 0.006 264.7 / 0.7529)'
      );
      expect(dark['--nx-color-overlay']).toBe(
        'oklch(0.13 0.006 264.7 / 0.8471)'
      );
      expect(light['--nx-color-popover-backdrop']).toBe(
        'oklch(0.13 0.006 264.7 / 0.9098)'
      );
      expect(dark['--nx-color-popover-backdrop']).toBe(
        light['--nx-color-popover-backdrop']
      );
      const lightBorder = contrast === 50 ? 0.0884 : 0.1168;
      const darkBorder = contrast === 50 ? 0.1768 : 0.2337;
      for (const token of [
        'border-default',
        'border-disabled',
        'border-default-alpha',
      ]) {
        expect(alphaOf(light[`--nx-color-${token}`]!)).toBe(lightBorder);
        expect(alphaOf(dark[`--nx-color-${token}`]!)).toBe(darkBorder);
      }
      expect(alphaOf(light['--nx-color-border-hairline']!)).toBe(0.0941);
      expect(alphaOf(dark['--nx-color-border-hairline']!)).toBe(0.0941);
      expect(alphaOf(light['--nx-color-popover-alpha']!)).toBe(
        contrast === 50 ? 0.97 : 1
      );
      expect(alphaOf(dark['--nx-color-popover-alpha']!)).toBe(
        contrast === 50 ? 0.97 : 1
      );
    }
  });

  it('strengthens hover ink while keeping scrims anchored', () => {
    const standard = at(50);
    const increased = at(100);
    expect(alphaOf(standard.light['--nx-color-background-hover-alpha']!)).toBe(
      0.0581
    );
    expect(alphaOf(standard.dark['--nx-color-background-hover-alpha']!)).toBe(
      0.0589
    );
    expect(alphaOf(increased.light['--nx-color-background-hover-alpha']!)).toBe(
      0.085
    );
    expect(alphaOf(increased.dark['--nx-color-background-hover-alpha']!)).toBe(
      0.09
    );
    for (const mode of ['light', 'dark'] as const) {
      expect(standard[mode]['--nx-color-overlay']).toBe(
        increased[mode]['--nx-color-overlay']
      );
    }
    expect(lOf(increased.dark['--nx-color-popover-alpha'])).toBeGreaterThan(
      lOf(standard.dark['--nx-color-popover-alpha'])
    );
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

const SURFACE_TONES: readonly NexusSurfaceTone[] = [
  'stone',
  'neutral',
  'zinc',
  'slate',
  'gray',
];

describe('popover-alpha worst-case readability', () => {
  it.each(SURFACE_TONES)(
    '%s: popover-foreground stays legible over the harshest backdrop',
    (surfaceTone) => {
      const { light, dark } = deriveTheme({
        surfaceTone,
        ...SURFACE_TONE_SEEDS,
      });

      const lightSurface = light['--nx-color-popover-alpha']!;
      const lightBg = compositeOver(
        toSrgbInts(lightSurface),
        alphaOf(lightSurface),
        [0, 0, 0]
      );
      const lightLc = Math.abs(
        apcaLc(light['--nx-color-popover-foreground']!, rgbString(lightBg))
      );

      const darkSurface = dark['--nx-color-popover-alpha']!;
      const darkBg = compositeOver(
        toSrgbInts(darkSurface),
        alphaOf(darkSurface),
        [255, 255, 255]
      );
      const darkLc = Math.abs(
        apcaLc(dark['--nx-color-popover-foreground']!, rgbString(darkBg))
      );

      expect(lightLc, `${surfaceTone} light`).toBeGreaterThanOrEqual(60);
      expect(darkLc, `${surfaceTone} dark`).toBeGreaterThanOrEqual(60);
    }
  );
});

describe('text inks stay legible composited over their surface', () => {
  const INK_CHECKS: ReadonlyArray<
    [string, string, keyof typeof TIER_THRESHOLDS]
  > = [
    ['--nx-color-foreground', '--nx-color-background', 'body'],
    ['--nx-color-muted-foreground', '--nx-color-muted', 'ui'],
    ['--nx-color-muted-foreground-subtle', '--nx-color-muted', 'incidental'],
  ];

  it.each(
    SURFACE_TONES.flatMap((surfaceTone) =>
      ([0, 25, 50, 75, 100] as const).flatMap((contrast) =>
        (['light', 'dark'] as const).map((mode) => ({
          surfaceTone,
          contrast,
          mode,
        }))
      )
    )
  )(
    '$surfaceTone @ contrast $contrast ($mode)',
    ({ surfaceTone, contrast, mode }) => {
      const map = deriveTheme({
        surfaceTone,
        ...SURFACE_TONE_SEEDS,
        contrast: { light: contrast, dark: contrast },
      })[mode];

      for (const [ink, surface, tier] of INK_CHECKS) {
        const inkColor = map[ink]!;
        const surfaceColor = map[surface]!;
        const composited = compositeOver(
          toSrgbInts(inkColor),
          alphaOf(inkColor),
          toSrgbInts(surfaceColor)
        );
        expect(
          Math.abs(apcaLc(rgbString(composited), surfaceColor)),
          `${mode} ${surfaceTone}@${contrast}: ${ink} on ${surface}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[tier]);
      }
    }
  );
});

describe('legibility invariant: every APCA pair clears its floor', () => {
  it.each(
    SWEEP_SEEDS.flatMap((seed) =>
      SURFACE_TONES.flatMap((surfaceTone) =>
        ([0, 50, 100] as const).map((contrast) => ({
          ...seed,
          surfaceTone,
          contrast,
        }))
      )
    )
  )(
    'contract %#',
    ({ accent, background, foreground, mode, surfaceTone, contrast }) => {
      const seeds = { accent, background, foreground };
      const contract: ThemeDerivationInput = {
        surfaceTone,
        light: seeds,
        dark: seeds,
        contrast: { light: contrast, dark: contrast },
      };
      const map = deriveTheme(contract)[mode];

      for (const pair of APCA_PAIRS) {
        expect(
          contrastForPair(map, pair),
          `${surfaceTone} ${mode}: ${pair.fg} on ${pair.bg}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[pair.tier]);
      }
    }
  );
});

describe('per-mode contrast isolation', () => {
  const seeds = {
    surfaceTone: 'slate' as const,
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
  };

  it('light contrast drives light tokens and leaves the whole dark map identical', () => {
    const baseline = deriveTheme({
      ...seeds,
      contrast: { light: 50, dark: 50 },
    });
    const lightIncreased = deriveTheme({
      ...seeds,
      contrast: { light: 100, dark: 50 },
    });

    // control-background is contrast-stepped in both modes (see the
    // 'moves structure tokens as contrast changes' test above).
    expect(lightIncreased.light['--nx-color-control-background']).not.toBe(
      baseline.light['--nx-color-control-background']
    );
    expect(lightIncreased.dark).toEqual(baseline.dark); // whole dark map byte-identical
  });

  it('dark contrast drives dark tokens and leaves the whole light map identical', () => {
    const baseline = deriveTheme({
      ...seeds,
      contrast: { light: 50, dark: 50 },
    });
    const darkIncreased = deriveTheme({
      ...seeds,
      contrast: { light: 50, dark: 100 },
    });

    expect(darkIncreased.dark['--nx-color-control-background']).not.toBe(
      baseline.dark['--nx-color-control-background']
    );
    expect(darkIncreased.light).toEqual(baseline.light);
  });
});
