'use client';

import { Button } from '@nexus_ds/react';

export default function ButtonVariants() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
