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

export const ViewportBoundContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a narrow viewport, long DialogBody content scrolls while the close button stays pinned.',
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
          <Button variant="outline">Open viewport-bound dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Viewport bounded dialog</DialogTitle>
            <DialogDescription>Long modal content stays within the stable visible viewport.</DialogDescription>
          </DialogHeader>
          <DialogBody class="nx:space-y-4 nx:typography-label-default nx:text-foreground">
            <p v-for="i in 16" :key="i">A representative row of dialog content that makes the modal tall enough to exercise its viewport max-height contract.</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">Close viewport-bound dialog</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
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

export const CloseButtonFocus: Story = {
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Open focus dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close button focus</DialogTitle>
            <DialogDescription>The close button keeps the canonical focus outline.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    `,
  }),
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
      'nx:focus-visible:outline-focus-default'
    );
    await expect(closeButton).toHaveClass('nx:right-6', 'nx:top-6');
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

export const OpenCloseInteraction: Story = {
  render: () => ({
    components: {
      Button,
      Dialog,
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
            <DialogTitle>Interaction Test</DialogTitle>
            <DialogDescription>Testing open and close behavior.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose as-child>
              <Button>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
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

    // Reopen and close with the corner close button
    await userEvent.click(trigger);
    const reopened = await within(document.body).findByRole('dialog');
    await userEvent.click(
      within(reopened).getByRole('button', { name: 'Close' })
    );
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: {
      Button,
      Dialog,
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
            <DialogTitle>Keyboard Test</DialogTitle>
            <DialogDescription>Testing keyboard interactions.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose as-child>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
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
            <DialogTitle>Data Attributes</DialogTitle>
            <DialogDescription>Testing data-slot attributes.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p class="nx:typography-body-default">Content here</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose as-child>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
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
