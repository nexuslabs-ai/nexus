'use client';
import type * as React from 'react';

import { Skeleton } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Skeleton> = {
    className: 'nx:h-4 nx:w-48',
  };
  return <Skeleton {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <Skeleton className="nx:h-4 nx:w-48" />
      <Skeleton className="nx:size-12 nx:rounded-full" />
      <div className="nx:flex nx:flex-col nx:gap-2">
        <Skeleton className="nx:h-4 nx:w-full" />
        <Skeleton className="nx:h-4 nx:w-4/5" />
      </div>
      <div className="nx:flex nx:w-80 nx:max-w-full nx:flex-col nx:gap-4">
        <Skeleton className="nx:h-40 nx:w-full nx:rounded-lg" />
        <div className="nx:flex nx:items-center nx:gap-3">
          <Skeleton className="nx:size-10 nx:rounded-full" />
          <div className="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
            <Skeleton className="nx:h-4 nx:w-1/2" />
            <Skeleton className="nx:h-3 nx:w-3/4" />
          </div>
        </div>
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
