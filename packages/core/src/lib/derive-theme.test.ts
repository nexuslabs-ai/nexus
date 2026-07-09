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
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import {
  derivePrimary,
  deriveSurfaces,
  deriveText,
  deriveTheme,
  type NexusSurfaceTone,
  STATUS_RAMP,
  type ThemeDerivationInput,
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
const RUNTIME_SEMANTIC_COLOR_COUNT = 106;
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

  it('keeps light container on the same white plane as the page', () => {
    const s = deriveSurfaces('#ffffff', 'stone', 'light', 0.056);
    expect(s['--nx-color-container']).toBe(s['--nx-color-background']);
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
  it('primary fill follows the seed lightness; supporting shades come from the ramp', () => {
    expect(derivePrimary('#2563eb', 'light')).toMatchInlineSnapshot(`
      {
        "--nx-color-border-primary": "oklch(0.87 0.066 262.881)",
        "--nx-color-border-primary-active": "oklch(0.66 0.1849 262.881)",
        "--nx-color-primary-background": "oklch(0.5461 0.2152 262.881)",
        "--nx-color-primary-background-active": "oklch(0.4461 0.2152 262.881)",
        "--nx-color-primary-background-hover": "oklch(0.4961 0.2152 262.881)",
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
        "--nx-color-primary-background": "oklch(0.5461 0.2152 262.881)",
        "--nx-color-primary-background-active": "oklch(0.4461 0.2152 262.881)",
        "--nx-color-primary-background-hover": "oklch(0.4961 0.2152 262.881)",
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

  it('picks an on-primary foreground that clears the ui tier', () => {
    const p = derivePrimary('#339cff', 'light');
    expect(
      apcaLc(
        p['--nx-color-primary-foreground']!,
        p['--nx-color-primary-background']!
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  });

  it('keeps the shared label legible on the hover and active fills, not only the base', () => {
    // Honoring the seed lightness can land the fill near mid-grey, where the
    // toward-mid hover/active nudge erodes contrast against the single shared
    // foreground. Every state fill must clear the ui tier against that label —
    // e.g. deep navy in dark mode lifts to a mid fill and used to drop hover
    // (~53) and active (~46) below the 60 floor.
    const seeds = ['#1b2a4a', '#0a0a0a', '#2563eb', '#339cff', '#7c3aed'];
    const states = [
      '--nx-color-primary-background',
      '--nx-color-primary-background-hover',
      '--nx-color-primary-background-active',
    ] as const;
    for (const seed of seeds) {
      for (const mode of ['light', 'dark'] as const) {
        const p = derivePrimary(seed, mode);
        const label = p['--nx-color-primary-foreground']!;
        for (const state of states) {
          expect(
            apcaLc(label, p[state]!),
            `${seed} ${mode} ${state}`
          ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
        }
      }
    }
  });

  it('keeps a black brand black in light mode and flips it to white in dark mode', () => {
    const light = derivePrimary('#0a0a0a', 'light');
    expect(lOf(light['--nx-color-primary-background'])).toBeLessThan(0.2);
    expect(lOf(light['--nx-color-primary-foreground'])).toBeGreaterThan(0.9);

    const dark = derivePrimary('#000000', 'dark');
    expect(lOf(dark['--nx-color-primary-background'])).toBeGreaterThan(0.9);
    expect(lOf(dark['--nx-color-primary-foreground'])).toBeLessThan(0.2);
  });
});

const CONTRACT: ThemeDerivationInput = {
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
      contrast: 60,
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

    expect(d.light['--nx-color-focus-error']).toBe(STATUS_RAMP.error['600']);
    expect(d.dark['--nx-color-focus-error']).toBe(STATUS_RAMP.error['300']);
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
    'moves structure tokens as contrast changes in %s mode',
    (mode) => {
      const at = (contrast: number) =>
        deriveTheme({
          surfaceTone: 'stone',
          ...SURFACE_TONE_SEEDS,
          contrast,
        })[mode];
      const soft = at(0);
      const strong = at(100);

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
        expect(strong[token], `${mode} ${token}`).not.toBe(soft[token]);
      }

      if (mode === 'dark') {
        expect(strong['--nx-color-disabled']).toBe(
          strong['--nx-color-container']
        );
        expect(strong['--nx-color-nav-background']).toBe(
          strong['--nx-color-container']
        );
        expect(strong['--nx-color-nav-item-active']).toBe(
          strong['--nx-color-container-hover']
        );
        expect(strong['--nx-color-nav-border']).toBe(
          strong['--nx-color-container-hover']
        );
      } else {
        expect(lOf(strong['--nx-color-container-hover'])).toBeLessThan(
          lOf(strong['--nx-color-background'])
        );
        expect(lOf(strong['--nx-color-popover-hover'])).toBeLessThan(
          lOf(strong['--nx-color-background-hover'])
        );
      }
    }
  );

  it.each(['light', 'dark'] as const)(
    'keeps background-anchored text stable as contrast changes in %s mode',
    (mode) => {
      const at = (contrast: number) =>
        deriveTheme({
          surfaceTone: 'slate',
          ...SURFACE_TONE_SEEDS,
          contrast,
        })[mode];
      const soft = at(0);
      const defaultContrast = at(60);
      const strong = at(100);

      for (const token of [
        '--nx-color-foreground',
        '--nx-color-muted-foreground',
      ]) {
        expect(defaultContrast[token], `${mode} ${token} at 60`).toBe(
          soft[token]
        );
        expect(strong[token], `${mode} ${token} at 100`).toBe(soft[token]);
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
  const secondaryTokens = (map: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(map).filter(([key]) =>
        key.startsWith('--nx-color-secondary-')
      )
    );

  it('secondary exactly matches the curated neutral map (both modes)', () => {
    const { light, dark } = deriveTheme({
      light: {
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#181818',
      },
      dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
      contrast: 60,
    });

    expect(secondaryTokens(light)).toEqual({
      '--nx-color-secondary-background': 'oklch(0.945 0 0)',
      '--nx-color-secondary-background-active': 'oklch(0.765 0 0)',
      '--nx-color-secondary-background-hover': 'oklch(0.87 0 0)',
      '--nx-color-secondary-disabled': 'oklch(0.985 0 0)',
      '--nx-color-secondary-foreground': 'oklch(0.207 0 0)',
      '--nx-color-secondary-subtle': 'oklch(0.945 0 0)',
      '--nx-color-secondary-subtle-active': 'oklch(0.765 0 0)',
      '--nx-color-secondary-subtle-foreground': 'oklch(0.46 0 0)',
      '--nx-color-secondary-subtle-hover': 'oklch(0.87 0 0)',
    });
    expect(secondaryTokens(dark)).toEqual({
      '--nx-color-secondary-background': 'oklch(0.207 0 0)',
      '--nx-color-secondary-background-active': 'oklch(0.46 0 0)',
      '--nx-color-secondary-background-hover': 'oklch(0.385 0 0)',
      '--nx-color-secondary-disabled': 'oklch(0.118 0 0)',
      '--nx-color-secondary-foreground': 'oklch(0.945 0 0)',
      '--nx-color-secondary-subtle': 'oklch(0.297 0 0)',
      '--nx-color-secondary-subtle-active': 'oklch(0.46 0 0)',
      '--nx-color-secondary-subtle-foreground': 'oklch(0.87 0 0)',
      '--nx-color-secondary-subtle-hover': 'oklch(0.385 0 0)',
    });
    expect(light['--nx-color-border-secondary']).toBeUndefined();
    expect(dark['--nx-color-border-secondary']).toBeUndefined();
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
  it('keeps light page and cards white while supporting softer surface tiers', () => {
    const slate = deriveTheme({
      surfaceTone: 'slate',
      ...SURFACE_TONE_SEEDS,
    }).light;
    const neutral = deriveTheme({
      surfaceTone: 'neutral',
      ...SURFACE_TONE_SEEDS,
    }).light;

    expect(slate['--nx-color-container']).toBe(slate['--nx-color-background']);
    expect(slate['--nx-color-popover']).toBe(slate['--nx-color-container']);
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
  // Exact chart values are ground-truthed against color.json in
  // tone-parity.test.ts (value parity); here we assert structure, not a copy.
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
  it.each(['light', 'dark'] as const)(
    'keeps emitted chart and status colors distinguishable in %s mode',
    (mode) => {
      const map = deriveTheme({
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
    expect(light['--nx-color-popover-alpha']).toBe('oklch(1 0 0 / 0.7529)');
    expect(dark['--nx-color-popover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.7529)'
    );
    expect(light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(dark['--nx-color-border-default']).toBe('oklch(1 0 0 / 0.1882)');
    expect(light['--nx-color-border-hairline']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(dark['--nx-color-border-hairline']).toBe('oklch(1 0 0 / 0.0941)');
    expect(light['--nx-color-border-disabled']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(dark['--nx-color-border-disabled']).toBe('oklch(1 0 0 / 0.1882)');
  });

  it('scales default border alpha with contrast, anchored at the curated default', () => {
    const at = (contrast: number) =>
      deriveTheme({
        surfaceTone: 'slate',
        ...SURFACE_TONE_SEEDS,
        contrast,
      });

    expect(at(0).light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.06)'
    );
    expect(at(0).dark['--nx-color-border-default']).toBe('oklch(1 0 0 / 0.12)');
    expect(at(0).light['--nx-color-border-disabled']).toBe(
      'oklch(0.1448 0 0 / 0.06)'
    );
    expect(at(0).dark['--nx-color-border-disabled']).toBe(
      'oklch(1 0 0 / 0.12)'
    );
    expect(at(60).light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(at(60).dark['--nx-color-border-default']).toBe(
      'oklch(1 0 0 / 0.1882)'
    );
    expect(at(60).light['--nx-color-border-default-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0941)'
    );
    expect(at(60).dark['--nx-color-border-default-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.1882)'
    );
    expect(at(100).light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.1168)'
    );
    expect(at(100).dark['--nx-color-border-default']).toBe(
      'oklch(1 0 0 / 0.2337)'
    );
    expect(at(100).dark['--nx-color-border-default-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.2337)'
    );
    expect(at(100).light['--nx-color-border-hairline']).toBe(
      'oklch(0.1448 0 0 / 0.0941)'
    );
    expect(at(100).dark['--nx-color-border-hairline']).toBe(
      'oklch(1 0 0 / 0.0941)'
    );
    // contrast 30 exercises the sub-anchor lerp branch + toFixed rounding —
    // every assertion above is an endpoint (0/100) or the c===60 early return.
    expect(at(30).dark['--nx-color-border-default']).toBe(
      'oklch(1 0 0 / 0.1541)'
    );
    expect(at(30).light['--nx-color-border-default']).toBe(
      'oklch(0.1448 0 0 / 0.0771)'
    );
  });

  it('scales background-hover-alpha with contrast while leaving scrims anchored', () => {
    const at = (contrast: number) =>
      deriveTheme({
        surfaceTone: 'slate',
        ...SURFACE_TONE_SEEDS,
        contrast,
      });

    expect(at(0).light['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.035)'
    );
    expect(at(0).dark['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.04)'
    );
    expect(at(60).light['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0627)'
    );
    expect(at(60).dark['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.0627)'
    );
    expect(at(100).light['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.085)'
    );
    expect(at(100).dark['--nx-color-background-hover-alpha']).toBe(
      'oklch(0.13 0.0400 264.7 / 0.09)'
    );
    expect(at(0).dark['--nx-color-overlay']).toBe(
      at(100).dark['--nx-color-overlay']
    );
    expect(at(0).dark['--nx-color-popover-alpha']).toBe(
      at(100).dark['--nx-color-popover-alpha']
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

const DERIVED_FAMILIES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
] as const;

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

const BASE_CONTRAST_CHECKS: ReadonlyArray<
  [string, string, keyof typeof TIER_THRESHOLDS]
> = [
  ['--nx-color-foreground', '--nx-color-background', 'body'],
  ['--nx-color-foreground', '--nx-color-background-hover', 'ui'],
  ['--nx-color-foreground', '--nx-color-muted', 'ui'],
  ['--nx-color-muted-foreground', '--nx-color-muted', 'incidental'],
  ['--nx-color-muted-foreground-subtle', '--nx-color-muted', 'incidental'],
  ['--nx-color-disabled-foreground', '--nx-color-disabled', 'incidental'],
  ['--nx-color-container-foreground', '--nx-color-container', 'body'],
  ['--nx-color-popover-foreground', '--nx-color-popover', 'body'],
  ['--nx-color-popover-foreground', '--nx-color-popover-hover', 'ui'],
  ['--nx-color-foreground', '--nx-color-control-background', 'ui'],
  ['--nx-color-foreground', '--nx-color-control-background-hover', 'ui'],
  ['--nx-color-nav-foreground', '--nx-color-nav-background', 'ui'],
  [
    '--nx-color-nav-muted-foreground',
    '--nx-color-nav-background',
    'incidental',
  ],
  ['--nx-color-nav-foreground', '--nx-color-nav-item-hover', 'ui'],
  ['--nx-color-nav-foreground', '--nx-color-nav-item-active', 'ui'],
];

describe('legibility invariant: every text tier clears its APCA floor', () => {
  it.each(
    SWEEP_SEEDS.flatMap((seed) =>
      SURFACE_TONES.flatMap((surfaceTone) =>
        [0, 60, 100].map((contrast) => ({
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
        contrast,
      };
      const map = deriveTheme(contract)[mode];

      const checks: Array<[string, string, keyof typeof TIER_THRESHOLDS]> = [
        ...BASE_CONTRAST_CHECKS,
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
      for (let index = 1; index <= 5; index += 1) {
        checks.push([
          `--nx-color-chart-categorical-${index}`,
          '--nx-color-container',
          'ui',
        ]);
      }

      for (const [fg, bg, tier] of checks) {
        expect(
          apcaLc(map[fg]!, map[bg]!),
          `${surfaceTone} ${mode}: ${fg} on ${bg}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[tier]);
      }
    }
  );
});
