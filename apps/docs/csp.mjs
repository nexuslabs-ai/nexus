/**
 * The docs Content-Security-Policy. `next.config.ts` builds the header from
 * here; `scripts/audit-csp-inventory.mjs` parses the built header back out of
 * the routes manifest with the helpers here and checks the output against it.
 * `CSP.md` records what the policy allows today and what still has to change
 * before it can be enforced.
 *
 * Next bakes `headers()` into `.next/routes-manifest.json`, so `DOCS_CSP_MODE`
 * is read at build time — setting it for `next start` alone does nothing.
 */

export const CSP_MODE =
  process.env.DOCS_CSP_MODE === 'enforce' ? 'enforce' : 'report-only';

export const CSP_HEADER_NAME =
  CSP_MODE === 'enforce'
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';

const HASH_OR_NONCE = /^'(?:sha(?:256|384|512)-|nonce-)/;

/**
 * A hash or nonce anywhere in a directive makes its `'unsafe-inline'` inert, so
 * the keyword on its own does not settle whether inline content runs.
 */
export function allowsArbitraryInline(sources) {
  return (
    sources.includes("'unsafe-inline'") &&
    !sources.some((source) => HASH_OR_NONCE.test(source))
  );
}

export function parseContentSecurityPolicy(header) {
  return Object.fromEntries(
    header
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources])
  );
}

export function createContentSecurityPolicy({
  appearanceScriptHash,
  isDevelopment,
}) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      appearanceScriptHash,
      "'report-sample'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(isDevelopment ? ['ws:'] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}
