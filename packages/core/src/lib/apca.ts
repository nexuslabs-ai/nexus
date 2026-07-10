import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma, converter, oklch, parse } from 'culori';

const toRgb = converter('rgb');

export type SrgbInts = [number, number, number];

function channel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

function toSrgbInts(input: string): SrgbInts {
  const parsed = parse(input);
  if (!parsed) throw new Error(`apca: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${input}' to OKLCH`);
  const rgb = toRgb(clampChroma(converted, 'oklch', 'rgb'));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
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

export function resolveToSrgbInts(value: string, bgInts?: SrgbInts): SrgbInts {
  if (typeof value !== 'string') {
    throw new Error(`apca: expected string color value, got ${typeof value}`);
  }

  if (/^#[0-9a-fA-F]{8}$/.test(value)) {
    if (!bgInts) {
      throw new Error(
        `apca: alpha color "${value}" needs a backdrop to composite against`
      );
    }
    return blendAlphaOver(value, bgInts);
  }

  const parsed = parse(value);
  if (!parsed) throw new Error(`apca: cannot parse color '${value}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${value}'`);
  const rgb = toRgb(clampChroma(converted, 'oklch', 'rgb'));
  const alpha = rgb.alpha ?? 1;
  const ints: SrgbInts = [channel(rgb.r), channel(rgb.g), channel(rgb.b)];

  if (alpha < 1) {
    if (!bgInts) {
      throw new Error(
        `apca: alpha color "${value}" needs a backdrop to composite against`
      );
    }
    return [
      Math.round(ints[0] * alpha + bgInts[0] * (1 - alpha)),
      Math.round(ints[1] * alpha + bgInts[1] * (1 - alpha)),
      Math.round(ints[2] * alpha + bgInts[2] * (1 - alpha)),
    ];
  }

  return ints;
}

/**
 * Absolute APCA Lc of `foreground` on `background`. Both accept any CSS color
 * string culori can parse (hex, rgb, oklch). Inputs must be opaque — alpha is
 * dropped, not pre-blended, so a translucent ink (e.g. the text-tier alpha
 * inks) must be composited over its surface by the caller before scoring.
 */
export function apcaLc(foreground: string, background: string): number {
  return Math.abs(
    APCAcontrast(
      sRGBtoY(toSrgbInts(foreground)),
      sRGBtoY(toSrgbInts(background))
    ) as number
  );
}
