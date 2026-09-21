'use client';
import * as React from 'react';

import { Checkbox } from '@nexus_ds/react';
import { FieldLegend, FieldSet } from '@nexus_ds/react';
import { RadioGroup, RadioGroupItem } from '@nexus_ds/react';
import {
  ChoiceRow,
  ChoiceRowContent,
  ChoiceRowDescription,
  ChoiceRowTitle,
} from '@nexus_ds/react';
function NotificationsRadioGroup() {
  const legendId = React.useId();

  return (
    <FieldSet className="nx:w-full nx:max-w-md">
      <FieldLegend id={legendId}>Delivery speed</FieldLegend>
      <RadioGroup aria-labelledby={legendId}>
        <ChoiceRow htmlFor="choice-radio-standard">
          <RadioGroupItem
            id="choice-radio-standard"
            value="standard"
            aria-labelledby="choice-radio-standard-title"
          />
          <ChoiceRowTitle id="choice-radio-standard-title">
            Standard
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-radio-priority">
          <RadioGroupItem
            id="choice-radio-priority"
            value="priority"
            aria-labelledby="choice-radio-priority-title"
          />
          <ChoiceRowTitle id="choice-radio-priority-title">
            Priority
          </ChoiceRowTitle>
        </ChoiceRow>
      </RadioGroup>
    </FieldSet>
  );
}
function Example0() {
  return (
    <div className="nx:w-full nx:max-w-md">
      <ChoiceRow htmlFor="choice-default">
        <Checkbox id="choice-default" aria-labelledby="choice-default-title" />
        <ChoiceRowTitle id="choice-default-title">
          Product updates
        </ChoiceRowTitle>
      </ChoiceRow>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:w-96 nx:max-w-full nx:flex-col nx:gap-6">
      <div className="nx:grid nx:gap-1">
        <ChoiceRow htmlFor="choice-all-unchecked">
          <Checkbox
            id="choice-all-unchecked"
            aria-labelledby="choice-all-unchecked-title"
          />
          <ChoiceRowTitle id="choice-all-unchecked-title">
            Unchecked checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-all-checked">
          <Checkbox
            id="choice-all-checked"
            defaultChecked
            aria-labelledby="choice-all-checked-title"
          />
          <ChoiceRowTitle id="choice-all-checked-title">
            Checked checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
        <ChoiceRow htmlFor="choice-all-disabled">
          <Checkbox
            id="choice-all-disabled"
            disabled
            aria-labelledby="choice-all-disabled-title"
          />
          <ChoiceRowTitle id="choice-all-disabled-title">
            Disabled checkbox
          </ChoiceRowTitle>
        </ChoiceRow>
      </div>
      <NotificationsRadioGroup />
      <ChoiceRow htmlFor="choice-all-description">
        <Checkbox
          id="choice-all-description"
          aria-labelledby="choice-all-description-title"
          aria-describedby="choice-all-description-help"
        />
        <ChoiceRowContent>
          <ChoiceRowTitle id="choice-all-description-title">
            With description
          </ChoiceRowTitle>
          <ChoiceRowDescription id="choice-all-description-help">
            Rows with helper text expand beyond the compact single-line rhythm.
          </ChoiceRowDescription>
        </ChoiceRowContent>
      </ChoiceRow>
    </div>
  );
}
function Example2() {
  return (
    <div className="nx:w-full nx:max-w-md">
      <ChoiceRow htmlFor="choice-disabled">
        <Checkbox
          id="choice-disabled"
          disabled
          aria-labelledby="choice-disabled-title"
        />
        <ChoiceRowTitle id="choice-disabled-title">
          Locked notifications
        </ChoiceRowTitle>
      </ChoiceRow>
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
