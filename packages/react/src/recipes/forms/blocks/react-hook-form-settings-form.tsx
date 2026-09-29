'use client';

import * as React from 'react';
import { useController, useForm } from 'react-hook-form';
import { flushSync } from 'react-dom';

import { SettingsFields } from './settings-fields';
import {
  failureMessage,
  savedValues,
  type SettingsFormProps,
  SettingsLayout,
  type SettingsValues,
  trimmed,
  validateEmail,
  validateName,
} from './settings-layout';

export function ReactHookFormSettingsForm({
  initialValues,
  onSave,
}: SettingsFormProps) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const [message, setMessage] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const form = useForm<SettingsValues>({
    defaultValues: initialValues,
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
  const dirty = form.formState.isDirty;
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
  async function save(values: SettingsValues) {
    setPending(true);
    let record: SettingsValues;
    try {
      record = await onSave(trimmed(values));
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
      form.reset(baseline);
      setMessage('Changes saved.');
      setPending(false);
    });
    nameRef.current?.focus();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    clearFeedback();
    await form.handleSubmit(save)();
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
      saveRef={saveRef}
    >
      <SettingsFields
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
    </SettingsLayout>
  );
}
