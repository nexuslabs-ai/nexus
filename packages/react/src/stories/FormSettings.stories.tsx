import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';

import { Separator } from '../components/separator';
import {
  DisabledSettings,
  ReadOnlyDetails,
} from '../recipes/forms/settings-display';
import displaySource from '../recipes/forms/settings-display.tsx?raw';
import fieldsSource from '../recipes/forms/settings-fields.tsx?raw';
import { SettingsForm } from '../recipes/forms/settings-form';
import formSource from '../recipes/forms/settings-form.tsx?raw';
import layoutSource from '../recipes/forms/settings-layout.tsx?raw';

import {
  slowSave,
  verifyFailure,
  verifyNarrow,
  verifyPending,
  verifySaveCancel,
  verifyValidation,
} from './support/settings-form-test-utils';

const settingsSource =
  formSource +
  '\n\n// settings-layout.tsx\n' +
  layoutSource +
  '\n\n// settings-fields.tsx\n' +
  fieldsSource;

const meta = {
  title: 'Patterns/Forms and Settings',
  component: SettingsForm,
  args: {
    initialValues: {
      name: 'Priya Shah',
      email: 'priya@example.com',
      updates: false,
    },
    onSave: fn(async () => {}),
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
      source: { code: settingsSource, language: 'tsx', type: 'code' },
      description: {
        component:
          'A copyable composition of existing Nexus components, not a new form framework. Use Field for a label, control, help and error; FieldSet + FieldLegend for related fields; and native form submission for Save. Wire htmlFor, required, aria-invalid and aria-describedby explicitly. Copy recipes/forms/settings-form.tsx with settings-layout.tsx and settings-fields.tsx, and supply initialValues and an async onSave. The form owns draft, validation, pending, saved and error states locally. Use a record key to remount when switching records. Cancel restores the latest saved values. Checkboxes participate in Save; switches are for immediate changes. The demo callback does not persist data. Applications own validation rules, authorization, API errors, navigation guards and persistence. Section and field spacing use density-aware layout tokens. See https://www.w3.org/WAI/tutorials/forms/ and https://react.dev/reference/react-dom/components/form.',
      },
    },
  },
} satisfies Meta<typeof SettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedSettings: Story = { play: verifySaveCancel };

export const Validation: Story = { play: verifyValidation };

export const Saving: Story = {
  args: {
    onSave: fn(slowSave),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a one-second save. Fields and actions are disabled until it completes; edits cannot race with the submitted values.',
      },
    },
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

export const ReadOnly: Story = {
  parameters: {
    docs: {
      source: { code: displaySource, language: 'tsx', type: 'code' },
      description: {
        story:
          'Use a DescriptionList when values are information rather than editable controls. Explain who can change them; keep empty values explicit.',
      },
    },
  },
  render: () => <ReadOnlyDetails name="Priya Shah" email="priya@example.com" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: { code: displaySource, language: 'tsx', type: 'code' },
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

export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: settingsSource + '\n\n// settings-display.tsx\n' + displaySource,
        language: 'tsx',
        type: 'code',
      },
    },
  },
  render: (args) => (
    <div className="nx:grid nx:gap-layout-section">
      <SettingsForm {...args} />
      <Separator />
      <ReadOnlyDetails name="Priya Shah" email="priya@example.com" />
      <Separator />
      <DisabledSettings address="24 Riverside Road" />
    </div>
  ),
};
