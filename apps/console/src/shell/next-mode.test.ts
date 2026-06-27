import { describe, expect, it } from 'vitest';

import { nextMode } from './next-mode';

describe('nextMode', () => {
  it('toggles light to dark', () => {
    expect(nextMode('light', 'light')).toBe('dark');
  });

  it('toggles dark to light', () => {
    expect(nextMode('dark', 'dark')).toBe('light');
  });

  it('toggles system resolved as light to explicit dark', () => {
    expect(nextMode('system', 'light')).toBe('dark');
  });

  it('toggles system resolved as dark to explicit light', () => {
    expect(nextMode('system', 'dark')).toBe('light');
  });
});
