import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  createContentSecurityPolicy,
  CSP_HEADER_NAME,
  parseContentSecurityPolicy,
} from '../csp.mjs';

import {
  collectCspPolicies,
  decideAuditVerdict,
  findInlineBlockers,
  findPolicyIntegrityFailures,
  findUnprerenderedPages,
  findUnscannedRoutes,
  routeOf,
} from './csp-audit.mjs';

const APPEARANCE_HASH = "'sha256-eULKAmXI30DXg866kExCNMr8MTRYjZmiqIhnMIw5g7w='";

const SHIPPED_HEADER = createContentSecurityPolicy({
  appearanceScriptHash: APPEARANCE_HASH,
  isDevelopment: false,
});

const shipped = parseContentSecurityPolicy(SHIPPED_HEADER);

const NO_INLINE_CONTENT = {
  styleAttributes: 0,
  styleElements: 0,
  flightScripts: 0,
  otherInlineScripts: 0,
};

const TRACKED_BLOCKER = { tracked: '#687', message: 'flight scripts blocked.' };
const UNTRACKED_BLOCKER = {
  tracked: null,
  message: 'style attributes blocked.',
};

function manifestWith(...headers: { key: string; value: string }[]) {
  return { headers: headers.map((header) => ({ headers: [header] })) };
}

function policiesOf(...values: string[]) {
  return values.map((value) => ({
    headerName: CSP_HEADER_NAME,
    header: value,
  }));
}

describe('collectCspPolicies', () => {
  it('deduplicates one policy repeated across routes', () => {
    const header = { key: CSP_HEADER_NAME, value: SHIPPED_HEADER };

    expect(collectCspPolicies(manifestWith(header, header))).toHaveLength(1);
  });

  it('reports divergent per-route policies separately', () => {
    const policies = collectCspPolicies(
      manifestWith(
        { key: CSP_HEADER_NAME, value: SHIPPED_HEADER },
        { key: CSP_HEADER_NAME, value: "default-src 'self'" }
      )
    );

    expect(policies).toHaveLength(2);
  });

  it('ignores headers that are not a CSP', () => {
    expect(
      collectCspPolicies(
        manifestWith({ key: 'X-Frame-Options', value: 'DENY' })
      )
    ).toEqual([]);
  });

  it('marks the enforcing header name as enforced', () => {
    const policy = collectCspPolicies(
      manifestWith({ key: 'Content-Security-Policy', value: SHIPPED_HEADER })
    )[0]!;

    expect(policy.enforced).toBe(true);
  });

  it('does not treat Report-Only as enforced', () => {
    const policy = collectCspPolicies(
      manifestWith({
        key: 'Content-Security-Policy-Report-Only',
        value: SHIPPED_HEADER,
      })
    )[0]!;

    expect(policy.enforced).toBe(false);
  });
});

describe('findPolicyIntegrityFailures', () => {
  const integrity = (
    overrides: Partial<Parameters<typeof findPolicyIntegrityFailures>[0]> = {}
  ) =>
    findPolicyIntegrityFailures({
      policies: policiesOf(SHIPPED_HEADER),
      appearanceScriptHashes: [APPEARANCE_HASH],
      ...overrides,
    });

  it('passes the header the build ships today', () => {
    expect(integrity()).toEqual([]);
  });

  it('catches a build that shipped no policy at all', () => {
    expect(integrity({ policies: [] })[0]).toContain(
      'No Content-Security-Policy'
    );
  });

  it('catches divergent per-route policies', () => {
    expect(
      integrity({
        policies: policiesOf(SHIPPED_HEADER, "default-src 'self'"),
      })[0]
    ).toContain('found 2');
  });

  it('catches a header name the build did not get from csp.mjs', () => {
    const policies = [
      { headerName: 'Content-Security-Policy', header: SHIPPED_HEADER },
    ];

    expect(integrity({ policies })[0]).toContain(CSP_HEADER_NAME);
  });

  it('catches a policy that drifted from the one csp.mjs builds', () => {
    const policies = policiesOf(SHIPPED_HEADER.replace(" 'unsafe-inline'", ''));

    expect(integrity({ policies })[0]).toContain(
      'stale, or the policy drifted'
    );
  });

  it('names a development build rather than calling it drift', () => {
    const policies = policiesOf(
      createContentSecurityPolicy({
        appearanceScriptHash: APPEARANCE_HASH,
        isDevelopment: true,
      })
    );

    expect(integrity({ policies })[0]).toContain('NODE_ENV=development');
  });

  it.each([[[]], [[APPEARANCE_HASH, "'sha256-other='"]]])(
    'catches a build carrying %s appearance bootstrap hashes',
    (appearanceScriptHashes) => {
      expect(integrity({ appearanceScriptHashes })[0]).toContain(
        'Expected one appearance bootstrap'
      );
    }
  );
});

describe('findInlineBlockers', () => {
  it('reports nothing when the build emits no inline content', () => {
    expect(findInlineBlockers(shipped, NO_INLINE_CONTENT)).toEqual([]);
  });

  it('passes the inline styles the shipped policy permits', () => {
    expect(
      findInlineBlockers(shipped, {
        ...NO_INLINE_CONTENT,
        styleAttributes: 1320,
        styleElements: 1,
      })
    ).toEqual([]);
  });

  it("tracks Next's unhashed flight scripts against #687", () => {
    const blockers = findInlineBlockers(shipped, {
      ...NO_INLINE_CONTENT,
      flightScripts: 658,
    });

    expect(blockers).toHaveLength(1);
    expect(blockers[0]!.tracked).toBe('#687');
    expect(blockers[0]!.message).toContain('script-src');
  });

  it('leaves an inline script that is not flight data untracked', () => {
    const blockers = findInlineBlockers(shipped, {
      ...NO_INLINE_CONTENT,
      flightScripts: 658,
      otherInlineScripts: 1,
    });

    expect(blockers.map((blocker) => blocker.tracked)).toEqual(['#687', null]);
    expect(blockers[1]!.message).toContain('neither the appearance bootstrap');
  });

  it('leaves a style-src regression untracked so it fails the audit', () => {
    const tightened = parseContentSecurityPolicy(
      SHIPPED_HEADER.replace(" 'unsafe-inline'", '')
    );

    const blockers = findInlineBlockers(tightened, {
      ...NO_INLINE_CONTENT,
      styleAttributes: 1320,
      styleElements: 1,
    });

    expect(blockers.map((blocker) => blocker.tracked)).toEqual([null, null]);
    expect(blockers[0]!.message).toContain('1320 inline style attributes');
    expect(blockers[1]!.message).toContain('1 inline <style> elements');
  });

  it('follows default-src when the policy names no style directive', () => {
    const blocker = findInlineBlockers(
      parseContentSecurityPolicy("default-src 'self'"),
      { ...NO_INLINE_CONTENT, styleAttributes: 3 }
    )[0]!;

    expect(blocker.message).toContain("default-src ('self')");
  });

  it('reports nothing when the policy restricts none of the chain', () => {
    expect(
      findInlineBlockers(parseContentSecurityPolicy("img-src 'self'"), {
        ...NO_INLINE_CONTENT,
        styleAttributes: 3,
        flightScripts: 5,
      })
    ).toEqual([]);
  });
});

describe('decideAuditVerdict', () => {
  const verdict = (
    overrides: Partial<Parameters<typeof decideAuditVerdict>[0]> = {}
  ) =>
    decideAuditVerdict({
      enforced: false,
      integrityFailures: [],
      blockers: [],
      ...overrides,
    });

  it('says nothing about a build with no findings', () => {
    expect(verdict()).toBeNull();
  });

  it('fails on an integrity failure even under Report-Only', () => {
    const result = verdict({ integrityFailures: ['stale build'] })!;

    expect(result.failed).toBe(true);
    expect(result.detail).toEqual(['stale build']);
  });

  it('reports integrity ahead of any blocker', () => {
    const result = verdict({
      integrityFailures: ['stale build'],
      blockers: [UNTRACKED_BLOCKER],
    })!;

    expect(result.detail).toEqual(['stale build']);
  });

  it('only warns for a tracked blocker under Report-Only', () => {
    const result = verdict({ blockers: [TRACKED_BLOCKER] })!;

    expect(result.failed).toBe(false);
    expect(result.detail).toEqual([TRACKED_BLOCKER.message]);
  });

  it('fails for an untracked blocker under Report-Only', () => {
    const result = verdict({ blockers: [UNTRACKED_BLOCKER] })!;

    expect(result.failed).toBe(true);
    expect(result.detail).toEqual([UNTRACKED_BLOCKER.message]);
  });

  it('reports only the untracked blockers when both kinds are present', () => {
    const result = verdict({ blockers: [TRACKED_BLOCKER, UNTRACKED_BLOCKER] })!;

    expect(result.failed).toBe(true);
    expect(result.detail).toEqual([UNTRACKED_BLOCKER.message]);
  });

  it('fails on a tracked blocker once the header enforces', () => {
    const result = verdict({ enforced: true, blockers: [TRACKED_BLOCKER] })!;

    expect(result.failed).toBe(true);
    expect(result.detail).toEqual([TRACKED_BLOCKER.message]);
  });
});

describe('findUnscannedRoutes', () => {
  const manifest = {
    routes: {
      '/': { dataRoute: '/index.rsc' },
      '/foundations/color': { dataRoute: '/foundations/color.rsc' },
      '/icon.svg': { dataRoute: null },
    },
  };

  it('passes when every prerendered page was scanned', () => {
    expect(findUnscannedRoutes(manifest, ['/', '/foundations/color'])).toEqual(
      []
    );
  });

  it('names a prerendered page the scan missed', () => {
    expect(findUnscannedRoutes(manifest, ['/'])).toEqual([
      '/foundations/color',
    ]);
  });

  it('does not expect HTML from a route handler', () => {
    expect(findUnscannedRoutes(manifest, [])).not.toContain('/icon.svg');
  });
});

describe('routeOf', () => {
  const appOutputDir = path.join('.next', 'server', 'app');
  const htmlFile = (...segments: string[]) =>
    path.join(appOutputDir, ...segments);

  it('maps the root page to /', () => {
    expect(routeOf(appOutputDir, htmlFile('index.html'))).toBe('/');
  });

  it('maps a nested page to its route', () => {
    expect(routeOf(appOutputDir, htmlFile('foundations', 'color.html'))).toBe(
      '/foundations/color'
    );
  });

  it("keeps Next's own underscore-prefixed page", () => {
    expect(routeOf(appOutputDir, htmlFile('_not-found.html'))).toBe(
      '/_not-found'
    );
  });

  it('normalises Windows separators on any platform', () => {
    expect(routeOf('', 'foundations\\color.html')).toBe('/foundations/color');
  });

  it('produces the routes the prerender manifest declares', () => {
    const scanned = [
      htmlFile('index.html'),
      htmlFile('agents', 'llms-txt.html'),
    ];

    expect(
      findUnscannedRoutes(
        {
          routes: {
            '/': { dataRoute: '/index.rsc' },
            '/agents/llms-txt': { dataRoute: '/agents/llms-txt.rsc' },
          },
        },
        scanned.map((file) => routeOf(appOutputDir, file))
      )
    ).toEqual([]);
  });
});

describe('findUnprerenderedPages', () => {
  const APP_PATH_ROUTES = {
    '/icon.svg/route': '/icon.svg',
    '/_not-found/page': '/_not-found',
    '/page': '/',
    '/appearance-ssr/page': '/appearance-ssr',
    '/changelog/page': '/changelog',
    '/[section]/page': '/[section]',
  };

  // The page each prerendered route came from, as the prerender manifest
  // records it: `/agents` is one of `/[section]`'s static params.
  const FULL_COVERAGE = {
    '/': '/',
    '/changelog': '/changelog',
    '/agents': '/[section]',
  };

  const uncovered = (
    prerenderedBy: Record<string, string>,
    exemptPages = ['/appearance-ssr', '/_not-found']
  ) =>
    findUnprerenderedPages({
      appPathRoutes: APP_PATH_ROUTES,
      prerenderManifest: {
        routes: Object.fromEntries(
          Object.entries(prerenderedBy).map(([route, srcRoute]) => [
            route,
            { srcRoute },
          ])
        ),
      },
      exemptPages,
    });

  const withoutRoute = (dropped: string) =>
    Object.fromEntries(
      Object.entries(FULL_COVERAGE).filter(([route]) => route !== dropped)
    );

  // Nothing prerendered, so every page the app owns is in the result and the
  // skips below assert against a non-empty list.
  const nothingPrerendered = uncovered({});

  it('passes when every declared page prerendered', () => {
    expect(uncovered(FULL_COVERAGE)).toEqual([]);
  });

  it('names a page that stopped prerendering', () => {
    expect(uncovered(withoutRoute('/changelog'))).toEqual(['/changelog']);
  });

  it('names a dynamic segment whose static params emptied', () => {
    // `/changelog` still matches `/[section]`'s URL pattern, so coverage read
    // from the route regex rather than from provenance would miss this.
    expect(uncovered(withoutRoute('/agents'))).toEqual(['/[section]']);
  });

  it('reports every page the app owns when the build prerendered nothing', () => {
    expect(nothingPrerendered).toEqual(['/', '/changelog', '/[section]']);
  });

  it('skips a page that renders per request by design', () => {
    expect(nothingPrerendered).not.toContain('/appearance-ssr');
  });

  it('skips the not-found page Next generates rather than the app', () => {
    expect(nothingPrerendered).not.toContain('/_not-found');
  });

  it('exempts only the pages it is given', () => {
    expect(uncovered({}, [])).toContain('/_not-found');
  });

  it('expects no HTML from a route handler', () => {
    expect(nothingPrerendered).not.toContain('/icon.svg');
  });
});

describe('the audit end to end', () => {
  const manifest = manifestWith({
    key: CSP_HEADER_NAME,
    value: SHIPPED_HEADER,
  });

  it('clears a build whose shipped policy permits what it emits', () => {
    const [policy] = collectCspPolicies(manifest);

    const integrityFailures = findPolicyIntegrityFailures({
      policies: [policy!],
      appearanceScriptHashes: [APPEARANCE_HASH],
    });
    const blockers = findInlineBlockers(policy!.directives, {
      styleAttributes: 1320,
      styleElements: 1,
      flightScripts: 658,
      otherInlineScripts: 0,
    });

    expect(integrityFailures).toEqual([]);
    expect(
      decideAuditVerdict({
        enforced: policy!.enforced,
        integrityFailures,
        blockers,
      })
    ).toMatchObject({ failed: false });
  });

  it('fails a build that emits inline content no issue owns', () => {
    const [policy] = collectCspPolicies(manifest);

    const integrityFailures = findPolicyIntegrityFailures({
      policies: [policy!],
      appearanceScriptHashes: [APPEARANCE_HASH],
    });
    const blockers = findInlineBlockers(policy!.directives, {
      styleAttributes: 1320,
      styleElements: 1,
      flightScripts: 658,
      otherInlineScripts: 1,
    });

    expect(integrityFailures).toEqual([]);
    expect(blockers.filter((blocker) => !blocker.tracked)).toHaveLength(1);
    expect(
      decideAuditVerdict({
        enforced: policy!.enforced,
        integrityFailures,
        blockers,
      })
    ).toMatchObject({ failed: true });
  });
});
