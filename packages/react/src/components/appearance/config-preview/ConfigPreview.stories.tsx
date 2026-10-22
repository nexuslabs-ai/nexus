import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { NxdsAppearanceConfigPreview } from './config-preview';

const meta: Meta<typeof NxdsAppearanceConfigPreview> = {
  title: 'Appearance/ConfigPreview',
  component: NxdsAppearanceConfigPreview,
  parameters: {
    docs: {
      description: {
        component:
          'NxdsAppearanceConfigPreview prints an appearance state as a code object. Use it to show the values a settings panel produces.',
      },
    },
  },
  args: {
    state: {
      ...DEFAULT_NXDS_APPEARANCE,
      lightContrast: 37,
      darkContrast: 82,
    },
    resolvedMode: 'light',
  },
};

export default meta;
type Story = StoryObj<typeof NxdsAppearanceConfigPreview>;

export const Default: Story = {};

export const ObjectShapeRegression: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('lightContrast: 37,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 82,')).toBeInTheDocument();
    await expect(
      canvas.queryByText(/\[object Object\]/)
    ).not.toBeInTheDocument();
  },
};
