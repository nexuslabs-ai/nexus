import { clampChroma, type Oklch, oklch, parse } from 'culori';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { deriveTheme, type Mode } from './derive-theme';
import lightFixture from './light-tone.fixture.json';
import perceptualGrid from './perceptual-grid.json';
import perceptualGridHue from './perceptual-grid-hue.json';

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
type TokenRecord = Record<string, string>;
type Fixture = {
  schemaVersion: number;
  paperL: number;
  lightDepthMultiplier: number;
  toneContrast: number;
  tones: Record<Tone, Record<ToneToken, string>>;
};

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(TEST_DIR, '..', '..');
const SEMANTIC_DIR = path.join(ROOT_DIR, 'tokens', 'semantic');
const PRIMITIVE_COLOR_FILE = path.join(
  ROOT_DIR,
  'tokens',
  'primitives',
  'color.json'
);
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
  'border-disabled',
]);
const FIXED_WHITE_TOKENS = new Set(['control-thumb']);
const STATUS_FAMILIES = ['success', 'warning', 'error', 'information'] as const;

const primitiveColors = JSON.parse(
  readFileSync(PRIMITIVE_COLOR_FILE, 'utf8')
) as Record<string, Record<string, { $value: string; $type: string }>>;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function collectColorLeaves(
  obj: unknown,
  leaves: TokenRecord,
  tokenPath: string[] = []
): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  const record = obj as Record<string, unknown>;
  if (record.$type === 'color' && typeof record.$value === 'string') {
    leaves[tokenPath.join('-')] = record.$value;
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('$')) continue;
    collectColorLeaves(value, leaves, [...tokenPath, key]);
  }
}

function baseLeaves(tone: Tone, mode: Mode): TokenRecord {
  const leaves: TokenRecord = {};
  collectColorLeaves(
    readJson(path.join(SEMANTIC_DIR, `base-${tone}-${mode}.json`)),
    leaves
  );
  return leaves;
}

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

function parseToOklch(input: string): Oklch {
  const parsed = parse(input);
  if (!parsed) throw new Error(`Cannot parse color "${input}"`);
  const color = oklch(parsed);
  if (!color) throw new Error(`Cannot convert color "${input}" to OKLCH`);
  return color;
}

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
  return primitiveOklch(ref);
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
        appearance: mode,
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
        contrast: TONE_CONTRAST,
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

  it('keeps non-neutral light paper visibly distinct from neutral', () => {
    const paper = Object.fromEntries(
      TONES.map((tone) => [tone, comps(LIGHT_FIXTURE.tones[tone].background)])
    );
    expect(paper.slate!.c).toBeGreaterThan(paper.gray!.c);
    expect(paper.gray!.c).toBeGreaterThan(paper.zinc!.c);
    expect(paper.zinc!.c).toBeGreaterThan(paper.neutral!.c);
    expect(paper.stone!.c).toBeGreaterThan(paper.neutral!.c);
  });
});
