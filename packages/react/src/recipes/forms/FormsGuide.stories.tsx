import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { DisabledSettings, ReadOnlyDetails } from './settings-display';
import displaySource from './settings-display.tsx?raw';

const meta = {
  title: 'Patterns/Forms and Settings',
  component: ReadOnlyDetails,
  args: { name: 'Priya Shah', email: 'priya@example.com' },
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-2xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: { source: { code: displaySource, language: 'tsx', type: 'code' } },
  },
} satisfies Meta<typeof ReadOnlyDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use a DescriptionList when values are information rather than editable controls. Explain who can change them; keep empty values explicit.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled controls are temporarily unavailable. Give a visible reason and connect it with aria-describedby. Apply disabled to the controls and data-disabled to their Field wrappers.',
      },
    },
  },
  render: () => <DisabledSettings address="24 Riverside Road" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('checkbox')).toBeDisabled();
    await expect(canvas.getByRole('textbox')).toHaveAccessibleDescription(
      /Delivery is paused/
    );
  },
};
