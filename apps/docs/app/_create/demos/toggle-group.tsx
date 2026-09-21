'use client';
import type * as React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@nexus_ds/react';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from '@tabler/icons-react';

function Example0() {
  return (
    <ToggleGroup type="single" defaultValue="left">
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <IconAlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <IconAlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <IconAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" variant="outline" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        defaultValue="left"
      >
        <ToggleGroupItem value="left" aria-label="Spaced left">
          <IconAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Spaced center">
          <IconAlignCenter />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
function Example2() {
  return (
    <ToggleGroup type="single" defaultValue="left" disabled>
      <ToggleGroupItem value="left" aria-label="Align left">
        <IconAlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <IconAlignCenter />
      </ToggleGroupItem>
    </ToggleGroup>
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
