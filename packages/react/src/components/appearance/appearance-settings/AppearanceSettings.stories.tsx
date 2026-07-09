import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { NexusAppearanceProvider } from '../provider';

import { NexusAppearanceSettings } from './appearance-settings';

const meta: Meta<typeof NexusAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NexusAppearanceSettings,
  decorators: [
    (Story) => (
      <NexusAppearanceProvider
        storageKey={false}
        defaultState={{
          ...DEFAULT_NEXUS_APPEARANCE,
        }}
      >
        <Story />
      </NexusAppearanceProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceSettings>;

export const Default: Story = {};

export const ContrastIsolation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Distinct accessible names (else getByRole is ambiguous / axe flags duplicates).
    const lightSlider = canvas.getByRole('slider', { name: 'Light contrast' });
    await expect(
      canvas.getByRole('slider', { name: 'Dark contrast' })
    ).toBeInTheDocument();

    // Drive the light slider down deterministically (Radix Slider handles arrows).
    lightSlider.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');

    // Config preview proves light moved and dark held — and renders numbers, not [object Object].
    await expect(canvas.getByText('lightContrast: 58,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 0,')).toBeInTheDocument();
  },
};
