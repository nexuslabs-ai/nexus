import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { expectExitBeforeUnmount } from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'AlertDialog makes the user confirm or cancel before an action with serious results, such as deleting data.',
          'For lower-stakes modal tasks, use Dialog.',
          'For edge panels, use Sheet, or Drawer for drag-to-dismiss.',
        ].join(' '),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently update your
            account settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Destructive: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Confirm a permanent delete with a destructive action button.',
      },
    },
  },
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Delete account' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    const action = within(dialog).getByRole('button', { name: 'Delete' });
    await expect(action).toHaveAttribute('data-variant', 'destructive');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const ViewportBoundContent: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Show viewport alert</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Viewport bounded alert dialog</AlertDialogTitle>
          <AlertDialogDescription>
            Consequential confirmations share the Dialog-family viewport
            boundary.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody className="nx:space-y-3 nx:typography-body-default nx:text-foreground">
          {Array.from({ length: 14 }).map((_, i) => (
            <p key={i}>
              Representative alert dialog detail that makes the body tall enough
              to exercise its stable viewport max-height contract.
            </p>
          ))}
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel viewport alert</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a narrow viewport, long AlertDialogBody content scrolls inside the visible screen.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show viewport alert' })
    );

    const dialog = await within(document.body).findByRole('alertdialog', {
      name: 'Viewport bounded alert dialog',
    });
    await expect(dialog).toHaveClass(
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden',
      'nx:py-6',
      'nx:gap-4'
    );
    await expect(dialog).not.toHaveClass('nx:p-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-header"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-body"]')
    ).toHaveClass(
      'nx:px-6',
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    await expect(
      document.querySelector('[data-slot="alert-dialog-body"]')
    ).toHaveAttribute('tabindex', '0');

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel viewport alert' })
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const Centered: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Center the header and stack full-width actions with `variant="center"`.',
      },
    },
  },
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Show centered dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent variant="center">
        <AlertDialogHeader>
          <AlertDialogTitle>Dialog Title</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to your profile here. Click save when you are done.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Action</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', {
      name: 'Show centered dialog',
    });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog).toHaveAttribute('data-variant', 'center');
    await expect(dialog).toHaveAttribute('data-orientation', 'vertical');
    await expect(dialog.className).toContain('nx:max-w-xs');

    const header = document.querySelector('[data-slot="alert-dialog-header"]');
    const footer = document.querySelector('[data-slot="alert-dialog-footer"]');
    await expect(header).toHaveAttribute('data-variant', 'center');
    await expect(footer).toHaveAttribute('data-orientation', 'vertical');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

// ============================================
// INTERACTION TESTS
// ============================================

export const FocusManagement: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show focus dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive project?</AlertDialogTitle>
          <AlertDialogDescription>
            Archiving hides this project from the default workspace views.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', {
      name: 'Show focus dialog',
    });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' });

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    await userEvent.click(cancelButton);

    await expectExitBeforeUnmount(dialog);
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  },
};

export const OverlayDoesNotDismiss: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keep dialog open?</AlertDialogTitle>
          <AlertDialogDescription>
            Clicking the overlay should not dismiss an alert dialog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const onOpenChange = args.onOpenChange;

    const trigger = canvas.getByRole('button', { name: 'Show dialog' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(onOpenChange).toHaveBeenCalledWith(true);

    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]'
    );
    await expect(overlay).toBeInTheDocument();
    if (!(overlay instanceof HTMLElement)) {
      throw new Error('Expected alert dialog overlay to be rendered.');
    }

    await userEvent.click(overlay);
    await expect(dialog).toBeInTheDocument();
    await expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Data attributes</AlertDialogTitle>
          <AlertDialogDescription>
            Testing data-slot attributes on every part.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the alert dialog.
    const trigger = canvas.getByRole('button', { name: 'Show dialog' });
    await userEvent.click(trigger);

    await within(document.body).findByRole('alertdialog');

    // Every wrapped part carries its data-slot hook.
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-overlay"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-header"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-title"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-description"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-footer"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="alert-dialog-cancel"]')
      ).toBeInTheDocument();
    });

    const content = document.querySelector(
      '[data-slot="alert-dialog-content"]'
    );
    await expect(content).toHaveAttribute('data-variant', 'default');
    await expect(content).toHaveAttribute('data-orientation', 'horizontal');

    const header = document.querySelector('[data-slot="alert-dialog-header"]');
    await expect(header).toHaveAttribute('data-variant', 'default');

    const footer = document.querySelector('[data-slot="alert-dialog-footer"]');
    await expect(footer).toHaveAttribute('data-orientation', 'horizontal');

    // The cancel/action controls expose their effective default button variants.
    const cancel = document.querySelector('[data-slot="alert-dialog-cancel"]');
    await expect(cancel).toBeInTheDocument();
    await expect(cancel).toHaveAttribute('data-variant', 'outline');

    const action = document.querySelector('[data-slot="alert-dialog-action"]');
    await expect(action).toBeInTheDocument();
    await expect(action).toHaveAttribute('data-variant', 'default');

    // Cleanup.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
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
          Confirm (primary action)
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Show dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Destructive action
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your account and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Centered action stack
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Show centered dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent variant="center">
            <AlertDialogHeader>
              <AlertDialogTitle>Dialog Title</AlertDialogTitle>
              <AlertDialogDescription>
                Make changes to your profile here. Click save when you are done.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Action
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
