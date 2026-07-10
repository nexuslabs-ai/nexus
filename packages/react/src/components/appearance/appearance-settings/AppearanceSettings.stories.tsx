import {
  CORNER_OPTIONS,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
} from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

async function expectSelectOptions(
  canvasElement: HTMLElement,
  name: string,
  labels: readonly string[]
) {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox', { name });

  try {
    await userEvent.click(trigger);

    const listbox = await within(document.body).findByRole('listbox');
    for (const label of labels) {
      await expect(
        within(listbox).getByRole('option', { name: label })
      ).toBeInTheDocument();
    }
  } finally {
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  }
}

export const LayoutModeOptions: Story = {
  play: async ({ canvasElement }) => {
    await expectSelectOptions(
      canvasElement,
      'Density',
      DENSITY_OPTIONS.map((option) => option.label)
    );
    await expectSelectOptions(
      canvasElement,
      'Corners',
      CORNER_OPTIONS.map((option) => option.label)
    );
    await expectSelectOptions(
      canvasElement,
      'Elevation',
      ELEVATION_OPTIONS.map((option) => option.label)
    );
  },
};

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
