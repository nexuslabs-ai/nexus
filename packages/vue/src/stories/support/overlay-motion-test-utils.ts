import { expect, waitFor, waitForElementToBeRemoved } from 'storybook/test';

/**
 * Asserts `surface` opened just below `trigger`, under it. A trigger whose ref
 * never reached the DOM leaves the content unplaced, off the top of the page.
 */
export async function expectPlacedBelow(
  surface: Element | null,
  trigger: Element
): Promise<void> {
  await expect(surface).toBeInTheDocument();
  if (!surface) return;
  await waitFor(() => {
    const content = surface.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    expect(content.top).toBeGreaterThanOrEqual(anchor.bottom);
    expect(content.top - anchor.bottom).toBeLessThan(24);
    expect(content.left).toBeLessThan(anchor.right);
    expect(content.right).toBeGreaterThan(anchor.left);
  });
}

export async function expectInterruptibleOverlayMotion(
  surface: Element | null,
  // audit-class-refs-ignore-next-line: a retired class, asserted absent.
  { oldOpenAnimationClass = 'nx:data-[state=open]:animate-in' } = {}
): Promise<void> {
  await expect(surface).toBeInTheDocument();
  await expect(surface).not.toHaveClass(oldOpenAnimationClass);
  await expect(surface).toHaveClass(
    'nx:data-[state=closed]:animate-overlay-presence-exit'
  );
}

export async function expectExitBeforeUnmount(
  surface: Element | null
): Promise<void> {
  await expect(surface).toBeInTheDocument();
  await waitForElementToBeRemoved(surface);
}
