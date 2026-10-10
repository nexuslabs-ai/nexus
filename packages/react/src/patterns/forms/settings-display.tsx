'use client';

import * as React from 'react';

import { Checkbox } from '../../components/checkbox';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../../components/description-list';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../../components/field';
import { Input } from '../../components/input';

export function ReadOnlyDetails({
  name,
  email,
  team,
}: {
  name: string;
  email: string;
  team?: string;
}) {
  return (
    <section className="nx:grid nx:gap-container">
      <div>
        <h2 className="nx:typography-heading-small">Account details</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          These details are managed by your organization. Contact an
          administrator to change them.
        </p>
      </div>
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription>{name}</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Email</DescriptionListTerm>
          <DescriptionListDescription>{email}</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Team</DescriptionListTerm>
          <DescriptionListDescription>
            {team || (
              <span className="nx:text-muted-foreground">Not provided</span>
            )}
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </section>
  );
}

export function DisabledSettings({ address }: { address: string }) {
  const id = React.useId();
  return (
    <FieldSet disabled className="nx:min-w-0">
      <FieldLegend>Delivery settings</FieldLegend>
      <FieldDescription id={`${id}-reason`}>
        Delivery is paused while your address is being verified.
      </FieldDescription>
      <FieldGroup className="nx:gap-container">
        <Field data-disabled="true">
          <FieldLabel htmlFor={`${id}-address`}>Delivery address</FieldLabel>
          <Input
            id={`${id}-address`}
            defaultValue={address}
            disabled
            aria-describedby={`${id}-reason`}
          />
        </Field>
        <Field orientation="horizontal" data-disabled="true">
          <Checkbox
            id={`${id}-tracking`}
            disabled
            defaultChecked
            aria-describedby={`${id}-reason`}
          />
          <FieldLabel htmlFor={`${id}-tracking`}>
            Send tracking updates
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
