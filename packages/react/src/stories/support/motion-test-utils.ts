import { expect } from 'storybook/test';

function animationDelayMs(element: Element) {
  const delay = getComputedStyle(element).animationDelay.split(',')[0]?.trim();

  if (!delay) return 0;
  if (delay.endsWith('ms')) return Number.parseFloat(delay);
  if (delay.endsWith('s')) return Number.parseFloat(delay) * 1000;

  return Number.parseFloat(delay) || 0;
}

async function expectImmediateItemMotion(container: Element, items: Element[]) {
  await expect(container).toBeInTheDocument();
  expect(items.length).toBeGreaterThan(1);

  for (const item of items) {
    await expect(item).toBeVisible();
    expect(animationDelayMs(item)).toBe(0);
  }
}

export { expectImmediateItemMotion };
