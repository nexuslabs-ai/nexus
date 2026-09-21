'use client';
import type * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@nexus_ds/react';

function Example0() {
  return (
    <Avatar role="img" aria-label="Ada Lovelace">
      <AvatarImage src="/broken-image.jpg" alt="" />
      <AvatarFallback aria-hidden="true">AL</AvatarFallback>
    </Avatar>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="WithFallback">
        <h2 className="nx:typography-heading-small">With Fallback</h2>
        <Example0 />
      </section>
    </div>
  );
}
