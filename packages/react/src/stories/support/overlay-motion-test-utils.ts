import { expect, waitForElementToBeRemoved } from 'storybook/test';

export async function expectInterruptibleOverlayMotion(
  surface: Element | null,
  oldOpenAnimationClass = 'nx:data-[state=open]:animate-in'
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
