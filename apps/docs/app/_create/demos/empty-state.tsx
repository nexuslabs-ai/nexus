'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@nexus_ds/react';
import { IconUsers } from '@tabler/icons-react';

function Example0() {
  return (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers aria-hidden />
        </EmptyStateMedia>
        <EmptyStateTitle>No contacts yet</EmptyStateTitle>
        <EmptyStateDescription>
          Add your first contact to start building your CRM.
        </EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button>Add contact</Button>
      </EmptyStateContent>
    </EmptyState>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <EmptyState bordered>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <IconUsers aria-hidden />
          </EmptyStateMedia>
          <EmptyStateTitle>No contacts yet</EmptyStateTitle>
          <EmptyStateDescription>
            Add your first contact to get started.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button>Add contact</Button>
        </EmptyStateContent>
      </EmptyState>

      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="default">
            <IconUsers
              aria-hidden
              className="nx:size-12 nx:text-muted-foreground"
            />
          </EmptyStateMedia>
          <EmptyStateTitle>No results</EmptyStateTitle>
          <EmptyStateDescription>
            Try adjusting your filters.
          </EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
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
