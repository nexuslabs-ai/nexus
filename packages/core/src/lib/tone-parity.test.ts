import { clampChroma, type Oklch } from 'culori';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { deriveTheme } from './derive-theme';
import lightFixture from './light-tone.fixture.json';
import type { Mode } from './palette';
import perceptualGrid from './perceptual-grid.json';
import perceptualGridHue from './perceptual-grid-hue.json';
import { CHART_DARK, CHART_LIGHT, NEUTRAL, STATUS_RAMP } from './static-ramps';
import {
  baseLeaves,
  parseToOklch,
  primitiveColors,
  readJson,
  ROOT_DIR,
} from './token-parity-utils';

const TONE_CONTRAST = 60;
const LIGHT_TOL = { l: 0.005, c: 0.002, h: 2, a: 0.002 };
const DARK_TOL = { l: 0.04, c: 0.01, h: 8, a: 0.02 };
const TONES = ['slate', 'neutral', 'zinc', 'gray', 'stone'] as const;
const TONE_TOKENS = [
  'background',
  'background-hover',
  'background-hover-alpha',
  'background-active',
  'muted',
  'disabled',
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'popover-alpha',
  'popover-backdrop',
  'control-background',
  'control-background-hover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'border-default-alpha',
  'border-active',
  'overlay',
] as const;

type Tone = (typeof TONES)[number];
type ToneToken = (typeof TONE_TOKENS)[number];
type Fixture = {
  schemaVersion: number;
  toneContrast: number;
  tones: Record<Tone, Record<ToneToken, string>>;
};

// Light tone parity is a frozen CHANGE-DETECTOR, not an independent oracle: the
// fixture was generated from the engine's own first run and human-reviewed (light
// intentionally diverges from curated near-white, so there is no external value to
// assert against). It catches unintended drift; the human sign-off proves the
// values are right.
const LIGHT_FIXTURE = lightFixture as Fixture;
const SHADE_RE = /^(50|100|200|300|400|500|600|700|800|900|950)$/;
const EMIT_GAMUT = 'p3';
const CUSP_FRACTION = 0.95;
const TONE_TOKEN_SET = new Set<string>(TONE_TOKENS);
const CONTRAST_INK_TOKENS = new Set([
  'foreground',
  'muted-foreground',
  'muted-foreground-subtle',
  'disabled-foreground',
  'container-foreground',
  'popover-foreground',
  'nav-foreground',
  'nav-muted-foreground',
  'border-default',
  'border-hairline',
  'border-disabled',
]);
const FIXED_WHITE_TOKENS = new Set(['control-thumb']);
const STATUS_FAMILIES = ['success', 'warning', 'error', 'information'] as const;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatOklchWithAlpha(color: Oklch): string {
  const finite = (value: number | undefined) =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const l = round(finite(color.l), 4);
  const c = round(finite(color.c), 4);
  const h = c && color.h !== undefined ? round(finite(color.h), 3) : 0;
  const alpha = color.alpha ?? 1;
  const base = `oklch(${l} ${c} ${h}`;
  if (alpha < 1) return `${base} / ${round(alpha, 4)})`;
  return `${base})`;
}

// Reproduces the build-time curated-primitive grinder (`scripts/lib/
// perceptual-grid.js` → `hexToOklchPinned`): per-hue L curves + P3-cusp chroma.
// This is NOT `perceptual-ramp.ts`'s `pinnedOklch` — that is the runtime
// brand-ramp grinder (flat L grid, chroma capped at the seed), a different
// algorithm. `rootDir: ./src` blocks importing the build script from a test.
function primitiveOklch(ref: string): string {
  const [palette, shade] = ref.slice(1, -1).split('.');
  const value =
    palette && shade ? primitiveColors[palette]?.[shade]?.$value : undefined;
  if (!palette || !shade || !value) throw new Error(`Unknown color ref ${ref}`);
  if (!value.startsWith('#')) return value;
  if (!SHADE_RE.test(shade)) return formatOklchWithAlpha(parseToOklch(value));

  const source = parseToOklch(value);
  const hueCurves = perceptualGridHue as Record<string, Record<string, number>>;
  const lGrid = perceptualGrid as Record<string, number>;
  const pinnedL = (hueCurves[palette] ?? lGrid)[shade];
  if (pinnedL === undefined) throw new Error(`Unknown shade ${ref}`);

  let chroma = source.c ?? 0;
  if (hueCurves[palette]) {
    const cusp =
      clampChroma(
        { mode: 'oklch', l: pinnedL, c: 0.5, h: source.h },
        'oklch',
        EMIT_GAMUT
      ).c ?? 0;
    chroma = cusp * CUSP_FRACTION;
  }

  return formatOklchWithAlpha(
    clampChroma(
      {
        mode: 'oklch',
        l: pinnedL,
        c: chroma,
        h: source.h,
        ...(source.alpha !== undefined ? { alpha: source.alpha } : {}),
      },
      'oklch',
      EMIT_GAMUT
    )
  );
}

function primitiveHex(palette: string, shade: string): string {
  const value = primitiveColors[palette]?.[shade]?.$value;
  if (!value?.startsWith('#'))
    throw new Error(`Unknown hex primitive ${palette}.${shade}`);
  return value;
}

function expectedTone(tone: Tone, mode: Mode, token: ToneToken): string {
  if (mode === 'light') return LIGHT_FIXTURE.tones[tone][token];
  const ref = baseLeaves(tone, mode)[token];
  if (!ref) throw new Error(`Missing curated ${tone}.${mode}.${token}`);
  if (ref.startsWith('{')) return primitiveOklch(ref);
  if (ref.startsWith('#')) return formatOklchWithAlpha(parseToOklch(ref));
  return ref;
}

function comps(value: string): { l: number; c: number; h: number; a: number } {
  const match = value.match(
    /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/
  );
  if (!match) throw new Error(`Unexpected OKLCH format: ${value}`);
  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
    a: match[4] ? Number(match[4]) : 1,
  };
}

function hueDelta(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function expectNear(
  got: string | undefined,
  want: string,
  tone: Tone,
  mode: Mode,
  token: ToneToken
): void {
  expect(got, `${tone} ${mode} ${token} is emitted`).toBeDefined();
  const g = comps(got!);
  const w = comps(want);
  const tolerance = mode === 'light' ? LIGHT_TOL : DARK_TOL;
  expect(
    Math.abs(g.l - w.l),
    `${tone} ${mode} ${token} lightness`
  ).toBeLessThanOrEqual(tolerance.l);
  expect(
    Math.abs(g.c - w.c),
    `${tone} ${mode} ${token} chroma`
  ).toBeLessThanOrEqual(tolerance.c);
  if (g.c > 0.01 && w.c > 0.01) {
    expect(
      hueDelta(g.h, w.h),
      `${tone} ${mode} ${token} hue`
    ).toBeLessThanOrEqual(tolerance.h);
  }
  expect(
    Math.abs(g.a - w.a),
    `${tone} ${mode} ${token} alpha`
  ).toBeLessThanOrEqual(tolerance.a);
}

function classifyBaseToken(token: string): string | null {
  if (TONE_TOKEN_SET.has(token)) return 'tone-owned';
  if (CONTRAST_INK_TOKENS.has(token)) return 'contrast-ink';
  if (FIXED_WHITE_TOKENS.has(token)) return 'fixed-white';
  if (
    STATUS_FAMILIES.some(
      (family) => token === family || token.startsWith(`${family}-`)
    )
  ) {
    return 'status';
  }
  if (
    STATUS_FAMILIES.some(
      (family) =>
        token === `border-${family}` || token === `border-${family}-active`
    )
  ) {
    return 'status-border';
  }
  return null;
}

describe('tone parity', () => {
  it.each(TONES)('%s matches the mode-split tone oracle', (tone) => {
    for (const mode of ['light', 'dark'] as const) {
      const got = deriveTheme({
        surfaceTone: tone,
        light: {
          accent: '#2563eb',
          background: '#ffffff',
          foreground: '#181818',
        },
        dark: {
          accent: '#2563eb',
          background: primitiveHex(tone, '950'),
          foreground: '#ffffff',
        },
        contrast: { light: TONE_CONTRAST, dark: TONE_CONTRAST },
      })[mode];

      for (const token of TONE_TOKENS) {
        expectNear(
          got[`--nx-color-${token}`],
          expectedTone(tone, mode, token),
          tone,
          mode,
          token
        );
      }
    }
  });

  it('classifies every base color leaf', () => {
    const unclassified = [];
    for (const tone of TONES) {
      for (const mode of ['light', 'dark'] as const) {
        for (const token of Object.keys(baseLeaves(tone, mode))) {
          if (!classifyBaseToken(token))
            unclassified.push(`${tone}.${mode}.${token}`);
        }
      }
    }
    expect(unclassified).toEqual([]);
  });

  it('keeps non-neutral light support tiers visibly distinct from neutral', () => {
    const supportTier = Object.fromEntries(
      TONES.map((tone) => {
        const light = deriveTheme({
          surfaceTone: tone,
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
          contrast: { light: TONE_CONTRAST, dark: TONE_CONTRAST },
        }).light;
        return [tone, comps(light['--nx-color-muted']!)];
      })
    );
    expect(supportTier.slate!.c).toBeGreaterThan(supportTier.gray!.c);
    expect(supportTier.gray!.c).toBeGreaterThan(supportTier.zinc!.c);
    expect(supportTier.zinc!.c).toBeGreaterThan(supportTier.neutral!.c);
    expect(supportTier.stone!.c).toBeGreaterThan(supportTier.neutral!.c);
  });
});

// Value parity: the engine's hand-typed primitive tables must equal the
// hue-curve-ground `color.json` primitives, so editing color.json (or mistyping a
// table entry) fails here instead of silently shipping a drifted value.
describe('engine color tables match ground color.json primitives', () => {
  const grind = (palette: string, shade: string): string =>
    primitiveOklch(`{${palette}.${shade}}`);
  const ALL_SHADES = [
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
  ] as const;

  it.each([
    ['success', 'green'],
    ['warning', 'orange'],
    ['error', 'red'],
    ['information', 'blue'],
  ] as const)('%s ramp equals ground %s', (family, palette) => {
    for (const shade of ALL_SHADES) {
      expect(STATUS_RAMP[family][shade], `${family}.${shade}`).toBe(
        grind(palette, shade)
      );
    }
  });

  it('chart-light/dark sets equal their ground primitives', () => {
    const lightPrimitives = [
      ['teal', '700'],
      ['green', '700'],
      ['orange', '600'],
      ['rose', '600'],
      ['indigo', '600'],
    ] as const;
    const darkPrimitives = [
      ['teal', '200'],
      ['lime', '200'],
      ['orange', '200'],
      ['rose', '200'],
      ['indigo', '200'],
    ] as const;
    CHART_LIGHT.forEach((value, index) =>
      expect(value, `chart-light ${index}`).toBe(
        grind(lightPrimitives[index]![0], lightPrimitives[index]![1])
      )
    );
    CHART_DARK.forEach((value, index) =>
      expect(value, `chart-dark ${index}`).toBe(
        grind(darkPrimitives[index]![0], darkPrimitives[index]![1])
      )
    );
  });

  it('neutral family equals ground neutral', () => {
    for (const shade of Object.keys(NEUTRAL) as (keyof typeof NEUTRAL)[]) {
      expect(NEUTRAL[shade], `neutral.${shade}`).toBe(grind('neutral', shade));
    }
  });

  // Runtime error focus is a fixed red primitive. Pin the derived value to the
  // static focus-default-{mode}.json shade ref so re-selecting the shade there
  // (e.g. {red.600} -> {red.500}) without updating deriveFocus fails here.
  it('runtime error focus tracks the static focus primitive shade', () => {
    const focusErrorRef = (mode: Mode) =>
      (
        readJson(
          path.join(
            ROOT_DIR,
            'tokens',
            'primitives',
            'focus',
            `focus-default-${mode}.json`
          )
        ) as { color: { error: { $value: string } } }
      ).color.error.$value;
    const theme = deriveTheme({
      surfaceTone: 'slate',
      light: {
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#181818',
      },
      dark: {
        accent: '#2563eb',
        background: primitiveHex('slate', '950'),
        foreground: '#ffffff',
      },
      contrast: { light: TONE_CONTRAST, dark: TONE_CONTRAST },
    });
    expect(theme.light['--nx-color-focus-error']).toBe(
      primitiveOklch(focusErrorRef('light'))
    );
    expect(theme.dark['--nx-color-focus-error']).toBe(
      primitiveOklch(focusErrorRef('dark'))
    );
  });
});
