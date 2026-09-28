import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { Button } from '../../../components/button';
import {
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifyRecordSwitch,
  verifySaveCancel,
  verifyServerNormalized,
  verifyValidation,
} from '../../../stories/support/settings-form-test-utils';

import { ReactHookFormSettingsForm } from './react-hook-form-settings-form';
import blockSource from './react-hook-form-settings-form.tsx?raw';
import type { SettingsValues } from './settings-layout';
import layoutSource from './settings-layout.tsx?raw';

const priya = {
  id: 'priya',
  values: { name: 'Priya Shah', email: 'priya@example.com', updates: false },
};
const arjun = {
  id: 'arjun',
  values: { name: 'Arjun Mehta', email: 'arjun@example.com', updates: true },
};
function RecordSwitcher({
  onSave,
}: {
  onSave: (values: SettingsValues) => Promise<SettingsValues>;
}) {
  const [record, setRecord] = React.useState(priya);
  function loadNewerCopy() {
    setRecord({
      ...record,
      values: { ...record.values, name: `${record.values.name} (refreshed)` },
    });
  }
  function switchRecord() {
    setRecord(record.id === 'priya' ? arjun : priya);
  }
  return (
    <div className="nx:grid nx:gap-4">
      <div className="nx:flex nx:gap-2">
        <Button variant="outline" onClick={loadNewerCopy}>
          Load a newer copy
        </Button>
        <Button variant="outline" onClick={switchRecord}>
          Switch record
        </Button>
      </div>
      <ReactHookFormSettingsForm
        key={record.id}
        initialValues={record.values}
        onSave={onSave}
      />
    </div>
  );
}
const meta = {
  title: 'Blocks/ReactHookFormSettingsForm',
  component: ReactHookFormSettingsForm,
  args: {
    initialValues: {
      name: 'Priya Shah',
      email: 'priya@example.com',
      updates: false,
    },
    onSave: fn(async (values: SettingsValues) => values),
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
      (values: SettingsValues) =>
        new Promise<SettingsValues>((resolve) =>
          setTimeout(() => resolve(values), 1000)
        )
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
export const ServerNormalized: Story = { play: verifyServerNormalized };
export const RecordSwitch: Story = {
  render: (args) => <RecordSwitcher onSave={args.onSave} />,
  play: verifyRecordSwitch,
};
