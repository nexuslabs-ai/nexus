'use client';
import * as React from 'react';

import { Label } from '@nexus_ds/react';
import { RadioGroup, RadioGroupItem } from '@nexus_ds/react';

function Example0() {
  const args: Partial<React.ComponentProps<typeof RadioGroup>> = {};
  return (
    <RadioGroup {...args} defaultValue="comfortable" aria-label="Density">
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="default" id="default-default" />
        <Label htmlFor="default-default">Default</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="comfortable" id="default-comfortable" />
        <Label htmlFor="default-comfortable">Comfortable</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="compact" id="default-compact" />
        <Label htmlFor="default-compact">Compact</Label>
      </div>
    </RadioGroup>
  );
}
function Example1() {
  const uid = React.useId();
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup aria-label="Unselected state">
              <RadioGroupItem value="a" aria-label="Unselected" />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Unselected
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup defaultValue="a" aria-label="Selected state">
              <RadioGroupItem value="a" aria-label="Selected" />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Selected
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup aria-label="Disabled state">
              <RadioGroupItem value="a" disabled aria-label="Disabled" />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup defaultValue="a" aria-label="Disabled selected state">
              <RadioGroupItem
                value="a"
                disabled
                aria-label="Disabled selected"
              />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled selected
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup aria-label="Invalid state">
              <RadioGroupItem value="a" aria-invalid aria-label="Invalid" />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Invalid
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <RadioGroup defaultValue="a" aria-label="Invalid selected state">
              <RadioGroupItem
                value="a"
                aria-invalid
                aria-label="Invalid selected"
              />
            </RadioGroup>
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Invalid selected
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With labels
        </h3>
        <RadioGroup defaultValue="comfortable" aria-label="Density">
          <div className="nx:flex nx:items-center nx:gap-2">
            <RadioGroupItem value="default" id={`${uid}-default`} />
            <Label htmlFor={`${uid}-default`}>Default</Label>
          </div>
          <div className="nx:flex nx:items-center nx:gap-2">
            <RadioGroupItem value="comfortable" id={`${uid}-comfortable`} />
            <Label htmlFor={`${uid}-comfortable`}>Comfortable</Label>
          </div>
          <div className="nx:flex nx:items-center nx:gap-2">
            <RadioGroupItem value="compact" id={`${uid}-compact`} />
            <Label htmlFor={`${uid}-compact`}>Compact</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
function Example2() {
  const args: Partial<React.ComponentProps<typeof RadioGroup>> = {};
  return (
    <RadioGroup
      {...args}
      defaultValue="one"
      disabled
      aria-label="Disabled options"
    >
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="one" id="disabled-one" />
        <Label htmlFor="disabled-one">Option one</Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <RadioGroupItem value="two" id="disabled-two" />
        <Label htmlFor="disabled-two">Option two</Label>
      </div>
    </RadioGroup>
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
