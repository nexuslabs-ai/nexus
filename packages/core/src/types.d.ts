declare module 'culori' {
  export interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
    alpha?: number;
  }
  export interface RgbColor {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }
  export type Color = OklchColor | RgbColor | { mode: string; alpha?: number };
  export type Gamut = 'rgb' | 'p3' | 'rec2020';

  export function parse(input: string): Color | undefined;
  export function oklch(input: Color | string): OklchColor;
  export function converter(mode: 'rgb'): (color: Color) => RgbColor;
  export function converter(mode: 'oklch'): (color: Color) => OklchColor;
  export function clampChroma<T extends Color>(
    color: T,
    mode: 'oklch',
    gamut?: Gamut
  ): T;
}

declare module 'apca-w3' {
  export function APCAcontrast(textY: number, bgY: number): number | string;
  export function sRGBtoY(rgb: [number, number, number]): number;
}
