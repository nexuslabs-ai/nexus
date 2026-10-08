/// <reference types="vite/client" />

import { apcaLc, TIER_THRESHOLDS } from '@nexus_ds/core';
import { expect } from 'storybook/test';

export const PRIMARY_HOVER_BRANDS = ['#000000', '#171717', '#2563eb'] as const;

/**
 * Hovers `control` with a real pointer, then checks its primary fill visibly
 * changed and the `ink` painted on it still clears the APCA UI tier.
 */
export async function expectLegiblePrimaryHover(
  control: HTMLElement,
  ink: () => string
) {
  if (import.meta.env.MODE !== 'test') return;
  const rest = getComputedStyle(control).backgroundColor;
  const { userEvent } = await import('vitest/browser');
  await userEvent.hover(control);
  await Promise.all(
    control
      .getAnimations({ subtree: true })
      .map((animation) => animation.finished)
  );
  const hover = getComputedStyle(control).backgroundColor;
  await expect(hover).not.toBe(rest);
  await expect(apcaLc(ink(), hover)).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  await userEvent.unhover(control);
}
