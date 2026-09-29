import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
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
import { SettingsForm } from './settings-form';
import blockSource from './settings-form.tsx?raw';
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
      <SettingsForm
        key={record.id}
        initialValues={record.values}
        onSave={onSave}
      />
    </div>
  );
}
const usage =
  "import { SettingsForm } from './blocks/settings-form';\n\nexport function ProfileSettings({ profile, saveProfile }) {\n  return (\n    <SettingsForm\n      key={profile.id}\n      initialValues={{ name: profile.name, email: profile.email, updates: profile.updates }}\n      onSave={(values) => saveProfile(profile.id, values)}\n    />\n  );\n}";
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
      page: () => (
        <>
          <Title />
          <p>
            A settings form whose state lives in plain React, with no form
            library.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for a small settings form where adding a form library would
            be overkill. If your app already uses React Hook Form or TanStack
            Form, use ReactHookFormSettingsForm or TanStackSettingsForm so your
            forms share one state model.
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
            The form keeps its draft, errors, pending and saved values in React
            state, and validates the draft values with the rules in{' '}
            <code>settings-layout.tsx</code>.
          </p>
          <h2>States and dismissal</h2>
          <p>
            Editable, saving, failed and saved states are covered by the stories
            below. Read-only and unavailable settings are separate examples on
            the Forms and Settings pattern page.
          </p>
          <h3>Narrow container</h3>
          <Canvas of={NarrowContainer} />
          <h3>Inside a Dialog</h3>
          <Canvas of={InsideDialog} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy <code>blocks/settings-form.tsx</code>,{' '}
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
            <li>No npm packages beyond React and the Nexus components.</li>
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
            <code>RecordSwitch</code>, <code>NarrowContainer</code>,{' '}
            <code>InsideDialog</code>.
          </p>
          <p>
            Not supported: server-side field errors mapped onto fields, and
            autosave. <code>onSave</code> can only resolve or reject, so showing
            server errors on individual fields means editing the copied block.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/settings-form.tsx</summary>
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
} satisfies Meta<typeof SettingsForm>;
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
