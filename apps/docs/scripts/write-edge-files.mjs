import { existsSync, readdirSync, writeFileSync } from 'node:fs';
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

// Next exports `opengraph-image` routes without a file extension, so the
// asset server can't infer their type. One rule per route shape, with each
// directory as a placeholder: `/:p0/:p1/opengraph-image-<hash>`.
const ogImageRules = [
  ...new Set(
    readdirSync(outDir, { recursive: true, withFileTypes: true })
      .filter(
        (entry) => entry.isFile() && entry.name.startsWith('opengraph-image')
      )
      .map((entry) =>
        path
          .relative(outDir, path.join(entry.parentPath, entry.name))
          .split(path.sep)
      )
      .map((parts) =>
        [...parts.slice(0, -1).map((_, index) => `:p${index}`), parts.at(-1)]
          .map((part) => `/${part}`)
          .join('')
      )
  ),
].flatMap((rule) => [rule, '  Content-Type: image/png']);

const headersLines = [
  '/*',
  ...Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => `  ${name}: ${value}`
  ),
  '/_next/static/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  // write-markdown.mjs output, served as UTF-8 so `›` and `—` survive.
  '/*.md',
  '  Content-Type: text/markdown; charset=utf-8',
  '/llms.txt',
  '  Content-Type: text/plain; charset=utf-8',
  '/llms-full.txt',
  '  Content-Type: text/plain; charset=utf-8',
  ...ogImageRules,
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
