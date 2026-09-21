'use client';
import type * as React from 'react';

import { Input } from '@nexus_ds/react';
import { Label } from '@nexus_ds/react';

function Example0() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="WithInput">
        <h2 className="nx:typography-heading-small">With Input</h2>
        <Example0 />
      </section>
    </div>
  );
}
