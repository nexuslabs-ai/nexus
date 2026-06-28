import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NexusAppearanceSettings } from './appearance-settings';
import { NexusAppearanceProvider } from './provider';

const meta: Meta<typeof NexusAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NexusAppearanceSettings,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceSettings>;

function ProviderFrame() {
  return (
    <NexusAppearanceProvider storageKey={false}>
      <div className="nx:max-w-3xl">
        <NexusAppearanceSettings />
      </div>
    </NexusAppearanceProvider>
  );
}

export const Default: Story = {
  render: () => <ProviderFrame />,
};

export const WithDataAttributes: Story = {
  render: () => <ProviderFrame />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="appearance-settings"]')
    ).toBeInTheDocument();
  },
};

export const ClickInteraction: Story = {
  render: () => <ProviderFrame />,
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
  render: () => <ProviderFrame />,
  play: async ({ canvasElement }) => {
    const originalShadow = document.documentElement.getAttribute('data-shadow');

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
          'data-shadow',
          'strong'
        );
      });
    } finally {
      if (originalShadow === null) {
        document.documentElement.removeAttribute('data-shadow');
      } else {
        document.documentElement.setAttribute('data-shadow', originalShadow);
      }
    }
  },
};

export const KeyboardInteraction: Story = {
  render: () => <ProviderFrame />,
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
