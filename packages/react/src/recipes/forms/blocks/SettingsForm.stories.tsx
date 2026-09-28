import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifySaveCancel,
  verifyValidation,
} from '../../../stories/support/settings-form-test-utils';

import { SettingsForm } from './settings-form';
import blockSource from './settings-form.tsx?raw';
import type { SettingsValues } from './settings-layout';

const meta = {
  title: 'Blocks/SettingsForm',
  component: SettingsForm,
  args: {
    initialValues: {
      name: 'Priya Shah',
      email: 'priya@example.com',
      updates: false,
    },
    onSave: fn(async (_values: SettingsValues) => {}),
  },
  argTypes: { onSave: { control: false } },
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:max-w-2xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      source: { code: blockSource, language: 'tsx', type: 'code' },
      description: {
        component:
          'A settings form with local React state: one self-contained file. Copy blocks/settings-form.tsx and supply initialValues and an async onSave. The form owns its draft, validation, pending, saved and error states. Use a record key to remount when switching records. Cancel restores the latest saved values.',
      },
    },
  },
} satisfies Meta<typeof SettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SaveAndCancel: Story = { play: verifySaveCancel };
export const Validation: Story = { play: verifyValidation };
export const Saving: Story = {
  args: {
    onSave: fn(
      (_values: SettingsValues) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  play: verifyPending,
};
export const SaveFailure: Story = { play: verifyFailure };
export const NarrowContainer: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <SettingsForm {...args} />
    </div>
  ),
  play: verifyNarrow,
};
