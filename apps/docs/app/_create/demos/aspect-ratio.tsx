'use client';
import type * as React from 'react';

import { AspectRatio } from '@nexus_ds/react';
function Placeholder({ label }: { label: string }) {
  return (
    <div className="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
      {label}
    </div>
  );
}
function Example0() {
  return (
    <div className="nx:w-full nx:max-w-md">
      <AspectRatio ratio={16 / 9}>
        <Placeholder label="16 / 9" />
      </AspectRatio>
    </div>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:items-start nx:gap-4">
      <div className="nx:w-40">
        <AspectRatio ratio={1}>
          <Placeholder label="1 / 1" />
        </AspectRatio>
      </div>
      <div className="nx:w-56">
        <AspectRatio ratio={16 / 9}>
          <Placeholder label="16 / 9" />
        </AspectRatio>
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
