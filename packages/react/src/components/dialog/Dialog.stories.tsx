import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Input } from '../input';

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Use Dialog for general modal tasks that temporarily interrupt the page and can be dismissed without forcing a choice.',
          'Use AlertDialog when the user must explicitly confirm or cancel a consequential action, Sheet for deterministic edge panels such as settings or filters, and Drawer for gesture-driven mobile-style panels with drag-to-dismiss behavior.',
        ].join(' '),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

// #593 — the close-button touch hit area is gated by pointer modality (coarse),
// not by viewport, so it survives on large touchscreens.
export const CloseHitAreaModalityGated: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hit area</DialogTitle>
          <DialogDescription>
            The close hit area is gated by coarse pointer, not viewport.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const close = document.body.querySelector(
      '[data-slot="dialog-close-button"]'
    );
    await expect(close).not.toHaveClass('nx:lg:after:hidden');
    await expect(close).toHaveClass('nx:pointer-coarse:after:-inset-2.5');
  },
};

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Dialog content goes here. You can add any content you need.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithDescription: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:grid nx:gap-4 nx:py-4">
          <div className="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
            <label
              htmlFor="name"
              className="nx:text-right nx:typography-label-default"
            >
              Name
            </label>
            <Input
              id="name"
              defaultValue="John Doe"
              className="nx:col-span-3"
            />
          </div>
          <div className="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
            <label
              htmlFor="username"
              className="nx:text-right nx:typography-label-default"
            >
              Username
            </label>
            <Input
              id="username"
              defaultValue="@johndoe"
              className="nx:col-span-3"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NoCloseButton: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No Close Button</DialogTitle>
          <DialogDescription>
            This dialog has no close button in the corner. Use the buttons below
            to close.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const CustomCloseButton: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Custom Close</DialogTitle>
          <DialogDescription>
            This dialog uses a custom close button in the footer.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="nx:typography-body-default nx:text-foreground">
            You can customize how users close the dialog.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Dismiss</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ScrollableContent: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms & Conditions</Button>
      </DialogTrigger>
      <DialogContent className="nx:max-h-[300px]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the following terms carefully.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4 nx:typography-label-default nx:text-foreground">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ViewportBoundContent: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open viewport-bound dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Viewport bounded dialog</DialogTitle>
          <DialogDescription>
            Long modal content stays within the stable visible viewport.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4 nx:typography-label-default nx:text-foreground">
          {Array.from({ length: 16 }).map((_, i) => (
            <p key={i}>
              A representative row of dialog content that makes the modal tall
              enough to exercise its viewport max-height contract.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close viewport-bound dialog</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a narrow/mobile viewport, long DialogBody content should scroll while the close button remains pinned in the content frame.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open viewport-bound dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Viewport bounded dialog',
    });

    await expect(dialog).toHaveClass(
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden'
    );

    const body = document.querySelector('[data-slot="dialog-body"]');
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(body).toHaveAttribute('tabindex', '0');
    await expect(body).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    expect(body).not.toContainElement(closeButton);

    await userEvent.click(
      within(dialog).getByRole('button', {
        name: 'Close viewport-bound dialog',
      })
    );
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const PropDrivenContent: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open invite dialog</Button>
      </DialogTrigger>
      <DialogContent
        title="Invite teammate"
        description="Send an invitation to a teammate and assign their first workspace role."
        body={
          <p className="nx:typography-body-default nx:text-foreground">
            The invitation expires in seven days and can be revoked from team
            settings.
          </p>
        }
      >
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open invite dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Invite teammate',
    });
    await expect(dialog).toHaveAttribute('data-variant', 'default');
    await expect(dialog).toHaveAttribute('data-orientation', 'horizontal');

    await expect(
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveAttribute('data-variant', 'default');
    await expect(
      document.querySelector('[data-slot="dialog-title"]')
    ).toHaveTextContent('Invite teammate');
    await expect(
      document.querySelector('[data-slot="dialog-description"]')
    ).toHaveTextContent('Send an invitation to a teammate');
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveClass('nx:px-6');
    await expect(dialog).toHaveTextContent(
      'The invitation expires in seven days'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const ComposedHeaderPrecedence: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open precedence dialog</Button>
      </DialogTrigger>
      <DialogContent
        title="Prop title"
        description="Prop description"
        body="Prop body"
      >
        <>
          <DialogHeader>
            <DialogTitle>Composed title</DialogTitle>
            <DialogDescription>
              The composed header takes precedence over generated title props.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="nx:typography-body-default">
              The composed body takes precedence over the body prop.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open precedence dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Composed title',
    });
    const titles = document.querySelectorAll('[data-slot="dialog-title"]');
    const bodies = document.querySelectorAll('[data-slot="dialog-body"]');

    await expect(titles).toHaveLength(1);
    await expect(titles[0]).toHaveTextContent('Composed title');
    await expect(bodies).toHaveLength(1);
    await expect(dialog).not.toHaveTextContent('Prop title');
    await expect(dialog).not.toHaveTextContent('Prop description');
    await expect(dialog).not.toHaveTextContent('Prop body');
    await expect(dialog).toHaveTextContent(
      'The composed body takes precedence over the body prop.'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const ComposedUsageCompatibility: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open composed dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Composed API</DialogTitle>
          <DialogDescription>
            Existing composed Dialog usage continues to render without prop
            shorthands.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="nx:typography-body-default">
            This body is authored with DialogBody.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open composed dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Composed API',
    });
    await expect(dialog).toHaveTextContent(
      'Existing composed Dialog usage continues to render'
    );
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveTextContent('This body is authored with DialogBody.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const OpenCloseInteraction: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interaction Test</DialogTitle>
          <DialogDescription>
            Testing open and close behavior.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Dismiss</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Dialog should not be visible initially
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await expect(trigger).toBeInTheDocument();

    // Open the dialog
    await userEvent.click(trigger);

    // Dialog content should now be visible (in document body)
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAttribute('data-slot', 'dialog-content');

    // Title should be visible
    const title = within(dialog).getByText('Interaction Test');
    await expect(title).toBeInTheDocument();

    // Close the dialog using the footer button (not the X button which also has "Close" sr-only text)
    const dismissButton = within(dialog).getByRole('button', {
      name: 'Dismiss',
    });
    await userEvent.click(dismissButton);

    // Wait for dialog to be removed from DOM
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Test</DialogTitle>
          <DialogDescription>Testing keyboard interactions.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog by clicking the trigger
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(trigger);

    // Dialog should be open
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();

    // Close with Escape key
    await userEvent.keyboard('{Escape}');

    // Wait for dialog to be removed from DOM
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Data Attributes</DialogTitle>
          <DialogDescription>Testing data-slot attributes.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="nx:typography-body-default">Content here</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dialog
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    await within(document.body).findByRole('dialog');

    // Check data-slot attributes using querySelector on document body
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="dialog-overlay"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-header"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-title"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-description"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-footer"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-close-button"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-body"]')
      ).toBeInTheDocument();
    });

    const content = document.querySelector('[data-slot="dialog-content"]');
    await expect(content).toHaveAttribute('data-variant', 'default');
    await expect(content).toHaveAttribute('data-orientation', 'horizontal');
    await expect(content).toHaveClass(
      'nx:py-6',
      'nx:gap-4',
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden'
    );
    await expect(content).not.toHaveClass('nx:p-6');
    await expect(
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveAttribute('data-variant', 'default');
    await expect(
      document.querySelector('[data-slot="dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="dialog-footer"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveClass(
      'nx:px-6',
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveAttribute('tabindex', '0');

    // Close the dialog
    await userEvent.keyboard('{Escape}');
  },
};

export const CloseButtonFocus: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open focus dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close button focus</DialogTitle>
          <DialogDescription>
            The close button keeps the canonical focus outline.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open focus dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog');
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });

    await waitFor(() => expect(closeButton).toHaveFocus());
    await expect(closeButton).toHaveClass(
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:outline-offset-(--focus-offset)'
    );
    await expect(closeButton).toHaveClass(
      'nx:right-6',
      'nx:top-6',
      'nx:pointer-coarse:after:absolute',
      'nx:pointer-coarse:after:-inset-2.5'
    );
    await expect(closeButton).toHaveClass(
      'nx:hover:bg-container-hover',
      'nx:focus-visible:bg-container-hover'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const ReducedMotionFallbacks: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open reduced-motion dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reduced motion contract</DialogTitle>
          <DialogDescription>
            Overlay motion should be disabled when reduced motion is preferred.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open reduced-motion dialog' })
    );

    try {
      const body = within(document.body);
      const dialog = await body.findByRole('dialog');
      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      const closeButton = within(dialog).getByRole('button', {
        name: 'Close',
      });

      await expectInterruptibleOverlayMotion(overlay);
      await expect(overlay).toHaveClass('nx:transition-opacity');
      await expectInterruptibleOverlayMotion(dialog);
      await expect(dialog).toHaveClass('nx:transition-[opacity,scale]');
      await expect(closeButton).toHaveClass('nx:motion-reduce:transition-none');

      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Done' })
      );
      await expectExitBeforeUnmount(document.querySelector('[role="dialog"]'));
    } finally {
      if (document.querySelector('[role="dialog"]')) {
        await userEvent.keyboard('{Escape}');
      }
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeNull();
      });
    }
  },
};

// ============================================
// NESTED OVERLAY STACKING (z-index layering)
// ============================================

/**
 * Verifies the z-index layering contract: a DropdownMenu opened inside a Dialog
 * must render *above* the dialog (popover z=70 > modal z=50) so the menu stays
 * usable when nested. See issue #91.
 */
export const NestedOverlayStacking: Story = {
  render: (_args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open stacking dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nested overlay stacking</DialogTitle>
          <DialogDescription>
            The dropdown below must appear above this dialog.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Open the dialog (modal layer).
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open stacking dialog' })
    );
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toHaveClass('nx:z-modal');

    // Open the dropdown nested inside the dialog (popover layer).
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Open menu' })
    );
    const menu = await body.findByRole('menu');
    await expect(menu).toHaveClass('nx:z-popover');
    await expect(
      within(menu).getByRole('menuitem', { name: 'Profile' })
    ).toBeInTheDocument();

    // The popover layer must stack above the modal layer.
    const zIndexOf = (el: Element) => Number(getComputedStyle(el).zIndex);
    await expect(zIndexOf(menu)).toBeGreaterThan(zIndexOf(dialog));

    // Cleanup: close the menu, then the dialog.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Dialog Trigger Variants
        </h3>
        <div className="nx:flex nx:gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Default Trigger</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Default Button Trigger</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Outline Trigger</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Outline Button Trigger</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Secondary Trigger</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Secondary Button Trigger</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Dialog with Footer Actions
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open with Actions</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to proceed with this action?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Dialog without Close Button
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open without X</Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>No Close Button</DialogTitle>
              <DialogDescription>
                Close this dialog using the button below.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
