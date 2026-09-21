'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@nexus_ds/react';

function Example0() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          Side Variants
        </h3>
        <div className="nx:flex nx:items-center nx:justify-center nx:gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Top tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Right tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Bottom tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Left tooltip</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="nx:text-foreground nx:mb-4 nx:typography-label-default">
          With Different Content
        </h3>
        <div className="nx:flex nx:items-center nx:justify-center nx:gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Short</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hi!</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Medium</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a medium length tooltip</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Long</Button>
            </TooltipTrigger>
            <TooltipContent className="nx:max-w-xs">
              <p>
                This tooltip has longer content that demonstrates how it handles
                text wrapping.
              </p>
            </TooltipContent>
          </Tooltip>
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
