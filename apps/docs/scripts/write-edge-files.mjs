import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';

import { docsRoot } from './roots.mjs';

// Cloudflare Workers static assets reject a _headers line over 2,000 characters.
const MAX_HEADERS_LINE_LENGTH = 2000;

const outDir = path.join(docsRoot, 'out');

if (!existsSync(outDir)) {
  console.error('Missing out/. Run `next build` first.');
  process.exit(1);
}

const jiti = createJiti(
  pathToFileURL(path.join(docsRoot, 'package.json')).href
);
const { SECURITY_HEADERS } = await jiti.import(
  path.join(docsRoot, 'security-headers.ts')
);
const { PAGE_MANIFEST } = await jiti.import(
  path.join(docsRoot, 'app', '_lib', 'manifest.ts')
);

const headersLines = [
  '/*',
  ...Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => `  ${name}: ${value}`
  ),
];

const overlong = headersLines.find(
  (line) => line.length > MAX_HEADERS_LINE_LENGTH
);
if (overlong) {
  console.error(
    `_headers line exceeds ${MAX_HEADERS_LINE_LENGTH} characters: ${overlong.slice(0, 80)}…`
  );
  process.exit(1);
}

// A static export renders `redirect()` in app/(docs)/[section]/page.tsx as a
// client-side redirect only; these give each section a real HTTP redirect.
const redirectLines = PAGE_MANIFEST.filter(
  (section) => section.pages.length > 0
).map((section) => `/${section.slug} ${section.pages[0].route} 307`);

writeFileSync(path.join(outDir, '_headers'), `${headersLines.join('\n')}\n`);
writeFileSync(path.join(outDir, '_redirects'), `${redirectLines.join('\n')}\n`);
