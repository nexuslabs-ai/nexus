import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';

import {
  collectBreakpointsTokens,
  collectSpacingTokens,
  collectZIndexTokens,
  DEFAULT_CONFIG,
  discoverSemantics,
  extractRefPath,
  extractTokens,
  formatTokenValue,
  generateSpacingModesCSS,
  generateSpacingRoleUtilitiesCSS,
  isReference,
  partitionThemedModes,
  pathToCssVar,
  resolveReference,
  resolveValue,
  splitSpacingTokens,
} from '../utils.js';

describe('utils', () => {
  describe('formatTokenValue', () => {
    it('formats dimension objects to CSS value', () => {
      const value = { value: 16, unit: 'rem' };
      expect(formatTokenValue(value, 'dimension')).toBe('16rem');
    });

    it('uses px as default unit for dimensions without unit', () => {
      const value = { value: 16 };
      expect(formatTokenValue(value, 'dimension')).toBe('16px');
    });

    it('handles zero dimension values', () => {
      const value = { value: 0, unit: 'rem' };
      expect(formatTokenValue(value, 'dimension')).toBe('0rem');
    });

    it('strips Figma float-32 export artifacts from dimension values', () => {
      expect(
        formatTokenValue({ value: -0.800000011920929, unit: 'px' }, 'dimension')
      ).toBe('-0.8px');
      expect(
        formatTokenValue(
          { value: 0.30000001192092896, unit: 'rem' },
          'dimension'
        )
      ).toBe('0.3rem');
    });

    it('converts hex colors to oklch (mechanical when no shade path)', () => {
      expect(formatTokenValue('#3b82f6', 'color')).toBe(
        'oklch(0.6231 0.188 259.815)'
      );
    });

    it('preserves alpha when converting 8-digit hex colors', () => {
      expect(formatTokenValue('#000000cc', 'color')).toBe('oklch(0 0 0 / 0.8)');
    });

    it('pins lightness for palette shade tokens', () => {
      expect(formatTokenValue('#3b82f6', 'color', ['blue', '500'])).toBe(
        'oklch(0.553 0.188 259.815)'
      );
    });

    it('routes single-element paths to mechanical (white/black at root)', () => {
      // `['white']` is length 1 — last segment isn't a shade key, falls through
      // to mechanical conversion.
      expect(formatTokenValue('#ffffff', 'color', ['white'])).toBe(
        'oklch(1 0 0)'
      );
    });

    it('pins deeper nested shade-key paths (length 3+)', () => {
      // Future-proofs against nested palettes like `chart.series.500` —
      // routing keys on path-suffix semantics, not length.
      expect(
        formatTokenValue('#3b82f6', 'color', ['some', 'group', '500'])
      ).toBe('oklch(0.553 0.188 259.815)');
    });

    it('returns non-color string values as-is', () => {
      expect(formatTokenValue('Inter, sans-serif', 'fontFamily')).toBe(
        'Inter, sans-serif'
      );
    });

    it('converts numbers to strings', () => {
      expect(formatTokenValue(400, 'fontWeight')).toBe('400');
      expect(formatTokenValue(1.5, 'number')).toBe('1.5');
    });

    it('handles null by JSON stringifying', () => {
      expect(formatTokenValue(null, 'unknown')).toBe('null');
    });

    it('throws on undefined input', () => {
      expect(() => formatTokenValue(undefined, 'unknown')).toThrow(
        /value is undefined/
      );
    });
  });

  describe('isReference', () => {
    it('returns true for valid DTCG references', () => {
      expect(isReference('{blue.500}')).toBe(true);
      expect(isReference('{size.6xl}')).toBe(true);
      expect(isReference('{family.font-sans}')).toBe(true);
      expect(isReference('{2xs.layer-1.x}')).toBe(true);
    });

    it('returns false for non-references', () => {
      expect(isReference('#3b82f6')).toBe(false);
      expect(isReference('16rem')).toBe(false);
      expect(isReference('blue.500')).toBe(false);
      expect(isReference('{incomplete')).toBe(false);
      expect(isReference('incomplete}')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isReference(123)).toBe(false);
      expect(isReference(null)).toBe(false);
      expect(isReference(undefined)).toBe(false);
      expect(isReference({ value: 16 })).toBe(false);
    });
  });

  describe('extractRefPath', () => {
    it('extracts path from reference string', () => {
      expect(extractRefPath('{blue.500}')).toBe('blue.500');
      expect(extractRefPath('{size.6xl}')).toBe('size.6xl');
      expect(extractRefPath('{family.font-sans}')).toBe('family.font-sans');
    });

    it('handles nested paths', () => {
      expect(extractRefPath('{2xs.layer-1.x}')).toBe('2xs.layer-1.x');
      expect(extractRefPath('{focus.default.color}')).toBe(
        'focus.default.color'
      );
    });
  });

  describe('pathToCssVar', () => {
    it('joins path array with hyphens', () => {
      expect(pathToCssVar(['blue', '500'])).toBe('blue-500');
      expect(pathToCssVar(['size', '6xl'])).toBe('size-6xl');
    });

    it('adds prefix when provided', () => {
      expect(pathToCssVar(['background'], 'color')).toBe('color-background');
      expect(pathToCssVar(['primary', 'background-hover'], 'color')).toBe(
        'color-primary-background-hover'
      );
    });

    it('handles single-element paths', () => {
      expect(pathToCssVar(['background'])).toBe('background');
    });

    it('handles deeply nested paths', () => {
      expect(pathToCssVar(['focus', 'default', 'color'])).toBe(
        'focus-default-color'
      );
    });
  });

  describe('resolveReference', () => {
    const primitiveMap = new Map([
      ['blue.500', { cssName: 'blue-500', value: '#3b82f6' }],
      ['size.6xl', { cssName: 'size-6xl', value: '60rem' }],
      ['neutral.100', { cssName: 'neutral-100', value: '#f5f5f5' }],
    ]);

    it('resolves reference to CSS var()', () => {
      expect(resolveReference('{blue.500}', primitiveMap)).toBe(
        'var(--blue-500)'
      );
      expect(resolveReference('{size.6xl}', primitiveMap)).toBe(
        'var(--size-6xl)'
      );
    });

    it('returns original value if not a reference', () => {
      expect(resolveReference('#3b82f6', primitiveMap)).toBe('#3b82f6');
      expect(resolveReference('16rem', primitiveMap)).toBe('16rem');
    });

    it('returns original reference if not found in map', () => {
      expect(resolveReference('{unknown.token}', primitiveMap)).toBe(
        '{unknown.token}'
      );
    });
  });

  describe('resolveValue', () => {
    const primitiveMap = new Map([
      ['blue.500', { cssName: 'blue-500', value: '#3b82f6' }],
      ['size.base', { cssName: 'size-base', value: '16rem' }],
    ]);

    it('resolves references', () => {
      expect(resolveValue('{blue.500}', primitiveMap, 'color')).toBe(
        'var(--blue-500)'
      );
    });

    it('formats dimension objects', () => {
      const dimension = { value: 16, unit: 'rem' };
      expect(resolveValue(dimension, primitiveMap, 'dimension')).toBe('16rem');
    });

    it('detects dimension objects even without type hint', () => {
      const dimension = { value: 8, unit: 'px' };
      expect(resolveValue(dimension, primitiveMap, 'unknown')).toBe('8px');
    });

    it('converts non-reference hex strings through the oklch formatter', () => {
      expect(resolveValue('#ff0000', primitiveMap, 'color')).toBe(
        'oklch(0.628 0.2577 29.234)'
      );
    });
  });

  describe('extractTokens', () => {
    it('extracts flat tokens from DTCG format', () => {
      const input = {
        blue: {
          500: {
            $value: '#3b82f6',
            $type: 'color',
          },
        },
      };

      const result = extractTokens(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: ['blue', '500'],
        value: '#3b82f6',
        type: 'color',
        description: undefined,
      });
    });

    it('extracts nested tokens', () => {
      const input = {
        primary: {
          background: {
            $value: '{blue.500}',
            $type: 'color',
            $description: 'Primary background',
          },
          hover: {
            $value: '{blue.600}',
            $type: 'color',
          },
        },
      };

      const result = extractTokens(input);

      expect(result).toHaveLength(2);
      expect(result[0].path).toEqual(['primary', 'background']);
      expect(result[0].description).toBe('Primary background');
      expect(result[1].path).toEqual(['primary', 'hover']);
    });

    it('skips metadata keys starting with $', () => {
      const input = {
        $description: 'Color tokens',
        blue: {
          $type: 'color',
          500: {
            $value: '#3b82f6',
            $type: 'color',
          },
        },
      };

      const result = extractTokens(input);

      expect(result).toHaveLength(1);
      expect(result[0].path).toEqual(['blue', '500']);
    });

    it('handles dimension token format', () => {
      const input = {
        size: {
          base: {
            $value: { value: 16, unit: 'rem' },
            $type: 'dimension',
          },
        },
      };

      const result = extractTokens(input);

      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual({ value: 16, unit: 'rem' });
      expect(result[0].type).toBe('dimension');
    });

    it('handles typography composite tokens', () => {
      const input = {
        display: {
          large: {
            $type: 'typography',
            $value: {
              fontFamily: '{family.font-sans}',
              fontSize: '{size.6xl}',
              fontWeight: '{weight.light}',
            },
          },
        },
      };

      const result = extractTokens(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('typography');
      expect(result[0].value.fontFamily).toBe('{family.font-sans}');
    });

    it('returns empty array for empty input', () => {
      expect(extractTokens({})).toEqual([]);
    });
  });

  describe('partitionThemedModes', () => {
    it('pairs {base}-light / {base}-dark into a themed base', () => {
      const result = partitionThemedModes(['vega-light', 'vega-dark']);
      expect(result).toEqual({
        themed: { vega: { light: 'vega-light', dark: 'vega-dark' } },
        plain: [],
      });
    });

    it('leaves un-paired modes in plain', () => {
      const result = partitionThemedModes(['lyra', 'maia', 'nova']);
      expect(result).toEqual({
        themed: {},
        plain: ['lyra', 'maia', 'nova'],
      });
    });

    it('handles mixed themed and plain modes', () => {
      const result = partitionThemedModes([
        'vega-light',
        'vega-dark',
        'standalone',
      ]);
      expect(result).toEqual({
        themed: { vega: { light: 'vega-light', dark: 'vega-dark' } },
        plain: ['standalone'],
      });
    });

    it('treats asymmetric singletons (only -light) as plain', () => {
      const result = partitionThemedModes(['vega-light']);
      expect(result).toEqual({
        themed: {},
        plain: ['vega-light'],
      });
    });

    it('treats asymmetric singletons (only -dark) as plain', () => {
      const result = partitionThemedModes(['vega-dark']);
      expect(result).toEqual({
        themed: {},
        plain: ['vega-dark'],
      });
    });

    it('pairs multiple themed bases simultaneously', () => {
      const result = partitionThemedModes([
        'vega-light',
        'vega-dark',
        'lyra-light',
        'lyra-dark',
      ]);
      expect(result.themed).toEqual({
        vega: { light: 'vega-light', dark: 'vega-dark' },
        lyra: { light: 'lyra-light', dark: 'lyra-dark' },
      });
      expect(result.plain).toEqual([]);
    });

    it('returns empty shape for empty input', () => {
      expect(partitionThemedModes([])).toEqual({ themed: {}, plain: [] });
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('has all required configuration keys', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('base');
      expect(DEFAULT_CONFIG).toHaveProperty('brand');
      expect(DEFAULT_CONFIG).toHaveProperty('typography');
      expect(DEFAULT_CONFIG).toHaveProperty('shadow');
      expect(DEFAULT_CONFIG).toHaveProperty('radius');
      expect(DEFAULT_CONFIG).toHaveProperty('borderwidth');
    });

    // `size` was removed in #119 — spacing now reads per-mode semantic files
    // (`spacing-{mode}.json`), not a `--nx-size-*` primitive layer.
    it('does not have the deprecated size key', () => {
      expect(DEFAULT_CONFIG).not.toHaveProperty('size');
    });

    it('has expected default values', () => {
      expect(DEFAULT_CONFIG.base).toBe('stone');
      expect(DEFAULT_CONFIG.brand).toBe('neutral');
      expect(DEFAULT_CONFIG.typography).toBe('vega');
      expect(DEFAULT_CONFIG.shadow).toBe('vega');
      expect(DEFAULT_CONFIG.radius).toBe('sharp');
      expect(DEFAULT_CONFIG.borderwidth).toBe('vega');
    });
  });

  describe('collectZIndexTokens', () => {
    function withZIndexFixture(tokenData, fn) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-zindex-test-'));
      try {
        fs.writeFileSync(
          path.join(dir, 'z-index.json'),
          JSON.stringify(tokenData)
        );
        return fn(dir);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }

    it('collects unitless number tokens as direct values, skipping metadata', () => {
      withZIndexFixture(
        {
          $description: 'ignored metadata',
          'z-index-modal': { $value: 50, $type: 'number' },
        },
        (dir) => {
          expect(collectZIndexTokens(dir)).toEqual([
            { cssName: 'z-index-modal', value: '50' },
          ]);
        }
      );
    });

    it('throws (naming the token) when a token $type is not number', () => {
      withZIndexFixture(
        { 'z-index-modal': { $value: '50px', $type: 'dimension' } },
        (dir) => {
          expect(() => collectZIndexTokens(dir)).toThrow(/z-index-modal/);
        }
      );
    });

    it('throws (naming the token) when a number token is missing its $value', () => {
      withZIndexFixture({ 'z-index-modal': { $type: 'number' } }, (dir) => {
        expect(() => collectZIndexTokens(dir)).toThrow(/z-index-modal/);
      });
    });
  });

  describe('collectBreakpointsTokens', () => {
    function withBreakpointsFixture(tokenData, fn) {
      const dir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'nexus-breakpoint-test-')
      );
      try {
        fs.writeFileSync(
          path.join(dir, 'breakpoints.json'),
          JSON.stringify(tokenData)
        );
        return fn(dir);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }

    it('collects rem dimensions as direct values, skipping metadata', () => {
      withBreakpointsFixture(
        {
          $description: 'ignored metadata',
          'breakpoint-lg': {
            $value: { value: 64, unit: 'rem' },
            $type: 'dimension',
          },
        },
        (dir) => {
          expect(collectBreakpointsTokens(dir)).toEqual([
            { cssName: 'breakpoint-lg', value: '64rem' },
          ]);
        }
      );
    });

    it('throws (naming the token) when a token $type is not dimension', () => {
      withBreakpointsFixture(
        { 'breakpoint-lg': { $value: 64, $type: 'number' } },
        (dir) => {
          expect(() => collectBreakpointsTokens(dir)).toThrow(/breakpoint-lg/);
        }
      );
    });

    it('throws (naming the token) when the unit is not rem', () => {
      withBreakpointsFixture(
        {
          'breakpoint-lg': {
            $value: { value: 1024, unit: 'px' },
            $type: 'dimension',
          },
        },
        (dir) => {
          expect(() => collectBreakpointsTokens(dir)).toThrow(/breakpoint-lg/);
        }
      );
    });

    it('throws (naming the token) when a dimension token is missing its $value', () => {
      withBreakpointsFixture(
        { 'breakpoint-lg': { $type: 'dimension' } },
        (dir) => {
          expect(() => collectBreakpointsTokens(dir)).toThrow(/breakpoint-lg/);
        }
      );
    });
  });

  // Shared fixture helper for spacing tests — writes per-mode JSON files into
  // a temp dir and runs the body. Source data mirrors real spacing-vega.json
  // structure (numeric `spacing.N` + role `control.h.md`, `container.p`,
  // `layout.section-gap` subtrees) so the test exercises the same shapes the
  // build sees.
  function withSpacingModesFixture(filesByMode, fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-spacing-test-'));
    try {
      for (const [mode, data] of Object.entries(filesByMode)) {
        fs.writeFileSync(
          path.join(dir, `spacing-${mode}.json`),
          JSON.stringify(data)
        );
      }
      return fn(dir);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  describe('discoverSemantics', () => {
    it('routes spacing-*.json into the spacingModes bucket (not standalone)', () => {
      withSpacingModesFixture(
        {
          vega: { spacing: {} },
          lyra: { spacing: {} },
        },
        (dir) => {
          // Also write a true standalone to confirm the partition.
          fs.writeFileSync(
            path.join(dir, 'focus.json'),
            JSON.stringify({
              offset: { $value: { value: 2, unit: 'px' }, $type: 'dimension' },
            })
          );

          const result = discoverSemantics(dir);

          expect(result.spacingModes).toEqual({
            vega: 'spacing-vega.json',
            lyra: 'spacing-lyra.json',
          });
          expect(result.standalone).toEqual(['focus.json']);
          // Confirm spacing files did NOT leak into standalone — without
          // this gate they'd get double-emitted by the generic dimension scan.
          expect(result.standalone).not.toContain('spacing-vega.json');
          expect(result.standalone).not.toContain('spacing-lyra.json');
        }
      );
    });

    it('returns empty spacingModes when no spacing-*.json files are present', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-disc-test-'));
      try {
        fs.writeFileSync(path.join(dir, 'focus.json'), JSON.stringify({}));
        const result = discoverSemantics(dir);
        expect(result.spacingModes).toEqual({});
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('collectSpacingTokens', () => {
    it('returns per-mode tokens with unprefixed cssNames (prefix is added at emit time)', () => {
      withSpacingModesFixture(
        {
          vega: {
            spacing: {
              0: { $value: { value: 0, unit: 'px' }, $type: 'dimension' },
              4: { $value: { value: 16, unit: 'px' }, $type: 'dimension' },
            },
            control: {
              h: {
                md: { $value: { value: 32, unit: 'px' }, $type: 'dimension' },
              },
            },
          },
          lyra: {
            spacing: {
              0: { $value: { value: 0, unit: 'px' }, $type: 'dimension' },
              4: { $value: { value: 12, unit: 'px' }, $type: 'dimension' },
            },
            control: {
              h: {
                md: { $value: { value: 28, unit: 'px' }, $type: 'dimension' },
              },
            },
          },
        },
        (dir) => {
          const result = collectSpacingTokens(dir);
          expect(Object.keys(result).sort()).toEqual(['lyra', 'vega']);
          expect(result.vega).toEqual([
            { cssName: 'spacing-0', path: ['spacing', '0'], value: '0px' },
            { cssName: 'spacing-4', path: ['spacing', '4'], value: '16px' },
            {
              cssName: 'control-h-md',
              path: ['control', 'h', 'md'],
              value: '32px',
            },
          ]);
          // Per-mode variance is the whole point — the same cssName resolves
          // to different values across modes.
          expect(result.lyra).toEqual([
            { cssName: 'spacing-0', path: ['spacing', '0'], value: '0px' },
            { cssName: 'spacing-4', path: ['spacing', '4'], value: '12px' },
            {
              cssName: 'control-h-md',
              path: ['control', 'h', 'md'],
              value: '28px',
            },
          ]);
        }
      );
    });

    it('throws when two paths flatten to the same cssName within a mode', () => {
      // Two paths flattening to the same name would silently overwrite the
      // first — defensive guard catches a real future risk once independent
      // contributors add role tokens.
      withSpacingModesFixture(
        {
          vega: {
            control: {
              h: {
                md: { $value: { value: 32, unit: 'px' }, $type: 'dimension' },
              },
              'h-md': {
                $value: { value: 999, unit: 'px' },
                $type: 'dimension',
              },
            },
          },
        },
        (dir) => {
          expect(() => collectSpacingTokens(dir)).toThrow(/control-h-md/);
        }
      );
    });

    it('throws when no spacing-*.json files exist', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-empty-test-'));
      try {
        expect(() => collectSpacingTokens(dir)).toThrow(
          /no semantic\/spacing-\{mode\}\.json files found/
        );
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('splitSpacingTokens', () => {
    it('partitions tokens by path[0] === "spacing"', () => {
      const tokens = [
        { cssName: 'spacing-0', path: ['spacing', '0'], value: '0px' },
        { cssName: 'spacing-4', path: ['spacing', '4'], value: '16px' },
        {
          cssName: 'control-h-md',
          path: ['control', 'h', 'md'],
          value: '32px',
        },
        { cssName: 'container-p', path: ['container', 'p'], value: '24px' },
        {
          cssName: 'layout-section-gap',
          path: ['layout', 'section-gap'],
          value: '32px',
        },
      ];
      const { numeric, role } = splitSpacingTokens(tokens);
      expect(numeric).toEqual([
        { cssName: 'spacing-0', path: ['spacing', '0'], value: '0px' },
        { cssName: 'spacing-4', path: ['spacing', '4'], value: '16px' },
      ]);
      expect(role).toEqual([
        {
          cssName: 'control-h-md',
          path: ['control', 'h', 'md'],
          value: '32px',
        },
        { cssName: 'container-p', path: ['container', 'p'], value: '24px' },
        {
          cssName: 'layout-section-gap',
          path: ['layout', 'section-gap'],
          value: '32px',
        },
      ]);
    });
  });

  describe('generateSpacingModesCSS', () => {
    const modes = {
      vega: [
        { cssName: 'spacing-4', value: '16px' },
        { cssName: 'control-h-md', value: '32px' },
      ],
      lyra: [
        { cssName: 'spacing-4', value: '12px' },
        { cssName: 'control-h-md', value: '28px' },
      ],
      luma: [
        { cssName: 'spacing-4', value: '16px' },
        { cssName: 'control-h-md', value: '32px' },
      ],
    };

    it('emits Vega block under :root and [data-style="vega"] selectors', () => {
      const css = generateSpacingModesCSS(modes);
      expect(css).toMatch(/:root,\s*\n\s*\[data-style=['"]vega['"]\] \{/);
    });

    it('emits non-default modes alphabetically (luma before lyra)', () => {
      const css = generateSpacingModesCSS(modes);
      // generateSpacingModesCSS returns a raw string with double-quoted
      // attribute selectors; prettier rewrites to single quotes only after
      // formatDistCssFiles runs. Match the raw form here.
      const lumaIdx = css.indexOf('[data-style="luma"]');
      const lyraIdx = css.indexOf('[data-style="lyra"]');
      expect(lumaIdx).toBeGreaterThan(-1);
      expect(lyraIdx).toBeGreaterThan(-1);
      expect(lumaIdx).toBeLessThan(lyraIdx);
    });

    it('emits --nx- prefixed declarations (per-mode blocks live outside @theme)', () => {
      const css = generateSpacingModesCSS(modes);
      expect(css).toMatch(/--nx-spacing-4: 16px;/);
      expect(css).toMatch(/--nx-control-h-md: 32px;/);
      // No bare (unprefixed) declarations — those would not override the
      // var(--nx-*) references that Tailwind v4 emits in utility bodies.
      expect(css).not.toMatch(/^\s+--spacing-4:/m);
      expect(css).not.toMatch(/^\s+--control-h-md:/m);
    });

    it('throws when defaultMode is not present in modesByName', () => {
      expect(() =>
        generateSpacingModesCSS(modes, { defaultMode: 'missing' })
      ).toThrow(/defaultMode "missing"/);
    });
  });

  describe('generateSpacingRoleUtilitiesCSS', () => {
    it('emits @utility declarations data-driven from canonical role tokens', () => {
      const canonical = [
        {
          cssName: 'control-h-md',
          path: ['control', 'h', 'md'],
          value: '32px',
        },
        {
          cssName: 'control-padding-x-sm',
          path: ['control', 'padding-x', 'sm'],
          value: '12px',
        },
        {
          cssName: 'control-padding-y-lg',
          path: ['control', 'padding-y', 'lg'],
          value: '12px',
        },
        {
          cssName: 'control-gap',
          path: ['control', 'gap'],
          value: '8px',
        },
        {
          cssName: 'container-p',
          path: ['container', 'p'],
          value: '24px',
        },
        {
          cssName: 'container-gap',
          path: ['container', 'gap'],
          value: '16px',
        },
        {
          cssName: 'layout-section-gap',
          path: ['layout', 'section-gap'],
          value: '32px',
        },
        {
          cssName: 'layout-stack-gap',
          path: ['layout', 'stack-gap'],
          value: '8px',
        },
      ];
      const { css, count } = generateSpacingRoleUtilitiesCSS(canonical);

      expect(count).toBe(8);
      // Each utility name follows the role-and-property convention; the var
      // reference is the prefixed form, so it matches what per-mode blocks
      // declare.
      expect(css).toMatch(
        /@utility h-control-md \{[^}]*height: var\(--nx-control-h-md\);/
      );
      expect(css).toMatch(
        /@utility px-control-sm \{[^}]*padding-left: var\(--nx-control-padding-x-sm\);[^}]*padding-right: var\(--nx-control-padding-x-sm\);/
      );
      expect(css).toMatch(
        /@utility py-control-lg \{[^}]*padding-top: var\(--nx-control-padding-y-lg\);[^}]*padding-bottom: var\(--nx-control-padding-y-lg\);/
      );
      expect(css).toMatch(
        /@utility gap-control \{[^}]*gap: var\(--nx-control-gap\);/
      );
      expect(css).toMatch(
        /@utility p-container \{[^}]*padding: var\(--nx-container-p\);/
      );
      expect(css).toMatch(
        /@utility gap-container \{[^}]*gap: var\(--nx-container-gap\);/
      );
      expect(css).toMatch(
        /@utility gap-layout-section \{[^}]*gap: var\(--nx-layout-section-gap\);/
      );
      expect(css).toMatch(
        /@utility gap-layout-stack \{[^}]*gap: var\(--nx-layout-stack-gap\);/
      );
    });

    it('emits exactly one @utility per role token (1:1)', () => {
      const canonical = [
        {
          cssName: 'control-h-md',
          path: ['control', 'h', 'md'],
          value: '32px',
        },
        { cssName: 'container-p', path: ['container', 'p'], value: '24px' },
      ];
      const { css, count } = generateSpacingRoleUtilitiesCSS(canonical);
      expect(count).toBe(2);
      expect((css.match(/@utility /g) || []).length).toBe(2);
    });
  });
});
