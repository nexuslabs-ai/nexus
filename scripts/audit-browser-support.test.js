import { describe, expect, it } from 'vitest';

import {
  auditBrowserSupport,
  BROWSER_FLOOR,
  compareBrowserslist,
  evaluateFeaturePolicies,
  EXPECTED_BROWSERSLIST,
  FEATURE_POLICIES,
  FEATURE_POLICY_DEFINITIONS,
  isFeatureSafeAtFloor,
} from './audit-browser-support.js';

describe('audit-browser-support', () => {
  it('matches the documented Nexus browser floor', () => {
    expect(BROWSER_FLOOR).toEqual({
      chrome: 111,
      edge: 111,
      firefox: 113,
      safari: 15.4,
      samsung: 22,
    });

    expect(EXPECTED_BROWSERSLIST).toEqual([
      'Chrome >= 111',
      'Edge >= 111',
      'Firefox >= 113',
      'Safari >= 15.4',
      'Samsung >= 22',
    ]);
  });

  it('treats OKLCH as floor-safe and Popover API as outside the floor', () => {
    const oklch = FEATURE_POLICIES.find((feature) => feature.id === 'oklch');
    const popover = FEATURE_POLICIES.find(
      (feature) => feature.id === 'popover-api'
    );

    expect(isFeatureSafeAtFloor(oklch)).toBe(true);
    expect(isFeatureSafeAtFloor(popover)).toBe(false);
  });

  it('keeps feature policies aligned with floor support', () => {
    const results = evaluateFeaturePolicies();

    expect(Object.keys(FEATURE_POLICY_DEFINITIONS).sort()).toEqual([
      'adopt',
      'defer',
      'fallback',
      'intentional-divergence',
      'progressive-enhancement',
    ]);

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'oklch',
          policy: 'adopt',
          floorSafe: true,
          problem: null,
        }),
        expect.objectContaining({
          id: 'accent-color',
          policy: 'progressive-enhancement',
          floorSafe: true,
          problem: null,
        }),
        expect.objectContaining({
          id: 'field-sizing',
          policy: 'progressive-enhancement',
          floorSafe: false,
          problem: null,
        }),
        expect.objectContaining({
          id: 'popover-api',
          policy: 'intentional-divergence',
          floorSafe: false,
          problem: null,
        }),
        expect.objectContaining({
          id: 'container-style-queries',
          policy: 'fallback',
          floorSafe: false,
          problem: null,
        }),
      ])
    );
  });

  it('flags unsupported features that are marked adopt', () => {
    const results = evaluateFeaturePolicies([
      {
        id: 'future-api',
        name: 'Future API',
        policy: 'adopt',
        support: {
          chrome: 999,
          edge: 999,
          firefox: 999,
          safari: 999,
          samsung: 999,
        },
        guide: 'css',
        note: 'test fixture',
      },
    ]);

    expect(results[0]).toEqual(
      expect.objectContaining({
        floorSafe: false,
        problem: 'marked adopt, but does not clear the browser floor',
      })
    );
  });

  it('flags stale deferrals when the floor supports every browser', () => {
    const results = evaluateFeaturePolicies([
      {
        id: 'old-api',
        name: 'Old API',
        policy: 'defer',
        support: {
          chrome: 1,
          edge: 1,
          firefox: 1,
          safari: 1,
          samsung: 1,
        },
        guide: 'html',
        note: 'test fixture',
      },
    ]);

    expect(results[0]).toEqual(
      expect.objectContaining({
        floorSafe: true,
        problem: 'marked defer, but now clears the browser floor',
      })
    );
  });

  it('flags unknown feature policies', () => {
    const results = evaluateFeaturePolicies([
      {
        id: 'misspelled-policy',
        name: 'Misspelled Policy',
        policy: 'adpot',
        support: {
          chrome: 111,
          edge: 111,
          firefox: 113,
          safari: 15.4,
          samsung: 22,
        },
        guide: 'css',
        note: 'test fixture',
      },
    ]);

    expect(results[0]).toEqual(
      expect.objectContaining({
        floorSafe: true,
        problem: 'uses unknown policy "adpot"',
      })
    );
  });

  it('detects drift from the canonical Browserslist targets', () => {
    expect(compareBrowserslist(['Chrome >= 111'])).toEqual({
      missing: [
        'Edge >= 111',
        'Firefox >= 113',
        'Safari >= 15.4',
        'Samsung >= 22',
      ],
      extra: [],
    });
  });

  it('passes for a package using the canonical targets', () => {
    const result = auditBrowserSupport({
      browserslist: [...EXPECTED_BROWSERSLIST],
    });

    expect(result.ok).toBe(true);
    expect(result.browserslistDiff).toEqual({ missing: [], extra: [] });
    expect(result.featureProblems).toEqual([]);
  });
});
