import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma, converter, oklch, parse } from 'culori';

const toRgb = converter('rgb');

function toSrgbInts(input: string): [number, number, number] {
  const parsed = parse(input);
  if (!parsed) throw new Error(`apca: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${input}' to OKLCH`);
  const rgb = toRgb(clampChroma(converted, 'oklch', 'rgb'));
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

/**
 * Absolute APCA Lc of `foreground` on `background`. Both accept any CSS color
 * string culori can parse (hex, rgb, oklch). Inputs must be opaque — alpha is
 * not pre-blended (mirrors the engine, which only emits opaque colors).
 */
export function apcaLc(foreground: string, background: string): number {
  return Math.abs(
    APCAcontrast(
      sRGBtoY(toSrgbInts(foreground)),
      sRGBtoY(toSrgbInts(background))
    ) as number
  );
}
