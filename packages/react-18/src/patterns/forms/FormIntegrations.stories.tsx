import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import {
  EditProfileDialog,
  RecordSwitchControls,
  useRecordSwitch,
} from '../../stories/support/settings-form-scenes';
import {
  slowSave,
  verifyFailure,
  verifyInsideDialog,
  verifyNarrow,
  verifyPending,
  verifyRecordSwitch,
  verifySaveCancel,
  verifyServerNormalized,
  verifyValidation,
} from '../../stories/support/settings-form-test-utils';

import { ReactHookFormExample } from './react-hook-form';
import hookFormSource from './react-hook-form.tsx?raw';
import fieldsSource from './settings-fields.tsx?raw';
import type { SettingsFormProps, SettingsValues } from './settings-layout';
import layoutSource from './settings-layout.tsx?raw';
import { TanStackFormExample } from './tanstack-form';
import tanStackSource from './tanstack-form.tsx?raw';

const sharedSource =
  '\n\n// settings-layout.tsx\n' +
  layoutSource +
  '\n\n// settings-fields.tsx\n' +
  fieldsSource;

function ReactHookFormWithRecordSwitch(props: SettingsFormProps) {
  const { record, loadNewerCopy, switchRecord } = useRecordSwitch();
  return (
    <>
      <RecordSwitchControls
        onLoadNewerCopy={loadNewerCopy}
        onSwitchRecord={switchRecord}
      />
      <ReactHookFormExample
        {...props}
        key={record.id}
        initialValues={record.values}
      />
    </>
  );
}

function TanStackFormWithRecordSwitch(props: SettingsFormProps) {
  const { record, loadNewerCopy, switchRecord } = useRecordSwitch();
  return (
    <>
      <RecordSwitchControls
        onLoadNewerCopy={loadNewerCopy}
        onSwitchRecord={switchRecord}
      />
      <TanStackFormExample
        {...props}
        key={record.id}
        initialValues={record.values}
      />
    </>
  );
}

const tanStackDocs = {
  docs: {
    source: {
      code: tanStackSource + sharedSource,
      language: 'tsx',
      type: 'code',
    },
  },
};

const meta = {
  title: 'Patterns/Form Integrations',
  component: ReactHookFormExample,
  args: {
    title: 'Profile settings',
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
      <main className="nx:w-full nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: hookFormSource + sharedSource,
        language: 'tsx',
        type: 'code',
      },
      description: {
        component:
          'The same nxds form with two interchangeable form-management libraries. These recipes live in ordinary source files; Storybook imports the same implementation. Copy the chosen integration with settings-layout.tsx and settings-fields.tsx, and install only that form library. Both validate on submit, clear a field error when edited, focus the first invalid field, preserve edits on save failure, and restore the latest saved values on Cancel. React Hook Form uses useForm/useController; TanStack uses useForm/useField with subscriptions. TanStack unsaved state uses !isDefaultValue rather than historical isDirty. Both reset the saved baseline to the record onSave resolves with, so server-normalized values replace what was typed. Saving changes shows only while onSave is running, not during validation. onSave is application-owned; no backend persistence is included. Applications provide initialValues and onSave. Remount with a record key when switching records. The existing Forms and Settings recipe demonstrates plain React.',
      },
    },
  },
} satisfies Meta<typeof ReactHookFormExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReactHookForm: Story = { play: verifySaveCancel };
export const TanStackForm: Story = {
  parameters: tanStackDocs,
  render: (args) => <TanStackFormExample {...args} />,
  play: verifySaveCancel,
};
export const ReactHookFormValidation: Story = { play: verifyValidation };
export const TanStackFormValidation: Story = {
  parameters: tanStackDocs,
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyValidation,
};
export const ReactHookFormSaving: Story = {
  args: { onSave: fn(slowSave) },
  play: verifyPending,
};
export const TanStackFormSaving: Story = {
  args: { onSave: fn(slowSave) },
  parameters: tanStackDocs,
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyPending,
};
export const ReactHookFormFailure: Story = { play: verifyFailure };
export const TanStackFormFailure: Story = {
  parameters: tanStackDocs,
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyFailure,
};
export const ReactHookFormNarrow: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <ReactHookFormExample {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const TanStackFormNarrow: Story = {
  parameters: tanStackDocs,
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <TanStackFormExample {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const ReactHookFormServerNormalized: Story = {
  play: verifyServerNormalized,
};
export const TanStackFormServerNormalized: Story = {
  parameters: tanStackDocs,
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyServerNormalized,
};
export const ReactHookFormRecordSwitch: Story = {
  render: (args) => <ReactHookFormWithRecordSwitch {...args} />,
  play: verifyRecordSwitch,
};
export const TanStackFormRecordSwitch: Story = {
  parameters: tanStackDocs,
  render: (args) => <TanStackFormWithRecordSwitch {...args} />,
  play: verifyRecordSwitch,
};
export const ReactHookFormInsideDialog: Story = {
  render: (args) => (
    <EditProfileDialog>
      <ReactHookFormExample {...args} />
    </EditProfileDialog>
  ),
  play: verifyInsideDialog,
};
export const TanStackFormInsideDialog: Story = {
  parameters: tanStackDocs,
  render: (args) => (
    <EditProfileDialog>
      <TanStackFormExample {...args} />
    </EditProfileDialog>
  ),
  play: verifyInsideDialog,
};
export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code:
          hookFormSource +
          '\n\n// tanstack-form.tsx\n' +
          tanStackSource +
          sharedSource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => (
    <div className="nx:@container nx:w-full">
      <div className="nx:grid nx:gap-10 nx:@2xl:grid-cols-2">
        <ReactHookFormExample
          {...args}
          title="Profile settings with React Hook Form"
        />
        <TanStackFormExample
          {...args}
          title="Profile settings with TanStack Form"
        />
      </div>
    </div>
  ),
};
