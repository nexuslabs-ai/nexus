import { describe, expect, it } from 'vitest';

import {
  allowsArbitraryInline,
  collectCspPolicies,
  createContentSecurityPolicy,
  CSP_HEADER_NAME,
  findInlineBlockers,
  findPolicyIntegrityFailures,
  parseContentSecurityPolicy,
  resolveDirective,
} from './csp.mjs';

const APPEARANCE_HASH = "'sha256-eULKAmXI30DXg866kExCNMr8MTRYjZmiqIhnMIw5g7w='";

const SHIPPED_HEADER = createContentSecurityPolicy({
  appearanceScriptHash: APPEARANCE_HASH,
  isDevelopment: false,
});

const shipped = parseContentSecurityPolicy(SHIPPED_HEADER);

const NO_INLINE_CONTENT = {
  styleAttributes: 0,
  styleElements: 0,
  unhashedScripts: 0,
};

function manifestWith(...headers: { key: string; value: string }[]) {
  return { headers: headers.map((header) => ({ headers: [header] })) };
}

describe('allowsArbitraryInline', () => {
  it('permits inline content when the directive carries only the keyword', () => {
    expect(allowsArbitraryInline(["'self'", "'unsafe-inline'"], 'style')).toBe(
      true
    );
  });

  it('withholds permission when the keyword is absent', () => {
    expect(allowsArbitraryInline(["'self'"], 'style')).toBe(false);
  });

  it.each([
    ["'sha256-abc='"],
    ["'sha384-abc='"],
    ["'sha512-abc='"],
    ["'nonce-abc123'"],
    ["'SHA256-abc='"],
    ["'Nonce-abc123'"],
  ])('treats %s as making the keyword inert', (source) => {
    expect(
      allowsArbitraryInline(["'self'", "'unsafe-inline'", source], 'script')
    ).toBe(false);
  });

  it("lets 'strict-dynamic' neutralise the keyword for scripts only", () => {
    const sources = ["'unsafe-inline'", "'strict-dynamic'"];

    expect(allowsArbitraryInline(sources, 'script')).toBe(false);
    expect(allowsArbitraryInline(sources, 'style')).toBe(true);
  });

  it("matches 'STRICT-DYNAMIC' case-insensitively", () => {
    expect(
      allowsArbitraryInline(["'unsafe-inline'", "'STRICT-DYNAMIC'"], 'script')
    ).toBe(false);
  });
});

describe('parseContentSecurityPolicy', () => {
  it('splits a header into directives and their source lists', () => {
    expect(
      parseContentSecurityPolicy("default-src 'self'; object-src 'none'")
    ).toEqual({ 'default-src': ["'self'"], 'object-src': ["'none'"] });
  });

  it('ignores the empty segment a trailing semicolon leaves behind', () => {
    expect(parseContentSecurityPolicy("default-src 'self'; ")).toEqual({
      'default-src': ["'self'"],
    });
  });

  it('keeps the first of a repeated directive, as a browser does', () => {
    expect(
      parseContentSecurityPolicy(
        "style-src 'self'; style-src 'self' 'unsafe-inline'"
      )
    ).toEqual({ 'style-src': ["'self'"] });
  });

  it('lowercases directive names', () => {
    expect(parseContentSecurityPolicy("Style-Src 'self'")).toEqual({
      'style-src': ["'self'"],
    });
  });

  it('records a directive with no sources', () => {
    expect(parseContentSecurityPolicy('upgrade-insecure-requests')).toEqual({
      'upgrade-insecure-requests': [],
    });
  });
});

describe('resolveDirective', () => {
  it('prefers the most specific directive present', () => {
    const directives = {
      'style-src-attr': ["'none'"],
      'style-src': ["'unsafe-inline'"],
      'default-src': ["'self'"],
    };

    expect(
      resolveDirective(directives, [
        'style-src-attr',
        'style-src',
        'default-src',
      ])
    ).toEqual({ name: 'style-src-attr', sources: ["'none'"] });
  });

  it('falls back to default-src when the chain is otherwise absent', () => {
    expect(
      resolveDirective({ 'default-src': ["'self'"] }, [
        'script-src-elem',
        'script-src',
        'default-src',
      ])
    ).toEqual({ name: 'default-src', sources: ["'self'"] });
  });

  it('returns null when the policy restricts nothing in the chain', () => {
    expect(
      resolveDirective({ 'img-src': ["'self'"] }, ['style-src'])
    ).toBeNull();
  });
});

describe('the shipped policy', () => {
  it('permits the inline style attributes Shiki writes for every token', () => {
    expect(allowsArbitraryInline(shipped['style-src']!, 'style')).toBe(true);
  });

  it('runs no inline script the appearance bootstrap hash does not cover', () => {
    expect(shipped['script-src']).toContain(APPEARANCE_HASH);
    expect(allowsArbitraryInline(shipped['script-src']!, 'script')).toBe(false);
  });

  it('opens eval and websockets for the dev server only', () => {
    const development = createContentSecurityPolicy({
      appearanceScriptHash: APPEARANCE_HASH,
      isDevelopment: true,
    });

    expect(development).toContain("'unsafe-eval'");
    expect(development).toContain('ws:');
    expect(shipped['script-src']).not.toContain("'unsafe-eval'");
    expect(shipped['connect-src']).not.toContain('ws:');
  });
});

describe('parseContentSecurityPolicy prototype keys', () => {
  it('keeps a directive whose name collides with an inherited key', () => {
    const directives = parseContentSecurityPolicy("constructor 'self'");

    expect(directives['constructor']).toEqual(["'self'"]);
    expect(resolveDirective(directives, ['toString'])).toBeNull();
  });
});

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
      headerName: CSP_HEADER_NAME,
      header: SHIPPED_HEADER,
      appearanceScriptHashes: [APPEARANCE_HASH],
      ...overrides,
    });

  it('passes the header the build ships today', () => {
    expect(integrity()).toEqual([]);
  });

  it('catches a header name the build did not get from csp.mjs', () => {
    expect(integrity({ headerName: 'Content-Security-Policy' })[0]).toContain(
      CSP_HEADER_NAME
    );
  });

  it('catches a policy that drifted from the one csp.mjs builds', () => {
    expect(
      integrity({ header: SHIPPED_HEADER.replace(" 'unsafe-inline'", '') })[0]
    ).toContain('stale, or the policy drifted');
  });

  it('names a development build rather than calling it drift', () => {
    const header = createContentSecurityPolicy({
      appearanceScriptHash: APPEARANCE_HASH,
      isDevelopment: true,
    });

    expect(integrity({ header })[0]).toContain('NODE_ENV=development');
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
      unhashedScripts: 658,
    });

    expect(blockers).toHaveLength(1);
    expect(blockers[0]!.tracked).toBe('#687');
    expect(blockers[0]!.message).toContain('script-src');
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
        unhashedScripts: 5,
      })
    ).toEqual([]);
  });
});
