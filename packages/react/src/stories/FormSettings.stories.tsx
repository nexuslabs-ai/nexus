import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';

import { Checkbox } from '../components/checkbox';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../components/description-list';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../components/field';
import { Input } from '../components/input';
import { Separator } from '../components/separator';

import {
  initialProfile,
  normalizeProfile,
  ProfileFields,
  ProfileSettingsLayout,
  type ProfileValues,
  saveFailureMessage,
  type SaveProfile,
  validateEmail,
  validateName,
} from './support/profile-settings';
import {
  verifyProfileNarrowFit,
  verifyProfilePending,
  verifyProfileSaveCancel,
  verifyProfileSaveFailure,
  verifyProfileValidation,
} from './support/profile-settings-test-utils';

type ProfileErrors = { name?: string; email?: string };

function SettingsForm({ onSave }: { onSave: SaveProfile }) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const [saved, setSaved] = React.useState(initialProfile);
  const [draft, setDraft] = React.useState(saved);
  const [errors, setErrors] = React.useState<ProfileErrors>({});
  const [pending, setPending] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const dirty =
    draft.name !== saved.name ||
    draft.email !== saved.email ||
    draft.updates !== saved.updates;

  function clearFeedback() {
    setMessage('');
    setSaveError('');
  }
  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, name: event.target.value });
    setErrors({ ...errors, name: undefined });
    clearFeedback();
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, email: event.target.value });
    setErrors({ ...errors, email: undefined });
    clearFeedback();
  }
  function changeUpdates(checked: boolean) {
    setDraft({ ...draft, updates: checked });
    clearFeedback();
  }
  function cancelChanges() {
    setDraft(saved);
    setErrors({});
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    const nextErrors = {
      name: validateName(draft.name),
      email: validateEmail(draft.email),
    };
    setErrors(nextErrors);
    clearFeedback();
    if (nextErrors.name || nextErrors.email) {
      (nextErrors.name ? nameRef : emailRef).current?.focus();
      return;
    }
    const submitted = normalizeProfile(draft);
    setPending(true);
    try {
      await onSave(submitted);
      setSaved(submitted);
      setDraft(submitted);
      setMessage('Changes saved in this demo.');
    } catch {
      setSaveError(saveFailureMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <ProfileSettingsLayout
      label="Profile settings"
      pending={pending}
      dirty={dirty}
      message={message}
      error={saveError}
      onSubmit={submit}
      onCancel={cancelChanges}
    >
      <ProfileFields
        pending={pending}
        nameField={{
          name: 'name',
          ref: nameRef,
          value: draft.name,
          error: errors.name,
          onChange: changeName,
        }}
        emailField={{
          name: 'email',
          ref: emailRef,
          value: draft.email,
          error: errors.email,
          onChange: changeEmail,
        }}
        updatesField={{
          name: 'updates',
          checked: draft.updates,
          onCheckedChange: changeUpdates,
        }}
      />
    </ProfileSettingsLayout>
  );
}

const meta = {
  title: 'Patterns/Forms and Settings',
  component: SettingsForm,
  args: { onSave: fn(async (_values: ProfileValues) => {}) },
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
      description: {
        component:
          'A copyable composition of existing Nexus components, not a new form framework. Use Field for a label, control, help and error; FieldSet + FieldLegend for related fields; and native form submission for Save. Wire htmlFor, required, aria-invalid and aria-describedby explicitly. This example owns draft, validation, pending, saved and error states locally. Cancel restores the latest saved values. Checkboxes participate in Save; switches are for immediate changes. The demo callback does not persist data. Applications own validation rules, authorization, API errors, navigation guards and persistence. Section and field spacing use density-aware layout tokens. See https://www.w3.org/WAI/tutorials/forms/ and https://react.dev/reference/react-dom/components/form.',
      },
    },
  },
} satisfies Meta<typeof SettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedSettings: Story = { play: verifyProfileSaveCancel };

export const Validation: Story = { play: verifyProfileValidation };

export const Saving: Story = {
  args: {
    onSave: fn(
      (_values: ProfileValues) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulates a one-second save. Fields and actions are disabled until it completes; edits cannot race with the submitted values.',
      },
    },
  },
  play: verifyProfilePending,
};

export const SaveFailure: Story = { play: verifyProfileSaveFailure };

export const NarrowContainer: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <SettingsForm {...args} />
    </div>
  ),
  play: verifyProfileNarrowFit,
};

function ReadOnlyDetails() {
  return (
    <section className="nx:grid nx:gap-container">
      <div>
        <h2 className="nx:typography-heading-small">Account details</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          These details are managed by your organization. Contact an
          administrator to change them.
        </p>
      </div>
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription>Priya Shah</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Email</DescriptionListTerm>
          <DescriptionListDescription>
            priya@example.com
          </DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Team</DescriptionListTerm>
          <DescriptionListDescription>
            <span className="nx:text-muted-foreground">Not provided</span>
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </section>
  );
}
export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use a DescriptionList when values are information rather than editable controls. Explain who can change them; keep empty values explicit.',
      },
    },
  },
  render: () => <ReadOnlyDetails />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.getByText('Not provided')).toBeVisible();
  },
};

function DisabledSettings() {
  const id = React.useId();
  return (
    <FieldSet disabled className="nx:min-w-0">
      <FieldLegend>Delivery settings</FieldLegend>
      <FieldDescription id={`${id}-reason`}>
        Delivery is paused while your address is being verified.
      </FieldDescription>
      <FieldGroup className="nx:gap-container">
        <Field data-disabled="true">
          <FieldLabel htmlFor={`${id}-address`}>Delivery address</FieldLabel>
          <Input
            id={`${id}-address`}
            defaultValue="24 Riverside Road"
            disabled
            aria-describedby={`${id}-reason`}
          />
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <Checkbox
            id={`${id}-tracking`}
            disabled
            defaultChecked
            aria-describedby={`${id}-reason`}
          />
          <FieldLabel htmlFor={`${id}-tracking`}>
            Send tracking updates
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled controls are temporarily unavailable. Give a visible reason and connect it with aria-describedby. Apply disabled to the controls and data-disabled to their Field wrappers.',
      },
    },
  },
  render: () => <DisabledSettings />,
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
  render: (args) => (
    <div className="nx:grid nx:gap-layout-section">
      <SettingsForm {...args} />
      <Separator />
      <ReadOnlyDetails />
      <Separator />
      <DisabledSettings />
    </div>
  ),
};
