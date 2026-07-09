import { describe, expect, it } from 'vitest';

import { deriveSurfaces, type NexusSurfaceTone } from './derive-theme';
import perceptualGrid from './perceptual-grid.json';
import {
  baseLeaves,
  parseToOklch,
  primitiveColors,
  type TokenRecord,
} from './token-parity-utils';

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

type SurfaceToken = (typeof SURFACE_TOKENS)[number];

const STANDARD_SHADE_L = perceptualGrid as Record<string, number>;
const STATIC_TOLERANCE_L = 0.006;
const SIGN_EPSILON = 0.0001;
const MIN_CARD_PAGE_SEPARATION_L = 0.025;
const MIN_CONTAINER_HOVER_PAGE_SEPARATION_L = 0.01;

function lOf(input: string): number {
  const color = parseToOklch(input);
  if (typeof color.l !== 'number') {
    throw new Error(`Color has no OKLCH lightness "${input}"`);
  }
  return color.l;
}

// Standard shades resolve to their grid-pinned L (the emitted CSS grinds them
// through perceptual-grid.json); off-grid near-whites (75/150) are emitted
// as-is, so their effective L is the raw hex L. The `stay off the perceptual
// grid` test below guards that this branch keeps its meaning.
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
  // primitiveLightness() only reads raw-hex L for the near-white 75/150 shades
  // because they are absent from the perceptual grid. If they were ever grid-
  // pinned, the resolver would silently switch to grid L and this suite's
  // meaning would change with no failing signal — so pin the invariant here.
  it('75/150 near-white primitives stay off the perceptual grid', () => {
    expect('75' in STANDARD_SHADE_L, '75 must not be grid-pinned').toBe(false);
    expect('150' in STANDARD_SHADE_L, '150 must not be grid-pinned').toBe(
      false
    );
  });

  it.each(TONES)(
    '%s light runtime surfaces match static token ladder',
    (tone) => {
      const staticLeaves = baseLeaves(tone, 'light');
      const engine = deriveSurfaces(
        '#ffffff',
        tone as NexusSurfaceTone,
        'light',
        0.056
      );
      const staticBackground = staticLightness(staticLeaves, 'background');
      const engineBackground = lOf(engine['--nx-color-background']!);
      const staticContainer = staticLightness(staticLeaves, 'container');
      const staticContainerHover = staticLightness(
        staticLeaves,
        'container-hover'
      );
      const engineContainer = lOf(engine['--nx-color-container']!);
      const engineContainerHover = lOf(engine['--nx-color-container-hover']!);

      expect(
        staticContainer - staticBackground,
        `${tone}.static card/page separation`
      ).toBeGreaterThanOrEqual(MIN_CARD_PAGE_SEPARATION_L);
      expect(
        engineContainer - engineBackground,
        `${tone}.engine card/page separation`
      ).toBeGreaterThanOrEqual(MIN_CARD_PAGE_SEPARATION_L);
      expect(
        staticContainerHover - staticBackground,
        `${tone}.static container-hover/page separation`
      ).toBeGreaterThanOrEqual(MIN_CONTAINER_HOVER_PAGE_SEPARATION_L);
      expect(
        engineContainerHover - engineBackground,
        `${tone}.engine container-hover/page separation`
      ).toBeGreaterThanOrEqual(MIN_CONTAINER_HOVER_PAGE_SEPARATION_L);

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
