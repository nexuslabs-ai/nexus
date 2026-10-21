import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';

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
} from '.';

const meta = {
  title: 'Components/Dialog',
  parameters: {
    docs: {
      description: {
        component:
          'Dialog opens a modal for a task that interrupts the page. The user can dismiss it without making a choice. It renders into `document.body`, traps focus, and returns focus to the trigger when it closes.',
      },
    },
  },
  component: Dialog,
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogBody,
      DialogClose,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile, then save.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p class="nx:m-0">Your changes apply to every workspace.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
            <DialogClose as-child><Button>Save changes</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogBody,
      DialogClose,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile, then save.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p class="nx:m-0">Your changes apply to every workspace.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
            <DialogClose as-child><Button>Save changes</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

// The dialog renders into document.body, outside the story canvas.
const page = within(document.body);

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Edit profile' })
  );
  return page.findByRole('dialog', { name: 'Edit profile' });
}

async function expectClosed() {
  await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
}

export const OpenCloseInteraction: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit profile',
    });
    const dialog = await openDialog(canvasElement);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog).toHaveAccessibleDescription(
      'Make changes to your profile, then save.'
    );

    await userEvent.click(page.getByRole('button', { name: 'Save changes' }));
    await expectClosed();
    await expect(trigger).toHaveFocus();
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);

    await expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard('{Escape}');
    await expectClosed();
  },
};

export const ExitTransition: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);

    await userEvent.keyboard('{Escape}');
    // Reka keeps the dialog mounted in its closed state until the exit
    // animation ends.
    await expect(dialog).toHaveAttribute('data-state', 'closed');
    await expectClosed();
  },
};

export const OverlayClick: Story = {
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]'
    );

    await userEvent.click(overlay!);
    await expectClosed();
  },
};

export const CloseButton: Story = {
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);

    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await expectClosed();
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);

    await expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
    await expect(dialog).toHaveAttribute('data-state', 'open');
    for (const slot of [
      'dialog-overlay',
      'dialog-header',
      'dialog-title',
      'dialog-description',
      'dialog-body',
      'dialog-footer',
      'dialog-close-button',
    ]) {
      await expect(
        document.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    await userEvent.keyboard('{Escape}');
    await expectClosed();
  },
};

export const WithoutDescription: Story = {
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Edit profile</Button>
        </DialogTrigger>
        <DialogContent id="edit-profile-dialog" :aria-describedby="undefined">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);

    await expect(dialog).toHaveAttribute('id', 'edit-profile-dialog');
    await expect(dialog).not.toHaveAttribute('aria-describedby');

    await userEvent.keyboard('{Escape}');
    await expectClosed();
  },
};
