'use client';
import type * as React from 'react';

import { Spinner } from '@nexus_ds/react';

function Example0() {
  return <Spinner />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:text-foreground">
      <div className="nx:flex nx:items-center nx:gap-4">
        <Spinner className="nx:size-4" />
        <Spinner className="nx:size-6" />
        <Spinner className="nx:size-8" />
      </div>
      <div className="nx:flex nx:items-center nx:gap-2 nx:typography-label-default nx:text-muted-foreground">
        <Spinner className="nx:size-4" />
        <span>Loading more…</span>
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
