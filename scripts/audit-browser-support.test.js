import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  auditBrowserSupport,
  BROWSER_FLOOR,
  compareBrowserslist,
  evaluateFeaturePolicies,
  EXPECTED_BROWSERSLIST,
  FEATURE_POLICIES,
  FEATURE_POLICY_DEFINITIONS,
  findRawViewportHeightUsages,
  findRawViewportHeightUsagesInSource,
  isFeatureSafeAtFloor,
} from './audit-browser-support.js';

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

function makeSourceRoot(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-vh-audit-'));
  tempDirs.push(dir);

  for (const [file, content] of Object.entries(files)) {
    const fullPath = path.join(dir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  return dir;
}

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
    const viewportHeightUnits = FEATURE_POLICIES.find(
      (feature) => feature.id === 'viewport-height-units'
    );
    const popover = FEATURE_POLICIES.find(
      (feature) => feature.id === 'popover-api'
    );

    expect(isFeatureSafeAtFloor(oklch)).toBe(true);
    expect(isFeatureSafeAtFloor(viewportHeightUnits)).toBe(true);
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
          id: 'viewport-height-units',
          policy: 'adopt',
          floorSafe: true,
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

  it('detects raw numeric vh values in source text', () => {
    const usages = findRawViewportHeightUsages(
      [
        'const rail = "nx:max-h-[calc(100vh-80px)]";',
        'const placeholder = "nx:min-h-[60vh]";',
        'const tailwindWhitespace = "nx:max-h-[calc(100vh_-_80px)]";',
        'const tailwindLeadingWhitespace = "nx:max-h-[calc(100%_-_100vh)]";',
      ].join('\n'),
      'fixture.tsx'
    );

    expect(usages).toEqual([
      expect.objectContaining({
        file: 'fixture.tsx',
        line: 1,
        match: '100vh',
      }),
      expect.objectContaining({
        file: 'fixture.tsx',
        line: 2,
        match: '60vh',
      }),
      expect.objectContaining({
        file: 'fixture.tsx',
        line: 3,
        match: '100vh',
      }),
      expect.objectContaining({
        file: 'fixture.tsx',
        line: 4,
        match: '100vh',
      }),
    ]);
  });

  it('allows svh, dvh, and lvh viewport units', () => {
    expect(
      findRawViewportHeightUsages(
        [
          'const a = "nx:min-h-[60svh] nx:max-h-[80dvh] nx:h-[100lvh]";',
          'const b = "nx:min-h-svh nx:h-dvh nx:max-h-lvh";',
        ].join('\n')
      )
    ).toEqual([]);
  });

  it('detects Tailwind screen height utilities', () => {
    const usages = findRawViewportHeightUsages(
      [
        'const a = "nx:min-h-screen";',
        'const b = "nx:md:h-screen";',
        'const c = "nx:[@media(pointer:fine)]:max-h-screen";',
      ].join('\n'),
      'fixture.tsx'
    );

    expect(usages.map((usage) => usage.match)).toEqual([
      'nx:min-h-screen',
      'nx:md:h-screen',
      'nx:[@media(pointer:fine)]:max-h-screen',
    ]);
  });

  it('allows raw vh only with an immediate prior-line reason', () => {
    const usages = findRawViewportHeightUsages(
      [
        '// nexus-allow-vh: immersive large-viewport demo',
        'const allowed = "100vh";',
        'const trailing = "100vh"; // nexus-allow-vh: not adjacent',
        '// nexus-allow-vh:',
        'const missingReason = "100vh";',
        '// nexus-allow-vh: separated by a blank line',
        '',
        'const separated = "100vh";',
      ].join('\n')
    );

    expect(usages.map((usage) => usage.line)).toEqual([3, 5, 8]);
  });

  it('finds raw vh usages in source roots and ignores generated dirs', () => {
    const sourceRoot = makeSourceRoot({
      'app/page.tsx': 'export const page = "nx:min-h-screen";',
      'app/dist/generated.tsx': 'export const generated = "100vh";',
      'app/node_modules/package/index.js': 'export const dependency = "100vh";',
      'app/styles.css': '.hero { min-height: 100vh; }',
      'app/README.md': '100vh in prose is outside the source scan',
    });

    const usages = findRawViewportHeightUsagesInSource([sourceRoot]);

    expect(usages).toEqual([
      expect.objectContaining({
        match: 'nx:min-h-screen',
      }),
      expect.objectContaining({
        match: '100vh',
      }),
    ]);
  });

  it('fails the audit when raw vh usages are present', () => {
    const sourceRoot = makeSourceRoot({
      'packages/react/src/example.tsx': 'export const example = "100vh";',
    });
    const result = auditBrowserSupport(
      {
        browserslist: [...EXPECTED_BROWSERSLIST],
      },
      {
        sourceRoots: [sourceRoot],
      }
    );

    expect(result.ok).toBe(false);
    expect(result.rawVhUsages).toEqual([
      expect.objectContaining({
        match: '100vh',
      }),
    ]);
  });
});
