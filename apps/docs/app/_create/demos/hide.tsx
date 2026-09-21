'use client';
import type * as React from 'react';

import { Hide } from '@nexus_ds/react';
const box =
  'nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground';
function Example0() {
  return (
    <Hide above="lg" as="div">
      <div className={box}>
        Hidden when the viewport is <strong>lg</strong> (≥ 64rem) or wider —
        shown below it.
      </div>
    </Hide>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
    </div>
  );
}
