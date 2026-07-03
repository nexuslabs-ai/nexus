import { expect } from 'storybook/test';

const STAGGER_CONTAINER_CLASS = 'nx:motion-stagger-items';
const STAGGER_ITEM_CLASS = 'nx:animate-stagger-item-enter';
const STAGGER_REDUCED_MOTION_CLASS = 'nx:motion-reduce:animate-none';

function animationDelayMs(element: Element) {
  const delay = getComputedStyle(element).animationDelay.split(',')[0]?.trim();

  if (!delay) return 0;
  if (delay.endsWith('ms')) return Number.parseFloat(delay);
  if (delay.endsWith('s')) return Number.parseFloat(delay) * 1000;

  return Number.parseFloat(delay) || 0;
}

async function expectStaggeredItemMotion(container: Element, items: Element[]) {
  const firstItem = items[0];
  const secondItem = items[1];

  await expect(container).toHaveClass(STAGGER_CONTAINER_CLASS);
  expect(items.length).toBeGreaterThan(1);

  if (!firstItem || !secondItem) {
    throw new Error('Expected at least two staggered items.');
  }

  await expect(firstItem).toHaveClass(STAGGER_ITEM_CLASS);
  await expect(firstItem).toHaveClass(STAGGER_REDUCED_MOTION_CLASS);
  expect(animationDelayMs(secondItem)).toBeGreaterThan(
    animationDelayMs(firstItem)
  );
}

export { expectStaggeredItemMotion };
