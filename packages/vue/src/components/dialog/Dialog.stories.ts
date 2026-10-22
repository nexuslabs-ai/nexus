import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useId } from 'vue';

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
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a basic dialog with a title and description.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p class="nx:typography-body-default nx:text-foreground">Dialog content goes here. You can add any content you need.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const WithDescription: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a DialogDescription and a short form to edit a profile.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogBody,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    setup: () => ({ nameId: useId(), usernameId: useId() }),
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button>Edit Profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <DialogBody class="nx:grid nx:gap-4 nx:py-4">
            <div class="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
              <label :for="nameId" class="nx:justify-end">Name</label>
              <input :id="nameId" value="John Doe" class="nx:col-span-3" />
            </div>
            <div class="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
              <label :for="usernameId" class="nx:justify-end">Username</label>
              <input :id="usernameId" value="@johndoe" class="nx:col-span-3" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const ScrollableContent: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Long DialogBody content scrolls while the header and footer stay in place.',
      },
    },
  },
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
          <Button variant="outline">Terms & Conditions</Button>
        </DialogTrigger>
        <DialogContent class="nx:max-h-[300px]">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Please read the following terms carefully.</DialogDescription>
          </DialogHeader>
          <DialogBody class="nx:space-y-4 nx:typography-label-default nx:text-foreground">
            <p v-for="i in 10" :key="i">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">Decline</Button>
            </DialogClose>
            <Button>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const PropDrivenContent: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Fill the `#title`, `#description` and `#body` slots of DialogContent instead of composing the header and body.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogClose,
      DialogContent,
      DialogFooter,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Open invite dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <template #title>Invite teammate</template>
          <template #description>Send an invitation to a teammate and assign their first workspace role.</template>
          <template #body>
            <p class="nx:typography-body-default nx:text-foreground">The invitation expires in seven days and can be revoked from team settings.</p>
          </template>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
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
