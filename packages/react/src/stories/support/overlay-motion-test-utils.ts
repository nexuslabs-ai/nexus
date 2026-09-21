import { expect, waitForElementToBeRemoved } from 'storybook/test';

type OverlayMotionOptions = {
  closedPresenceClass?: string;
  oldOpenAnimationClass?: string;
};

export async function expectInterruptibleOverlayMotion(
  surface: Element | null,
  {
    closedPresenceClass = 'nx:data-[state=closed]:animate-overlay-presence-exit',
    oldOpenAnimationClass = 'nx:data-[state=open]:animate-in',
  }: OverlayMotionOptions = {}
): Promise<void> {
  await expect(surface).toBeInTheDocument();
  await expect(surface).not.toHaveClass(oldOpenAnimationClass);
  await expect(surface).toHaveClass(closedPresenceClass);
}

export async function expectExitBeforeUnmount(
  surface: Element | null
): Promise<void> {
  await expect(surface).toBeInTheDocument();
  await waitForElementToBeRemoved(surface);
}
