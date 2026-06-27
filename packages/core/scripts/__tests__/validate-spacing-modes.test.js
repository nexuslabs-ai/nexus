import { describe, expect, it } from 'vitest';

import {
  assertCanonicalModeSet,
  BASELINE_MODE,
  CANONICAL_BORDERWIDTH_MODES,
  CANONICAL_MODES,
  CANONICAL_RADIUS_MODES,
  CANONICAL_SHADOW_MODES,
  ConfigError,
  diffKeySets,
  discoverFamilyModes,
  formatFamilyFindings,
  leafPathsOf,
  modeFamilyConfigs,
  validateModeFamilies,
  validateModes,
} from '../validate-spacing-modes.js';

const dim = (n) => ({ $value: { value: n, unit: 'px' }, $type: 'dimension' });

describe('CANONICAL_MODES', () => {
  it('is the 7-mode set per the canonical mode list', () => {
    expect([...CANONICAL_MODES].sort()).toEqual([
      'comfortable',
      'compact',
      'default',
      'regular',
      'relaxed',
      'spacious',
      'tight',
    ]);
  });

  it('contains the baseline', () => {
    expect(CANONICAL_MODES).toContain(BASELINE_MODE);
  });
});

describe('mode family configs', () => {
  it('declares the canonical runtime mode families and baselines', () => {
    const configs = modeFamilyConfigs();
    expect(
      configs.map((config) => [
        config.name,
        config.baseline,
        config.expectedModes,
      ])
    ).toEqual([
      ['spacing', 'regular', CANONICAL_MODES],
      ['radius', 'sharp', CANONICAL_RADIUS_MODES],
      ['borderwidth', 'vega', CANONICAL_BORDERWIDTH_MODES],
      ['shadow-light', 'quiet', CANONICAL_SHADOW_MODES],
      ['shadow-dark', 'quiet', CANONICAL_SHADOW_MODES],
    ]);
  });

  it('discovers the checked-in modes for every configured family', () => {
    for (const config of modeFamilyConfigs()) {
      expect(discoverFamilyModes(config), config.name).toEqual(
        [...config.expectedModes].sort()
      );
    }
  });

  it('validates checked-in spacing/radius/borderwidth/shadow key parity', () => {
    const results = validateModeFamilies();

    expect(results.map((result) => result.config.name)).toEqual([
      'spacing',
      'radius',
      'borderwidth',
      'shadow-light',
      'shadow-dark',
    ]);
    for (const { config, findings } of results) {
      const drift = findings.filter(
        (finding) => finding.missing.length > 0 || finding.extra.length > 0
      );
      expect(drift, `${config.name} should match its baseline`).toEqual([]);
    }
  });

  it.each(['radius', 'borderwidth', 'shadow-light', 'shadow-dark'])(
    'reports synthetic key drift for %s',
    (familyName) => {
      const config = modeFamilyConfigs().find(
        (candidate) => candidate.name === familyName
      );
      const [comparisonMode] = config.expectedModes.filter(
        (mode) => mode !== config.baseline
      );
      const baseline = { token: { a: dim(1), b: dim(2) } };
      const drifted = { token: { a: dim(1) } };
      const findings = validateModes(
        new Map([
          [config.baseline, baseline],
          [comparisonMode, drifted],
        ]),
        config.baseline
      );

      expect(findings).toEqual([
        { mode: comparisonMode, missing: ['token.b'], extra: [] },
      ]);
      expect(formatFamilyFindings({ config, findings })).toContain(
        config.fileName(comparisonMode)
      );
    }
  );
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
      ['regular', data],
      ['tight', data],
      ['relaxed', data],
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
      ['regular', data],
      ['tight', data],
    ]);
    expect(validateModes(modeMap).map((f) => f.mode)).toEqual(['tight']);
  });

  it('reports per-mode drift for multiple diverging modes', () => {
    const baseline = { spacing: { 0: dim(0), 1: dim(4), 2: dim(8) } };
    const comfortable = { spacing: { 0: dim(0), 2: dim(8) } }; // missing spacing.1
    const tight = { spacing: { 0: dim(0), 1: dim(4), 2: dim(8), 3: dim(12) } }; // extra spacing.3
    const modeMap = new Map([
      ['regular', baseline],
      ['comfortable', comfortable],
      ['tight', tight],
    ]);
    const findings = validateModes(modeMap);
    expect(findings).toEqual([
      { mode: 'comfortable', missing: ['spacing.1'], extra: [] },
      { mode: 'tight', missing: [], extra: ['spacing.3'] },
    ]);
  });

  it('sorts findings by mode name for stable output', () => {
    const data = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['regular', data],
      ['spacious', data],
      ['compact', data],
      ['comfortable', data],
    ]);
    expect(validateModes(modeMap).map((f) => f.mode)).toEqual([
      'comfortable',
      'compact',
      'spacious',
    ]);
  });

  it('reports every non-baseline mode as drifting when the baseline itself has a stray key', () => {
    // If regular gets a new key the other modes haven't picked up yet, every
    // non-baseline mode reports it as missing — the validator surfaces the
    // drift symmetrically rather than special-casing the baseline.
    const regular = { spacing: { 0: dim(0), 99: dim(396) } };
    const clean = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['regular', regular],
      ['tight', clean],
      ['relaxed', clean],
    ]);
    const findings = validateModes(modeMap);
    expect(findings).toEqual([
      { mode: 'relaxed', missing: ['spacing.99'], extra: [] },
      { mode: 'tight', missing: ['spacing.99'], extra: [] },
    ]);
  });

  it('throws when the baseline mode is absent from the input map', () => {
    const modeMap = new Map([['tight', { spacing: { 0: dim(0) } }]]);
    expect(() => validateModes(modeMap)).toThrow(
      /baseline mode "regular" not found/
    );
  });

  it('honours a custom baseline argument', () => {
    const data = { spacing: { 0: dim(0) } };
    const modeMap = new Map([
      ['tight', data],
      ['relaxed', data],
    ]);
    expect(validateModes(modeMap, 'tight').map((f) => f.mode)).toEqual([
      'relaxed',
    ]);
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
    const discovered = CANONICAL_MODES.filter((m) => m !== 'tight');
    expect(() => assertCanonicalModeSet(discovered)).toThrow(ConfigError);
    expect(() => assertCanonicalModeSet(discovered)).toThrow(
      /missing canonical mode\(s\): tight/
    );
  });

  it('reports both unexpected and missing modes in one message', () => {
    const discovered = CANONICAL_MODES.filter((m) => m !== 'tight').concat([
      'foo',
      'bar',
    ]);
    try {
      assertCanonicalModeSet(discovered);
      throw new Error('expected ConfigError');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      expect(err.message).toMatch(/unexpected mode file\(s\): bar, foo/);
      expect(err.message).toMatch(/missing canonical mode\(s\): tight/);
    }
  });
});
