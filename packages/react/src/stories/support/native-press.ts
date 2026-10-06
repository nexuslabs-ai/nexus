/// <reference types="vite/client" />

import { expect } from 'storybook/test';

declare module 'vitest/browser' {
  interface BrowserCommands {
    measureButtonPress(selector: string): Promise<{
      active: boolean;
      scale: string;
      width: number;
      height: number;
    }>;
  }
}

/** Native pointer checks run in Vitest's Playwright provider, not the docs canvas. */
export async function expectNativePress(selector: string, scale: number) {
  if (import.meta.env.MODE !== 'test') return;
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Press target missing: ${selector}`);
  const before = element.getBoundingClientRect();
  const { commands } = await import('vitest/browser');
  const pressed = await commands.measureButtonPress(selector);
  await expect(pressed.active).toBe(true);
  await expect(pressed.scale).toBe(String(scale));
  await expect(pressed.width).toBeCloseTo(before.width * scale, 2);
  await expect(pressed.height).toBeCloseTo(before.height * scale, 2);
}
