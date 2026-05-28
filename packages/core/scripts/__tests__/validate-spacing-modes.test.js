import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  assertCanonicalModeSet,
  BASELINE_MODE,
  CANONICAL_MODES,
  ConfigError,
  diffKeySets,
  discoverModes,
  formatFindings,
  leafPathsOf,
  validateModes,
} from '../validate-spacing-modes.js';

const dim = (n) => ({ $value: { value: n, unit: 'px' }, $type: 'dimension' });

describe('CANONICAL_MODES', () => {
  it('is the 7-mode set per packages/core/docs/spacing-tokens.md', () => {
    expect([...CANONICAL_MODES].sort()).toEqual([
      'luma',
      'lyra',
      'maia',
      'mira',
      'nova',
      'sera',
      'vega',
    ]);
  });

  it('contains the baseline', () => {
    expect(CANONICAL_MODES).toContain(BASELINE_MODE);
  });
});

describe('leafPathsOf', () => {
  it('returns sorted dotted paths for flat token nodes', () => {
    const data = { spacing: { 0: dim(0), 1: dim(4), 2: dim(8) } };
    expect(leafPathsOf(data)).toEqual(['spacing.0', 'spacing.1', 'spacing.2']);
  });

  it('walks 3+ level deep nesting (e.g. control.padding-x.sm)', () => {
    const data = {
      control: {
        'padding-x': { sm: dim(12), md: dim(16), lg: dim(32) },
        gap: { sm: dim(6) },
      },
    };
    expect(leafPathsOf(data)).toEqual([
      'control.gap.sm',
      'control.padding-x.lg',
      'control.padding-x.md',
      'control.padding-x.sm',
    ]);
  });

  it('skips $-prefixed metadata keys at any level', () => {
    const data = {
      $meta: { capturedAt: '2026-05-27' },
      spacing: {
        $description: 'numeric scale',
        0: dim(0),
        1: dim(4),
      },
    };
    expect(leafPathsOf(data)).toEqual(['spacing.0', 'spacing.1']);
  });

  it('returns a leaf only when BOTH $value and $type are present', () => {
    // A typo `value:` (no $) doesn't make this a leaf — the walker keeps
    // descending and finds nothing token-shaped underneath.
    const typo = {
      spacing: { 0: { value: { value: 0, unit: 'px' }, $type: 'dimension' } },
    };
    expect(leafPathsOf(typo)).toEqual([]);

    // Same for $value without $type
    const noType = {
      spacing: { 0: { $value: { value: 0, unit: 'px' } } },
    };
    expect(leafPathsOf(noType)).toEqual([]);
  });

  it('treats malformed $value as a valid leaf for path purposes', () => {
    // Key-set parity is about which paths exist, not about $value shape.
    // A $value that is a string (not a dimension object) is still a leaf.
    const data = {
      spacing: { 0: { $value: 'not-a-dimension', $type: 'dimension' } },
    };
    expect(leafPathsOf(data)).toEqual(['spacing.0']);
  });

  it('returns an empty list for an empty object', () => {
    expect(leafPathsOf({})).toEqual([]);
  });

  it('handles non-object / null nodes without throwing', () => {
    expect(leafPathsOf(null)).toEqual([]);
    // Null sub-trees are skipped rather than walked.
    expect(leafPathsOf({ spacing: null, control: { md: dim(8) } })).toEqual([
      'control.md',
    ]);
  });
});

describe('diffKeySets', () => {
  it('returns empty arrays for identical inputs', () => {
    const paths = ['a', 'b', 'c'];
    expect(diffKeySets(paths, paths)).toEqual({ missing: [], extra: [] });
  });

  it('returns empty arrays for both empty inputs', () => {
    expect(diffKeySets([], [])).toEqual({ missing: [], extra: [] });
  });

  it('reports a key present in baseline but absent from mode as missing', () => {
    const baseline = ['a', 'b', 'c'];
    const mode = ['a', 'c'];
    expect(diffKeySets(baseline, mode)).toEqual({
      missing: ['b'],
      extra: [],
    });
  });

  it('reports a key present in mode but absent from baseline as extra', () => {
    const baseline = ['a', 'b'];
    const mode = ['a', 'b', 'c'];
    expect(diffKeySets(baseline, mode)).toEqual({
      missing: [],
      extra: ['c'],
    });
  });

  it('reports interleaved missing and extra in the same diff', () => {
    const baseline = ['a', 'b', 'c'];
    const mode = ['a', 'd', 'e'];
    expect(diffKeySets(baseline, mode)).toEqual({
      missing: ['b', 'c'],
      extra: ['d', 'e'],
    });
  });

  it('sorts missing and extra arrays for stable output', () => {
    const baseline = ['zeta', 'alpha', 'mu'];
    const mode = ['theta', 'beta'];
    expect(diffKeySets(baseline, mode)).toEqual({
      missing: ['alpha', 'mu', 'zeta'],
      extra: ['beta', 'theta'],
    });
  });

  it('treats an entirely-missing mode as all-baseline-keys-missing', () => {
    expect(diffKeySets(['a', 'b', 'c'], [])).toEqual({
      missing: ['a', 'b', 'c'],
      extra: [],
    });
  });
});

describe('validateModes', () => {
  it('returns an empty findings list when all modes match the baseline', () => {
    const data = { spacing: { 0: dim(0), 1: dim(4) } };
    const modeMap = new Map([
      ['vega', data],
      ['lyra', data],
      ['maia', data],
    ]);
    const findings = validateModes(modeMap);
    expect(findings).toHaveLength(2);
    for (const f of findings) {
      expect(f.missing).toEqual([]);
      expect(f.extra).toEqual([]);
    }
  });

  it('skips the baseline mode in the output', () => {
    const data = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['vega', data],
      ['lyra', data],
    ]);
    expect(validateModes(modeMap).map((f) => f.mode)).toEqual(['lyra']);
  });

  it('reports per-mode drift for multiple diverging modes', () => {
    const baseline = { spacing: { 0: dim(0), 1: dim(4), 2: dim(8) } };
    const luma = { spacing: { 0: dim(0), 2: dim(8) } }; // missing spacing.1
    const lyra = { spacing: { 0: dim(0), 1: dim(4), 2: dim(8), 3: dim(12) } }; // extra spacing.3
    const modeMap = new Map([
      ['vega', baseline],
      ['luma', luma],
      ['lyra', lyra],
    ]);
    const findings = validateModes(modeMap);
    expect(findings).toEqual([
      { mode: 'luma', missing: ['spacing.1'], extra: [] },
      { mode: 'lyra', missing: [], extra: ['spacing.3'] },
    ]);
  });

  it('sorts findings by mode name for stable output', () => {
    const data = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['vega', data],
      ['sera', data],
      ['nova', data],
      ['luma', data],
    ]);
    expect(validateModes(modeMap).map((f) => f.mode)).toEqual([
      'luma',
      'nova',
      'sera',
    ]);
  });

  it('reports every non-baseline mode as drifting when the baseline itself has a stray key', () => {
    // If vega gets a new key the other modes haven't picked up yet, every
    // non-baseline mode reports it as missing — the validator surfaces the
    // drift symmetrically rather than special-casing the baseline.
    const vega = { spacing: { 0: dim(0), 99: dim(396) } };
    const clean = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['vega', vega],
      ['lyra', clean],
      ['maia', clean],
    ]);
    const findings = validateModes(modeMap);
    expect(findings).toEqual([
      { mode: 'lyra', missing: ['spacing.99'], extra: [] },
      { mode: 'maia', missing: ['spacing.99'], extra: [] },
    ]);
  });

  it('throws when the baseline mode is absent from the input map', () => {
    const modeMap = new Map([['lyra', { spacing: { 0: dim(0) } }]]);
    expect(() => validateModes(modeMap)).toThrow(
      /baseline mode "vega" not found/
    );
  });

  it('honours a custom baseline argument', () => {
    const data = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['lyra', data],
      ['maia', data],
    ]);
    expect(validateModes(modeMap, 'lyra').map((f) => f.mode)).toEqual(['maia']);
  });
});

describe('formatFindings', () => {
  it('renders a ✓ line for a clean mode', () => {
    const out = formatFindings([{ mode: 'lyra', missing: [], extra: [] }]);
    expect(out).toContain('✓ spacing-lyra.json (matches baseline)');
  });

  it('renders a ✗ line with missing-path details for a mode with missing keys', () => {
    const out = formatFindings([
      { mode: 'luma', missing: ['spacing.4'], extra: [] },
    ]);
    expect(out).toContain('✗ spacing-luma.json (1 missing, 0 extra)');
    expect(out).toContain('missing: spacing.4');
    expect(out).toContain('in spacing-vega.json but not in spacing-luma.json');
  });

  it('renders a ✗ line with extra-path details for a mode with extra keys', () => {
    const out = formatFindings([
      { mode: 'lyra', missing: [], extra: ['spacing.99'] },
    ]);
    expect(out).toContain('✗ spacing-lyra.json (0 missing, 1 extra)');
    expect(out).toContain('extra:');
    expect(out).toContain('spacing.99');
  });

  it('renders both kinds in a single report and includes the baseline name in the header', () => {
    const out = formatFindings([
      { mode: 'luma', missing: ['spacing.1'], extra: [] },
      { mode: 'lyra', missing: [], extra: ['spacing.99'] },
      { mode: 'maia', missing: [], extra: [] },
    ]);
    expect(out).toContain('baseline: vega');
    expect(out).toContain('spacing-luma.json (1 missing, 0 extra)');
    expect(out).toContain('spacing-lyra.json (0 missing, 1 extra)');
    expect(out).toContain('spacing-maia.json (matches baseline)');
  });

  it('uses the custom baseline name when provided', () => {
    const out = formatFindings(
      [{ mode: 'maia', missing: ['spacing.1'], extra: [] }],
      'lyra'
    );
    expect(out).toContain('baseline: lyra');
    expect(out).toContain('in spacing-lyra.json but not in spacing-maia.json');
  });
});

describe('discoverModes', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-modes-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const touch = (name) => fs.writeFileSync(path.join(tmpDir, name), '{}');

  it('returns the matching mode names sorted alphabetically', () => {
    touch('spacing-vega.json');
    touch('spacing-luma.json');
    touch('spacing-maia.json');
    expect(discoverModes(tmpDir)).toEqual(['luma', 'maia', 'vega']);
  });

  it('ignores files that do not match the spacing-<mode>.json pattern', () => {
    touch('spacing-vega.json');
    touch('base-slate-light.json');
    touch('spacing-vega.json.bak');
    touch('Spacing-vega.json');
    touch('spacing-Vega.json');
    touch('spacing-vega-extra.json');
    touch('spacing-.json');
    touch('README.md');
    expect(discoverModes(tmpDir)).toEqual(['vega']);
  });

  it('returns an empty list when the directory has no matching files', () => {
    touch('README.md');
    expect(discoverModes(tmpDir)).toEqual([]);
  });
});

describe('assertCanonicalModeSet', () => {
  it('does not throw when the discovered set equals the canonical set', () => {
    expect(() => assertCanonicalModeSet([...CANONICAL_MODES])).not.toThrow();
  });

  it('does not depend on input order', () => {
    expect(() =>
      assertCanonicalModeSet([...CANONICAL_MODES].reverse())
    ).not.toThrow();
  });

  it('throws a ConfigError naming unexpected (alien) mode files', () => {
    const discovered = [...CANONICAL_MODES, 'foo'];
    expect(() => assertCanonicalModeSet(discovered)).toThrow(ConfigError);
    expect(() => assertCanonicalModeSet(discovered)).toThrow(
      /unexpected mode file\(s\): foo/
    );
  });

  it('throws a ConfigError naming missing canonical modes', () => {
    const discovered = CANONICAL_MODES.filter((m) => m !== 'lyra');
    expect(() => assertCanonicalModeSet(discovered)).toThrow(ConfigError);
    expect(() => assertCanonicalModeSet(discovered)).toThrow(
      /missing canonical mode\(s\): lyra/
    );
  });

  it('reports both unexpected and missing modes in one message', () => {
    const discovered = CANONICAL_MODES.filter((m) => m !== 'lyra').concat([
      'foo',
      'bar',
    ]);
    try {
      assertCanonicalModeSet(discovered);
      throw new Error('expected ConfigError');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      expect(err.message).toMatch(/unexpected mode file\(s\): bar, foo/);
      expect(err.message).toMatch(/missing canonical mode\(s\): lyra/);
    }
  });
});
