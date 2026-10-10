import * as React from 'react';

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

export type SettingsTextBinding = {
  name: string;
  value: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
};

export type SettingsCheckboxBinding = {
  name: string;
  checked: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;
};

export function SettingsFields({
  nameField,
  emailField,
  updatesField,
  pending,
}: {
  nameField: SettingsTextBinding;
  emailField: SettingsTextBinding;
  updatesField: SettingsCheckboxBinding;
  pending: boolean;
}) {
  const id = React.useId();
  return (
    <>
      <FieldSet className="nx:min-w-0">
        <FieldLegend>Personal details</FieldLegend>
        <FieldGroup className="nx:gap-container">
          <Field data-invalid={!!nameField.error}>
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
              readOnly={pending}
              aria-invalid={!!nameField.error}
              aria-describedby={`${id}-name-help${nameField.error ? ` ${id}-name-error` : ''}`}
            />
            <FieldDescription id={`${id}-name-help`}>
              The name other people see when you collaborate.
            </FieldDescription>
            <FieldError id={`${id}-name-error`}>{nameField.error}</FieldError>
          </Field>
          <Field data-invalid={!!emailField.error}>
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
              readOnly={pending}
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
      <FieldSet className="nx:min-w-0">
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
