import { oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { APCA_PAIRS } from './apca-pairs';
import {
  BASE_TONE_OPTIONS,
  BASE_TONE_SEEDS,
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  sanitizeNexusAppearance,
} from './appearance-model';
import { contrastForPair } from './contrast';
import { deriveTheme, deriveThemeMode, type TokenMap } from './derive-theme';
import { TIER_THRESHOLDS } from './palette';
import { SURFACE_TOKENS } from './surface-ladder';
import { SEMANTIC_TOKEN_REGISTRY } from './token-registry';

// Contrast is normalized to an integer, so these 101 stops are every input.
const STOPS = Array.from({ length: 101 }, (_, index) => index);
const RUNTIME_TOKENS = SEMANTIC_TOKEN_REGISTRY.map(
  ({ name }) => `--nx-color-${name}`
).sort();
// Bisection quantizes each solve, so adjacent stops may dip by a fraction of an Lc.
const MONOTONIC_TOLERANCE_LC = 0.5;
// 5 tones × 7 brands × 101 stops of one mode's derivation.
const SWEEP_TIMEOUT_MS = 120_000;
const BRANDS = [
  '#000000',
  '#ffffff',
  '#808080',
  '#ffff00',
  '#7656cc',
  '#00ff00',
  '#ff0000',
];
const colors = (state: Partial<typeof DEFAULT_NEXUS_APPEARANCE>) =>
  deriveTheme(
    createNexusThemeContract({ ...DEFAULT_NEXUS_APPEARANCE, ...state })
  );

describe('continuous contrast', () => {
  it.each(['light', 'dark'] as const)(
    'legibility invariant across the full slider range in %s mode',
    (mode) => {
      for (const { value: surfaceTone } of BASE_TONE_OPTIONS)
        for (const brandColor of BRANDS) {
          let previous: TokenMap | undefined;
          for (const contrast of STOPS) {
            const map = deriveThemeMode(
              createNexusThemeContract({
                ...DEFAULT_NEXUS_APPEARANCE,
                surfaceTone,
                brandColor,
                [`${mode}Contrast`]: contrast,
              }),
              mode
            );
            expect(Object.keys(map).sort()).toEqual(RUNTIME_TOKENS);
            if (mode === 'light') {
              expect(map['--nx-color-background']).toBe('oklch(1 0 0)');
              expect(map['--nx-color-container']).toBe(
                map['--nx-color-background']
              );
              expect(map['--nx-color-popover']).toBe(
                map['--nx-color-background']
              );
            }
            for (const pair of APCA_PAIRS) {
              const context = `${mode} ${surfaceTone} ${brandColor} ${contrast} ${pair.fg}/${pair.bg}`;
              const score = contrastForPair(map, pair);
              expect(score, context).toBeGreaterThanOrEqual(
                TIER_THRESHOLDS[pair.tier]
              );
              // The page stays fixed. Moving hover/overlay surfaces can change
              // which background limits a shared ink, so check their floors above.
              if (previous && pair.bg === 'background' && !pair.backdrop) {
                expect(
                  score + MONOTONIC_TOLERANCE_LC,
                  context + ' monotonic on fixed page'
                ).toBeGreaterThanOrEqual(contrastForPair(previous, pair));
              }
            }
            for (const value of Object.values(map)) {
              expect(Number.isFinite(oklch(parse(value)!)!.l)).toBe(true);
            }
            previous = map;
          }
        }
    },
    SWEEP_TIMEOUT_MS
  );

  it.each(BASE_TONE_OPTIONS.map(({ value }) => value))(
    'legibility invariant: maximum light contrast keeps readable text and the original subtle border strength in %s',
    (surfaceTone) => {
      const map = colors({
        surfaceTone,
        brandColor: '#0a0a0a',
        lightContrast: 100,
      }).light;
      const lightness = (name: string) =>
        oklch(parse(map[`--nx-color-${name}`]!)!)!.l;
      expect(lightness('foreground')).toBeLessThan(0.25);
      expect(lightness('nav-foreground')).toBeLessThan(0.25);
      expect(lightness('foreground')).toBeCloseTo(
        oklch(parse(BASE_TONE_SEEDS[surfaceTone].light.foreground)!)!.l,
        3
      );
      expect(lightness('muted-foreground')).toBeGreaterThan(0.4);
      expect(lightness('muted-foreground')).toBeGreaterThan(
        lightness('foreground')
      );
      expect(map['--nx-color-background']).toBe('oklch(1 0 0)');
      expect(map['--nx-color-container']).toBe(map['--nx-color-background']);
      expect(map['--nx-color-popover']).toBe(map['--nx-color-background']);
      expect(map['--nx-color-border-default']).toBe(
        'oklch(0.1448 0 0 / 0.1168)'
      );
      expect(map['--nx-color-border-hairline']).toBe(
        'oklch(0.1448 0 0 / 0.0941)'
      );
    }
  );

  it.each(BASE_TONE_OPTIONS.map(({ value }) => value))(
    'keeps %s surfaces, ordinary text, and overlays nearly neutral across contrast states',
    (surfaceTone) => {
      const textNames = [
        'foreground',
        'muted-foreground',
        'muted-foreground-subtle',
        'container-foreground',
        'popover-foreground',
        'nav-foreground',
        'nav-muted-foreground',
        'disabled-foreground',
      ];
      const alphaNames = [
        'overlay',
        'popover-backdrop',
        'border-default-alpha',
        'background-hover-alpha',
      ];
      for (const contrast of [0, 50, 100]) {
        const theme = colors({
          surfaceTone,
          brandColor: '#95bf47',
          lightContrast: contrast,
          darkContrast: contrast,
        });
        for (const mode of ['light', 'dark'] as const) {
          const map = theme[mode];
          const chroma = (name: string) =>
            oklch(parse(map[`--nx-color-${name}`]!)!)!.c;
          const surfaceLimit = mode === 'light' ? 0.003 : 0.006;
          const textLimit = mode === 'light' ? 0.006 : 0.003;
          for (const name of SURFACE_TOKENS) {
            expect(
              chroma(name),
              `${surfaceTone} ${mode} ${contrast} ${name}`
            ).toBeLessThanOrEqual(surfaceLimit);
          }
          for (const name of textNames)
            expect(chroma(name), name).toBeLessThanOrEqual(textLimit);
          for (const name of alphaNames)
            expect(chroma(name), name).toBeLessThanOrEqual(0.006);
          expect(chroma('container-hover')).toBeCloseTo(
            chroma('control-background-hover'),
            4
          );
          expect(chroma('primary-background')).toBeGreaterThan(0.05);
          expect(chroma('warning-background')).toBeGreaterThan(0.05);
          expect(chroma('error-background')).toBeGreaterThan(0.05);
        }
      }
    }
  );

  it('changing one contrast value leaves the other mode unchanged', () => {
    const baseline = colors({});
    for (const mode of ['light', 'dark'] as const) {
      const theme = colors({ [`${mode}Contrast`]: 100 });
      expect(theme[mode]).not.toEqual(baseline[mode]);
      expect(theme[mode === 'dark' ? 'light' : 'dark']).toEqual(
        baseline[mode === 'dark' ? 'light' : 'dark']
      );
    }
  });

  it('covers shared state labels, text surfaces, and translucent backdrops', () => {
    expect(APCA_PAIRS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fg: 'primary-foreground',
          bg: 'primary-background-hover',
        }),
        expect.objectContaining({
          fg: 'warning-text',
          bg: 'warning-subtle-active',
        }),
        expect.objectContaining({ fg: 'muted-foreground', bg: 'container' }),
        expect.objectContaining({
          fg: 'popover-foreground',
          bg: 'popover-alpha',
          backdrop: 'container',
        }),
      ])
    );
  });

  it('sanitizes invalid values and keeps deterministic output', () => {
    const state = sanitizeNexusAppearance({
      lightContrast: 100,
      darkContrast: Number.NaN,
    });
    expect(state).toMatchObject({
      lightContrast: 100,
      darkContrast: 50,
    });
    expect(colors(state)).toEqual(colors(state));
  });
});
