'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@nexus_ds/react';
import { IconSelector } from '@tabler/icons-react';

function Example0() {
  return (
    <Collapsible className="nx:flex nx:w-72 nx:max-w-full nx:flex-col">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
          <span className="nx:typography-label-default nx:text-foreground">
            @nexus starred 3 repositories
          </span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Toggle repositories">
              <IconSelector />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
          @radix-ui/react-collapsible
        </div>
      </div>
      {/* Spacing lives inside the content (overflow-hidden contains it), so
          there is no parent flex `gap` to snap when it collapses to height 0. */}
      <CollapsibleContent>
        <div className="nx:mt-2 nx:flex nx:flex-col nx:gap-2">
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
            @radix-ui/react-toggle
          </div>
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
            @radix-ui/react-slider
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <Collapsible className="nx:flex nx:w-64 nx:max-w-full nx:flex-col">
        <CollapsibleTrigger asChild>
          <Button variant="outline">Closed by default</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-muted-foreground">
            Hidden until toggled.
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        defaultOpen
        className="nx:flex nx:w-64 nx:max-w-full nx:flex-col"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline">Open by default</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-muted-foreground">
            Visible on first render.
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
function Example2() {
  const args: Partial<React.ComponentProps<typeof Collapsible>> = {};
  return (
    <Collapsible
      disabled
      onOpenChange={args.onOpenChange}
      className="nx:flex nx:w-72 nx:max-w-full nx:flex-col"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="nx:mt-2 nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
          Unreachable while disabled.
        </div>
      </CollapsibleContent>
    </Collapsible>
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
