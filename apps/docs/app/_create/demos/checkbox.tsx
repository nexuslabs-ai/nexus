'use client';
import * as React from 'react';

import { Label } from '@nexus_ds/react';
import { Checkbox } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Checkbox> = {
    'aria-label': 'Accept terms',
  };
  return <Checkbox {...args} />;
}
function Example1() {
  const uid = React.useId();
  const termsDescriptionId = `${uid}-terms-description`;
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:items-center nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox aria-label="Unchecked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Unchecked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox defaultChecked aria-label="Checked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Checked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox checked="indeterminate" aria-label="Indeterminate" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Indeterminate
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox disabled aria-label="Disabled unchecked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox disabled defaultChecked aria-label="Disabled checked" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled Checked
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox
              disabled
              checked="indeterminate"
              aria-label="Disabled indeterminate"
            />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Disabled Mixed
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Validation
        </h3>
        <div className="nx:flex nx:items-center nx:gap-6">
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox aria-invalid aria-label="Unchecked invalid" />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Invalid
            </span>
          </div>
          <div className="nx:flex nx:flex-col nx:items-center nx:gap-2">
            <Checkbox
              defaultChecked
              aria-invalid
              aria-label="Checked invalid"
            />
            <span className="nx:typography-label-small nx:text-muted-foreground">
              Invalid Checked
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Labels
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:gap-2">
            <Checkbox id={`${uid}-newsletter`} defaultChecked />
            <Label htmlFor={`${uid}-newsletter`}>Subscribe to newsletter</Label>
          </div>
          <div className="nx:flex nx:items-start nx:gap-2">
            <Checkbox
              id={`${uid}-terms`}
              aria-describedby={termsDescriptionId}
              className="nx:mt-0.5"
            />
            <div className="nx:grid nx:gap-1.5">
              <Label htmlFor={`${uid}-terms`}>
                Accept terms and conditions
              </Label>
              <p
                id={termsDescriptionId}
                className="nx:typography-body-default nx:text-muted-foreground"
              >
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Example2() {
  const args: React.ComponentProps<typeof Checkbox> = {
    'aria-label': 'Disabled checkbox',
    disabled: true,
  };
  return <Checkbox {...args} />;
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
