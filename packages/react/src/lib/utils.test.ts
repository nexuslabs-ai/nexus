import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn — gap class group', () => {
  it('collapses two per-size gap-control utilities with last-one-wins semantics', () => {
    expect(cn('nx:gap-control-sm', 'nx:gap-control-md')).toBe(
      'nx:gap-control-md'
    );
  });

  it('collapses a per-size gap-control against a native gap utility in both orders', () => {
    expect(cn('nx:gap-control-md', 'nx:gap-2')).toBe('nx:gap-2');
    expect(cn('nx:gap-2', 'nx:gap-control-md')).toBe('nx:gap-control-md');
  });
});
