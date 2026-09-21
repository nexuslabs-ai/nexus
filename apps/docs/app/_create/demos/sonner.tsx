'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import { toast, Toaster } from '@nexus_ds/react';

function Example0() {
  return (
    <>
      <Button variant="outline" onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
      <Toaster />
    </>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Button variant="outline" onClick={() => toast('Default toast')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Success toast')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Error toast')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Warning toast')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Info toast')}>
        Info
      </Button>
      <Toaster richColors />
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
