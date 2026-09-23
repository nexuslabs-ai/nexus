import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma } from 'culori';

import { resolveToSrgbInts } from './apca';
import { APCA_PAIRS, type ApcaPair, type ApcaSolveKind } from './apca-pairs';
import type { TokenMap } from './derive-theme';
import { formatOklch } from './oklch-format';
import { type Mode, type Tier, TIER_THRESHOLDS } from './palette';
import { seedOklch } from './perceptual-ramp';

/** Clamp to an integer 0–100; anything non-finite falls back. */
export function normalizeContrast(value: unknown, fallback = 50): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.max(0, Math.min(100, value)))
    : fallback;
}

/** The Lc a pair aims for: its tier floor plus up to 15 more as contrast rises. */
export function contrastTarget(tier: Tier, contrast: number): number {
  return TIER_THRESHOLDS[tier] + (15 * contrast) / 100;
}

const BISECT_STEPS = 12;

/** Narrow a failing and a passing bound; returns the passing value closest to `fail`. */
export function bisect(
  fail: number,
  pass: number,
  passes: (value: number) => boolean
): number {
  for (let i = 0; i < BISECT_STEPS; i++) {
    const middle = (fail + pass) / 2;
    if (passes(middle)) pass = middle;
    else fail = middle;
  }
  return pass;
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

const luminance = (color: string) => sRGBtoY(resolveToSrgbInts(color));
const score = (foregroundY: number, backgroundY: number) =>
  Math.abs(APCAcontrast(foregroundY, backgroundY) as number);

interface Constraint {
  backgroundY: number;
  /** Requested Lc, capped at what the black/white endpoint can reach. */
  target: number;
}

/** Constraints for one foreground, or undefined when even the endpoint misses a floor. */
function constraintsFor(
  map: TokenMap,
  pairs: readonly ApcaPair[],
  contrast: number,
  endpointY: number
): Constraint[] | undefined {
  const constraints: Constraint[] = [];
  for (const pair of pairs) {
    const backgroundY = sRGBtoY(pairBackground(map, pair));
    const reachable = score(endpointY, backgroundY);
    if (reachable < TIER_THRESHOLDS[pair.tier]) return undefined;
    const target = contrastTarget(pair.tier, contrast) + (pair.offset ?? 0);
    constraints.push({ backgroundY, target: Math.min(target, reachable) });
  }
  return constraints;
}

/** Light text keeps its designed quiet seed when that already passes; dark text is always re-solved. */
const keepsTextSeed = (mode: Mode, kind: ApcaSolveKind) =>
  mode === 'light' && kind === 'text';

function solveForeground(
  seed: string,
  constraints: readonly Constraint[],
  endpoint: 0 | 1,
  keepSeed: boolean
): string {
  const passes = (color: string) => {
    const y = luminance(color);
    return constraints.every((c) => score(y, c.backgroundY) >= c.target);
  };
  if (keepSeed && passes(seed)) return seed;
  const parsed = seedOklch(seed);
  const at = (l: number) =>
    formatOklch(clampChroma({ ...parsed, l, alpha: 1 }, 'oklch', 'p3'));
  return at(
    bisect(keepSeed ? parsed.l : 1 - endpoint, endpoint, (l) => passes(at(l)))
  );
}

/** Pairs grouped by the color they resolve to (`solveAs`, else their own foreground). */
const SOLVE_GROUPS = new Map<string, ApcaPair[]>();
for (const pair of APCA_PAIRS) {
  const key = pair.solveAs ?? pair.fg;
  SOLVE_GROUPS.set(key, [...(SOLVE_GROUPS.get(key) ?? []), pair]);
}

/** Pick the black/white label for a family and move any fill it can't read on to the tier floor. */
function constrainFamilyFills(
  map: TokenMap,
  name: string,
  pairs: readonly ApcaPair[]
) {
  const basePair = pairs[0];
  if (!basePair) throw new Error(`contrast: missing pairs for ${name}`);
  const baseY = luminance(token(map, basePair.bg));
  const endpoint: 0 | 1 = score(1, baseY) >= score(0, baseY) ? 1 : 0;
  map[`--nx-color-${name}`] = `oklch(${endpoint} 0 0)`;
  for (const pair of pairs) {
    const floor = TIER_THRESHOLDS[pair.tier];
    const value = token(map, pair.bg);
    if (score(endpoint, luminance(value)) >= floor) continue;
    const fill = seedOklch(value);
    const at = (l: number) =>
      formatOklch(clampChroma({ ...fill, l }, 'oklch', 'p3'));
    const readable = (l: number) => score(endpoint, luminance(at(l))) >= floor;
    map[`--nx-color-${pair.bg}`] = at(bisect(fill.l, 1 - endpoint, readable));
  }
}

/** Resolve every foreground against all its registered backgrounds, after fills and alpha composition. */
export function constrainColors(
  map: TokenMap,
  mode: Mode,
  contrast: number
): TokenMap {
  const labels = [...SOLVE_GROUPS].filter(
    ([, pairs]) => pairs[0]?.kind === 'label'
  );
  for (const [name, pairs] of labels) constrainFamilyFills(map, name, pairs);

  const endpoint: 0 | 1 = mode === 'dark' ? 1 : 0;
  const endpointY = luminance(`oklch(${endpoint} 0 0)`);
  for (const [name, pairs] of SOLVE_GROUPS) {
    const kind = pairs[0]?.kind;
    if (kind === undefined || kind === 'label') continue;
    const constraints = constraintsFor(map, pairs, contrast, endpointY);
    if (constraints === undefined)
      throw new Error(`contrast: no readable ${name} in ${mode}`);
    const solved = solveForeground(
      token(map, name),
      constraints,
      endpoint,
      keepsTextSeed(mode, kind)
    );
    for (const fg of new Set(pairs.map((pair) => pair.fg).concat(name)))
      map[`--nx-color-${fg}`] = solved;
  }
  return map;
}
