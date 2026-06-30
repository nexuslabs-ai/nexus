import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Input } from '../input';

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Use Sheet for deterministic edge panels such as settings, filters, navigation, or supporting forms tied to a viewport side.',
          'Use Dialog for centered modal tasks, AlertDialog for choice-forcing confirmations, and Drawer for gesture-driven mobile-style panels with drag-to-dismiss behavior.',
        ].join(' '),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

// ============================================
// BASIC STORIES (one per side variant)
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            This panel slides in from the right edge by default.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Sheet content goes here. You can add any content you need.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            A left sheet is the canonical home for a slide-in nav drawer.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Top</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Announcement</SheetTitle>
          <SheetDescription>
            A top sheet drops down across the full width of the viewport.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick actions</SheetTitle>
          <SheetDescription>
            A bottom sheet rises from the bottom edge — a common mobile pattern.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Edit Profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Update your profile here, then save when you are done.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="nx:grid nx:gap-4">
          <div className="nx:grid nx:gap-1.5">
            <label htmlFor="sheet-name" className="nx:typography-label-default">
              Name
            </label>
            <Input id="sheet-name" defaultValue="John Doe" />
          </div>
          <div className="nx:grid nx:gap-1.5">
            <label
              htmlFor="sheet-username"
              className="nx:typography-label-default"
            >
              Username
            </label>
            <Input id="sheet-username" defaultValue="@johndoe" />
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ScrollableContent: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Terms & Conditions</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Terms of Service</SheetTitle>
          <SheetDescription>
            Please read the following terms carefully.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="nx:space-y-4 nx:typography-label-default nx:text-foreground">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Decline</Button>
          </SheetClose>
          <Button>Accept</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ViewportUnitContract: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="nx:capitalize">
              Open {side} viewport sheet
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="nx:capitalize">
                {side} viewport sheet
              </SheetTitle>
              <SheetDescription>
                The sheet uses stable visible viewport units for this edge.
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="nx:space-y-3 nx:typography-body-default nx:text-foreground">
              {Array.from({ length: 8 }).map((_, i) => (
                <p key={i}>
                  Representative sheet content for checking the viewport sizing
                  contract without relying on a device-specific visual test.
                </p>
              ))}
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button>Close {side} viewport sheet</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a narrow/mobile viewport, long SheetBody content should scroll while the frame and close button stay fixed to the selected edge.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const side of SIDES) {
      await userEvent.click(
        canvas.getByRole('button', { name: `Open ${side} viewport sheet` })
      );

      const sheet = await within(document.body).findByRole('dialog');
      await expect(sheet).toHaveAttribute('data-side', side);
      await expect(sheet).toHaveClass('nx:overflow-hidden');

      const body = sheet.querySelector('[data-slot="sheet-body"]');
      const closeButton = within(sheet).getByRole('button', {
        name: `Close ${side} viewport sheet`,
      });
      await expect(body).toHaveClass('nx:min-h-0', 'nx:overflow-y-auto');
      expect(body).not.toContainElement(closeButton);

      if (side === 'left' || side === 'right') {
        await expect(sheet).toHaveClass('nx:h-svh');
      } else {
        await expect(sheet).toHaveClass('nx:max-h-svh');
      }

      await userEvent.click(
        within(sheet).getByRole('button', {
          name: `Close ${side} viewport sheet`,
        })
      );
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeNull();
      });
    }
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Interaction Test</SheetTitle>
          <SheetDescription>Testing open and close behavior.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Dismiss</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Sheet should not be open initially.
    const trigger = canvas.getByRole('button', { name: 'Open Sheet' });
    await expect(trigger).toBeInTheDocument();

    // Open the sheet.
    await userEvent.click(trigger);

    // Content portals to document.body with role="dialog".
    const sheet = await within(document.body).findByRole('dialog');
    await expect(sheet).toBeInTheDocument();
    await expect(sheet).toHaveAttribute('data-slot', 'sheet-content');

    // Title should be visible.
    await expect(
      within(sheet).getByText('Interaction Test')
    ).toBeInTheDocument();

    // Close via the footer button (the X button also has "Close" sr-only text).
    await userEvent.click(
      within(sheet).getByRole('button', { name: 'Dismiss' })
    );

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keyboard Test</SheetTitle>
          <SheetDescription>Testing keyboard interactions.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Sheet' });
    await userEvent.click(trigger);

    const sheet = await within(document.body).findByRole('dialog');
    await expect(sheet).toBeInTheDocument();

    // Escape closes the sheet.
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Data Attributes</SheetTitle>
          <SheetDescription>Testing data-slot attributes.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="nx:typography-body-default">Content here</p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open Sheet' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('dialog');

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="sheet-overlay"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-header"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-title"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-description"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-body"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-footer"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="sheet-close-button"]')
      ).toBeInTheDocument();
    });

    // The active side is reflected on the content for CSS / test hooks.
    await expect(
      document.querySelector('[data-slot="sheet-content"]')
    ).toHaveAttribute('data-side', 'right');
    await expect(
      document.querySelector('[data-slot="sheet-content"]')
    ).toHaveClass('nx:h-svh', 'nx:overflow-hidden');

    await expect(
      document.querySelector('[data-slot="sheet-body"]')
    ).toHaveClass('nx:min-h-0', 'nx:overflow-y-auto');

    await expect(
      document.querySelector('[data-slot="sheet-close-button"]')
    ).toHaveClass(
      'nx:right-6',
      'nx:top-6',
      'nx:after:absolute',
      'nx:after:-inset-2.5',
      'nx:lg:after:hidden'
    );

    await userEvent.keyboard('{Escape}');
  },
};

// ============================================
// ALL VARIANTS GRID (every side)
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-wrap nx:gap-4">
      {SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="nx:capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="nx:capitalize">{side} sheet</SheetTitle>
              <SheetDescription>
                Slides in from the {side} edge.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose asChild>
                <Button>Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// A11Y is tested automatically on ALL stories
// via addon-a11y with test: 'error'
// ============================================
