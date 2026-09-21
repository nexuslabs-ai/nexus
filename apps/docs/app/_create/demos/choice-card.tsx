'use client';
import type * as React from 'react';

import { Checkbox } from '@nexus_ds/react';
import { RadioGroup, RadioGroupItem } from '@nexus_ds/react';
import {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  type ChoiceCardProps,
  ChoiceCardTitle,
} from '@nexus_ds/react';
function CheckboxChoiceCard({
  defaultChecked,
  description,
  disabled,
  id,
  invalid,
  title,
  trailing,
  variant,
}: CheckboxChoiceCardProps) {
  const checkbox = (
    <Checkbox
      id={id}
      defaultChecked={defaultChecked}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    />
  );
  const content = (
    <ChoiceCardContent>
      <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
      <ChoiceCardDescription id={`${id}-description`}>
        {description}
      </ChoiceCardDescription>
    </ChoiceCardContent>
  );

  return (
    <ChoiceCard htmlFor={id} variant={variant}>
      {trailing ? content : checkbox}
      {trailing ? checkbox : content}
    </ChoiceCard>
  );
}
function RadioChoiceCard({
  defaultValue,
  description,
  disabled,
  id,
  invalid,
  title,
  trailing,
  variant,
}: RadioChoiceCardProps) {
  const item = (
    <RadioGroupItem
      id={id}
      value={id}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    />
  );
  const content = (
    <ChoiceCardContent>
      <ChoiceCardTitle id={`${id}-title`}>{title}</ChoiceCardTitle>
      <ChoiceCardDescription id={`${id}-description`}>
        {description}
      </ChoiceCardDescription>
    </ChoiceCardContent>
  );

  return (
    <RadioGroup aria-label={title} defaultValue={defaultValue ?? id}>
      <ChoiceCard htmlFor={id} variant={variant}>
        {trailing ? content : item}
        {trailing ? item : content}
      </ChoiceCard>
    </RadioGroup>
  );
}
interface CheckboxChoiceCardProps {
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  trailing?: boolean;
  variant?: ChoiceCardVariant;
}
interface RadioChoiceCardProps {
  defaultValue?: string;
  description: string;
  disabled?: boolean;
  id: string;
  invalid?: boolean;
  title: string;
  trailing?: boolean;
  variant?: ChoiceCardVariant;
}
type ChoiceCardVariant = ChoiceCardProps['variant'];
function Example0() {
  const { variant }: Partial<React.ComponentProps<typeof ChoiceCard>> = {
    variant: 'bordered',
  };
  return (
    <div className="nx:w-96 nx:max-w-full">
      <ChoiceCard htmlFor="choice-card-default" variant={variant}>
        <Checkbox
          id="choice-card-default"
          aria-labelledby="choice-card-default-title"
          aria-describedby="choice-card-default-description"
        />
        <ChoiceCardContent>
          <ChoiceCardTitle id="choice-card-default-title">
            Product updates
          </ChoiceCardTitle>
          <ChoiceCardDescription id="choice-card-default-description">
            News about features and improvements.
          </ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:grid nx:w-full nx:max-w-4xl nx:grid-cols-1 nx:gap-6 nx:md:grid-cols-2">
      <div className="nx:grid nx:gap-3">
        <CheckboxChoiceCard
          id="choice-card-checkbox-bordered"
          title="Checkbox bordered"
          description="Default rich option card with a visible frame."
        />
        <CheckboxChoiceCard
          id="choice-card-checkbox-borderless"
          variant="borderless"
          title="Checkbox borderless"
          description="Quiet option card with no resting frame."
        />
      </div>
      <div className="nx:grid nx:gap-3">
        <RadioChoiceCard
          id="choice-card-radio-bordered"
          title="Radio bordered"
          description="Radio choices use the same card shell."
        />
        <RadioChoiceCard
          id="choice-card-radio-borderless"
          variant="borderless"
          trailing
          title="Radio borderless"
          description="Trailing controls use child order and top alignment."
        />
      </div>
    </div>
  );
}
function Example2() {
  return (
    <div className="nx:grid nx:w-96 nx:max-w-full nx:gap-3">
      <CheckboxChoiceCard
        id="choice-card-disabled"
        disabled
        title="Locked notifications"
        description="This setting is managed by your workspace."
      />
      <CheckboxChoiceCard
        id="choice-card-disabled-checked"
        disabled
        defaultChecked
        title="Disabled selected"
        description="Selected state does not override disabled styling."
      />
      <CheckboxChoiceCard
        id="choice-card-disabled-invalid"
        disabled
        invalid
        title="Disabled invalid"
        description="Invalid state does not override disabled styling."
      />
      <RadioChoiceCard
        id="choice-card-disabled-radio"
        disabled
        title="Disabled radio"
        description="Radio disabled state styles the card shell."
      />
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
