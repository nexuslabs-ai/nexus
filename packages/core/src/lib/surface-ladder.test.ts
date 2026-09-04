import { describe, expect, it } from 'vitest';

import {
  DARK_SURFACE_STEPS,
  LIGHT_SURFACE_STEPS,
  SURFACE_TOKENS,
  type SurfaceSteps,
} from './surface-ladder';

const EXPECTED_LIGHT_SURFACE_STEPS = {
  background: 0,
  'background-hover': -0.27,
  'background-active': -1.38,
  muted: -0.54,
  'muted-extralight': -0.216,
  container: 0,
  'container-hover': -0.54,
  'container-active': -0.98,
  popover: 0,
  'popover-hover': -0.98,
  'popover-active': -0.98,
  'control-background': -1.38,
  'control-background-hover': -2.32,
  'nav-background': -0.54,
  'nav-item-hover': -1.38,
  'nav-item-active': -1.38,
  'nav-border': -1.38,
  disabled: -0.98,
  'border-active': -6.07,
} satisfies SurfaceSteps;

const EXPECTED_DARK_SURFACE_STEPS = {
  background: 0,
  'background-hover': 1.6,
  'background-active': 1.6,
  muted: 1.6,
  'muted-extralight': 0.64,
  container: 1.6,
  'container-hover': 3.2,
  'container-active': 1.6,
  popover: 3.2,
  'popover-hover': 4.8,
  'popover-active': 3.2,
  'control-background': 3.2,
  'control-background-hover': 4.8,
  'nav-background': 1.6,
  'nav-item-hover': 3.2,
  'nav-item-active': 3.2,
  'nav-border': 3.2,
  disabled: 1.6,
  'border-active': 9.68,
} satisfies SurfaceSteps;

function expectStepsToMatch(actual: SurfaceSteps, expected: SurfaceSteps) {
  for (const token of SURFACE_TOKENS) {
    expect(actual[token], token).toBeCloseTo(expected[token], 4);
  }
}

describe('surface ladder', () => {
  it('keeps the light surface steps at their expected shade anchors', () => {
    expectStepsToMatch(LIGHT_SURFACE_STEPS, EXPECTED_LIGHT_SURFACE_STEPS);
  });

  it('keeps the dark ladder at its expected raw steps', () => {
    expectStepsToMatch(DARK_SURFACE_STEPS, EXPECTED_DARK_SURFACE_STEPS);
  });

  // `Bubble`'s muted variant borrows `popover-active` as its hover, because
  // `muted` has no `-hover` rung. `components.md` justifies that borrow by it
  // being exactly *one* rung above `muted` in both regimes. The tables above
  // pin today's numbers, so they move with any re-baseline; this pins the
  // relation instead.
  it('keeps popover-active exactly one rung above muted in both regimes', () => {
    // Elevation runs in opposite directions: light surfaces rise by darkening,
    // dark surfaces by lightening.
    for (const [regime, steps, towardsElevated] of [
      ['light', LIGHT_SURFACE_STEPS, -1],
      ['dark', DARK_SURFACE_STEPS, 1],
    ] as const) {
      const rise = (steps['popover-active'] - steps.muted) * towardsElevated;

      expect(
        rise,
        `${regime}: popover-active must sit one rung above muted`
      ).toBeGreaterThan(0.1);

      const low = Math.min(steps.muted, steps['popover-active']);
      const high = Math.max(steps.muted, steps['popover-active']);
      const between = SURFACE_TOKENS.filter(
        (token) => steps[token] > low && steps[token] < high
      );

      expect(
        between,
        `${regime}: rungs between muted and popover-active`
      ).toEqual([]);
    }
  });

  // The borrow only holds while `muted` has no hover rung of its own; a real
  // `muted-hover` token must repoint `Bubble` rather than sit unused.
  it('has no muted-hover rung for the borrow to shadow', () => {
    expect(SURFACE_TOKENS as readonly string[]).not.toContain('muted-hover');
  });
});
