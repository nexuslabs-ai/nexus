import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  allowsArbitraryInline,
  createContentSecurityPolicy,
  parseContentSecurityPolicy,
  resolveDirective,
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

  if (policies.size === 0) {
    console.error(
      'No Content-Security-Policy header in .next/routes-manifest.json.'
    );
    process.exit(1);
  }

  // One policy for every route is the arrangement the audit reasons about; a
  // per-route policy would leave the routes it does not sample unaudited.
  if (policies.size > 1) {
    console.error(
      `Expected one Content-Security-Policy across all routes, found ${policies.size}.`
    );
    process.exit(1);
  }

  return policies.values().next().value;
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
  appearanceScripts += scripts.filter(([, attrs]) =>
    attrs.includes('data-nexus-appearance-script')
  ).length;
  for (const [, attrs, body] of scripts) {
    if (attrs.includes('data-nexus-appearance-script')) {
      appearanceScriptBodies.add(body);
    }
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
const blockers = [];

// Comparing the built header against the policy rebuilt from the bootstrap
// that actually shipped catches both a drifted policy and a stale build.
if (appearanceScriptHashes.length !== 1) {
  blockers.push(
    `Expected one appearance bootstrap across the build, found ${appearanceScriptHashes.length}.`
  );
} else {
  const expected = createContentSecurityPolicy({
    appearanceScriptHash: appearanceScriptHashes[0],
    isDevelopment: false,
  });

  if (shippedCsp.header !== expected) {
    blockers.push(
      `The shipped policy is not the one csp.mjs builds — the build is stale, or the policy drifted.
      shipped:  ${shippedCsp.header}
      expected: ${expected}`
    );
  }
}

const inlineChecks = [
  {
    label: `${inlineStyleAttributes} inline style attributes`,
    count: inlineStyleAttributes,
    type: 'style',
    chain: ['style-src-attr', 'style-src', 'default-src'],
  },
  {
    label: `${inlineStyleElements} inline <style> elements`,
    count: inlineStyleElements,
    type: 'style',
    chain: ['style-src-elem', 'style-src', 'default-src'],
  },
  {
    label: `${nextInlineScripts} inline scripts that carry no hash (Next.js RSC flight data)`,
    count: nextInlineScripts,
    type: 'script',
    chain: ['script-src-elem', 'script-src', 'default-src'],
  },
];

for (const { label, count, type, chain } of inlineChecks) {
  if (count === 0) continue;

  // No directive in the chain means the policy does not restrict this content.
  const directive = resolveDirective(shippedCsp.directives, chain);
  if (!directive || allowsArbitraryInline(directive.sources, type)) continue;

  blockers.push(
    `${directive.name} (${directive.sources.join(' ')}) blocks ${label}.`
  );
}

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

if (blockers.length > 0) {
  const detail = blockers.map((blocker) => `  - ${blocker}`).join('\n');
  if (shippedCsp.enforced) {
    console.error(
      `The policy is set to enforce, but the build violates it:\n${detail}\nSee apps/docs/CSP.md.`
    );
    process.exit(1);
  }
  console.warn(
    `Content-Security-Policy is Report-Only; enforcing it today would break:\n${detail}\nSee apps/docs/CSP.md.`
  );
}
