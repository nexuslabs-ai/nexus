import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const appOutputDir = path.join(docsRoot, '.next', 'server', 'app');
const inlineScriptPattern =
  /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath;
  });
}

if (!existsSync(appOutputDir)) {
  console.error('Missing .next/server/app. Run `yarn build` first.');
  process.exit(1);
}

const htmlFiles = walk(appOutputDir).filter((file) => file.endsWith('.html'));

if (htmlFiles.length === 0) {
  console.error('No prerendered app HTML files found under .next/server/app.');
  process.exit(1);
}

let bootstrapScripts = 0;
let inlineScripts = 0;
let inlineStyleAttributes = 0;
let serializedBootstrapReferences = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(inlineScriptPattern)];

  inlineScripts += scripts.length;
  inlineStyleAttributes += html.match(/\sstyle="/g)?.length ?? 0;
  bootstrapScripts += scripts.filter(([, attrs]) =>
    attrs.includes('data-nexus-theme-bootstrap')
  ).length;
  serializedBootstrapReferences += scripts.filter(([, , body]) =>
    body.includes('nexus-docs-tokens')
  ).length;
}

console.log(
  JSON.stringify(
    {
      htmlFiles: htmlFiles.length,
      inlineScripts,
      bootstrapScripts,
      nextInlineScripts: inlineScripts - bootstrapScripts,
      serializedBootstrapReferences,
      inlineStyleAttributes,
    },
    null,
    2
  )
);

if (bootstrapScripts === 0) {
  console.error('Expected the docs theme bootstrap script in prerendered HTML.');
  process.exit(1);
}
