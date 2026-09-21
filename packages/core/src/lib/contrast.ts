import { sRGBtoY } from 'apca-w3';

import { measureLuminance, resolveToSrgbInts } from './apca';
import { APCA_PAIRS, type ApcaPair } from './apca-pairs';
import type { TokenMap } from './derive-theme';
import { formatOklch } from './oklch-format';
import { type Mode, type Tier, TIER_THRESHOLDS } from './palette';
import { seedOklch } from './perceptual-ramp';
import { clampThemeChroma } from './theme-gamut';
import type { ThemeTrace } from './theme-inspection';

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
  pair: ApcaPair,
  trace?: ThemeTrace
): [number, number, number] {
  const backdrop = pair.backdrop
    ? resolveToSrgbInts(
        pair.backdrop.startsWith('#')
          ? pair.backdrop
          : token(map, pair.backdrop),
        undefined,
        trace
      )
    : undefined;
  return resolveToSrgbInts(token(map, pair.bg), backdrop, trace);
}

export function contrastForPair(
  map: TokenMap,
  pair: ApcaPair,
  trace?: ThemeTrace
): number {
  const background = pairBackground(map, pair, trace);
  const foregroundY = sRGBtoY(
    resolveToSrgbInts(token(map, pair.fg), background, trace)
  );
  const backgroundY = sRGBtoY(background);
  return measureLuminance(
    foregroundY,
    backgroundY,
    token(map, pair.fg),
    token(map, pair.bg),
    trace
  );
}

interface Constraint {
  backgroundY: number;
  background: string;
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

export function pairTarget(pair: ApcaPair, contrast: number): number {
  return (
    contrastTarget(pair.tier, contrast) +
    (pair.fg.startsWith('chart-categorical-')
      ? (Number(pair.fg.slice(-1)) - 1) * 4.5
      : 0)
  );
}

function constraintsFor(
  map: TokenMap,
  pairs: readonly ApcaPair[],
  contrast: number,
  trace?: ThemeTrace
): Constraint[] {
  return pairs.map((pair) => {
    const backgroundY = sRGBtoY(pairBackground(map, pair, trace));
    const target = pairTarget(pair, contrast);
    const floor = TIER_THRESHOLDS[pair.tier];
    trace?.decision('foreground-constraint', {
      background: pair.bg,
      backdrop: pair.backdrop ?? null,
      backgroundY,
      tier: pair.tier,
      target,
      floor,
    });
    return { backgroundY, background: token(map, pair.bg), target, floor };
  });
}

const luminance = (color: string, trace?: ThemeTrace) =>
  sRGBtoY(resolveToSrgbInts(color, undefined, trace));

function solveForeground(
  seed: string,
  constraints: Constraint[],
  endpoint: 0 | 1,
  preserveSeed: boolean,
  trace?: ThemeTrace
): string | undefined {
  const endpointColor = `oklch(${endpoint} 0 0)`;
  const endpointY = luminance(endpointColor, trace);
  trace?.decision('foreground-endpoint', {
    endpoint,
    preserveSeed,
    seed,
    constraints: constraints.length,
  });
  if (
    constraints.some(
      (c) =>
        measureLuminance(
          endpointY,
          c.backgroundY,
          endpointColor,
          c.background,
          trace,
          c.floor
        ) < c.floor
    )
  ) {
    trace?.decision('foreground-unreachable', {
      endpoint,
      reason: 'endpoint-below-floor',
    });
    return undefined;
  }
  const targets = constraints.map((c) => {
    const maximum = measureLuminance(
      endpointY,
      c.backgroundY,
      endpointColor,
      c.background,
      trace
    );
    const target = Math.min(c.target, maximum);
    trace?.decision('reachable-target', {
      background: c.background,
      requested: c.target,
      maximum,
      target,
      capped: target < c.target,
    });
    return target;
  });
  const passes = (color: string) => {
    const y = luminance(color, trace);
    let evaluated = 0;
    const passed = constraints.every((c, index) => {
      const target = targets[index];
      if (target === undefined) return false;
      evaluated += 1;
      return (
        measureLuminance(
          y,
          c.backgroundY,
          color,
          c.background,
          trace,
          target
        ) >= target
      );
    });
    trace?.decision('foreground-candidate', {
      color,
      passed,
      evaluated,
      unevaluated: constraints.length - evaluated,
    });
    return passed;
  };
  const parsed = seedOklch(seed);
  if (preserveSeed && passes(seed)) {
    trace?.decision('foreground-preserved', { seed });
    return seed;
  }
  let fail = preserveSeed ? parsed.l : 1 - endpoint;
  let pass: number = endpoint;
  let result = endpointColor;
  for (let i = 0; i < 12; i++) {
    const l = (fail + pass) / 2;
    trace?.decision('foreground-bisection', {
      iteration: i,
      fail,
      pass,
      lightness: l,
    });
    const candidate = formatOklch(
      clampThemeChroma({ ...parsed, l, alpha: 1 }, 'p3', trace)
    );
    if (passes(candidate)) {
      pass = l;
      result = candidate;
    } else fail = l;
  }
  trace?.decision('foreground-result', { result });
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
  contrast: number,
  trace?: ThemeTrace
) {
  const basePair = pairs[0];
  if (!basePair) throw new Error(`contrast: missing pairs for ${name}`);
  const base = token(map, basePair.bg);
  const baseY = luminance(base, trace);
  const endpoint: 0 | 1 =
    measureLuminance(1, baseY, 'oklch(1 0 0)', base, trace) >=
    measureLuminance(0, baseY, 'oklch(0 0 0)', base, trace)
      ? 1
      : 0;
  const label = `oklch(${endpoint} 0 0)`;
  map[`--nx-color-${name}`] = label;
  trace?.record({
    kind: 'assignment',
    value: label,
    source: 'family-label-endpoint',
  });
  for (const pair of pairs) {
    const fillTrace = trace?.at('constraints', `--nx-color-${pair.bg}`);
    const value = token(map, pair.bg);
    const target = contrastTarget(pair.tier, contrast);
    fillTrace?.decision('family-fill-target', {
      label,
      value,
      target,
      foreground: pair.fg,
    });
    if (
      measureLuminance(
        endpoint,
        luminance(value, fillTrace),
        label,
        value,
        fillTrace,
        target
      ) >= target
    ) {
      fillTrace?.decision('family-fill-preserved', { value });
      continue;
    }
    const seed = seedOklch(value);
    let fail = seed.l;
    let pass = 1 - endpoint;
    let result = `oklch(${pass} 0 0)`;
    for (let i = 0; i < 12; i++) {
      const l = (fail + pass) / 2;
      fillTrace?.decision('family-fill-bisection', {
        iteration: i,
        fail,
        pass,
        lightness: l,
      });
      const candidate = formatOklch(
        clampThemeChroma({ ...seed, l }, 'p3', fillTrace)
      );
      if (
        measureLuminance(
          endpoint,
          luminance(candidate, fillTrace),
          label,
          candidate,
          fillTrace,
          target
        ) >= target
      ) {
        pass = l;
        result = candidate;
      } else fail = l;
    }
    map[`--nx-color-${pair.bg}`] = result;
    fillTrace?.record({
      kind: 'assignment',
      value: result,
      source: 'family-fill-search',
    });
  }
}

/** Resolve shared foregrounds after fills and alpha composition. */
export function constrainColors(
  map: TokenMap,
  mode: Mode,
  contrast: number,
  trace?: ThemeTrace
): TokenMap {
  for (const [name, pairs] of FOREGROUND_GROUPS) {
    if (
      /^(primary|secondary|success|warning|error|information)-foreground$/.test(
        name
      )
    ) {
      constrainFamilyFills(
        map,
        name,
        pairs,
        contrast,
        trace?.at('constraints', `--nx-color-${name}`)
      );
    }
  }
  for (const [name, pairs] of FOREGROUND_GROUPS) {
    if (
      /^(primary|secondary|success|warning|error|information)-foreground$/.test(
        name
      )
    )
      continue;
    const tokenTrace = trace?.at('constraints', `--nx-color-${name}`);
    const constraints = constraintsFor(map, pairs, contrast, tokenTrace);
    const seed = token(map, name);
    const result = solveForeground(
      seed,
      constraints,
      mode === 'dark' ? 1 : 0,
      mode === 'light' && TEXT_FOREGROUNDS.has(name),
      tokenTrace
    );
    if (result === undefined)
      throw new Error(`contrast: no readable ${name} in ${mode}`);
    map[`--nx-color-${name}`] = result;
    tokenTrace?.record({
      kind: 'assignment',
      value: result,
      source: 'foreground-constraints',
    });
  }
  return map;
}
