'use client';

import * as React from 'react';

import { Button } from '../../components/button';
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

export type SettingsValues = { name: string; email: string; updates: boolean };
export type SettingsFormProps = {
  initialValues: SettingsValues;
  onSave: (values: SettingsValues) => Promise<void>;
};

export function SettingsForm({ initialValues, onSave }: SettingsFormProps) {
  const id = React.useId();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const [saved, setSaved] = React.useState<SettingsValues>(initialValues);
  const [draft, setDraft] = React.useState(saved);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>(
    {}
  );
  const [pending, setPending] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const savingRef = React.useRef(false);
  const dirty =
    draft.name !== saved.name ||
    draft.email !== saved.email ||
    draft.updates !== saved.updates;

  function changeName(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, name: event.target.value });
    setErrors({ ...errors, name: undefined });
    setMessage('');
    setSaveError('');
  }
  function changeEmail(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, email: event.target.value });
    setErrors({ ...errors, email: undefined });
    setMessage('');
    setSaveError('');
  }
  function changeUpdates(checked: boolean | 'indeterminate') {
    setDraft({ ...draft, updates: checked === true });
    setMessage('');
    setSaveError('');
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
    if (savingRef.current || !dirty) return;
    const nextErrors = {
      name: draft.name.trim() ? undefined : 'Enter your name.',
      email: emailRef.current?.validity.valid
        ? undefined
        : 'Enter a valid email address.',
    };
    setErrors(nextErrors);
    setMessage('');
    setSaveError('');
    if (nextErrors.name || nextErrors.email) {
      (nextErrors.name ? nameRef : emailRef).current?.focus();
      return;
    }
    const submitted = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };
    savingRef.current = true;
    setPending(true);
    try {
      await onSave(submitted);
      setSaved(submitted);
      setDraft(submitted);
      setMessage('Changes saved.');
    } catch {
      setSaveError(
        'We could not save your changes. Your edits are still here. Try again.'
      );
    } finally {
      savingRef.current = false;
      setPending(false);
    }
  }
  const status = pending
    ? 'Saving changes…'
    : message || (dirty ? 'You have unsaved changes.' : 'No unsaved changes.');

  return (
    <form
      aria-label="Profile settings"
      noValidate
      onSubmit={submit}
      className="nx:grid nx:w-full nx:min-w-0 nx:gap-layout-section"
    >
      <div>
        <h2 className="nx:typography-heading-small">Profile settings</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          Update your details and preferences. Changes apply when you save.
        </p>
      </div>
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!errors.name} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-name`}>
              Name <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={nameRef}
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
              value={draft.name}
              onChange={changeName}
              disabled={pending}
              aria-invalid={!!errors.name}
              aria-describedby={`${id}-name-help${errors.name ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.email} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-email`}>
              Email <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              onChange={changeEmail}
              disabled={pending}
              aria-invalid={!!errors.email}
              aria-describedby={`${id}-email-help${errors.email ? ` ${id}-email-error` : ''}`}
            />
            <FieldDescription id={`${id}-email-help`}>
              Used for account notices and the updates you choose below.
            </FieldDescription>
            <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Preferences</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal" data-disabled={pending}>
            <Checkbox
              id={`${id}-updates`}
              name="updates"
              checked={draft.updates}
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
      <div className="nx:grid nx:gap-3 nx:border-t-default nx:border-border-default nx:pt-4">
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {status}
        </p>
        <FieldError>{saveError}</FieldError>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button type="submit" loading={pending} disabled={!dirty}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || pending}
            onClick={cancelChanges}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
