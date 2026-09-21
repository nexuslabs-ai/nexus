import { describe, expect, it } from 'vitest';

import { findUsages, readSourceFiles } from './source-audit.js';

const TEST_FILE_RE = /(?:^|\/)__tests__\/|\.test\.[^/]+$/;

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
    label: 'supports variant',
    pattern: /\bsupports-[^\s:]*:/,
    sample: 'nx:not-supports-[backdrop-filter]:bg-popover',
  },
  {
    label: 'CSS.supports()',
    pattern: /\bCSS\.supports\s*\(/,
    sample: "CSS.supports('selector(:has(*))')",
  },
  {
    label: 'prefers-reduced-*',
    pattern: /prefers-reduced-/,
    sample: '@media (prefers-reduced-motion: reduce)',
  },
  {
    label: 'prefers-contrast',
    pattern: /prefers-contrast/,
    sample: '@media (prefers-contrast: more)',
  },
  {
    label: 'contrast variant',
    pattern: /\bcontrast-(?:more|less):/,
    sample: 'nx:contrast-more:border-border-default',
  },
  {
    label: 'inverted-colors',
    pattern: /inverted-colors/,
    sample: 'nx:inverted-colors:shadow-none',
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
    label: 'hover media query',
    pattern: /\((?:any-)?hover\s*:/,
    sample: 'nx:[@media(any-hover:hover)]:underline',
  },
  {
    label: 'user-agent sniffing',
    pattern: /navigator\.(?:userAgent|platform)\b|\buserAgentData\b/,
    sample: 'navigator.userAgent',
  },
];

describe('environment branching', () => {
  it('each banned pattern matches its sample', () => {
    for (const { label, pattern, sample } of BANNED_BRANCHES) {
      expect(pattern.test(sample), label).toBe(true);
    }
  });

  it('no source file branches on OS, browser, or input device', () => {
    const files = readSourceFiles().filter(
      ({ file }) => !TEST_FILE_RE.test(file)
    );
    expect(findUsages(BANNED_BRANCHES, files)).toEqual([]);
  });
});
