import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma } from 'culori';

import { resolveToSrgbInts } from './apca';
import { APCA_PAIRS, type ApcaPair } from './apca-pairs';
import type { TokenMap } from './derive-theme';
import { formatOklch } from './oklch-format';
import { type Mode, type Tier, TIER_THRESHOLDS } from './palette';
import { seedOklch } from './perceptual-ramp';

export function normalizeContrast(value: unknown, fallback = 50): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
}

export function contrastTarget(tier: Tier, contrast: number): number {
  return TIER_THRESHOLDS[tier] + (15 * normalizeContrast(contrast)) / 100;
}

const token = (map: TokenMap, name: string): string => {
  const value = map[`--nx-color-${name}`];
  if (value === undefined) throw new Error(`contrast: missing ${name}`);
  return value;
};

export function pairBackground(
  map: TokenMap,
  pair: ApcaPair
): [number, number, number] {
  const backdrop = pair.backdrop
    ? resolveToSrgbInts(
        pair.backdrop.startsWith('#')
          ? pair.backdrop
          : token(map, pair.backdrop)
      )
    : undefined;
  return resolveToSrgbInts(token(map, pair.bg), backdrop);
}

export function contrastForPair(map: TokenMap, pair: ApcaPair): number {
  const background = pairBackground(map, pair);
  return Math.abs(
    APCAcontrast(
      sRGBtoY(resolveToSrgbInts(token(map, pair.fg), background)),
      sRGBtoY(background)
    ) as number
  );
}

interface Constraint {
  backgroundY: number;
  target: number;
  floor: number;
}

const TEXT_FOREGROUNDS = new Set([
  'foreground',
  'container-foreground',
  'popover-foreground',
  'nav-foreground',
  'muted-foreground',
  'muted-foreground-subtle',
  'nav-muted-foreground',
  'disabled-foreground',
]);

function constraintsFor(
  map: TokenMap,
  pairs: readonly ApcaPair[],
  contrast: number
): Constraint[] {
  // Stagger chart lightness targets so categories retain more than hue differences.
  return pairs.map((pair) => ({
    backgroundY: sRGBtoY(pairBackground(map, pair)),
    target:
      contrastTarget(pair.tier, contrast) +
      (pair.fg.startsWith('chart-categorical-')
        ? (Number(pair.fg.slice(-1)) - 1) * 4.5
        : 0),
    floor: TIER_THRESHOLDS[pair.tier],
  }));
}

const luminance = (color: string) => sRGBtoY(resolveToSrgbInts(color));
const score = (foregroundY: number, backgroundY: number) =>
  Math.abs(APCAcontrast(foregroundY, backgroundY) as number);

function solveForeground(
  seed: string,
  constraints: Constraint[],
  endpoint: 0 | 1,
  preserveSeed: boolean
): string | undefined {
  const endpointColor = `oklch(${endpoint} 0 0)`;
  const endpointY = luminance(endpointColor);
  if (constraints.some((c) => score(endpointY, c.backgroundY) < c.floor))
    return undefined;
  const targets = constraints.map((c) =>
    Math.min(c.target, score(endpointY, c.backgroundY))
  );
  const passes = (color: string) => {
    const y = luminance(color);
    return constraints.every((c, index) => {
      const target = targets[index];
      return target !== undefined && score(y, c.backgroundY) >= target;
    });
  };
  const parsed = seedOklch(seed);
  if (preserveSeed && passes(seed)) return seed;
  let fail = preserveSeed ? parsed.l : 1 - endpoint;
  let pass: number = endpoint;
  let result = endpointColor;
  for (let i = 0; i < 12; i++) {
    const l = (fail + pass) / 2;
    const candidate = formatOklch(
      clampChroma({ ...parsed, l, alpha: 1 }, 'oklch', 'p3')
    );
    if (passes(candidate)) {
      pass = l;
      result = candidate;
    } else fail = l;
  }
  return result;
}

const FOREGROUND_GROUPS = new Map<string, ApcaPair[]>();
for (const pair of APCA_PAIRS) {
  const group = FOREGROUND_GROUPS.get(pair.fg) ?? [];
  group.push(pair);
  FOREGROUND_GROUPS.set(pair.fg, group);
}

function constrainFamilyFills(
  map: TokenMap,
  name: string,
  pairs: readonly ApcaPair[],
  contrast: number
) {
  const basePair = pairs[0];
  if (!basePair) throw new Error(`contrast: missing pairs for ${name}`);
  const base = token(map, basePair.bg);
  const baseY = luminance(base);
  const endpoint: 0 | 1 = score(1, baseY) >= score(0, baseY) ? 1 : 0;
  const label = `oklch(${endpoint} 0 0)`;
  map[`--nx-color-${name}`] = label;
  for (const pair of pairs) {
    const value = token(map, pair.bg);
    const target = contrastTarget(pair.tier, contrast);
    if (score(endpoint, luminance(value)) >= target) continue;
    const seed = seedOklch(value);
    let fail = seed.l;
    let pass = 1 - endpoint;
    let result = `oklch(${pass} 0 0)`;
    for (let i = 0; i < 12; i++) {
      const l = (fail + pass) / 2;
      const candidate = formatOklch(clampChroma({ ...seed, l }, 'oklch', 'p3'));
      if (score(endpoint, luminance(candidate)) >= target) {
        pass = l;
        result = candidate;
      } else fail = l;
    }
    map[`--nx-color-${pair.bg}`] = result;
  }
}

/** Resolve shared foregrounds after fills and alpha composition. */
export function constrainColors(
  map: TokenMap,
  mode: Mode,
  contrast: number
): TokenMap {
  for (const [name, pairs] of FOREGROUND_GROUPS) {
    if (
      /^(primary|secondary|success|warning|error|information)-foreground$/.test(
        name
      )
    ) {
      constrainFamilyFills(map, name, pairs, contrast);
    }
  }
  for (const [name, pairs] of FOREGROUND_GROUPS) {
    if (
      /^(primary|secondary|success|warning|error|information)-foreground$/.test(
        name
      )
    )
      continue;
    const constraints = constraintsFor(map, pairs, contrast);
    const seed = token(map, name);
    const result = solveForeground(
      seed,
      constraints,
      mode === 'dark' ? 1 : 0,
      mode === 'light' && TEXT_FOREGROUNDS.has(name)
    );
    if (result === undefined)
      throw new Error(`contrast: no readable ${name} in ${mode}`);
    map[`--nx-color-${name}`] = result;
  }
  return map;
}
