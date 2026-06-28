import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { useNexusAppearance } from './provider';
import { NexusThemeQuickControl } from './theme-quick-control';

const meta: Meta<typeof NexusThemeQuickControl> = {
  title: 'Appearance/ThemeQuickControl',
  component: NexusThemeQuickControl,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof NexusThemeQuickControl>;

function StateProbe() {
  const { state } = useNexusAppearance();

  return (
    <dl className="nx:mt-3 nx:grid nx:grid-cols-[auto_1fr] nx:gap-x-2 nx:gap-y-1 nx:typography-body-small">
      <dt className="nx:text-muted-foreground">Mode</dt>
      <dd aria-label="Current mode">{state.mode}</dd>
      <dt className="nx:text-muted-foreground">Surface</dt>
      <dd aria-label="Current surface tone">{state.surfaceTone}</dd>
      <dt className="nx:text-muted-foreground">Brand</dt>
      <dd aria-label="Current brand color">{state.brandColor}</dd>
    </dl>
  );
}

function QuickControlFrame() {
  return (
    <>
      <NexusThemeQuickControl />
      <StateProbe />
    </>
  );
}

export const Default: Story = {
  render: () => <QuickControlFrame />,
};

export const WithDataAttributes: Story = {
  render: () => <QuickControlFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Theme' })).toHaveAttribute(
      'data-slot',
      'theme-quick-control-trigger'
    );
  },
};

export const ClickInteraction: Story = {
  render: () => <QuickControlFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Theme' }));
    const popover = await within(document.body).findByRole('dialog');
    await userEvent.click(within(popover).getByRole('radio', { name: 'Dark' }));
    await userEvent.click(
      within(popover).getByRole('button', { name: 'Surface tone: Slate' })
    );

    await expect(canvas.getByLabelText('Current mode')).toHaveTextContent(
      'dark'
    );
    await expect(
      canvas.getByLabelText('Current surface tone')
    ).toHaveTextContent('slate');
  },
};

export const KeyboardInteraction: Story = {
  render: () => <QuickControlFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Theme' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    const popover = await within(document.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(
        within(popover).getByRole('group', { name: 'Theme mode' })
      ).toBeVisible();
    });
  },
};
