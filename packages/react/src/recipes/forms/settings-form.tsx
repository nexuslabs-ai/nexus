'use client';

import * as React from 'react';

import { SettingsFields } from './settings-fields';
import {
  failureMessage,
  normalized,
  type SettingsFormProps,
  SettingsLayout,
  type SettingsValues,
  validateEmail,
  validateName,
} from './settings-layout';

type SettingsErrors = { name?: string; email?: string };

export function SettingsForm({ initialValues, onSave }: SettingsFormProps) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const [saved, setSaved] = React.useState<SettingsValues>(initialValues);
  const [draft, setDraft] = React.useState(saved);
  const [errors, setErrors] = React.useState<SettingsErrors>({});
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
    const submitted = normalized(draft);
    setPending(true);
    try {
      await onSave(submitted);
      setSaved(submitted);
      setDraft(submitted);
      setMessage('Changes saved.');
    } catch {
      setSaveError(failureMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <SettingsLayout
      label="Profile settings"
      pending={pending}
      dirty={dirty}
      message={message}
      error={saveError}
      onSubmit={submit}
      onCancel={cancelChanges}
    >
      <SettingsFields
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
    </SettingsLayout>
  );
}
