import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

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
        <p className="nx:text-sm nx:text-foreground">
          Dialog content goes here. You can add any content you need.
        </p>
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
        <div className="nx:grid nx:gap-4 nx:py-4">
          <div className="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
            <label
              htmlFor="name"
              className="nx:text-right nx:text-sm nx:font-medium"
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
              className="nx:text-right nx:text-sm nx:font-medium"
            >
              Username
            </label>
            <Input
              id="username"
              defaultValue="@johndoe"
              className="nx:col-span-3"
            />
          </div>
        </div>
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
        <p className="nx:text-sm nx:text-foreground">
          You can customize how users close the dialog.
        </p>
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
      <DialogContent className="nx:max-h-[300px] nx:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the following terms carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="nx:space-y-4 nx:text-sm nx:text-foreground">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
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

export const DataAttributesTest: Story = {
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
        <p className="nx:text-sm">Content here</p>
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
    });

    // Close the dialog
    await userEvent.keyboard('{Escape}');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: (_args) => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
        <h3 className="nx:text-foreground nx:mb-4 nx:text-sm nx:font-medium">
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
