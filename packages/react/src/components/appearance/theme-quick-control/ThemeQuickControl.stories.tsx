import { BASE_TONE_OPTIONS, DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { NxdsAppearanceProvider } from '../provider';

import { NxdsThemeQuickControl } from './theme-quick-control';

const meta: Meta<typeof NxdsThemeQuickControl> = {
  title: 'Appearance/ThemeQuickControl',
  component: NxdsThemeQuickControl,
  parameters: {
    docs: {
      description: {
        component:
          'NxdsThemeQuickControl is an icon button that opens a popover for mode, surface tone and brand color. Render it inside NxdsAppearanceProvider. For every setting, use NxdsAppearanceSettings.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NxdsAppearanceProvider storageKey={false}>
        <Story />
      </NxdsAppearanceProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof NxdsThemeQuickControl>;

function triggerIn(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole('button', { name: 'Theme' });
}

async function openControl(canvasElement: HTMLElement) {
  await userEvent.click(triggerIn(canvasElement));
  return within(document.body).findByRole('dialog', {
    name: 'Theme quick control',
  });
}

async function closeControl(canvasElement: HTMLElement) {
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(triggerIn(canvasElement)).toHaveAttribute('data-state', 'closed')
  );
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = triggerIn(canvasElement);

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(
      within(document.body).queryByRole('dialog', {
        name: 'Theme quick control',
      })
    ).toBeNull();
  },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement }) => {
    const control = within(await openControl(canvasElement));

    await expect(control.getByRole('radio', { name: 'Light' })).toHaveAttribute(
      'data-state',
      'on'
    );
    await userEvent.click(control.getByRole('radio', { name: 'Dark' }));
    await expect(control.getByRole('radio', { name: 'Dark' })).toHaveAttribute(
      'data-state',
      'on'
    );
    await expect(control.getByRole('radio', { name: 'Light' })).toHaveAttribute(
      'data-state',
      'off'
    );

    await closeControl(canvasElement);
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const trigger = triggerIn(canvasElement);

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const control = within(
      await within(document.body).findByRole('dialog', {
        name: 'Theme quick control',
      })
    );
    const light = control.getByRole('radio', { name: 'Light' });
    const dark = control.getByRole('radio', { name: 'Dark' });

    await waitFor(() => expect(light).toHaveFocus());
    await expect(light).toHaveAttribute('data-state', 'on');

    await userEvent.keyboard('{ArrowRight}');
    await expect(dark).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(dark).toHaveAttribute('data-state', 'on');
    await expect(light).toHaveAttribute('data-state', 'off');

    await closeControl(canvasElement);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

const OTHER_TONE = BASE_TONE_OPTIONS.find(
  (option) => option.value !== DEFAULT_NXDS_APPEARANCE.surfaceTone
)!;

export const SurfaceTone: Story = {
  play: async ({ canvasElement }) => {
    const control = within(await openControl(canvasElement));
    const swatch = control.getByRole('button', {
      name: `Surface tone: ${OTHER_TONE.label}`,
    });

    await userEvent.click(swatch);
    await expect(swatch).toHaveAttribute('aria-pressed', 'true');
    await expect(
      control
        .getAllByRole('button', { name: /^Surface tone: / })
        .filter((button) => button.getAttribute('aria-pressed') === 'true')
    ).toHaveLength(1);

    await closeControl(canvasElement);
  },
};

export const BrandColor: Story = {
  play: async ({ canvasElement }) => {
    const control = within(await openControl(canvasElement));
    const hex = control.getByRole('textbox', {
      name: 'Brand color hex value',
    });

    await userEvent.clear(hex);
    await userEvent.type(hex, '#dc2626');
    await expect(
      control.getByLabelText('Brand color', { exact: true })
    ).toHaveValue('#dc2626');

    await closeControl(canvasElement);
  },
};

export const WithCustomize: Story = {
  args: { onCustomize: fn() },
  play: async ({ canvasElement, args }) => {
    const control = within(await openControl(canvasElement));

    await userEvent.click(
      control.getByRole('button', { name: 'Customize...' })
    );

    await expect(args.onCustomize).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(triggerIn(canvasElement)).toHaveAttribute('data-state', 'closed')
    );
  },
};

export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    await expect(triggerIn(canvasElement)).toHaveAttribute(
      'data-slot',
      'theme-quick-control-trigger'
    );
  },
};
