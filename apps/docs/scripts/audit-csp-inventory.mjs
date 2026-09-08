import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  collectCspPolicies,
  decideAuditVerdict,
  findInlineBlockers,
  findPolicyIntegrityFailures,
  findUnprerenderedPages,
  findUnscannedRoutes,
  routeOf,
} from './csp-audit.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const appOutputDir = path.join(docsRoot, '.next', 'server', 'app');
const clientOutputDir = path.join(docsRoot, '.next', 'static');
const routesManifest = path.join(docsRoot, '.next', 'routes-manifest.json');
const prerenderManifest = path.join(
  docsRoot,
  '.next',
  'prerender-manifest.json'
);
// Written from the app's file tree, so a page stays listed here even when it
// stops prerendering.
const appPathRoutesManifest = path.join(
  docsRoot,
  '.next',
  'app-path-routes-manifest.json'
);
// Next streams the RSC payload through inline scripts calling this.
const flightScriptMarker = 'self.__next_f';
// String literals only — identifiers and property names are mangled away, and
// a generic marker collides with unrelated client code.
const highlighterMarkers = [
  { source: '__shiki_resolved', module: '@shikijs/primitive' },
  { source: 'Shiki instance has been disposed', module: '@shikijs/primitive' },
  { source: 'source.tsx', module: '@shikijs/langs/tsx' },
  { source: 'source.css', module: '@shikijs/langs/css' },
  { source: 'Invalid recursionLimit; use 2-20', module: 'oniguruma-to-es' },
];
const appearanceFixtureSource = path.join(
  docsRoot,
  'app',
  'appearance-ssr',
  'page.tsx'
);
// The two pages that owe no prerendered HTML: `/appearance-ssr` renders per
// request by design, and `/_not-found` is Next's own page. Neither premise is
// trusted — both are checked against the app tree below.
const exemptPages = ['/appearance-ssr', '/_not-found'];
const forceDynamicDeclaration = "export const dynamic = 'force-dynamic'";
const notFoundSource = path.join(docsRoot, 'app', 'not-found.tsx');
const inlineScriptPattern =
  /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath;
  });
}

if (
  !existsSync(appearanceFixtureSource) ||
  !readFileSync(appearanceFixtureSource, 'utf8').includes(
    forceDynamicDeclaration
  )
) {
  console.error(
    `/appearance-ssr is exempt from the page-coverage check as always-dynamic, but ${path.relative(docsRoot, appearanceFixtureSource)} does not declare ${forceDynamicDeclaration}.`
  );
  process.exit(1);
}

// The exemption holds only while Next owns the page. Declaring the app's own
// not-found page would keep the same manifest key and inherit the skip.
if (existsSync(notFoundSource)) {
  console.error(
    `/_not-found is exempt from the page-coverage check as a page Next generates, but ${path.relative(docsRoot, notFoundSource)} makes it the docs app’s. Drop the exemption and cover the page.`
  );
  process.exit(1);
}

for (const { source, module } of highlighterMarkers) {
  const dist = readFileSync(fileURLToPath(import.meta.resolve(module)), 'utf8');
  if (!dist.includes(source)) {
    console.error(
      `Highlighter marker "${source}" is gone from ${module}; the client-bundle scan can no longer detect a highlighter.`
    );
    process.exit(1);
  }
}

if (
  !existsSync(appOutputDir) ||
  !existsSync(clientOutputDir) ||
  !existsSync(routesManifest) ||
  !existsSync(prerenderManifest) ||
  !existsSync(appPathRoutesManifest)
) {
  console.error(
    'Missing .next/server/app, .next/static, or one of the .next manifests (routes, prerender, app-path-routes). Run `pnpm build` first.'
  );
  process.exit(1);
}

const htmlFiles = walk(appOutputDir).filter((file) => file.endsWith('.html'));
const serverFiles = walk(appOutputDir).filter((file) =>
  /\.(?:js|mjs)$/.test(file)
);

if (htmlFiles.length === 0) {
  console.error('No prerendered app HTML files found under .next/server/app.');
  process.exit(1);
}

const highlighterChunks = walk(clientOutputDir).filter((file) => {
  if (!/\.(?:js|mjs)$/.test(file)) return false;
  const contents = readFileSync(file, 'utf8');
  return highlighterMarkers.some((marker) => contents.includes(marker.source));
});

if (highlighterChunks.length > 0) {
  console.error(
    `Highlighter reached the client bundle: ${highlighterChunks
      .map((file) => path.relative(docsRoot, file))
      .join(', ')}`
  );
  process.exit(1);
}

let appearanceScripts = 0;
let flightScripts = 0;
let otherInlineScripts = 0;
let inlineScripts = 0;
let inlineStyleAttributes = 0;
let inlineStyleElements = 0;
const appearanceScriptBodies = new Set();
let serializedAppearanceReferences = 0;
let serializedDocsStorageReferences = 0;
let fixtureOrderChecks = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(inlineScriptPattern)];

  inlineScripts += scripts.length;
  inlineStyleAttributes += html.match(/\sstyle="/g)?.length ?? 0;
  inlineStyleElements += html.match(/<style[\s>]/gi)?.length ?? 0;

  for (const [, attrs = '', body = ''] of scripts) {
    if (`${attrs}\n${body}`.includes('data-nexus-appearance-script')) {
      serializedAppearanceReferences++;
    }
    if (body.includes('nexus-docs-appearance')) {
      serializedDocsStorageReferences++;
    }

    if (attrs.includes('data-nexus-appearance-script')) {
      appearanceScripts++;
      appearanceScriptBodies.add(body);
      continue;
    }

    if (body.includes(flightScriptMarker)) {
      flightScripts++;
      continue;
    }

    otherInlineScripts++;
  }

  const scriptIndex = html.indexOf('data-nexus-appearance-script');
  const markerIndex = html.indexOf('data-nexus-appearance-fixture-marker');
  if (scriptIndex !== -1 && markerIndex !== -1) {
    fixtureOrderChecks++;
    if (scriptIndex > markerIndex) {
      console.error(
        `${file}: expected data-nexus-appearance-script before fixture marker.`
      );
      process.exit(1);
    }
  }
}

for (const file of serverFiles) {
  const source = readFileSync(file, 'utf8');
  if (source.includes('data-nexus-appearance-script')) {
    serializedAppearanceReferences++;
  }
}

// The audit checks the header the build actually baked into the routes
// manifest, not the one the current environment would produce.
const routes = JSON.parse(readFileSync(routesManifest, 'utf8'));
const policies = collectCspPolicies(routes);
const shippedCsp = policies[0];
const appearanceScriptHashes = [...appearanceScriptBodies].map(
  (body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`
);

// A scan that found none of these proves nothing about them, so the blocker
// list would come back empty for the wrong reason. There is no floor for inline
// `<style>` elements: the build emits one, from Next's own `not-found` page,
// and the app owns nothing that would keep it there.
const scanFloors = [
  ['inline style attributes', inlineStyleAttributes],
  ['inline flight scripts', flightScripts],
];

const scannedRoutes = htmlFiles.map((file) => routeOf(appOutputDir, file));
const prerendered = JSON.parse(readFileSync(prerenderManifest, 'utf8'));

const scanFailures = [
  ...scanFloors
    .filter(([, count]) => count === 0)
    .map(
      ([what]) =>
        `Found no ${what} across ${htmlFiles.length} prerendered pages; the scan cannot show whether the policy permits them.`
    ),
  ...findUnscannedRoutes(prerendered, scannedRoutes).map(
    (route) =>
      `The build declares ${route} as prerendered but the HTML scan never read it, so the counts cover only part of the site.`
  ),
  ...findUnprerenderedPages({
    appPathRoutes: JSON.parse(readFileSync(appPathRoutesManifest, 'utf8')),
    prerenderManifest: prerendered,
    exemptPages,
  }).map(
    (page) =>
      `The app declares ${page} but it prerendered nothing, so the scan says nothing about the inline content it emits.`
  ),
];

// Anything here means the audit's inputs do not support its counts — the wrong
// artifact, or a scan that proved nothing — so it outranks every enforcement
// finding and fails whichever header is shipping.
const integrityFailures = [
  ...findPolicyIntegrityFailures({ policies, appearanceScriptHashes }),
  ...scanFailures,
];

const blockers =
  integrityFailures.length === 0 && shippedCsp
    ? findInlineBlockers(shippedCsp.directives, {
        styleAttributes: inlineStyleAttributes,
        styleElements: inlineStyleElements,
        flightScripts,
        otherInlineScripts,
      })
    : [];

console.log(
  JSON.stringify(
    {
      htmlFiles: htmlFiles.length,
      inlineScripts,
      appearanceScripts,
      flightScripts,
      otherInlineScripts,
      serializedAppearanceReferences,
      serializedDocsStorageReferences,
      fixtureOrderChecks,
      inlineStyleAttributes,
      inlineStyleElements,
      highlighterChunks: highlighterChunks.length,
      cspHeader: shippedCsp?.headerName ?? null,
      integrityFailures,
      enforcementBlockers: blockers,
    },
    null,
    2
  )
);

if (appearanceScripts === 0) {
  console.error(
    'Expected the docs appearance provider bootstrap script in prerendered HTML.'
  );
  process.exit(1);
}

if (serializedAppearanceReferences === 0) {
  console.error(
    'Expected the package appearance bootstrap script in the built fixture.'
  );
  process.exit(1);
}

if (serializedDocsStorageReferences === 0) {
  console.error(
    'Expected the docs appearance provider bootstrap script to use the docs storage key.'
  );
  process.exit(1);
}

if (fixtureOrderChecks === 0) {
  const source = readFileSync(appearanceFixtureSource, 'utf8');
  const scriptIndex = source.indexOf('<NexusAppearanceScript');
  const markerIndex = source.indexOf('data-nexus-appearance-fixture-marker');

  if (scriptIndex === -1 || markerIndex === -1 || scriptIndex > markerIndex) {
    console.error(
      'Expected apps/docs/app/appearance-ssr/page.tsx to render NexusAppearanceScript before the fixture marker.'
    );
    process.exit(1);
  }
}

const verdict = decideAuditVerdict({
  enforced: shippedCsp?.enforced ?? false,
  integrityFailures,
  blockers,
});

if (verdict) {
  const detail = verdict.detail.map((line) => `  - ${line}`).join('\n');
  const report = `${verdict.headline}:\n${detail}\nSee apps/docs/CSP.md.`;

  if (verdict.failed) {
    console.error(report);
    process.exit(1);
  }

  console.warn(report);
}
