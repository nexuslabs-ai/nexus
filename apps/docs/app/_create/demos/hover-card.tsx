'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@nexus_ds/react';

function Example0() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="nx:flex nx:flex-col nx:gap-1">
          <p className="nx:typography-label-default nx:font-semibold nx:text-foreground">
            @nexus
          </p>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            The AI-native design system. Joined March 2026.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
function Example1() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nexus</Button>
      </HoverCardTrigger>
      <HoverCardContent>Joined March 2026</HoverCardContent>
    </HoverCard>
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
