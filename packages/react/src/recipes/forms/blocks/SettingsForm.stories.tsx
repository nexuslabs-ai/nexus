import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../../components/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/dialog';
import {
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifyRecordSwitch,
  verifySaveCancel,
  verifyServerNormalized,
  verifyValidation,
} from '../../../stories/support/settings-form-test-utils';

import { SettingsForm } from './settings-form';
import blockSource from './settings-form.tsx?raw';
import type { SettingsValues } from './settings-layout';

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
      <SettingsForm
        key={record.id}
        initialValues={record.values}
        onSave={onSave}
      />
    </div>
  );
}
const meta = {
  title: 'Blocks/SettingsForm',
  component: SettingsForm,
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
      <SettingsForm {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const ServerNormalized: Story = { play: verifyServerNormalized };
export const RecordSwitch: Story = {
  render: (args) => <RecordSwitcher onSave={args.onSave} />,
  play: verifyRecordSwitch,
};
export const InsideDialog: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes apply when you save.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <SettingsForm {...args} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit profile',
    });
    await userEvent.click(trigger);
    const dialog = within(
      await page.findByRole('dialog', { name: 'Edit profile' })
    );
    const name = dialog.getByRole('textbox', { name: 'Name' });
    await userEvent.type(name, ' Jr{Enter}');
    await waitFor(() =>
      expect(dialog.getByRole('status')).toHaveTextContent('Changes saved')
    );
    await expect(args.onSave).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
