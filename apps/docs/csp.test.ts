import { describe, expect, it } from 'vitest';

import {
  allowsArbitraryInline,
  createContentSecurityPolicy,
  parseContentSecurityPolicy,
  resolveDirective,
} from './csp.mjs';

const APPEARANCE_HASH = "'sha256-eULKAmXI30DXg866kExCNMr8MTRYjZmiqIhnMIw5g7w='";

const shipped = parseContentSecurityPolicy(
  createContentSecurityPolicy({
    appearanceScriptHash: APPEARANCE_HASH,
    isDevelopment: false,
  })
);

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
