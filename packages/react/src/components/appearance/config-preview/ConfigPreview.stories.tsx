import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { NexusAppearanceConfigPreview } from './config-preview';

const meta: Meta<typeof NexusAppearanceConfigPreview> = {
  title: 'Appearance/ConfigPreview',
  component: NexusAppearanceConfigPreview,
  args: {
    state: { ...DEFAULT_NEXUS_APPEARANCE, lightContrast: 72, darkContrast: 40 },
    resolvedMode: 'light',
  },
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceConfigPreview>;

export const Default: Story = {};

export const ObjectShapeRegression: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('lightContrast: 72,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 40,')).toBeInTheDocument();
    await expect(
      canvas.queryByText(/\[object Object\]/)
    ).not.toBeInTheDocument();
  },
};
