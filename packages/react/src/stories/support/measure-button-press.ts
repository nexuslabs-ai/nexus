import type {} from '@vitest/browser-playwright';
import type { BrowserCommand } from 'vitest/node';

/**
 * Playwright-side half of `expectNativePress`: holds a real mouse press on the
 * target, waits for its transitions to settle, then reports the pressed box.
 */
export const measureButtonPress: BrowserCommand<[selector: string]> = async (
  { page, iframe },
  selector
) => {
  const target = iframe.locator(selector);
  await target.hover();
  await page.mouse.down();
  try {
    await target.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      );
    });
    return await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        active: element.matches(':active'),
        scale: getComputedStyle(element).scale,
        width: rect.width,
        height: rect.height,
      };
    });
  } finally {
    await page.mouse.up();
  }
};
