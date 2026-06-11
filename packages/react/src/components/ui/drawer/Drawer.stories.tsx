import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';

import {
  Drawer,
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
        <p className="nx:px-4 nx:text-sm nx:text-foreground">
          Drawer content goes here. On touch devices it can be dragged to
          dismiss.
        </p>
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

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
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

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
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
