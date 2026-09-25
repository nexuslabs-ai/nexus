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

export type ProfileValues = { name: string; email: string; updates: boolean };
export type SaveProfile = (values: ProfileValues) => Promise<void>;

export const initialProfile: ProfileValues = {
  name: 'Priya Shah',
  email: 'priya@example.com',
  updates: false,
};

export const saveFailureMessage =
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

export function normalizeProfile(values: ProfileValues): ProfileValues {
  return { ...values, name: values.name.trim(), email: values.email.trim() };
}

type ProfileSettingsLayoutProps = {
  children: React.ReactNode;
  label: string;
  pending: boolean;
  dirty: boolean;
  message: string;
  error: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

export function ProfileSettingsLayout({
  children,
  label,
  pending,
  dirty,
  message,
  error,
  onSubmit,
  onCancel,
}: ProfileSettingsLayoutProps) {
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

export type ProfileTextBinding = {
  name: string;
  value: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
};

export type ProfileCheckboxBinding = {
  name: string;
  checked: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;
};

type ProfileFieldsProps = {
  nameField: ProfileTextBinding;
  emailField: ProfileTextBinding;
  updatesField: ProfileCheckboxBinding;
  pending: boolean;
};

export function ProfileFields({
  nameField,
  emailField,
  updatesField,
  pending,
}: ProfileFieldsProps) {
  const id = React.useId();
  return (
    <>
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!nameField.error} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-name`}>
              Name <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={nameField.ref}
              id={`${id}-name`}
              name={nameField.name}
              autoComplete="name"
              required
              value={nameField.value}
              onChange={nameField.onChange}
              onBlur={nameField.onBlur}
              disabled={pending}
              aria-invalid={!!nameField.error}
              aria-describedby={`${id}-name-help${nameField.error ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{nameField.error}</FieldError>
          </Field>
          <Field data-invalid={!!emailField.error} data-disabled={pending}>
            <FieldLabel htmlFor={`${id}-email`}>
              Email <FieldRequiredIndicator />
            </FieldLabel>
            <Input
              ref={emailField.ref}
              id={`${id}-email`}
              name={emailField.name}
              type="email"
              autoComplete="email"
              required
              value={emailField.value}
              onChange={emailField.onChange}
              onBlur={emailField.onBlur}
              disabled={pending}
              aria-invalid={!!emailField.error}
              aria-describedby={`${id}-email-help${emailField.error ? ` ${id}-email-error` : ''}`}
            />
            <FieldDescription id={`${id}-email-help`}>
              Used for account notices and the updates you choose below.
            </FieldDescription>
            <FieldError id={`${id}-email-error`}>{emailField.error}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet disabled={pending} className="nx:min-w-0">
        <FieldLegend>Preferences</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal" data-disabled={pending}>
            <Checkbox
              ref={updatesField.ref}
              id={`${id}-updates`}
              name={updatesField.name}
              checked={updatesField.checked}
              onCheckedChange={(checked) =>
                updatesField.onCheckedChange(checked === true)
              }
              onBlur={updatesField.onBlur}
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
    </>
  );
}
