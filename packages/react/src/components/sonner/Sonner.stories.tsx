import { useState } from 'react';

import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NexusRoot } from '../appearance/provider';
import { Button } from '../button';

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

export const PromiseStory: Story = {
  name: 'Promise',
  render: () => {
    const save = () =>
      new Promise<void>((resolve) => {
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

// The toaster rides the Nexus toast layer (z-index 100) via an inline style,
// which outranks sonner's injected z-index:999999999 without `!important`.
// Sonner only mounts its container once a toast exists, so fire one first.
export const ToastLayer: Story = {
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
    await waitFor(() => {
      const toaster = document.body.querySelector<HTMLElement>(
        '[data-sonner-toaster]'
      );
      expect(toaster).not.toBeNull();
      expect(getComputedStyle(toaster as HTMLElement).zIndex).toBe('100');
    });
  },
};

function ModeSwitchingToaster() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  return (
    <NexusRoot state={{ ...DEFAULT_NEXUS_APPEARANCE, mode }}>
      <Button onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
      <Button variant="outline" onClick={() => setMode('dark')}>
        Go dark
      </Button>
      <Toaster />
    </NexusRoot>
  );
}

// The toaster renders inside the nearest root, takes its mode, and follows a
// mode change while a toast is visible.
export const FollowsRootMode: Story = {
  render: () => <ModeSwitchingToaster />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector(
      '[data-nexus-root] [data-nexus-root]'
    )!;
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    const toaster = await waitFor(() => {
      const element = document.body.querySelector('[data-sonner-toaster]');
      expect(element).not.toBeNull();
      return element!;
    });

    await expect(root).toContainElement(toaster as HTMLElement);
    await expect(toaster).toHaveAttribute('data-sonner-theme', 'light');

    await userEvent.click(canvas.getByRole('button', { name: 'Go dark' }));
    await waitFor(() =>
      expect(toaster).toHaveAttribute('data-sonner-theme', 'dark')
    );
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
