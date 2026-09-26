'use client';

import { Field, FieldError, FieldLabel } from '@/components/field/field';
import { Input } from '@/components/input/input';

export default function InputInvalid() {
  return (
    <Field data-invalid="true" className="nx:max-w-sm">
      <FieldLabel htmlFor="input-invalid-email">Email</FieldLabel>
      <Input
        id="input-invalid-email"
        type="email"
        defaultValue="ada@"
        aria-invalid
        aria-describedby="input-invalid-email-error"
      />
      <FieldError id="input-invalid-email-error">
        Enter a complete email address.
      </FieldError>
    </Field>
  );
}
