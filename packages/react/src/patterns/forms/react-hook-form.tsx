'use client';

import * as React from 'react';
import { useController, useForm } from 'react-hook-form';

import { SettingsFields } from './settings-fields';
import {
  FAILURE_MESSAGE,
  normalize,
  restoreDroppedFocus,
  type SettingsFormProps,
  SettingsLayout,
  type SettingsValues,
  validateEmail,
  validateName,
} from './settings-layout';

export function ReactHookFormExample({
  title,
  initialValues,
  onSave,
}: SettingsFormProps) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState('');
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
  const { isDirty: dirty, isSubmitting: pending, errors } = form.formState;
  function clearFeedback() {
    setMessage('');
    form.clearErrors('root.server');
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
    const submitted = normalize(values);
    try {
      await onSave(submitted);
    } catch {
      form.setError('root.server', { message: FAILURE_MESSAGE });
      return;
    }
    form.reset(submitted);
    setMessage('Changes saved.');
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    setMessage('');
    await form.handleSubmit(save)(event);
    restoreDroppedFocus(nameRef.current);
  }
  function cancelChanges() {
    form.reset();
    setMessage('Changes discarded.');
    nameRef.current?.focus();
  }
  return (
    <SettingsLayout
      title={title}
      pending={pending}
      dirty={dirty}
      message={message}
      error={errors.root?.server?.message ?? ''}
      onSubmit={submit}
      onCancel={cancelChanges}
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
