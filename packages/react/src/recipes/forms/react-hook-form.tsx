'use client';

import * as React from 'react';
import { useController, useForm } from 'react-hook-form';

import { Checkbox } from '../../components/checkbox';
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
} from '../../components/field';
import { Input } from '../../components/input';
import { Separator } from '../../components/separator';

import {
  failureMessage,
  normalized,
  type Props,
  SettingsLayout,
  type Values,
} from './settings-layout';

export function ReactHookFormExample({ initialValues, onSave }: Props) {
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
    setMessage('Changes saved.');
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
