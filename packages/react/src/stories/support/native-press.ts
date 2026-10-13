/// <reference types="vite/client" />

import { expect } from 'storybook/test';

import { forcePseudoState } from './pseudo-state';

/**
 * Forces the native `:hover` + `:active` press on `selector` and checks the
 * pressed box settles at `scale`. Runs only in Vitest, not the docs canvas.
 */
export async function expectNativePress(selector: string, scale: number) {
  if (import.meta.env.MODE !== 'test') return;
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Press target missing: ${selector}`);
  const before = element.getBoundingClientRect();
  await forcePseudoState(element, ['hover', 'active']);
  try {
    const pressed = element.getBoundingClientRect();
    await expect(element.matches(':active')).toBe(true);
    await expect(getComputedStyle(element).scale).toBe(String(scale));
    await expect(pressed.width).toBeCloseTo(before.width * scale, 2);
    await expect(pressed.height).toBeCloseTo(before.height * scale, 2);
  } finally {
    await forcePseudoState(element, []);
  }
}
