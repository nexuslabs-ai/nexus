'use client';

import * as React from 'react';

import {
  useField,
  useForm as useTanStackForm,
  useStore,
} from '@tanstack/react-form';

import { Checkbox } from '../../../components/checkbox';
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
} from '../../../components/field';
import { Input } from '../../../components/input';
import { Separator } from '../../../components/separator';

import {
  failureMessage,
  type SettingsFormProps,
  SettingsLayout,
  trimmed,
} from './settings-layout';

export function TanStackSettingsForm({
  initialValues,
  onSave,
}: SettingsFormProps) {
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
      const submitted = trimmed(value);
      await onSave(submitted);
      setSaved(submitted);
      formApi.reset(submitted);
      setMessage('Changes saved.');
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
