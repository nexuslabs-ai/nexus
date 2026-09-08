/**
 * The docs Content-Security-Policy. `next.config.ts` builds the header from
 * here; `scripts/audit-csp-inventory.mjs` parses the built header back out of
 * the routes manifest with the helpers here and checks the output against it.
 * `CSP.md` records what the policy allows today and what still has to change
 * before it can be enforced.
 */

// #687 flips this to 'Content-Security-Policy' once Next's inline flight
// scripts are covered; until then enforcing the policy blanks every page.
export const CSP_HEADER_NAME = 'Content-Security-Policy-Report-Only';

const HASH_OR_NONCE = /^'(?:sha(?:256|384|512)-|nonce-)/i;

/**
 * CSP Level 3, "Does a source list allow all inline behavior for type?". A hash
 * or nonce makes `'unsafe-inline'` inert for either type; `'strict-dynamic'`
 * does so for scripts only. Source expressions are ASCII case-insensitive.
 *
 * @param {readonly string[]} sources
 * @param {'script' | 'style'} type
 * @returns {boolean}
 */
export function allowsArbitraryInline(sources, type) {
  let allowAllInline = false;

  for (const source of sources) {
    if (HASH_OR_NONCE.test(source)) return false;

    const keyword = source.toLowerCase();
    if (type === 'script' && keyword === "'strict-dynamic'") return false;
    if (keyword === "'unsafe-inline'") allowAllInline = true;
  }

  return allowAllInline;
}

/**
 * @param {string} header
 * @returns {Record<string, string[]>}
 */
export function parseContentSecurityPolicy(header) {
  /** @type {Record<string, string[]>} */
  const directives = {};

  for (const directive of header.split(';')) {
    const [name, ...sources] = directive.trim().split(/\s+/);
    if (!name) continue;

    // Directive names are case-insensitive, and a browser honours the first
    // occurrence of a repeated directive and ignores the rest.
    const key = name.toLowerCase();
    if (key in directives) continue;
    directives[key] = sources;
  }

  return directives;
}

/**
 * The directive a browser consults for one kind of inline content, following
 * the `-elem` / `-attr` variants and then the `default-src` fallback. Returns
 * null when the policy names none of them, which permits the content.
 *
 * @param {Record<string, string[]>} directives
 * @param {readonly string[]} fallbackChain
 * @returns {{ name: string, sources: string[] } | null}
 */
export function resolveDirective(directives, fallbackChain) {
  for (const name of fallbackChain) {
    const sources = directives[name];
    if (sources) return { name, sources };
  }

  return null;
}

/**
 * @param {{ appearanceScriptHash: string, isDevelopment: boolean }} options
 * @returns {string}
 */
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
