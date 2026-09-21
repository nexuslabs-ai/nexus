'use client';
import type * as React from 'react';

import { Input } from '@nexus_ds/react';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@nexus_ds/react';

function Example0() {
  return (
    <div className="nx:w-full nx:max-w-md">
      <Field>
        <FieldLabel htmlFor="field-email">Email</FieldLabel>
        <Input id="field-email" type="email" placeholder="you@example.com" />
        <FieldDescription>We never share it.</FieldDescription>
      </Field>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:w-80 nx:max-w-full nx:rounded-lg nx:border nx:border-border-default nx:bg-container nx:p-6">
      <FieldSet>
        <FieldLegend variant="legend">Account</FieldLegend>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            aria-label="Email"
            placeholder="you@example.com"
          />
          <FieldDescription>We never share it.</FieldDescription>
        </Field>
        <FieldSeparator>OR</FieldSeparator>
        <Field data-invalid="true">
          <FieldLabel>Username</FieldLabel>
          <Input aria-label="Username" aria-invalid />
          <FieldError errors={[{ message: 'That username is taken.' }]} />
        </Field>
      </FieldSet>
    </div>
  );
}
function Example2() {
  return (
    <div className="nx:w-full nx:max-w-md">
      <Field data-disabled="true">
        <FieldLabel htmlFor="field-disabled">Email</FieldLabel>
        <Input id="field-disabled" type="email" disabled />
        <FieldDescription>This field is locked.</FieldDescription>
      </Field>
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
