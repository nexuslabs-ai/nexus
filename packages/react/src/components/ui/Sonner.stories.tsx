import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from './button';
import { toast, Toaster } from './sonner';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <>
      <Button variant="outline" onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
      <Toaster />
    </>
  ),
};

export const Success: Story = {
  render: () => (
    <>
      <Button variant="outline" onClick={() => toast.success('Changes saved')}>
        Show success
      </Button>
      <Toaster richColors />
    </>
  ),
};

export const Error: Story = {
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() => toast.error('Something went wrong')}
      >
        Show error
      </Button>
      <Toaster richColors />
    </>
  ),
};

export const Warning: Story = {
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() => toast.warning('Your session is about to expire')}
      >
        Show warning
      </Button>
      <Toaster richColors />
    </>
  ),
};

export const Info: Story = {
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() => toast.info('A new version is available')}
      >
        Show info
      </Button>
      <Toaster richColors />
    </>
  ),
};

export const WithAction: Story = {
  render: () => {
    const showToast = () =>
      toast('File deleted', {
        action: { label: 'Undo', onClick: () => toast('File restored') },
      });
    return (
      <>
        <Button variant="outline" onClick={showToast}>
          Show with action
        </Button>
        <Toaster />
      </>
    );
  },
};

export const Promise: Story = {
  render: () => {
    const save = () =>
      new globalThis.Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      });
    const showToast = () =>
      toast.promise(save, {
        loading: 'Saving…',
        success: 'Settings saved',
        error: 'Could not save',
      });
    return (
      <>
        <Button variant="outline" onClick={showToast}>
          Show promise
        </Button>
        <Toaster />
      </>
    );
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <>
      <Button onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
      <Toaster />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));

    // Sonner renders the toast outside the canvas subtree — query the document.
    const status = await within(document.body).findByText(
      'Event has been created'
    );
    await expect(status).toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => <Toaster />,
  play: async ({ canvasElement }) => {
    const toaster = canvasElement.querySelector('[data-slot="toaster"]');
    await expect(toaster).toBeInTheDocument();
    await expect(toaster).toHaveAttribute('data-slot', 'toaster');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Button variant="outline" onClick={() => toast('Default toast')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Success toast')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Error toast')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Warning toast')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Info toast')}>
        Info
      </Button>
      <Toaster richColors />
    </div>
  ),
};
