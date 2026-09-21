'use client';
import type * as React from 'react';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@nexus_ds/react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';

function Example0() {
  const args: Partial<React.ComponentProps<typeof Alert>> = {
    layout: 'stack',
    presentation: 'card',
    variant: 'default',
  };
  return (
    <Alert {...args} className="nx:max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Default
        </div>
        <Alert className="nx:max-w-md">
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>
            This is a default informational alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Information
        </div>
        <Alert variant="information" className="nx:max-w-md">
          <AlertIcon>
            <IconInfoCircle />
          </AlertIcon>
          <AlertTitle>Information Alert</AlertTitle>
          <AlertDescription>This is an informational alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Destructive
        </div>
        <Alert variant="destructive" className="nx:max-w-md">
          <AlertIcon>
            <IconAlertCircle />
          </AlertIcon>
          <AlertTitle>Destructive Alert</AlertTitle>
          <AlertDescription>
            This is a destructive/error alert.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Success
        </div>
        <Alert variant="success" className="nx:max-w-md">
          <AlertIcon>
            <IconCircleCheck />
          </AlertIcon>
          <AlertTitle>Success Alert</AlertTitle>
          <AlertDescription>This is a success alert.</AlertDescription>
        </Alert>
      </div>

      <div>
        <div className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Warning
        </div>
        <Alert variant="warning" className="nx:max-w-md">
          <AlertIcon>
            <IconAlertTriangle />
          </AlertIcon>
          <AlertTitle>Warning Alert</AlertTitle>
          <AlertDescription>This is a warning alert.</AlertDescription>
        </Alert>
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
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
