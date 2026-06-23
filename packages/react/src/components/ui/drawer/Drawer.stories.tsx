import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconX } from '@/lib/icons';

import { Button } from '../button';

import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Use Drawer for gesture-driven mobile-style panels, especially bottom drawers that can be dragged to dismiss.',
          'Use Sheet for deterministic side panels, Dialog for centered modal tasks, and AlertDialog for choice-forcing confirmations.',
        ].join(' '),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const DIRECTIONS = ['top', 'right', 'bottom', 'left'] as const;
const SCROLLABLE_ITEMS = Array.from({ length: 18 }, (_, index) => ({
  title: `Audit item ${index + 1}`,
  description:
    'A representative row that keeps the drawer body scrollable while actions remain available.',
}));

const waitForDrawerToClose = async () => {
  await waitFor(
    () => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    },
    { timeout: 3000 }
  );
};

// ============================================
// BASIC STORIES
// ============================================

// A bottom drawer (vaul's default direction) with the drag handle.
export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>
            Drag down or press Escape to dismiss this drawer.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Drawer content goes here. On touch devices it can be dragged to
            dismiss.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// A right-edge drawer — the side-panel direction.
export const Right: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open Right</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            A right drawer slides in from the trailing edge.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// A longer body keeps actions visible while only the content region scrolls.
export const ScrollableContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Review changes</DrawerTitle>
          <DrawerDescription>
            Long drawers keep the action footer reachable while the body
            scrolls.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody
          data-testid="drawer-scroll-area"
          tabIndex={0}
          className="nx:max-h-[45svh] nx:overflow-y-auto nx:pb-2 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
        >
          <ul className="nx:flex nx:flex-col nx:gap-3">
            {SCROLLABLE_ITEMS.map((item) => (
              <li
                key={item.title}
                className="nx:rounded-md nx:border nx:border-border-default nx:bg-background nx:p-4"
              >
                <p className="nx:typography-label-default nx:text-foreground">
                  {item.title}
                </p>
                <p className="nx:typography-body-default nx:text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </DrawerBody>
        <DrawerFooter className="nx:border-t nx:border-border-default">
          <Button>Save changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Details' }));

    const drawer = await within(document.body).findByRole('dialog');
    const scrollArea = within(drawer).getByTestId('drawer-scroll-area');

    await waitFor(() => {
      expect(scrollArea.scrollHeight).toBeGreaterThan(scrollArea.clientHeight);
    });
    await expect(
      within(drawer).getByRole('button', { name: 'Save changes' })
    ).toBeVisible();

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close' })
    );

    await waitForDrawerToClose();
  },
};

// Header actions can provide an explicit close affordance without changing API.
export const WithHeaderActions: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open Actions</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="nx:flex-row nx:items-start nx:justify-between nx:gap-4">
          <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-1.5">
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>
              Refine the visible records without leaving the current view.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close drawer">
              <IconX aria-hidden="true" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <DrawerBody className="nx:pb-6 nx:typography-body-default nx:text-foreground">
          Header actions are regular composition: consumers place controls in
          the header and keep Vaul responsible for dismissal.
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Actions' }));

    const drawer = await within(document.body).findByRole('dialog');
    const closeButton = within(drawer).getByRole('button', {
      name: 'Close drawer',
    });

    await expect(closeButton).toBeVisible();
    await userEvent.click(closeButton);

    await waitForDrawerToClose();
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

// Clicking the trigger opens the drawer; the footer button closes it.
export const OpenCloseInteraction: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Interaction Test</DrawerTitle>
          <DrawerDescription>
            Testing open and close behavior.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Dismiss</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    // Content portals to document.body with role="dialog".
    const drawer = await within(document.body).findByRole('dialog');
    await expect(drawer).toHaveAttribute('data-slot', 'drawer-content');
    await expect(
      within(drawer).getByText('Interaction Test')
    ).toBeInTheDocument();

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Dismiss' })
    );

    await waitForDrawerToClose();
  },
};

// Escape closes the drawer.
export const KeyboardInteraction: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Keyboard Test</DrawerTitle>
          <DrawerDescription>Testing keyboard interactions.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    await waitForDrawerToClose();
  },
};

// data-slot identifies every part of the open drawer.
export const WithDataAttributes: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Data Attributes</DrawerTitle>
          <DrawerDescription>Testing data-slot attributes.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Content here
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('dialog');

    await waitFor(() => {
      for (const slot of [
        'drawer-overlay',
        'drawer-content',
        'drawer-header',
        'drawer-handle',
        'drawer-title',
        'drawer-description',
        'drawer-footer',
      ]) {
        expect(
          document.querySelector(`[data-slot="${slot}"]`)
        ).toBeInTheDocument();
      }
    });

    await userEvent.keyboard('{Escape}');
  },
};

// Every Vaul direction is reflected on content for styling and inspection.
export const DirectionBehavior: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {DIRECTIONS.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline">Open {direction} drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="nx:capitalize">
                {direction} behavior
              </DrawerTitle>
              <DrawerDescription>
                The content exposes the active Vaul direction.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close {direction} drawer</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const direction of DIRECTIONS) {
      await userEvent.click(
        canvas.getByRole('button', { name: `Open ${direction} drawer` })
      );

      const drawer = await within(document.body).findByRole('dialog');
      await expect(drawer).toHaveAttribute(
        'data-vaul-drawer-direction',
        direction
      );

      await userEvent.click(
        within(drawer).getByRole('button', {
          name: `Close ${direction} drawer`,
        })
      );

      await waitForDrawerToClose();
    }
  },
};

// The drag handle is a bottom-drawer affordance only.
export const BottomDragHandleVisibility: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open Bottom Handle</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Bottom drawer</DrawerTitle>
            <DrawerDescription>The handle is visible here.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close bottom handle</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline">Open Right Handle</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Right drawer</DrawerTitle>
            <DrawerDescription>The handle stays hidden here.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close right handle</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open Bottom Handle' })
    );

    let drawer = await within(document.body).findByRole('dialog');
    let handle = drawer.querySelector('[data-slot="drawer-handle"]');

    await expect(handle).toBeVisible();
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close bottom handle' })
    );

    await waitForDrawerToClose();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open Right Handle' })
    );

    drawer = await within(document.body).findByRole('dialog');
    handle = drawer.querySelector('[data-slot="drawer-handle"]');

    await expect(handle).not.toBeVisible();
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close right handle' })
    );

    await waitForDrawerToClose();
  },
};

// ============================================
// ALL VARIANTS GRID (every direction)
// ============================================

// A trigger per direction. Reused by the per-base variant generator; the static
// grid shows the closed triggers (portal content only renders when open).
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {DIRECTIONS.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="nx:capitalize">
              {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="nx:capitalize">
                {direction} drawer
              </DrawerTitle>
              <DrawerDescription>
                Slides in from the {direction} edge.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};
