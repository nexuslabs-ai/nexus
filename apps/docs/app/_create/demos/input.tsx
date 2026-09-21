'use client';
import type * as React from 'react';

import { Input } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Input> = {
    placeholder: 'Enter text...',
  };
  return <Input {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-md nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Read-only
        </span>
        <Input
          aria-label="Read-only account id"
          aria-describedby="input-readonly-note"
          defaultValue="acct_1024"
          readOnly
        />
        <p
          id="input-readonly-note"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Value can be selected and submitted, but not edited here.
        </p>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Disabled
        </span>
        <Input
          aria-label="Disabled account id"
          aria-describedby="input-disabled-note"
          defaultValue="acct_1024"
          disabled
        />
        <p
          id="input-disabled-note"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Value is unavailable and should not be submitted from this control.
        </p>
      </div>
    </div>
  );
}
function Example2() {
  return (
    <div className="nx:flex nx:w-full nx:max-w-md nx:flex-col nx:gap-4">
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Warning
        </span>
        <Input
          aria-label="Warning budget"
          aria-describedby="input-warning-message"
          defaultValue="95"
          className="nx:border-border-warning"
        />
        <p
          id="input-warning-message"
          className="nx:typography-body-small nx:text-warning-subtle-foreground"
        >
          Near the monthly limit. You can continue.
        </p>
      </div>
      <div className="nx:grid nx:gap-1.5">
        <span className="nx:typography-label-default nx:text-foreground">
          Error
        </span>
        <Input
          aria-label="Invalid budget"
          aria-describedby="input-error-help"
          aria-errormessage="input-error-message"
          aria-invalid
          defaultValue="125"
        />
        <p
          id="input-error-help"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          Enter a value from 0 to 100.
        </p>
        <p
          id="input-error-message"
          role="alert"
          className="nx:typography-body-small nx:text-error-subtle-foreground"
        >
          Budget cannot exceed 100.
        </p>
      </div>
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
      <section
        className="nx:space-y-4 nx:max-w-full"
        aria-label="ReadOnlyVsDisabled"
      >
        <h2 className="nx:typography-heading-small">Read Only Vs Disabled</h2>
        <Example1 />
      </section>
      <section
        className="nx:space-y-4 nx:max-w-full"
        aria-label="WarningVsError"
      >
        <h2 className="nx:typography-heading-small">Warning Vs Error</h2>
        <Example2 />
      </section>
    </div>
  );
}
