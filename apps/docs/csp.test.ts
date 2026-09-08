import { describe, expect, it } from 'vitest';

import {
  allowsArbitraryInline,
  createContentSecurityPolicy,
  parseContentSecurityPolicy,
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
    expect(allowsArbitraryInline(["'self'", "'unsafe-inline'"])).toBe(true);
  });

  it('withholds permission when the keyword is absent', () => {
    expect(allowsArbitraryInline(["'self'"])).toBe(false);
  });

  it.each([
    ["'sha256-abc='"],
    ["'sha384-abc='"],
    ["'sha512-abc='"],
    ["'nonce-abc123'"],
  ])('treats %s as making the keyword inert', (source) => {
    expect(allowsArbitraryInline(["'self'", "'unsafe-inline'", source])).toBe(
      false
    );
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
});

describe('the shipped policy', () => {
  it('permits the inline style attributes Shiki writes for every token', () => {
    expect(allowsArbitraryInline(shipped['style-src']!)).toBe(true);
  });

  it('runs no inline script the appearance bootstrap hash does not cover', () => {
    expect(shipped['script-src']).toContain(APPEARANCE_HASH);
    expect(allowsArbitraryInline(shipped['script-src']!)).toBe(false);
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
