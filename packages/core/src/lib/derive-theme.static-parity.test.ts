import { oklch, parse } from 'culori';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { deriveSurfaces, type NexusSurfaceTone } from './derive-theme';
import perceptualGrid from './perceptual-grid.json';

const TONES = ['slate', 'neutral', 'zinc', 'gray', 'stone'] as const;
const SURFACE_TOKENS = [
  'background',
  'background-hover',
  'background-active',
  'muted',
  'disabled',
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'control-background',
  'control-background-hover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'border-active',
] as const;

type Tone = (typeof TONES)[number];
type SurfaceToken = (typeof SURFACE_TOKENS)[number];
type TokenRecord = Record<string, string>;

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(TEST_DIR, '..', '..');
const SEMANTIC_DIR = path.join(ROOT_DIR, 'tokens', 'semantic');
const PRIMITIVE_COLOR_FILE = path.join(
  ROOT_DIR,
  'tokens',
  'primitives',
  'color.json'
);
const STANDARD_SHADE_L = perceptualGrid as Record<string, number>;
const STATIC_TOLERANCE_L = 0.006;
const SIGN_EPSILON = 0.0001;

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

function baseLeaves(tone: Tone): TokenRecord {
  const leaves: TokenRecord = {};
  collectColorLeaves(
    readJson(path.join(SEMANTIC_DIR, `base-${tone}-light.json`)),
    leaves
  );
  return leaves;
}

function parseToOklch(input: string): { l?: number } {
  const parsed = parse(input);
  if (!parsed) throw new Error(`Cannot parse color "${input}"`);
  const color = oklch(parsed);
  if (!color) throw new Error(`Cannot convert color "${input}" to OKLCH`);
  return color;
}

function lOf(input: string): number {
  const color = parseToOklch(input);
  if (typeof color.l !== 'number') {
    throw new Error(`Color has no OKLCH lightness "${input}"`);
  }
  return color.l;
}

function primitiveLightness(ref: string): number {
  const [palette, shade] = ref.slice(1, -1).split('.');
  const value =
    palette && shade ? primitiveColors[palette]?.[shade]?.$value : undefined;
  if (!palette || !shade || !value) throw new Error(`Unknown color ref ${ref}`);
  if (shade in STANDARD_SHADE_L) return STANDARD_SHADE_L[shade]!;
  return lOf(value);
}

function staticLightness(leaves: TokenRecord, token: SurfaceToken): number {
  const value = leaves[token];
  if (!value) throw new Error(`Missing static light token "${token}"`);
  if (value.startsWith('{')) return primitiveLightness(value);
  return lOf(value);
}

function sign(value: number): number {
  if (Math.abs(value) <= SIGN_EPSILON) return 0;
  return Math.sign(value);
}

describe('deriveSurfaces static light parity', () => {
  it.each(TONES)(
    '%s light runtime surfaces match static token ladder',
    (tone) => {
      const staticLeaves = baseLeaves(tone);
      const engine = deriveSurfaces(
        '#ffffff',
        tone as NexusSurfaceTone,
        'light',
        0.056
      );
      const staticBackground = staticLightness(staticLeaves, 'background');
      const engineBackground = lOf(engine['--nx-color-background']!);

      for (const token of SURFACE_TOKENS) {
        const engineL = lOf(engine[`--nx-color-${token}`]!);
        const staticL = staticLightness(staticLeaves, token);
        expect(
          sign(engineL - engineBackground),
          `${tone}.${token} direction`
        ).toBe(sign(staticL - staticBackground));
        expect(
          Math.abs(engineL - staticL),
          `${tone}.${token} lightness`
        ).toBeLessThanOrEqual(STATIC_TOLERANCE_L);
      }
    }
  );
});
