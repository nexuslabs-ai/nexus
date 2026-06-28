import { describe, expect, it } from 'vitest';

import {
  comparePairs,
  diffLeaves,
  DISTINCTNESS_ALLOWLIST,
  findViolations,
} from '../mode-distinctness.js';

const px = (value) => ({ value, unit: 'px' });

describe('mode-distinctness core', () => {
  it('diffLeaves reports only differing leaf paths', () => {
    const a = { 'container.p': px(24), 'container.gap': px(16) };
    const b = { 'container.p': px(22), 'container.gap': px(16) };
    expect(diffLeaves(a, b)).toEqual(['container.p']);
  });

  it('comparePairs flags an identical pair with 0 differing leaves', () => {
    const leaves = { 'container.p': px(24) };
    const findings = comparePairs('spacing', {
      default: leaves,
      regular: { ...leaves },
    });
    expect(findings).toEqual([
      {
        family: 'spacing',
        a: 'default',
        b: 'regular',
        differingLeaves: 0,
        firstDiffs: [],
      },
    ]);
  });

  it('findViolations fails identical pairs but spares an allowlisted pair', () => {
    const identical = [
      {
        family: 'spacing',
        a: 'default',
        b: 'regular',
        differingLeaves: 0,
        firstDiffs: [],
      },
    ];
    expect(findViolations(identical, [])).toHaveLength(1);
    expect(
      findViolations(identical, [
        { family: 'spacing', modes: ['default', 'regular'], reason: 'x' },
      ])
    ).toHaveLength(0);
  });

  it('keeps distinct pairs out of violations and surfaces leaf counts', () => {
    const findings = comparePairs('borderwidth', {
      normal: { default: px(1), thick: px(2) },
      strong: { default: px(1.5), thick: px(3) },
    });
    expect(findings[0].differingLeaves).toBe(2);
    expect(findViolations(findings, [])).toHaveLength(0);
  });

  it('ships no default allowlist entries until a future intentional alias exists', () => {
    expect(DISTINCTNESS_ALLOWLIST).toEqual([]);
  });
});
