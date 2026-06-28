import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NexusAppearanceSettings } from './appearance-settings';

const meta: Meta<typeof NexusAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NexusAppearanceSettings,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceSettings>;

const rootDataAttribute = (name: string) => `data-${name}`;
const ROOT_SHADOW_ATTRIBUTE = rootDataAttribute('shadow');

function SettingsFrame() {
  return (
    <div className="nx:max-w-3xl">
      <NexusAppearanceSettings />
    </div>
  );
}

export const Default: Story = {
  render: () => <SettingsFrame />,
};

export const WithDataAttributes: Story = {
  render: () => <SettingsFrame />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="appearance-settings"]')
    ).toBeInTheDocument();
  },
};

export const ClickInteraction: Story = {
  render: () => <SettingsFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const brandInput = canvas.getByRole('textbox', {
      name: 'Brand color hex value',
    });

    await userEvent.clear(brandInput);
    await userEvent.type(brandInput, '#ff3366');
    await expect(canvas.getByText('brandColor: "#ff3366",')).toBeVisible();

    const surfaceTrigger = canvas.getByRole('combobox', {
      name: 'Surface tone',
    });
    await userEvent.click(surfaceTrigger);

    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Slate' })
    );

    await waitFor(() => {
      expect(canvas.getByText('surfaceTone: "slate",')).toBeVisible();
    });
  },
};

export const ElevationInteraction: Story = {
  render: () => <SettingsFrame />,
  play: async ({ canvasElement }) => {
    const originalShadow = document.documentElement.getAttribute(
      ROOT_SHADOW_ATTRIBUTE
    );

    try {
      const canvas = within(canvasElement);
      const elevationTrigger = canvas.getByRole('combobox', {
        name: 'Elevation',
      });

      await userEvent.click(elevationTrigger);

      const listbox = await within(document.body).findByRole('listbox');
      const options = within(listbox).getAllByRole('option');

      expect(options.map((option) => option.textContent)).toEqual([
        'Quiet',
        'Standard',
        'Strong',
      ]);

      await userEvent.click(
        within(listbox).getByRole('option', { name: 'Strong' })
      );

      await waitFor(() => {
        expect(canvas.getByText('elevation: "strong",')).toBeVisible();
        expect(document.documentElement).toHaveAttribute(
          ROOT_SHADOW_ATTRIBUTE,
          'strong'
        );
      });
    } finally {
      if (originalShadow === null) {
        document.documentElement.removeAttribute(ROOT_SHADOW_ATTRIBUTE);
      } else {
        document.documentElement.setAttribute(
          ROOT_SHADOW_ATTRIBUTE,
          originalShadow
        );
      }
    }
  },
};

export const KeyboardInteraction: Story = {
  render: () => <SettingsFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lightMode = canvas.getByRole('radio', { name: 'Light' });
    const darkMode = canvas.getByRole('radio', { name: 'Dark' });

    await userEvent.tab();
    await expect(lightMode).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(darkMode).toHaveFocus();
    await userEvent.keyboard(' ');

    await waitFor(() => {
      expect(canvas.getByText('mode: "dark",')).toBeVisible();
    });
  },
};
