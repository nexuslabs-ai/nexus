'use client';
import type * as React from 'react';

import { Textarea } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Textarea> = {
    placeholder: 'Tell us about yourself...',
  };
  return <Textarea {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8 nx:w-full nx:max-w-md">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Variants
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
              bordered
            </span>
            <Textarea placeholder="Bordered textarea" />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-20 nx:pt-2">
              borderless
            </span>
            <Textarea variant="borderless" placeholder="Borderless textarea" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          States
        </h3>
        <div className="nx:flex nx:flex-col nx:gap-3">
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              empty
            </span>
            <Textarea placeholder="Placeholder text" />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              filled
            </span>
            <Textarea
              defaultValue="Filled value spanning a couple of lines so the multi-line shape is visible."
              aria-label="Filled textarea"
            />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              disabled
            </span>
            <Textarea placeholder="Disabled" disabled />
          </div>
          <div className="nx:flex nx:items-start nx:gap-4">
            <span className="nx:typography-label-small nx:text-muted-foreground nx:w-16 nx:pt-2">
              invalid
            </span>
            <Textarea
              defaultValue="Invalid value"
              aria-invalid
              aria-label="Invalid textarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
function Example2() {
  const args: React.ComponentProps<typeof Textarea> = {
    placeholder: 'Cannot edit this',
    disabled: true,
  };
  return <Textarea {...args} />;
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
