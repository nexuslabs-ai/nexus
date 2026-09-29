'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

import {
  useField,
  useForm as useTanStackForm,
  useStore,
} from '@tanstack/react-form';

import { SettingsFields } from '../settings-fields';
import {
  failureMessage,
  savedValues,
  type SettingsFormProps,
  SettingsLayout,
  type SettingsValues,
  trimmed,
  validateEmail,
  validateName,
} from '../settings-layout';

export function TanStackSettingsForm({
  initialValues,
  onSave,
}: SettingsFormProps) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const savingRef = React.useRef(false);
  const [saved, setSaved] = React.useState(initialValues);
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const form = useTanStackForm({
    defaultValues: saved,
    onSubmit: async ({ value, formApi }) => {
      setPending(true);
      let record: SettingsValues;
      try {
        record = await onSave(trimmed(value));
      } catch {
        flushSync(() => {
          setSaveError(failureMessage);
          setPending(false);
        });
        saveRef.current?.focus();
        return;
      }
      const baseline = savedValues(record);
      flushSync(() => {
        formApi.reset(baseline);
        setSaved(baseline);
        setMessage('Changes saved.');
        setPending(false);
      });
      nameRef.current?.focus();
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
  function clearFeedback() {
    setMessage('');
    setSaveError('');
  }
  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    name.handleChange(event.target.value);
    clearFeedback();
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    email.handleChange(event.target.value);
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
    if (savingRef.current || form.state.isDefaultValue) return;
    savingRef.current = true;
    clearFeedback();
    try {
      await form.handleSubmit();
    } finally {
      savingRef.current = false;
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
    <SettingsLayout
      label="Profile settings with TanStack Form"
      pending={pending}
      dirty={dirty}
      message={message}
      error={saveError}
      onSubmit={submit}
      onCancel={cancelChanges}
      saveRef={saveRef}
    >
      <SettingsFields
        pending={pending}
        nameField={{
          name: name.name,
          ref: nameRef,
          value: name.state.value,
          error: name.state.meta.errors[0],
          onChange: changeName,
        }}
        emailField={{
          name: email.name,
          ref: emailRef,
          value: email.state.value,
          error: email.state.meta.errors[0],
          onChange: changeEmail,
        }}
        updatesField={{
          name: updates.name,
          checked: updates.state.value,
          onCheckedChange: changeUpdates,
        }}
      />
    </SettingsLayout>
  );
}
