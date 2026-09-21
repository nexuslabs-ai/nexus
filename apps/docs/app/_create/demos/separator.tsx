'use client';
import type * as React from 'react';

import { Separator } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Separator> = {};
  return <Separator {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6 nx:typography-label-default nx:text-foreground">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Horizontal</span>
        <Separator />
      </div>
      <div className="nx:flex nx:h-5 nx:items-center nx:gap-3">
        <span className="nx:text-muted-foreground">Vertical</span>
        <Separator orientation="vertical" />
        <span>before</span>
        <Separator orientation="vertical" />
        <span>after</span>
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
