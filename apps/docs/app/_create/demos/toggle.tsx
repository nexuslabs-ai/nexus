'use client';
import type * as React from 'react';

import { Toggle } from '@nexus_ds/react';
import { IconBold, IconItalic } from '@tabler/icons-react';

function Example0() {
  return (
    <Toggle aria-label="Bold">
      <IconBold />
    </Toggle>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle aria-label="Default off">
          <IconBold />
        </Toggle>
        <Toggle aria-label="Default on" defaultPressed>
          <IconBold />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline off">
          <IconItalic />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline on" defaultPressed>
          <IconItalic />
        </Toggle>
      </div>
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle size="sm" aria-label="Small">
          <IconBold />
        </Toggle>
        <Toggle size="default" aria-label="Medium">
          <IconBold />
        </Toggle>
        <Toggle size="lg" aria-label="Large">
          <IconBold />
        </Toggle>
      </div>
    </div>
  );
}
function Example2() {
  const args: Partial<React.ComponentProps<typeof Toggle>> = {};
  return (
    <Toggle aria-label="Bold" disabled onPressedChange={args.onPressedChange}>
      <IconBold />
    </Toggle>
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
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
