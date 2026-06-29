import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';

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
          'Use AlertDialog for consequential confirmations where the user must explicitly confirm or cancel before continuing.',
          'Use Dialog for lower-stakes modal tasks, Sheet for deterministic edge panels such as settings or filters, and Drawer for gesture-driven mobile-style panels with drag-to-dismiss behavior.',
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

export const WithBodyContent: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Remove payment method</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
          <AlertDialogDescription>
            This payment method will be removed from the workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody className="nx:grid nx:gap-2">
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:p-3 nx:typography-body-default">
            Future invoices will use the fallback payment method.
          </div>
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:p-3 nx:typography-body-default">
            Active subscriptions continue until the next billing cycle.
          </div>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">
            Remove method
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', {
      name: 'Remove payment method',
    });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog).toHaveTextContent(
      'Future invoices will use the fallback payment method.'
    );

    await expect(dialog).toHaveClass('nx:py-6', 'nx:gap-4');
    await expect(dialog).not.toHaveClass('nx:p-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-header"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-body"]')
    ).toHaveClass('nx:px-6');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const Centered: Story = {
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

export const OpenConfirm: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
          <AlertDialogDescription>
            Confirming will apply your changes.
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

    // Dialog should not be visible initially.
    const trigger = canvas.getByRole('button', { name: 'Show dialog' });
    await expect(trigger).toBeInTheDocument();

    // Open the alert dialog.
    await userEvent.click(trigger);

    // Content should now be visible in the document body with the alertdialog role.
    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAttribute('data-slot', 'alert-dialog-content');

    // Confirming via the action closes the dialog.
    const continueButton = within(dialog).getByRole('button', {
      name: 'Continue',
    });
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const EscapeCancels: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Pressing Escape dismisses this dialog without confirming.
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

    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog).toBeInTheDocument();

    // Escape dismisses an alert dialog (unlike an outside click, which does not).
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const CancelCloses: Story = {
  render: (_args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard draft?</AlertDialogTitle>
          <AlertDialogDescription>
            Cancel closes the dialog without confirming the action.
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

    const trigger = canvas.getByRole('button', { name: 'Show dialog' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('alertdialog');
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

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

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
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
