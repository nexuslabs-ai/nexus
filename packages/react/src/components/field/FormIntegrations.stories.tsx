import * as React from 'react';
import { useController, useForm } from 'react-hook-form';

import type { Meta, StoryObj } from '@storybook/react';
import {
  useField,
  useForm as useTanStackForm,
  useStore,
} from '@tanstack/react-form';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Separator } from '../separator';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRequiredIndicator,
  FieldSet,
} from './field';

type Values = { name: string; email: string; updates: boolean };
type Save = (values: Values) => Promise<void>;
type Props = { onSave: Save };
const initialValues: Values = {
  name: 'Priya Shah',
  email: 'priya@example.com',
  updates: false,
};
const failureMessage =
  'We could not save your changes. Your edits are still here. Try again.';
function normalized(values: Values): Values {
  return { ...values, name: values.name.trim(), email: values.email.trim() };
}

function SettingsLayout({
  children,
  label,
  pending,
  dirty,
  message,
  error,
  onSubmit,
  onCancel,
}: {
  children: React.ReactNode;
  label: string;
  pending: boolean;
  dirty: boolean;
  message: string;
  error: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}) {
  const status = pending
    ? 'Saving changes…'
    : message || (dirty ? 'You have unsaved changes.' : 'No unsaved changes.');
  return (
    <form
      aria-label={label}
      noValidate
      onSubmit={onSubmit}
      className="nx:grid nx:w-full nx:min-w-0 nx:gap-layout-section"
    >
      <div>
        <h2 className="nx:typography-heading-small">Profile settings</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          Update your details and preferences. Changes apply when you save.
        </p>
      </div>
      {children}
      <div className="nx:grid nx:gap-3 nx:border-t-default nx:border-border-default nx:pt-4">
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {status}
        </p>
        <FieldError>{error}</FieldError>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button type="submit" loading={pending} disabled={!dirty}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || pending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

function ReactHookFormExample({ onSave }: Props) {
  const id = React.useId();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const submitting = React.useRef(false);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const form = useForm<Values>({
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const name = useController({
    control: form.control,
    name: 'name',
    rules: { validate: (value) => !!value.trim() || 'Enter your name.' },
  });
  const email = useController({
    control: form.control,
    name: 'email',
    rules: {
      validate: () =>
        !!emailRef.current?.validity.valid || 'Enter a valid email address.',
    },
  });
  const updates = useController({ control: form.control, name: 'updates' });
  const { isDirty: dirty, isSubmitting: pending } = form.formState;
  const nameError = name.fieldState.error?.message;
  const emailError = email.fieldState.error?.message;
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
  function changeUpdates(checked: boolean | 'indeterminate') {
    updates.field.onChange(checked === true);
    clearFeedback();
  }
  function attachName(node: HTMLInputElement | null) {
    nameRef.current = node;
    name.field.ref(node);
  }
  function attachEmail(node: HTMLInputElement | null) {
    emailRef.current = node;
    email.field.ref(node);
  }
  async function save(values: Values) {
    const submitted = normalized(values);
    await onSave(submitted);
    form.reset(submitted);
    setMessage('Changes saved in this demo.');
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !dirty) return;
    submitting.current = true;
    clearFeedback();
    try {
      await form.handleSubmit(save)();
    } catch {
      setSaveError(failureMessage);
    } finally {
      submitting.current = false;
    }
  }
  function cancelChanges() {
    form.reset();
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  return (
    <SettingsLayout
      label="Profile settings with React Hook Form"
      pending={pending}
      dirty={dirty}
      message={message}
      error={saveError}
      onSubmit={submit}
      onCancel={cancelChanges}
    >
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!nameError} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-name`}>
              Name <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              {...name.field}
              ref={attachName}
              id={`${id}-name`}
              autoComplete="name"
              required
              disabled={pending}
              onChange={changeName}
              aria-invalid={!!nameError}
              aria-describedby={`${id}-name-help${nameError ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{nameError}</FieldError>
          </Field>
          <Field data-invalid={!!emailError} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-email`}>
              Email <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              {...email.field}
              ref={attachEmail}
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              onChange={changeEmail}
              aria-invalid={!!emailError}
              aria-describedby={`${id}-email-help${emailError ? ` ${id}-email-error` : ''}`}
            />
            <FieldDescription id={`${id}-email-help`}>
              Used for account notices and the updates you choose below.
            </FieldDescription>
            <FieldError id={`${id}-email-error`}>{emailError}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Preferences</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal" data-disabled={pending}>
            <Checkbox
              name={updates.field.name}
              ref={updates.field.ref}
              checked={updates.field.value}
              onBlur={updates.field.onBlur}
              id={`${id}-updates`}
              onCheckedChange={changeUpdates}
              disabled={pending}
              aria-describedby={`${id}-updates-help`}
            />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-updates`}>Product updates</FieldLabel>
              <FieldDescription id={`${id}-updates-help`}>
                Receive occasional news about new features. This preference is
                saved with your details.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </SettingsLayout>
  );
}

function TanStackFormExample({ onSave }: Props) {
  const id = React.useId();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const submitting = React.useRef(false);
  const [invalidField, setInvalidField] = React.useState<
    'name' | 'email' | null
  >(null);
  const [saved, setSaved] = React.useState(initialValues);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const form = useTanStackForm({
    defaultValues: saved,
    onSubmit: async ({ value, formApi }) => {
      const submitted = normalized(value);
      await onSave(submitted);
      setSaved(submitted);
      formApi.reset(submitted);
      setMessage('Changes saved in this demo.');
    },
    onSubmitInvalid: ({ value }) => {
      setInvalidField(value.name.trim() ? 'email' : 'name');
    },
  });
  const name = useField({
    form,
    name: 'name',
    validators: {
      onSubmit: ({ value }) => (value.trim() ? undefined : 'Enter your name.'),
    },
  });
  const email = useField({
    form,
    name: 'email',
    validators: {
      onSubmit: () =>
        emailRef.current?.validity.valid
          ? undefined
          : 'Enter a valid email address.',
    },
  });
  const updates = useField({ form, name: 'updates' });
  const dirty = useStore(form.store, (state) => !state.isDefaultValue);
  const pending = useStore(form.store, (state) => state.isSubmitting);
  React.useEffect(() => {
    if (!pending && invalidField) {
      (invalidField === 'name' ? nameRef : emailRef).current?.focus();
      setInvalidField(null);
    }
  }, [pending, invalidField]);
  const nameError = name.state.meta.errors[0];
  const emailError = email.state.meta.errors[0];
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
  function changeUpdates(checked: boolean | 'indeterminate') {
    updates.handleChange(checked === true);
    clearFeedback();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || form.state.isDefaultValue) return;
    submitting.current = true;
    clearFeedback();
    try {
      await form.handleSubmit();
    } catch {
      setSaveError(failureMessage);
    } finally {
      submitting.current = false;
    }
  }
  function cancelChanges() {
    form.reset();
    setSaveError('');
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  return (
    <SettingsLayout
      label="Profile settings with TanStack Form"
      pending={pending}
      dirty={dirty}
      message={message}
      error={saveError}
      onSubmit={submit}
      onCancel={cancelChanges}
    >
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!nameError} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-name`}>
              Name <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              name={name.name}
              ref={nameRef}
              value={name.state.value}
              onBlur={name.handleBlur}
              id={`${id}-name`}
              autoComplete="name"
              required
              disabled={pending}
              onChange={changeName}
              aria-invalid={!!nameError}
              aria-describedby={`${id}-name-help${nameError ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{nameError}</FieldError>
          </Field>
          <Field data-invalid={!!emailError} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-email`}>
              Email <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              name={email.name}
              ref={emailRef}
              value={email.state.value}
              onBlur={email.handleBlur}
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              onChange={changeEmail}
              aria-invalid={!!emailError}
              aria-describedby={`${id}-email-help${emailError ? ` ${id}-email-error` : ''}`}
            />
            <FieldDescription id={`${id}-email-help`}>
              Used for account notices and the updates you choose below.
            </FieldDescription>
            <FieldError id={`${id}-email-error`}>{emailError}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Preferences</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal" data-disabled={pending}>
            <Checkbox
              name={updates.name}
              checked={updates.state.value}
              onBlur={updates.handleBlur}
              id={`${id}-updates`}
              onCheckedChange={changeUpdates}
              disabled={pending}
              aria-describedby={`${id}-updates-help`}
            />
            <FieldContent>
              <FieldLabel htmlFor={`${id}-updates`}>Product updates</FieldLabel>
              <FieldDescription id={`${id}-updates-help`}>
                Receive occasional news about new features. This preference is
                saved with your details.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </SettingsLayout>
  );
}

const meta = {
  title: 'Patterns/Form Integrations',
  component: ReactHookFormExample,
  args: { onSave: fn(async (_values: Values) => {}) },
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
type Play = NonNullable<Story['play']>;

const verifySaveCancel: Play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const updates = canvas.getByRole('checkbox', { name: 'Product updates' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await expect(save).toBeDisabled();
  await userEvent.type(name, 'x');
  await expect(save).toBeEnabled();
  await userEvent.keyboard('{Backspace}');
  await expect(save).toBeDisabled();
  await userEvent.click(updates);
  await userEvent.click(updates);
  await expect(save).toBeDisabled();
  await userEvent.clear(name);
  await userEvent.type(name, 'Priya Patel');
  await userEvent.click(updates);
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(args.onSave).toHaveBeenCalledWith({
    name: 'Priya Patel',
    email: 'priya@example.com',
    updates: true,
  });
  await userEvent.type(name, ' unsaved');
  await userEvent.click(updates);
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Patel');
  await expect(name).toHaveFocus();
  await expect(updates).toBeChecked();
  await expect(save).toBeDisabled();
};

const verifyValidation: Play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const email = canvas.getByRole('textbox', { name: 'Email' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.clear(name);
  await userEvent.clear(email);
  await userEvent.type(email, 'invalid');
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(name).toHaveFocus());
  await expect(name).toHaveAccessibleDescription(/Enter your name/);
  await expect(email).toHaveAccessibleDescription(
    /Enter a valid email address/
  );
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.type(name, 'Priya Shah');
  await userEvent.type(email, 'still-invalid');
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(save);
  await waitFor(() => expect(email).toHaveFocus());
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await userEvent.clear(email);
  await userEvent.type(email, 'priya.shah@example.com');
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
};

const verifyPending: Play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  let completeSave: () => void = () => {};
  const response = new Promise<void>((resolve) => {
    completeSave = resolve;
  });
  args.onSave.mockImplementationOnce(() => response);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.type(name, ' Jr');
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Saving changes')
  );
  await expect(name).toBeDisabled();
  await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  await expect(canvas.getByRole('checkbox')).toBeDisabled();
  await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(save).toBeDisabled();
  await userEvent.keyboard('{Enter}');
  save.click();
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  completeSave();
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(name).toBeEnabled();
  await expect(save).toBeDisabled();
};

const verifyFailure: Play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  args.onSave.mockRejectedValueOnce(new Error('Demo save failed'));
  await userEvent.type(name, ' Jr');
  await userEvent.click(save);
  await expect(await canvas.findByRole('alert')).toHaveTextContent(
    'Your edits are still here'
  );
  await expect(name).toHaveValue('Priya Shah Jr');
  await expect(name).toBeEnabled();
  await expect(save).toBeEnabled();
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.type(name, ' unsaved');
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Shah Jr');
  await expect(save).toBeDisabled();
};

const verifyNarrow: Play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
  await expect(await canvas.findByRole('alert')).toBeVisible();
  const form = canvas.getByRole('form');
  await expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
};

export const ReactHookForm: Story = { play: verifySaveCancel };
export const TanStackForm: Story = {
  render: (args) => <TanStackFormExample {...args} />,
  play: verifySaveCancel,
};
export const ReactHookFormValidation: Story = { play: verifyValidation };
export const TanStackFormValidation: Story = {
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyValidation,
};
export const ReactHookFormSaving: Story = {
  args: {
    onSave: fn(
      (_values: Values) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  play: verifyPending,
};
export const TanStackFormSaving: Story = {
  args: {
    onSave: fn(
      (_values: Values) =>
        new Promise<void>((resolve) => setTimeout(resolve, 1000))
    ),
  },
  render: (args) => <TanStackFormExample {...args} />,
  play: verifyPending,
};
export const ReactHookFormFailure: Story = { play: verifyFailure };
export const TanStackFormFailure: Story = {
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
  render: (args) => (
    <div className="nx:w-full" style={{ maxWidth: 280 }}>
      <TanStackFormExample {...args} />
    </div>
  ),
  play: verifyNarrow,
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
