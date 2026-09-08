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
  // A null prototype keeps a directive named `constructor` or `toString` from
  // colliding with an inherited key on the way in or the way back out.
  /** @type {Record<string, string[]>} */
  const directives = Object.create(null);

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
/**
 * Every Content-Security-Policy header the build baked into the routes
 * manifest, deduplicated by name and value.
 *
 * @param {{ headers?: { headers?: { key: string, value: string }[] }[] }} manifest
 * @returns {{ headerName: string, enforced: boolean, header: string, directives: Record<string, string[]> }[]}
 */
export function collectCspPolicies(manifest) {
  const policies = new Map();

  for (const route of manifest.headers ?? []) {
    for (const { key, value } of route.headers ?? []) {
      const name = key.toLowerCase();
      if (
        name !== 'content-security-policy' &&
        name !== 'content-security-policy-report-only'
      ) {
        continue;
      }

      policies.set(`${name} ${value}`, {
        headerName: key,
        enforced: name === 'content-security-policy',
        header: value,
        directives: parseContentSecurityPolicy(value),
      });
    }
  }

  return [...policies.values()];
}

/**
 * Whether the header the build shipped is the one `csp.mjs` builds today. Any
 * failure here means the audit is reading a stale build or a drifted policy, so
 * every count it goes on to report is about the wrong artifact.
 *
 * @param {{ headerName: string, header: string, appearanceScriptHashes: readonly string[] }} shipped
 * @returns {string[]}
 */
export function findPolicyIntegrityFailures({
  headerName,
  header,
  appearanceScriptHashes,
}) {
  const failures = [];

  if (headerName !== CSP_HEADER_NAME) {
    failures.push(
      `The build shipped ${headerName}; csp.mjs builds ${CSP_HEADER_NAME}.`
    );
  }

  if (appearanceScriptHashes.length !== 1) {
    failures.push(
      `Expected one appearance bootstrap across the build, found ${appearanceScriptHashes.length}.`
    );
    return failures;
  }

  const appearanceScriptHash = appearanceScriptHashes[0];
  const expected = createContentSecurityPolicy({
    appearanceScriptHash,
    isDevelopment: false,
  });

  if (header === expected) return failures;

  const development = createContentSecurityPolicy({
    appearanceScriptHash,
    isDevelopment: true,
  });

  if (header === development) {
    failures.push(
      'The build ran with NODE_ENV=development, so the policy carries the dev-only sources. The audit only reasons about a production build.'
    );
    return failures;
  }

  failures.push(
    `The shipped policy is not the one csp.mjs builds — the build is stale, or the policy drifted.
      shipped:  ${header}
      expected: ${expected}`
  );

  return failures;
}

/**
 * Inline content the shipped policy would block. `tracked` names the issue that
 * owns a blocker the policy knowingly carries; an untracked blocker is a
 * regression and fails the audit even while the header is Report-Only.
 *
 * @param {Record<string, string[]>} directives
 * @param {{ styleAttributes: number, styleElements: number, unhashedScripts: number }} counts
 * @returns {{ tracked: string | null, message: string }[]}
 */
export function findInlineBlockers(directives, counts) {
  const checks = [
    {
      label: `${counts.styleAttributes} inline style attributes`,
      count: counts.styleAttributes,
      type: 'style',
      chain: ['style-src-attr', 'style-src', 'default-src'],
      tracked: null,
    },
    {
      label: `${counts.styleElements} inline <style> elements`,
      count: counts.styleElements,
      type: 'style',
      chain: ['style-src-elem', 'style-src', 'default-src'],
      tracked: null,
    },
    {
      label: `${counts.unhashedScripts} inline scripts that carry no hash (Next.js RSC flight data)`,
      count: counts.unhashedScripts,
      type: 'script',
      chain: ['script-src-elem', 'script-src', 'default-src'],
      tracked: '#687',
    },
  ];

  const blockers = [];

  for (const { label, count, type, chain, tracked } of checks) {
    if (count === 0) continue;

    // No directive in the chain means the policy does not restrict this content.
    const directive = resolveDirective(directives, chain);
    if (!directive || allowsArbitraryInline(directive.sources, type)) continue;

    blockers.push({
      tracked,
      message: `${directive.name} (${directive.sources.join(' ')}) blocks ${label}.`,
    });
  }

  return blockers;
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
