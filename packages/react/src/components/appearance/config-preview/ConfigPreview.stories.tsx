import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react';

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
