import * as apca from 'apca-w3';
import { describe, expect, it } from 'vitest';

import { APCA_PAIRS } from './apca-pairs';
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { constrainColors, contrastForPair } from './contrast';
import {
  deriveSurfaces,
  deriveTheme,
  inspectTheme,
  type ThemeDerivationInput,
  themeToCss,
} from './derive-theme';
import { PALETTE_KEYS, SHADES } from './palette';
import { getPaletteRamp, getPaletteShade } from './primitive-palette';
import {
  type ThemeInspection,
  ThemeTrace,
  type ThemeTraceEvent,
} from './theme-inspection';
import { SEMANTIC_TOKEN_REGISTRY } from './token-registry';

const contract = (brandColor = '#2863ab'): ThemeDerivationInput =>
  createNexusThemeContract({ ...DEFAULT_NEXUS_APPEARANCE, brandColor });
const decisions = (result: ThemeInspection, operation: string) =>
  result.trace.filter(
    (event): event is Extract<ThemeTraceEvent, { kind: 'decision' }> =>
      event.kind === 'decision' && event.operation === operation
  );

function thrown(run: () => unknown): Error {
  try {
    run();
  } catch (error) {
    if (error instanceof Error) return error;
    throw error;
  }
  throw new Error('Expected the derivation to fail');
}

describe('inspectTheme parity', () => {
  it.each(BRAND_COLOR_PRESETS)(
    '$label preserves both complete maps and CSS across tones and contrast',
    ({ color }) => {
      for (const surfaceTone of PALETTE_KEYS) {
        for (const contrast of [0, 50, 100]) {
          const input = createNexusThemeContract({
            ...DEFAULT_NEXUS_APPEARANCE,
            brandColor: color,
            surfaceTone,
            lightContrast: contrast,
            darkContrast: 100 - contrast,
          });
          const result = inspectTheme(input);
          const ordinary = deriveTheme(input);
          expect(result.theme).toEqual(ordinary);
          expect(themeToCss(result.theme)).toBe(themeToCss(ordinary));
        }
      }
    }
  );

  it.each([
    '#000000',
    '#ffffff',
    '#1b2a4a',
    '#808080',
    'oklch(0.7 0.4 150)',
    '#2863ab80',
  ])(
    'keeps endpoint, custom, gamut, and alpha input parity for %s',
    (color) => {
      const input = contract(color);
      expect(inspectTheme(input).theme).toEqual(deriveTheme(input));
    }
  );

  it('records defaults and normalization without sanitizing seed strings', () => {
    const input = contract();
    delete input.surfaceTone;
    input.contrast = { light: Number.NaN, dark: 123 };
    const result = inspectTheme(input);
    expect(result.input).toEqual(input);
    expect(result.normalizedInput).toMatchObject({
      surfaceTone: 'neutral',
      contrast: { light: 50, dark: 100 },
      light: input.light,
    });
    expect(decisions(result, 'normalize-input')).toMatchObject([
      {
        mode: 'light',
        values: { defaultedTone: true, inputContrast: 'NaN', contrast: 50 },
      },
      {
        mode: 'dark',
        values: { defaultedTone: true, inputContrast: '123', contrast: 100 },
      },
    ]);
    expect(result.theme).toEqual(deriveTheme(input));
    const clamped = inspectTheme({
      ...input,
      contrast: { light: -1, dark: Infinity },
    });
    expect(clamped.normalizedInput.contrast).toEqual({ light: 0, dark: 50 });
  });

  it.each(['accent', 'foreground', 'background'] as const)(
    'preserves errors for an invalid dark %s',
    (field) => {
      const input = contract();
      input.dark[field] = 'not-a-color';
      const original = thrown(() => deriveTheme(input));
      const inspected = thrown(() => inspectTheme(input));
      expect(inspected.constructor).toBe(original.constructor);
      expect(inspected.message).toBe(original.message);
    }
  );

  it.each([
    null,
    undefined,
    {},
    { ...contract(), light: undefined },
    { ...contract(), dark: null },
    { ...contract(), contrast: null },
    { ...contract(), surfaceTone: 'unknown' },
  ])('preserves malformed JavaScript caller errors for %j', (value) => {
    const input = value as ThemeDerivationInput;
    const original = thrown(() => deriveTheme(input));
    const inspected = thrown(() => inspectTheme(input));
    expect(inspected.constructor).toBe(original.constructor);
    expect(inspected.message).toBe(original.message);
  });

  it('does not validate the ignored light background seed', () => {
    const input = contract();
    input.light.background = 'unused-by-white-plane';
    const result = inspectTheme(input);
    expect(result.theme).toEqual(deriveTheme(input));
    expect(decisions(result, 'surface-anchor')[0]?.values).toMatchObject({
      branch: 'white-plane',
      seedLightness: null,
    });
  });
});

describe('executed inspection evidence', () => {
  it('keeps call-local deterministic sequences despite unrelated calls and warmed caches', () => {
    const input = contract();
    const first = inspectTheme(input);
    const before = JSON.stringify(first);
    deriveTheme(contract('#e11d48'));
    inspectTheme(contract('#ffffff'));
    for (const shade of SHADES) getPaletteShade('blue', shade);
    const second = inspectTheme(input);
    expect(second).toEqual(first);
    expect(JSON.stringify(first)).toBe(before);
    expect(first.trace.map((event) => event.sequence)).toEqual(
      first.trace.map((_, index) => index)
    );
    expect(first.trace).not.toBe(second.trace);
    input.light.accent = '#000000';
    expect(first.input.light.accent).toBe('#2863ab');
  });

  it('distinguishes solid fill from all eleven supporting ramp shades', () => {
    const result = inspectTheme(contract());
    const shades = decisions(result, 'brand-ramp-shade').filter(
      (event) => event.mode === 'light'
    );
    expect(shades.map((event) => event.values.shade)).toEqual(SHADES);
    expect(result.theme.light['--nx-color-primary-background']).toBe(
      'oklch(0.4991 0.1301 255.276)'
    );
    expect(
      shades.find((event) => event.values.shade === '600')?.values.css
    ).not.toBe(result.theme.light['--nx-color-primary-background']);
    expect(
      shades.every(
        (event) =>
          event.values.cuspFraction === 0.95 &&
          event.values.capAtSeedChroma === true
      )
    ).toBe(true);
    const black = inspectTheme(contract('#000000'));
    expect(
      decisions(black, 'brand-ramp-shade').every(
        (event) => event.values.chroma === 0 && event.values.achromatic === true
      )
    ).toBe(true);
  });

  it.each([
    ['#000000', 'dark-endpoint-lift'],
    ['#1b2a4a', 'dark-lift-curve'],
    ['#2863ab', 'dark-honor-seed'],
  ])('records only the executed dark fill branch for %s', (color, branch) => {
    const result = inspectTheme(contract(color));
    expect(
      decisions(result, 'primary-fill-lightness').filter(
        (event) => event.mode === 'dark'
      )
    ).toMatchObject([{ values: { branch } }]);
    expect(
      decisions(result, 'primary-fill-lightness').filter(
        (event) => event.mode === 'dark'
      )
    ).toHaveLength(1);
    expect(decisions(result, 'primary-fill-lightness')[0]?.values.branch).toBe(
      'light-cap'
    );
  });

  it('records endpoint interactions and real shared-label state adjustments', () => {
    const black = inspectTheme(contract('#000000'));
    expect(decisions(black, 'primary-hover-target')).toMatchObject([
      { values: { branch: 'dark-endpoint', shade: '900' } },
      { values: { branch: 'light-endpoint', shade: '100' } },
    ]);
    expect(decisions(black, 'primary-active-target')).toMatchObject([
      { values: { shade: '950' } },
      { values: { shade: '200' } },
    ]);
    const navy = inspectTheme(contract('#1b2a4a'));
    expect(
      decisions(navy, 'primary-legibility-candidate').some(
        (event) => Number(event.values.step) > 0
      )
    ).toBe(true);
    expect(decisions(navy, 'primary-state-candidate').length).toBeGreaterThan(
      0
    );
    expect(
      decisions(navy, 'primary-state-base-fallback').length
    ).toBeGreaterThan(0);
  });

  it('records reused authored palette provenance and immutable nested data', () => {
    const result = inspectTheme(contract());
    const palette = result.trace.find(
      (event) =>
        event.kind === 'palette' && event.provenance.palette === 'orange'
    );
    if (palette?.kind !== 'palette')
      throw new Error('Expected Warning palette evidence');
    expect(palette).toMatchObject({
      stage: 'status',
      token: '--nx-color-warning',
      origin: 'authored-palette-provenance',
    });
    expect(palette.provenance.css).toBe(
      getPaletteShade(
        'orange',
        palette.provenance.shade as (typeof SHADES)[number]
      )
    );
    expect(Reflect.set(palette.provenance, 'css', '#000')).toBe(false);
    expect(Reflect.set(palette.provenance.target, 'l', 0)).toBe(false);
    expect(Object.isFrozen(getPaletteRamp('orange'))).toBe(true);
    expect(
      result.trace
        .filter((event) => event.kind === 'palette')
        .some((event) => event.provenance.grid === 'common')
    ).toBe(true);
    expect(
      result.trace
        .filter((event) => event.kind === 'palette')
        .some(
          (event) =>
            event.provenance.grid === 'hue' &&
            Number(event.provenance.cuspChroma) > 0
        )
    ).toBe(true);
    const other = inspectTheme(contract('#e11d48'));
    const statusEvidence = (inspection: ThemeInspection) =>
      inspection.trace
        .filter((event) => event.stage === 'status')
        .map((event) => ({ ...event, sequence: 0 }));
    expect(statusEvidence(other)).toEqual(statusEvidence(result));
  });

  it('exposes primary, secondary and chart references and every final semantic assignment', () => {
    const result = inspectTheme(contract());
    expect(decisions(result, 'ramp-reference')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token: '--nx-color-primary-disabled',
          mode: 'light',
          values: { shade: '300', value: expect.any(String) },
        }),
        expect.objectContaining({
          token: '--nx-color-secondary-background',
          mode: 'dark',
          values: { shade: '900', value: expect.any(String) },
        }),
      ])
    );
    expect(result.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stage: 'chart',
          token: '--nx-color-chart-categorical-1',
          kind: 'palette',
        }),
      ])
    );
    for (const mode of ['light', 'dark'] as const) {
      const emitted = result.trace.filter(
        (event): event is Extract<ThemeTraceEvent, { kind: 'assignment' }> =>
          event.mode === mode &&
          event.stage === 'output' &&
          event.kind === 'assignment'
      );
      expect(emitted.map((event) => event.token).sort()).toEqual(
        SEMANTIC_TOKEN_REGISTRY.map(
          (token) => `--nx-color-${token.name}`
        ).sort()
      );
      expect(
        Object.fromEntries(emitted.map((event) => [event.token, event.value]))
      ).toEqual(result.theme[mode]);
    }
  });

  it('leaves skipped constraints unmeasured and records requested versus reachable targets', () => {
    const input = contract();
    input.contrast = { light: 100, dark: 100 };
    const result = inspectTheme(input);
    const attempts = result.trace.filter(
      (event) =>
        event.stage === 'constraints' &&
        event.token === '--nx-color-muted-foreground' &&
        event.mode === 'light'
    );
    let measured = 0;
    let hasSkipped = false;
    let inCandidate = false;
    for (const event of attempts) {
      if (
        event.kind === 'decision' &&
        event.operation === 'foreground-bisection'
      ) {
        measured = 0;
        inCandidate = true;
      }
      if (inCandidate && event.kind === 'measurement') measured += 1;
      if (
        inCandidate &&
        event.kind === 'decision' &&
        event.operation === 'foreground-candidate'
      ) {
        expect(measured).toBe(event.values.evaluated);
        hasSkipped ||= Number(event.values.unevaluated) > 0;
        inCandidate = false;
      }
    }
    expect(hasSkipped).toBe(true);
    expect(
      decisions(result, 'reachable-target').some(
        (event) => event.values.capped === true
      )
    ).toBe(true);
    expect(decisions(result, 'foreground-constraint')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          token: '--nx-color-chart-categorical-5',
          values: expect.objectContaining({ target: 93 }),
        }),
      ])
    );
    expect(decisions(result, 'foreground-preserved').length).toBeGreaterThan(0);
    expect(decisions(result, 'family-fill-bisection').length).toBeGreaterThan(
      0
    );
  });

  it('records the white plane, dark anchor clamp, and quiet-text endpoint fallback', () => {
    const input = contract();
    input.dark.background = '#ffffff';
    input.light.foreground = '#999999';
    const result = inspectTheme(input);
    expect(decisions(result, 'surface-anchor')).toMatchObject([
      { values: { branch: 'white-plane', anchorLightness: 1 } },
      { values: { branch: 'dark-clamp', anchorLightness: 0.32 } },
    ]);
    expect(
      decisions(result, 'quiet-text-endpoint-fallback').length
    ).toBeGreaterThan(0);
    expect(decisions(result, 'text-chroma-cap')).toHaveLength(2);
    expect(result.theme.light['--nx-color-container']).toBe('oklch(1 0 0)');
  });

  it('records spacing bisection when the surface helper must narrow its ladder', () => {
    const events: ThemeTraceEvent[] = [];
    const surfaces = deriveSurfaces(
      '#ffffff',
      'stone',
      'dark',
      0.2,
      100,
      new ThemeTrace(events, 'dark', 'surfaces')
    );
    expect(surfaces).toEqual(
      deriveSurfaces('#ffffff', 'stone', 'dark', 0.2, 100)
    );
    expect(
      events.filter(
        (event) =>
          event.kind === 'decision' &&
          event.operation === 'surface-spacing-bisection'
      )
    ).toHaveLength(12);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'decision',
          operation: 'surface-spacing-check',
          values: expect.objectContaining({
            passed: false,
            unevaluated: expect.any(Number),
          }),
        }),
      ])
    );
  });

  it('records quantized alpha composition and luminance separately from executed attempts', () => {
    const result = inspectTheme(contract());
    const diagnostic = result.diagnostics.find(
      (d) => d.mode === 'dark' && d.pair.bg === 'popover-alpha'
    );
    if (!diagnostic) throw new Error('Missing translucent diagnostic');
    const conversions = diagnostic.evidence.filter(
      (event) => event.kind === 'conversion'
    );
    const alpha = conversions.find(
      (event) => event.input === result.theme.dark['--nx-color-popover-alpha']
    );
    if (!alpha?.backdrop) throw new Error('Missing actual backdrop');
    expect(alpha.result).toEqual(
      alpha.quantized.map((channel, index) =>
        Math.round(
          channel * alpha.alpha + alpha.backdrop![index]! * (1 - alpha.alpha)
        )
      )
    );
    expect(diagnostic.lc).toBe(
      contrastForPair(result.theme.dark, diagnostic.pair)
    );
    expect(diagnostic.evidence[diagnostic.evidence.length - 1]).toMatchObject({
      kind: 'measurement',
      lc: diagnostic.lc,
      backgroundY: apca.sRGBtoY(alpha.result),
    });
    expect(result.trace).not.toContain(diagnostic.evidence[0]);
    expect(result.diagnostics).toHaveLength(APCA_PAIRS.length * 2);
    expect(result.diagnostics.every((d) => d.meetsFloor)).toBe(true);
  });

  it('retains the solver failure and its short-circuit endpoint evidence', () => {
    const map = deriveTheme(contract()).dark;
    map['--nx-color-background'] = 'oklch(1 0 0)';
    const ordinary = thrown(() => constrainColors({ ...map }, 'dark', 50));
    const trace: ThemeTraceEvent[] = [];
    const inspected = thrown(() =>
      constrainColors(
        { ...map },
        'dark',
        50,
        new ThemeTrace(trace, 'dark', 'constraints')
      )
    );
    expect(inspected.message).toBe(ordinary.message);
    expect(inspected.message).toBe('contrast: no readable foreground in dark');
    expect(trace[trace.length - 1]).toMatchObject({
      kind: 'decision',
      operation: 'foreground-unreachable',
      values: { reason: 'endpoint-below-floor' },
    });
    expect(
      trace.filter(
        (event) =>
          event.token === '--nx-color-foreground' &&
          event.kind === 'measurement'
      )
    ).toHaveLength(1);
  });
});
