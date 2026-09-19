import { describe, expect, it } from 'vitest';

import {
  coarseTouchTargetClassName,
  coarseTouchTargetProbeClassName,
} from './touch-target';

describe('coarseTouchTargetClassName', () => {
  it('keeps the probe twin in sync with the gated class', () => {
    expect(coarseTouchTargetClassName.split('pointer-coarse:').join('')).toBe(
      coarseTouchTargetProbeClassName
    );
  });

  it('adds both borders back to the inset', () => {
    expect(coarseTouchTargetClassName).toContain(
      '2*var(--nx-borderwidth-default)'
    );
  });
});
