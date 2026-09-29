import * as React from 'react';

import { Button } from '../../../components/button';
import { FieldError } from '../../../components/field';

export type SettingsValues = { name: string; email: string; updates: boolean };
export type SettingsFormProps = {
  initialValues: SettingsValues;
  onSave: (values: SettingsValues) => Promise<SettingsValues>;
};

export const failureMessage =
  'We could not save your changes. Your edits are still here. Try again.';

// The WHATWG "valid email address" production, matching native type="email".
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateName(value: string) {
  return value.trim() ? undefined : 'Enter your name.';
}

export function validateEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
    ? undefined
    : 'Enter a valid email address.';
}

export function trimmed(values: SettingsValues): SettingsValues {
  return { ...values, name: values.name.trim(), email: values.email.trim() };
}

/** Keeps only the form's fields from the record onSave resolves with. */
export function savedValues({ name, email, updates }: SettingsValues) {
  return { name, email, updates };
}

export function SettingsLayout({
  children,
  label,
  pending,
  dirty,
  message,
  error,
  onSubmit,
  onCancel,
  saveRef,
}: {
  children: React.ReactNode;
  label: string;
  pending: boolean;
  dirty: boolean;
  message: string;
  error: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  saveRef: React.Ref<HTMLButtonElement>;
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
          <Button
            ref={saveRef}
            type="submit"
            loading={pending}
            disabled={!dirty}
          >
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
