'use client';
import type * as React from 'react';

import { Progress } from '@nexus_ds/react';

function Example0() {
  const args: React.ComponentProps<typeof Progress> = {
    'aria-label': 'Progress',
    value: 60,
  };
  return <Progress {...args} />;
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {[0, 25, 50, 75, 100].map((pct) => (
        <div key={pct} className="nx:flex nx:flex-col nx:gap-2">
          <span className="nx:typography-label-default nx:tabular-nums nx:text-muted-foreground">
            {pct}%
          </span>
          <Progress value={pct} aria-label={`${pct}% complete`} />
        </div>
      ))}
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
