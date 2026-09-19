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

  // A declared `0.5px` stroke is used as 1px, so the inset must compensate the
  // used width or the target lands at 43px.
  it('adds both used borders back to the inset', () => {
    expect(coarseTouchTargetClassName).toContain(
      '2*max(1px,var(--nx-borderwidth-default))'
    );
  });
});
