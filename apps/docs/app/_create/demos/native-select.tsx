'use client';
import type * as React from 'react';

import { NativeSelect, NativeSelectOption } from '@nexus_ds/react';

function Example0() {
  return (
    <NativeSelect aria-label="Plan" defaultValue="pro">
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
      <NativeSelectOption value="team">Team</NativeSelectOption>
    </NativeSelect>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-3">
      <NativeSelect size="default" aria-label="Bordered" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        variant="borderless"
        aria-label="Borderless"
        defaultValue="pro"
      >
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small" defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Invalid" aria-invalid defaultValue="free">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Disabled" defaultValue="free" disabled>
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
function Example2() {
  return (
    <NativeSelect aria-label="Plan" defaultValue="free" disabled>
      <NativeSelectOption value="free">Free</NativeSelectOption>
      <NativeSelectOption value="pro">Pro</NativeSelectOption>
    </NativeSelect>
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
