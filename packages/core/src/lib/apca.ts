import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { converter, oklch, parse } from 'culori';

import { clampThemeChroma } from './theme-gamut';
import type { ThemeTrace } from './theme-inspection';

const toRgb = converter('rgb');

export type SrgbInts = [number, number, number];

function channel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

function toSrgbInts(input: string, trace?: ThemeTrace): SrgbInts {
  const parsed = parse(input);
  if (!parsed) throw new Error(`apca: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${input}' to OKLCH`);
  const rgb = toRgb(clampThemeChroma(converted, 'rgb', trace));
  const ints: SrgbInts = [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
  trace?.record({
    kind: 'conversion',
    input,
    policy: 'opaque',
    rgb: [rgb.r, rgb.g, rgb.b],
    quantized: ints,
    alpha: rgb.alpha ?? 1,
    result: ints,
  });
  return ints;
}

// Composite an 8-digit alpha hex over an opaque backdrop to rendered sRGB ints.
export function blendAlphaOver(hex8: string, bgInts: SrgbInts): SrgbInts {
  const h = hex8.slice(1);
  const a = parseInt(h.slice(6, 8), 16) / 255;
  const [bgR, bgG, bgB] = bgInts;
  const mix = (fg: number, bg: number) => Math.round(fg * a + bg * (1 - a));
  return [
    mix(parseInt(h.slice(0, 2), 16), bgR),
    mix(parseInt(h.slice(2, 4), 16), bgG),
    mix(parseInt(h.slice(4, 6), 16), bgB),
  ];
}

export function resolveToSrgbInts(
  value: string,
  bgInts?: SrgbInts,
  trace?: ThemeTrace
): SrgbInts {
  if (typeof value !== 'string') {
    throw new Error(`apca: expected string color value, got ${typeof value}`);
  }

  if (/^#[0-9a-fA-F]{8}$/.test(value)) {
    if (!bgInts) {
      throw new Error(
        `apca: alpha color "${value}" needs a backdrop to composite against`
      );
    }
    const result = blendAlphaOver(value, bgInts);
    if (trace) {
      const hex = value.slice(1);
      const quantized: SrgbInts = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
      trace.record({
        kind: 'conversion',
        input: value,
        policy: 'composite',
        rgb: quantized.map((channel) => channel / 255),
        quantized,
        alpha: parseInt(hex.slice(6, 8), 16) / 255,
        backdrop: bgInts,
        result,
      });
    }
    return result;
  }

  const parsed = parse(value);
  if (!parsed) throw new Error(`apca: cannot parse color '${value}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${value}'`);
  const rgb = toRgb(clampThemeChroma(converted, 'rgb', trace));
  const alpha = rgb.alpha ?? 1;
  const ints: SrgbInts = [channel(rgb.r), channel(rgb.g), channel(rgb.b)];

  if (alpha < 1) {
    if (!bgInts) {
      throw new Error(
        `apca: alpha color "${value}" needs a backdrop to composite against`
      );
    }
    const result: SrgbInts = [
      Math.round(ints[0] * alpha + bgInts[0] * (1 - alpha)),
      Math.round(ints[1] * alpha + bgInts[1] * (1 - alpha)),
      Math.round(ints[2] * alpha + bgInts[2] * (1 - alpha)),
    ];
    trace?.record({
      kind: 'conversion',
      input: value,
      policy: 'composite',
      rgb: [rgb.r, rgb.g, rgb.b],
      quantized: ints,
      alpha,
      backdrop: bgInts,
      result,
    });
    return result;
  }

  trace?.record({
    kind: 'conversion',
    input: value,
    policy: 'composite',
    rgb: [rgb.r, rgb.g, rgb.b],
    quantized: ints,
    alpha,
    result: ints,
  });
  return ints;
}

/**
 * Absolute APCA Lc of `foreground` on `background`. Both accept any CSS color
 * string culori can parse (hex, rgb, oklch). Inputs must be opaque — alpha is
 * dropped, not pre-blended, so a translucent ink (e.g. the text-tier alpha
 * inks) must be composited over its surface by the caller before scoring.
 */
export function apcaLc(foreground: string, background: string): number {
  return measureApca(foreground, background);
}

export function measureApca(
  foreground: string,
  background: string,
  trace?: ThemeTrace,
  target?: number
): number {
  const foregroundY = sRGBtoY(toSrgbInts(foreground, trace));
  const backgroundY = sRGBtoY(toSrgbInts(background, trace));
  return measureLuminance(
    foregroundY,
    backgroundY,
    foreground,
    background,
    trace,
    target
  );
}

export function measureLuminance(
  foregroundY: number,
  backgroundY: number,
  foreground: string,
  background: string,
  trace?: ThemeTrace,
  target?: number
): number {
  const lc = Math.abs(APCAcontrast(foregroundY, backgroundY) as number);
  trace?.record({
    kind: 'measurement',
    foreground,
    background,
    foregroundY,
    backgroundY,
    lc,
    ...(target === undefined ? {} : { target, passed: lc >= target }),
  });
  return lc;
}
