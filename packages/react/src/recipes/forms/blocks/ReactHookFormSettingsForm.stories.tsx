import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifySaveCancel,
  verifyValidation,
} from '../../../stories/support/settings-form-test-utils';

import { ReactHookFormSettingsForm } from './react-hook-form-settings-form';
import blockSource from './react-hook-form-settings-form.tsx?raw';
import type { SettingsValues } from './settings-layout';
import layoutSource from './settings-layout.tsx?raw';

const meta = {
  title: 'Blocks/ReactHookFormSettingsForm',
  component: ReactHookFormSettingsForm,
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
      source: {
        code: blockSource + '\n\n// settings-layout.tsx\n' + layoutSource,
        language: 'tsx',
        type: 'code',
      },
      description: {
        component:
          'The same settings form managed by React Hook Form (useForm and useController). Copy blocks/react-hook-form-settings-form.tsx and blocks/settings-layout.tsx, and install react-hook-form.',
      },
    },
  },
} satisfies Meta<typeof ReactHookFormSettingsForm>;
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
      <ReactHookFormSettingsForm {...args} />
    </div>
  ),
  play: verifyNarrow,
};
