import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { docsRoot } from './roots.mjs';

const outDir = path.join(docsRoot, 'out');
const clientOutputDir = path.join(outDir, '_next', 'static');
const headersFile = path.join(outDir, '_headers');
// String literals only — identifiers and property names are mangled away, and
// a generic marker collides with unrelated client code.
const highlighterMarkers = [
  { source: '__shiki_resolved', module: '@shikijs/primitive' },
  { source: 'Shiki instance has been disposed', module: '@shikijs/primitive' },
  { source: 'source.tsx', module: '@shikijs/langs/tsx' },
  { source: 'source.css', module: '@shikijs/langs/css' },
  { source: 'Invalid recursionLimit; use 2-20', module: 'oniguruma-to-es' },
];
const inlineScriptPattern =
  /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath;
  });
}

function sha256CspSource(source) {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
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

if (!existsSync(clientOutputDir) || !existsSync(headersFile)) {
  console.error(
    'Missing out/_next/static or out/_headers. Run `pnpm build` first.'
  );
  process.exit(1);
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith('.html'));

if (htmlFiles.length === 0) {
  console.error('No exported HTML files found under out/.');
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

const scriptSrc =
  readFileSync(headersFile, 'utf8')
    .match(/Content-Security-Policy-Report-Only:[^\n]*/)?.[0]
    .match(/script-src [^;]*/)?.[0] ?? '';

if (!scriptSrc) {
  console.error(
    'out/_headers has no Content-Security-Policy-Report-Only script-src.'
  );
  process.exit(1);
}

let appearanceScripts = 0;
let inlineScripts = 0;
let inlineStyleAttributes = 0;
let docsStorageScripts = 0;
const unhashedAppearanceScripts = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(inlineScriptPattern)];
  const appearance = scripts.filter(([, attrs]) =>
    attrs.includes('data-nexus-appearance-script')
  );

  inlineScripts += scripts.length;
  inlineStyleAttributes += html.match(/\sstyle="/g)?.length ?? 0;
  appearanceScripts += appearance.length;
  docsStorageScripts += appearance.filter(([, , body]) =>
    body.includes('nexus-docs-appearance')
  ).length;

  for (const [, , body] of appearance) {
    if (!scriptSrc.includes(sha256CspSource(body))) {
      unhashedAppearanceScripts.add(path.relative(docsRoot, file));
    }
  }
}

console.log(
  JSON.stringify(
    {
      htmlFiles: htmlFiles.length,
      inlineScripts,
      appearanceScripts,
      nextInlineScripts: inlineScripts - appearanceScripts,
      docsStorageScripts,
      inlineStyleAttributes,
      highlighterChunks: highlighterChunks.length,
    },
    null,
    2
  )
);

if (appearanceScripts === 0) {
  console.error(
    'Expected the docs appearance provider bootstrap script in exported HTML.'
  );
  process.exit(1);
}

if (docsStorageScripts === 0) {
  console.error(
    'Expected the docs appearance provider bootstrap script to use the docs storage key.'
  );
  process.exit(1);
}

if (unhashedAppearanceScripts.size > 0) {
  console.error(
    `out/_headers script-src lacks the hash of the appearance script shipped in: ${[
      ...unhashedAppearanceScripts,
    ].join(', ')}`
  );
  process.exit(1);
}
