import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CONFIG,
  extractRefPath,
  extractTokens,
  formatTokenValue,
  isReference,
  partitionThemedModes,
  pathToCssVar,
  resolveReference,
  resolveValue,
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
      expect(pathToCssVar(['primary', 'hover'], 'color')).toBe(
        'color-primary-hover'
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
      expect(DEFAULT_CONFIG).toHaveProperty('size');
      expect(DEFAULT_CONFIG).toHaveProperty('typography');
      expect(DEFAULT_CONFIG).toHaveProperty('shadow');
      expect(DEFAULT_CONFIG).toHaveProperty('radius');
      expect(DEFAULT_CONFIG).toHaveProperty('borderwidth');
    });

    it('has expected default values', () => {
      expect(DEFAULT_CONFIG.base).toBe('stone');
      expect(DEFAULT_CONFIG.brand).toBe('neutral');
      expect(DEFAULT_CONFIG.size).toBe('vega');
      expect(DEFAULT_CONFIG.typography).toBe('vega');
      expect(DEFAULT_CONFIG.shadow).toBe('vega');
      expect(DEFAULT_CONFIG.radius).toBe('sharp');
      expect(DEFAULT_CONFIG.borderwidth).toBe('vega');
    });
  });
});
