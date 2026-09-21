'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import { Popover, PopoverContent, PopoverTrigger } from '@nexus_ds/react';

function Example0() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Place content for the popover here.
        </p>
      </PopoverContent>
    </Popover>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Trigger Variants
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Outline trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Secondary trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">Ghost trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="nx:typography-body-default">Popover content</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Placements
        </h3>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Top</Button>
            </PopoverTrigger>
            <PopoverContent side="top">
              <p className="nx:typography-body-default">Top</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Right</Button>
            </PopoverTrigger>
            <PopoverContent side="right">
              <p className="nx:typography-body-default">Right</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              <p className="nx:typography-body-default">Bottom</p>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Left</Button>
            </PopoverTrigger>
            <PopoverContent side="left">
              <p className="nx:typography-body-default">Left</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
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
