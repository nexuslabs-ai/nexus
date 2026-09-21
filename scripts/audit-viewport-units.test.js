import { describe, expect, it } from 'vitest';

import { findUsages, readSourceFiles } from './source-audit.js';

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
    expect(findUsages(RAW_VIEWPORT_HEIGHTS, readSourceFiles())).toEqual([]);
  });
});
