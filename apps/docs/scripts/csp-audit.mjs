/**
 * The verdicts `audit-csp-inventory.mjs` reaches about a build, kept apart from
 * the I/O so each one can be pinned by a test. `csp.mjs` owns the policy itself
 * and the CSP Level 3 primitives these build on.
 */

import {
  allowsArbitraryInline,
  createContentSecurityPolicy,
  CSP_HEADER_NAME,
  parseContentSecurityPolicy,
  resolveDirective,
} from '../csp.mjs';

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
 * Whether the audit is reading the artifact it thinks it is: one policy across
 * every route, shipped under the header name `csp.mjs` builds, with the value
 * `csp.mjs` builds from the bootstrap that actually shipped. Any failure here
 * means every count the audit reports is about the wrong build.
 *
 * @param {{ policies: readonly { headerName: string, header: string }[], appearanceScriptHashes: readonly string[] }} build
 * @returns {string[]}
 */
export function findPolicyIntegrityFailures({
  policies,
  appearanceScriptHashes,
}) {
  if (policies.length === 0) {
    return ['No Content-Security-Policy header in .next/routes-manifest.json.'];
  }

  // One policy for every route is the arrangement the audit reasons about; a
  // per-route policy would leave the routes it does not sample unaudited.
  if (policies.length > 1) {
    return [
      `Expected one Content-Security-Policy across all routes, found ${policies.length}.`,
    ];
  }

  const [{ headerName, header }] = policies;
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
 * Next's flight scripts are the tracked case, so they are counted apart from
 * any other unhashed inline script — an inline script the app itself added must
 * not inherit #687's exemption.
 *
 * @param {Record<string, string[]>} directives
 * @param {{ styleAttributes: number, styleElements: number, flightScripts: number, otherInlineScripts: number }} counts
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
      label: `${counts.flightScripts} inline scripts that carry no hash (Next.js RSC flight data)`,
      count: counts.flightScripts,
      type: 'script',
      chain: ['script-src-elem', 'script-src', 'default-src'],
      tracked: '#687',
    },
    {
      label: `${counts.otherInlineScripts} inline scripts that are neither the appearance bootstrap nor flight data`,
      count: counts.otherInlineScripts,
      type: 'script',
      chain: ['script-src-elem', 'script-src', 'default-src'],
      tracked: null,
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

/**
 * What the audit should say and whether it should fail. Returns null when there
 * is nothing to report.
 *
 * @param {{ enforced: boolean, integrityFailures: readonly string[], blockers: readonly { tracked: string | null, message: string }[] }} findings
 * @returns {{ failed: boolean, headline: string, detail: string[] } | null}
 */
export function decideAuditVerdict({ enforced, integrityFailures, blockers }) {
  if (integrityFailures.length > 0) {
    return {
      failed: true,
      headline:
        'The audit is not reading the policy csp.mjs builds, so its counts describe the wrong artifact. Rebuild the docs app, or reconcile csp.mjs',
      detail: [...integrityFailures],
    };
  }

  const messages = blockers.map((blocker) => blocker.message);

  if (enforced && blockers.length > 0) {
    return {
      failed: true,
      headline: 'The policy is set to enforce, but the build violates it',
      detail: messages,
    };
  }

  // A blocker no issue owns is a regression in the policy or the output, and
  // fails now rather than waiting for the header to flip.
  const untracked = blockers.filter((blocker) => !blocker.tracked);

  if (untracked.length > 0) {
    return {
      failed: true,
      headline:
        'The policy blocks inline content the build emits, and no issue owns it',
      detail: untracked.map((blocker) => blocker.message),
    };
  }

  if (blockers.length === 0) return null;

  return {
    failed: false,
    headline:
      'Content-Security-Policy is Report-Only; enforcing it today would break',
    detail: messages,
  };
}

/**
 * Prerendered pages the build declared but the HTML scan never read. A page has
 * an `.rsc` data route; a route handler such as `/icon.svg` does not, and emits
 * no HTML.
 *
 * @param {{ routes?: Record<string, { dataRoute?: string | null }> }} prerenderManifest
 * @param {readonly string[]} scannedRoutes
 * @returns {string[]}
 */
export function findUnscannedRoutes(prerenderManifest, scannedRoutes) {
  const scanned = new Set(scannedRoutes);

  return Object.entries(prerenderManifest.routes ?? {})
    .filter(([, { dataRoute }]) => dataRoute?.endsWith('.rsc'))
    .map(([route]) => route)
    .filter((route) => !scanned.has(route));
}
