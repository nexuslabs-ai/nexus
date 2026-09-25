import { Button } from '@nexus_ds/react';

export default function ButtonCoreVariants() {
  return (
    <div className="nx:flex nx:flex-wrap nx:gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
