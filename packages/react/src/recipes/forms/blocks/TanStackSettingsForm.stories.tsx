import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { Button } from '../../../components/button';
import { SettingsFormContract } from '../../../stories/support/settings-form-contract';
import {
  slowSave,
  verifyErrorAfterSave,
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifyRecordSwitch,
  verifySaveCancel,
  verifyServerNormalized,
  verifyValidation,
} from '../../../stories/support/settings-form-test-utils';

import fieldsSource from './settings-fields.tsx?raw';
import type { SettingsValues } from './settings-layout';
import layoutSource from './settings-layout.tsx?raw';
import { TanStackSettingsForm } from './tanstack-settings-form';
import blockSource from './tanstack-settings-form.tsx?raw';

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
      <TanStackSettingsForm
        key={record.id}
        initialValues={record.values}
        onSave={onSave}
      />
    </div>
  );
}
const usage =
  "import { TanStackSettingsForm } from './blocks/tanstack-settings-form';\n\nexport function ProfileSettings({ profile, saveProfile }) {\n  return (\n    <TanStackSettingsForm\n      key={profile.id}\n      initialValues={{ name: profile.name, email: profile.email, updates: profile.updates }}\n      onSave={(values) => saveProfile(profile.id, values)}\n    />\n  );\n}";
const meta = {
  title: 'Blocks/TanStackSettingsForm',
  component: TanStackSettingsForm,
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
      page: () => (
        <>
          <Title />
          <p>
            The same settings form with its state managed by TanStack Form,
            through <code>useForm</code> and <code>useField</code>.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it when your app already uses TanStack Form. For a one-off form
            without a library, use SettingsForm.
          </p>
          <h2>Minimal composition</h2>
          <Canvas of={Default} />
          <Source code={usage} language="tsx" />
          <h2>Value and changes</h2>
          <p>
            Values have the shape{' '}
            <code>{'{ name: string; email: string; updates: boolean }'}</code>.
            Pass them as <code>initialValues</code> and save them in{' '}
            <code>onSave</code>, which resolves with the saved record.
          </p>
          <SettingsFormContract />
          <p>
            Unsaved state is read from <code>!isDefaultValue</code> rather than
            the older <code>isDirty</code>. The inputs do not call{' '}
            <code>handleBlur</code>: this form has no blur validators, and a
            blur validation clears a field’s submit error. After a save, the
            saved record goes to both the form’s <code>defaultValues</code>{' '}
            state and <code>formApi.reset</code>, because <code>useForm</code>{' '}
            re-applies its options on every render.
          </p>
          <h2>States and dismissal</h2>
          <p>
            Editable, saving, failed and saved states are covered by the stories
            below. Read-only and unavailable settings are separate examples on
            the Forms and Settings pattern page.
          </p>
          <h3>Narrow container</h3>
          <Canvas of={NarrowContainer} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy <code>blocks/tanstack-settings-form.tsx</code>,{' '}
              <code>blocks/settings-layout.tsx</code> and{' '}
              <code>blocks/settings-fields.tsx</code>, keeping the{' '}
              <code>recipes/forms</code> layout.
            </li>
            <li>
              They import these Nexus component folders, which you need too:{' '}
              <code>button</code>, <code>checkbox</code>, <code>field</code>,{' '}
              <code>input</code>, <code>separator</code>. If your copy lives
              elsewhere, update the relative imports.
            </li>
            <li>
              <code>@tanstack/react-form</code> 1. Install it only if you use
              this block.
            </li>
            <li>
              Your application owns loading the record, authorization, server
              validation and field-error mapping, navigation guards and
              persistence.
            </li>
          </ul>
          <h2>Evidence and support boundary</h2>
          <p>
            Each behaviour above is tested on this page:{' '}
            <code>SaveAndCancel</code>, <code>Validation</code>,{' '}
            <code>Saving</code>, <code>SaveFailure</code>,{' '}
            <code>ErrorAfterSave</code>, <code>ServerNormalized</code>,{' '}
            <code>RecordSwitch</code>, <code>NarrowContainer</code>.
          </p>
          <p>
            Not supported: server-side field errors mapped onto fields, and
            autosave. <code>onSave</code> can only resolve or reject, so showing
            server errors on individual fields means editing the copied block.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/tanstack-settings-form.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
          <details>
            <summary>blocks/settings-layout.tsx</summary>
            <Source code={layoutSource} language="tsx" />
          </details>
          <details>
            <summary>blocks/settings-fields.tsx</summary>
            <Source code={fieldsSource} language="tsx" />
          </details>
          <p>
            <a
              href="/?path=/docs/patterns-forms-and-settings--docs"
              target="_top"
            >
              See how this fits the Forms and Settings pattern
            </a>
          </p>
        </>
      ),
    },
  },
} satisfies Meta<typeof TanStackSettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SaveAndCancel: Story = { play: verifySaveCancel };
export const Validation: Story = { play: verifyValidation };
export const Saving: Story = {
  args: { onSave: fn(slowSave) },
  play: verifyPending,
};
export const SaveFailure: Story = { play: verifyFailure };
export const ErrorAfterSave: Story = {
  parameters: { test: { dangerouslyIgnoreUnhandledErrors: true } },
  play: verifyErrorAfterSave,
};
export const NarrowContainer: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <TanStackSettingsForm {...args} />
    </div>
  ),
  play: verifyNarrow,
};
export const ServerNormalized: Story = { play: verifyServerNormalized };
export const RecordSwitch: Story = {
  render: (args) => <RecordSwitcher onSave={args.onSave} />,
  play: verifyRecordSwitch,
};
