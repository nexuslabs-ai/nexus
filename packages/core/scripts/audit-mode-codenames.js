import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RETIRED_CODENAMES } from './lib/mode-rename-map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const CODE = RETIRED_CODENAMES.join('|');
const DATA_ATTR_FAMILY = 'style|radius|shadow|borderwidth';
const THEME_FAMILY = 'spacing|shadow|radius|borderwidth|typography';

const PATTERNS = [
  {
    kind: 'data attribute',
    regex: new RegExp(
      `(?<!\\[)data-(?:${DATA_ATTR_FAMILY})\\s*=\\s*["'](?:${CODE})["']`,
      'g'
    ),
  },
  {
    kind: 'CSS selector',
    regex: new RegExp(
      `\\[data-(?:${DATA_ATTR_FAMILY})=["'](?:${CODE})["']\\]`,
      'g'
    ),
  },
  {
    kind: 'theme href',
    regex: new RegExp(
      `/themes/(?:${THEME_FAMILY})-(?:${CODE})(?:-(?:light|dark))?\\.css`,
      'g'
    ),
  },
];

const FILENAME_PATTERN = new RegExp(
  `^(?:spacing|shadow|radius|borderwidth|typography)-(?:${CODE})(?:-(?:light|dark))?\\.json$`
);

const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json']);
const SKIP_DIR = new Set([
  'node_modules',
  'dist',
  'storybook-static',
  '.next',
  '.turbo',
  '__generated__',
]);

export const DEFAULT_ALLOWLIST = [
  'packages/core/scripts/lib/mode-rename-map.js',
  'packages/core/scripts/capture-mode-values.js',
  'packages/core/scripts/__tests__/__fixtures__/pre-rename-mode-values.json',
  'apps/docs/app/changelog',
];

export function scanText(file, text) {
  const hits = [];
  const lines = text.split('\n');

  lines.forEach((lineText, index) => {
    for (const pattern of PATTERNS) {
      for (const match of lineText.matchAll(pattern.regex)) {
        hits.push({
          file,
          line: index + 1,
          kind: pattern.kind,
          text: match[0],
        });
      }
    }
  });

  return hits;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIR.has(entry.name)) continue;
      yield* walk(entryPath);
      continue;
    }

    yield entryPath;
  }
}

export function findCodenameViolations({
  roots = ['packages', 'apps'],
  allowlist = DEFAULT_ALLOWLIST,
} = {}) {
  const violations = [];
  const isAllowed = (relativePath) =>
    allowlist.some(
      (allowed) =>
        relativePath === allowed || relativePath.startsWith(`${allowed}/`)
    );

  for (const root of roots) {
    const absoluteRoot = path.join(REPO_ROOT, root);
    if (!fs.existsSync(absoluteRoot)) continue;

    for (const filePath of walk(absoluteRoot)) {
      const relativePath = path.relative(REPO_ROOT, filePath);
      if (isAllowed(relativePath)) continue;

      if (FILENAME_PATTERN.test(path.basename(filePath))) {
        violations.push({
          file: relativePath,
          line: 0,
          kind: 'token filename',
          text: path.basename(filePath),
        });
        continue;
      }

      if (!SCAN_EXT.has(path.extname(filePath))) continue;

      violations.push(
        ...scanText(relativePath, fs.readFileSync(filePath, 'utf8'))
      );
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = findCodenameViolations();

  if (violations.length === 0) {
    console.log('No retired token-mode codenames in load-bearing positions.');
    process.exit(0);
  }

  console.error(`${violations.length} retired codename reference(s):`);
  for (const violation of violations) {
    const suffix = violation.line ? `:${violation.line}` : '';
    console.error(
      `  ${violation.file}${suffix} (${violation.kind}) ${violation.text}`
    );
  }
  process.exit(1);
}
