import { describe, expect, it } from 'vitest';

import { findUsages, readSourceFiles } from './source-audit.js';

const TEST_FILE_RE = /(?:^|\/)__tests__\/|\.test\.[^/]+$/;

const BANNED_BRANCHES = [
  {
    label: 'forced-colors',
    pattern: /forced-colors/,
    samples: ['@media (forced-colors: active)'],
  },
  {
    label: '@supports',
    pattern: /@supports\b/,
    samples: ['@supports not (selector(:has(*)))'],
  },
  {
    label: 'supports variant',
    pattern: /\bsupports-/,
    samples: [
      'nx:not-supports-[backdrop-filter]:bg-popover',
      '@variant not-supports-[backdrop-filter] {',
    ],
  },
  {
    label: 'CSS.supports()',
    pattern: /\bCSS\.supports\s*\(/,
    samples: ["CSS.supports('selector(:has(*))')"],
  },
  {
    label: 'prefers-reduced-*',
    pattern: /prefers-reduced-/,
    samples: ['@media (prefers-reduced-motion: reduce)'],
  },
  {
    label: 'prefers-contrast',
    pattern: /prefers-contrast/,
    samples: ['@media (prefers-contrast: more)'],
  },
  {
    label: 'contrast variant',
    pattern: /\bcontrast-(?:more|less)\b/,
    samples: [
      'nx:contrast-more:border-border-default',
      '@variant contrast-more {',
    ],
  },
  {
    label: 'inverted-colors',
    pattern: /inverted-colors/,
    samples: ['nx:inverted-colors:shadow-none'],
  },
  {
    label: 'motion variant',
    pattern: /\bmotion-(?:reduce|safe)\b/,
    samples: ['nx:motion-reduce:transition-none', '@variant motion-reduce {'],
  },
  {
    label: 'reduce-transparency variant',
    pattern: /\breduce-transparency\b/,
    samples: ['nx:reduce-transparency:bg-popover'],
  },
  {
    label: 'pointer variant',
    pattern: /\b(?:any-)?pointer-(?:coarse|fine|none)\b/,
    samples: ['nx:pointer-coarse:after:-inset-2', '@variant pointer-coarse {'],
  },
  {
    label: 'pointer media query',
    pattern: /\((?:any-)?pointer\s*:/,
    samples: ['nx:[@media(pointer:fine)]:hidden'],
  },
  {
    label: 'hover media query',
    pattern: /\((?:any-)?hover\s*:/,
    samples: ['nx:[@media(any-hover:hover)]:underline'],
  },
  {
    label: 'boolean hover or pointer media query',
    pattern: /(?:@media[^{\]]*|['"])\((?:any-)?(?:hover|pointer)\s*\)/,
    samples: ['nx:[@media(hover)]:underline', "matchMedia('(pointer)')"],
  },
  {
    label: 'user-agent sniffing',
    pattern: /navigator\.(?:userAgent|platform)\b|\buserAgentData\b/,
    samples: ['navigator.userAgent'],
  },
];

describe('environment branching', () => {
  it('each banned pattern matches its samples', () => {
    for (const { label, pattern, samples } of BANNED_BRANCHES) {
      for (const sample of samples) {
        expect(pattern.test(sample), `${label}: ${sample}`).toBe(true);
      }
    }
  });

  it('no source file branches on OS, browser, or input device', () => {
    const files = readSourceFiles().filter(
      ({ file }) => !TEST_FILE_RE.test(file)
    );
    expect(findUsages(BANNED_BRANCHES, files)).toEqual([]);
  });
});
