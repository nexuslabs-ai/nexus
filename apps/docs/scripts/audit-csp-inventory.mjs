import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  collectCspPolicies,
  findInlineBlockers,
  findPolicyIntegrityFailures,
} from '../csp.mjs';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const appOutputDir = path.join(docsRoot, '.next', 'server', 'app');
const clientOutputDir = path.join(docsRoot, '.next', 'static');
const routesManifest = path.join(docsRoot, '.next', 'routes-manifest.json');
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
const inlineScriptPattern =
  /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath;
  });
}

// The audit checks the header the build actually baked into the routes
// manifest, not the one the current environment would produce.
function readShippedCsp() {
  const manifest = JSON.parse(readFileSync(routesManifest, 'utf8'));
  const policies = collectCspPolicies(manifest);

  if (policies.length === 0) {
    console.error(
      'No Content-Security-Policy header in .next/routes-manifest.json.'
    );
    process.exit(1);
  }

  // One policy for every route is the arrangement the audit reasons about; a
  // per-route policy would leave the routes it does not sample unaudited.
  if (policies.length > 1) {
    console.error(
      `Expected one Content-Security-Policy across all routes, found ${policies.length}.`
    );
    process.exit(1);
  }

  return policies[0];
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
  !existsSync(routesManifest)
) {
  console.error(
    'Missing .next/server/app, .next/static or .next/routes-manifest.json. Run `pnpm build` first.'
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
  for (const [, attrs, body] of scripts) {
    if (!attrs.includes('data-nexus-appearance-script')) continue;
    appearanceScripts++;
    appearanceScriptBodies.add(body);
  }
  serializedAppearanceReferences += scripts.filter(([, attrs, body]) =>
    `${attrs}\n${body}`.includes('data-nexus-appearance-script')
  ).length;
  serializedDocsStorageReferences += scripts.filter(([, , body]) =>
    body.includes('nexus-docs-appearance')
  ).length;

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

const nextInlineScripts = inlineScripts - appearanceScripts;
const shippedCsp = readShippedCsp();
const appearanceScriptHashes = [...appearanceScriptBodies].map(
  (body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`
);

// A failure here means the audit is reading the wrong artifact, so it is not an
// enforcement finding and does not wait for the header to flip.
const integrityFailures = findPolicyIntegrityFailures({
  headerName: shippedCsp.headerName,
  header: shippedCsp.header,
  appearanceScriptHashes,
});

const blockers = findInlineBlockers(shippedCsp.directives, {
  styleAttributes: inlineStyleAttributes,
  styleElements: inlineStyleElements,
  unhashedScripts: nextInlineScripts,
});

console.log(
  JSON.stringify(
    {
      htmlFiles: htmlFiles.length,
      inlineScripts,
      appearanceScripts,
      nextInlineScripts,
      serializedAppearanceReferences,
      serializedDocsStorageReferences,
      fixtureOrderChecks,
      inlineStyleAttributes,
      inlineStyleElements,
      highlighterChunks: highlighterChunks.length,
      cspHeader: shippedCsp.headerName,
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

if (fixtureOrderChecks === 0 && existsSync(appearanceFixtureSource)) {
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

const indent = (lines) => lines.map((line) => `  - ${line}`).join('\n');

if (integrityFailures.length > 0) {
  console.error(
    `The audit is not reading the policy csp.mjs builds, so its counts describe the wrong artifact:
${indent(integrityFailures)}
Rebuild the docs app, or reconcile csp.mjs. See apps/docs/CSP.md.`
  );
  process.exit(1);
}

const blockerMessages = blockers.map((blocker) => blocker.message);
const untracked = blockers.filter((blocker) => !blocker.tracked);

if (shippedCsp.enforced && blockers.length > 0) {
  console.error(
    `The policy is set to enforce, but the build violates it:
${indent(blockerMessages)}
See apps/docs/CSP.md.`
  );
  process.exit(1);
}

// A blocker no issue owns is a regression in the policy or the output, and
// fails now rather than waiting for the header to flip.
if (untracked.length > 0) {
  console.error(
    `The policy blocks inline content the build emits, and no issue owns it:
${indent(untracked.map((blocker) => blocker.message))}
See apps/docs/CSP.md.`
  );
  process.exit(1);
}

if (blockers.length > 0) {
  console.warn(
    `Content-Security-Policy is Report-Only; enforcing it today would break:
${indent(blockerMessages)}
See apps/docs/CSP.md.`
  );
}
