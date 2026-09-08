import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { allowsArbitraryInline, parseContentSecurityPolicy } from '../csp.mjs';

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

  for (const route of manifest.headers ?? []) {
    for (const { key, value } of route.headers ?? []) {
      const enforced = key === 'Content-Security-Policy';
      if (!enforced && key !== 'Content-Security-Policy-Report-Only') continue;
      return {
        headerName: key,
        enforced,
        directives: parseContentSecurityPolicy(value),
      };
    }
  }

  console.error(
    'No Content-Security-Policy header in .next/routes-manifest.json.'
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

if (!existsSync(appOutputDir) || !existsSync(clientOutputDir)) {
  console.error(
    'Missing .next/server/app or .next/static. Run `pnpm build` first.'
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
let appearanceScriptBody = null;
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
  appearanceScriptBody ??=
    scripts.find(([, attrs]) =>
      attrs.includes('data-nexus-appearance-script')
    )?.[2] ?? null;
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
const styleSrc = shippedCsp.directives['style-src'] ?? [];
const scriptSrc = shippedCsp.directives['script-src'] ?? [];
const appearanceScriptHash = appearanceScriptBody
  ? `'sha256-${createHash('sha256').update(appearanceScriptBody).digest('base64')}'`
  : null;
const blockers = [];

if (
  !allowsArbitraryInline(styleSrc) &&
  inlineStyleAttributes + inlineStyleElements > 0
) {
  blockers.push(
    `style-src (${styleSrc.join(' ')}) blocks ${inlineStyleAttributes} inline style attributes and ${inlineStyleElements} inline <style> elements.`
  );
}

if (appearanceScriptHash && !scriptSrc.includes(appearanceScriptHash)) {
  blockers.push(
    `script-src carries no hash for the appearance bootstrap that shipped (${appearanceScriptHash}).`
  );
}

if (!allowsArbitraryInline(scriptSrc) && nextInlineScripts > 0) {
  blockers.push(
    `script-src blocks ${nextInlineScripts} inline scripts that carry no hash (Next.js RSC flight data).`
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
