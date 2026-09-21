import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const SOURCE_ROOTS = ['apps', 'packages'];
const SOURCE_FILE_RE = /\.(?:[cm]?js|[cm]?ts|jsx|tsx|css|scss|mdx)$/i;
const TEST_FILE_RE = /(?:^|\/)__tests__\/|\.test\.[^/]+$/;
const IGNORED_DIRS = new Set([
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
]);

const BANNED_BRANCHES = [
  {
    label: 'forced-colors',
    pattern: /forced-colors/,
    sample: '@media (forced-colors: active)',
  },
  {
    label: '@supports',
    pattern: /@supports\b/,
    sample: '@supports not (selector(:has(*)))',
  },
  {
    label: 'prefers-reduced-*',
    pattern: /prefers-reduced-/,
    sample: '@media (prefers-reduced-motion: reduce)',
  },
  {
    label: 'motion variant',
    pattern: /\bmotion-(?:reduce|safe):/,
    sample: 'nx:motion-reduce:transition-none',
  },
  {
    label: 'reduce-transparency variant',
    pattern: /\breduce-transparency\b/,
    sample: 'nx:reduce-transparency:bg-popover',
  },
  {
    label: 'pointer variant',
    pattern: /\b(?:any-)?pointer-(?:coarse|fine|none):/,
    sample: 'nx:pointer-coarse:after:-inset-2',
  },
  {
    label: 'pointer media query',
    pattern: /\((?:any-)?pointer\s*:/,
    sample: 'nx:[@media(pointer:fine)]:hidden',
  },
  {
    label: 'user-agent sniffing',
    pattern: /navigator\.(?:userAgent|platform)\b|\buserAgentData\b/,
    sample: 'navigator.userAgent',
  },
];

const RAW_VIEWPORT_HEIGHTS = [
  {
    label: 'raw vh',
    pattern: /(?<![a-z0-9.])\d+(?:\.\d+)?vh(?![a-z0-9])/i,
    sample: 'nx:max-h-[calc(100vh-80px)]',
  },
  {
    label: 'h-screen',
    pattern:
      /\b(?:nx:)?(?:(?:[a-z0-9-]+|\[[^\]]+\]):)*(?:min-h|h|max-h)-screen\b/,
    sample: 'nx:md:min-h-screen',
  },
];

function* walkSourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      yield* walkSourceFiles(path.join(dir, entry.name));
      continue;
    }
    if (SOURCE_FILE_RE.test(entry.name)) yield path.join(dir, entry.name);
  }
}

const sourceFiles = SOURCE_ROOTS.flatMap((root) => [
  ...walkSourceFiles(path.join(REPO_ROOT, root)),
]).map((file) => ({
  file: path.relative(REPO_ROOT, file),
  lines: fs.readFileSync(file, 'utf8').split('\n'),
}));

function findUsages(checks, files) {
  const usages = [];
  for (const { file, lines } of files) {
    lines.forEach((line, index) => {
      for (const { label, pattern } of checks) {
        if (pattern.test(line)) usages.push(`${file}:${index + 1} ${label}`);
      }
    });
  }
  return usages;
}

describe('environment branching', () => {
  it('each banned pattern matches its sample', () => {
    for (const { label, pattern, sample } of BANNED_BRANCHES) {
      expect(pattern.test(sample), label).toBe(true);
    }
  });

  it('no source file branches on OS, browser, or input device', () => {
    const files = sourceFiles.filter(({ file }) => !TEST_FILE_RE.test(file));
    expect(findUsages(BANNED_BRANCHES, files)).toEqual([]);
  });
});

describe('viewport height units', () => {
  it('each raw viewport-height pattern matches its sample', () => {
    for (const { label, pattern, sample } of RAW_VIEWPORT_HEIGHTS) {
      expect(pattern.test(sample), label).toBe(true);
    }
  });

  it('allows svh, lvh, and dvh', () => {
    const files = [
      {
        file: 'sample',
        lines: ['nx:h-svh nx:max-h-[80dvh] nx:min-h-[100lvh]'],
      },
    ];
    expect(findUsages(RAW_VIEWPORT_HEIGHTS, files)).toEqual([]);
  });

  it('no source file uses raw vh or a screen height utility', () => {
    expect(findUsages(RAW_VIEWPORT_HEIGHTS, sourceFiles)).toEqual([]);
  });
});
