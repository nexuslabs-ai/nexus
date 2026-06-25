import { describe, expect, it } from 'vitest';

import { apcaLc } from './apca';

describe('apcaLc', () => {
  it('is high for black on white', () => {
    expect(apcaLc('#000000', '#ffffff')).toBeGreaterThan(100);
  });

  it('is ~0 for identical colors', () => {
    expect(apcaLc('#888888', '#888888')).toBeLessThan(1);
  });

  it('accepts oklch strings (what the engine produces)', () => {
    expect(apcaLc('oklch(1 0 0)', 'oklch(0.12 0 0)')).toBeGreaterThan(75);
  });
});
