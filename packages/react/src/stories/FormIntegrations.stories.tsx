import * as React from 'react';
import { useController, useForm } from 'react-hook-form';

import type { Meta, StoryObj } from '@storybook/react';
import {
  useField,
  useForm as useTanStackForm,
  useStore,
} from '@tanstack/react-form';
import { fn } from 'storybook/test';

import {
  initialProfile,
  normalizeProfile,
  ProfileFields,
  ProfileSettingsLayout,
  type ProfileValues,
  saveFailureMessage,
  type SaveProfile,
  slowSave,
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

type Props = { onSave: SaveProfile };

function ReactHookFormExample({ onSave }: Props) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const form = useForm<ProfileValues>({
    defaultValues: initialProfile,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const name = useController({
    control: form.control,
    name: 'name',
    rules: { validate: validateName },
  });
  const email = useController({
    control: form.control,
    name: 'email',
    rules: { validate: validateEmail },
  });
  const updates = useController({ control: form.control, name: 'updates' });
  const { isDirty: dirty, isSubmitting: pending } = form.formState;
  function clearFeedback() {
    setMessage('');
    setSaveError('');
  }
  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    name.field.onChange(event);
    form.clearErrors('name');
    clearFeedback();
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    email.field.onChange(event);
    form.clearErrors('email');
    clearFeedback();
  }
  function changeUpdates(checked: boolean) {
    updates.field.onChange(checked);
    clearFeedback();
  }
  function attachName(node: HTMLInputElement | null) {
    nameRef.current = node;
    name.field.ref(node);
  }
  async function save(values: ProfileValues) {
    const submitted = normalizeProfile(values);
    await onSave(submitted);
    form.reset(submitted);
    setMessage('Changes saved in this demo.');
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    clearFeedback();
    try {
      await form.handleSubmit(save)();
    } catch {
      setSaveError(saveFailureMessage);
    }
  }
  function cancelChanges() {
    form.reset();
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  return (
    <ProfileSettingsLayout
      label="Profile settings with React Hook Form"
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
          ...name.field,
          ref: attachName,
          error: name.fieldState.error?.message,
          onChange: changeName,
        }}
        emailField={{
          ...email.field,
          error: email.fieldState.error?.message,
          onChange: changeEmail,
        }}
        updatesField={{
          name: updates.field.name,
          ref: updates.field.ref,
          checked: updates.field.value,
          onBlur: updates.field.onBlur,
          onCheckedChange: changeUpdates,
        }}
      />
    </ProfileSettingsLayout>
  );
}

function TanStackFormExample({ onSave }: Props) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const [saved, setSaved] = React.useState(initialProfile);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const form = useTanStackForm({
    defaultValues: saved,
    onSubmit: async ({ value, formApi }) => {
      const submitted = normalizeProfile(value);
      await onSave(submitted);
      setSaved(submitted);
      formApi.reset(submitted);
      setMessage('Changes saved in this demo.');
    },
  });
  const name = useField({
    form,
    name: 'name',
    validators: { onSubmit: ({ value }) => validateName(value) },
  });
  const email = useField({
    form,
    name: 'email',
    validators: { onSubmit: ({ value }) => validateEmail(value) },
  });
  const updates = useField({ form, name: 'updates' });
  const dirty = useStore(form.store, (state) => !state.isDefaultValue);
  const pending = useStore(form.store, (state) => state.isSubmitting);
  function clearFeedback() {
    setMessage('');
    setSaveError('');
  }
  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    name.handleChange(event.target.value);
    name.setErrorMap({ onSubmit: undefined });
    clearFeedback();
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    email.handleChange(event.target.value);
    email.setErrorMap({ onSubmit: undefined });
    clearFeedback();
  }
  function changeUpdates(checked: boolean) {
    updates.handleChange(checked);
    clearFeedback();
  }
  function focusFirstInvalid() {
    const fields = [
      { name: 'name', ref: nameRef },
      { name: 'email', ref: emailRef },
    ] as const;
    const invalid = fields.find(
      (field) => form.getFieldMeta(field.name)?.errors.length
    );
    invalid?.ref.current?.focus();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.state.isDefaultValue) return;
    clearFeedback();
    try {
      await form.handleSubmit();
    } catch {
      setSaveError(saveFailureMessage);
      return;
    }
    focusFirstInvalid();
  }
  function cancelChanges() {
    form.reset();
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  return (
    <ProfileSettingsLayout
      label="Profile settings with TanStack Form"
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
          name: name.name,
          ref: nameRef,
          value: name.state.value,
          error: name.state.meta.errors[0],
          onBlur: name.handleBlur,
          onChange: changeName,
        }}
        emailField={{
          name: email.name,
          ref: emailRef,
          value: email.state.value,
          error: email.state.meta.errors[0],
          onBlur: email.handleBlur,
          onChange: changeEmail,
        }}
        updatesField={{
          name: updates.name,
          checked: updates.state.value,
          onBlur: updates.handleBlur,
          onCheckedChange: changeUpdates,
        }}
      />
    </ProfileSettingsLayout>
  );
}

const meta = {
  title: 'Patterns/Form Integrations',
  component: ReactHookFormExample,
  args: { onSave: fn(async (_values: ProfileValues) => {}) },
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
      description: {
        component:
          'The same Nexus form with two interchangeable form-management libraries. These are copyable Storybook integrations, not package exports. Both validate on submit, clear a field error when edited, focus the first invalid field, preserve edits on save failure, and restore the latest saved values on Cancel. React Hook Form uses useForm/useController; TanStack uses useForm/useField with subscriptions. TanStack unsaved state uses !isDefaultValue rather than historical isDirty. Both reset the saved baseline after success. onSave is application-owned; no backend persistence is included. Both libraries are development-only dependencies for these examples. The existing Forms and Settings recipe demonstrates plain React.',
      },
    },
  },
} satisfies Meta<typeof ReactHookFormExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReactHookForm: Story = { play: verifyProfileSaveCancel };
export const TanStackForm: Story = {
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyProfileSaveCancel,
};
export const ReactHookFormValidation: Story = {
  play: verifyProfileValidation,
};
export const TanStackFormValidation: Story = {
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyProfileValidation,
};
export const ReactHookFormSaving: Story = {
  args: { onSave: fn(slowSave) },
  play: verifyProfilePending,
};
export const TanStackFormSaving: Story = {
  args: { onSave: fn(slowSave) },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyProfilePending,
};
export const ReactHookFormFailure: Story = { play: verifyProfileSaveFailure };
export const TanStackFormFailure: Story = {
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyProfileSaveFailure,
};
export const ReactHookFormNarrow: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <ReactHookFormExample {...args} />
    </div>
  ),
  play: verifyProfileNarrowFit,
};
export const TanStackFormNarrow: Story = {
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <TanStackFormExample {...args} />
    </div>
  ),
  play: verifyProfileNarrowFit,
};
export const AllVariants: Story = {
  render: (args) => (
    <div className="nx:@container nx:w-full">
      <div className="nx:grid nx:gap-10 nx:@2xl:grid-cols-2">
        <section className="nx:min-w-0">
          <p className="nx:mb-4 nx:typography-label-default nx:text-muted-foreground">
            React Hook Form
          </p>
          <ReactHookFormExample {...args} />
        </section>
        <section className="nx:min-w-0">
          <p className="nx:mb-4 nx:typography-label-default nx:text-muted-foreground">
            TanStack Form
          </p>
          <TanStackFormExample {...args} />
        </section>
      </div>
    </div>
  ),
};
