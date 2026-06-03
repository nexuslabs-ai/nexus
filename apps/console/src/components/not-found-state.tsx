import type { ReactNode } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@nexus/react';
import { IconFileOff } from '@tabler/icons-react';

interface NotFoundStateProps {
  /** Headline — e.g. "Contact not found". */
  title: string;
  /** Supporting copy — e.g. "This contact doesn't exist, or may have been removed.". */
  description: string;
  /** The back action — pass a single `<Link>`; it renders as an outline button. */
  children: ReactNode;
}

/**
 * The shared record-not-found state for the console's detail routes: a medallion
 * icon, a title + description, and a back link rendered as an outline button.
 * A thin wrapper over `EmptyState` that de-duplicates the near-identical local
 * `NotFound` each detail route used to inline (they differed only in copy + the
 * back target, which is now the `children` slot).
 */
export function NotFoundState({
  title,
  description,
  children,
}: NotFoundStateProps) {
  return (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconFileOff />
        </EmptyStateMedia>
        <EmptyStateTitle>{title}</EmptyStateTitle>
        <EmptyStateDescription>{description}</EmptyStateDescription>
      </EmptyStateHeader>
      <EmptyStateContent>
        <Button variant="outline" asChild>
          {children}
        </Button>
      </EmptyStateContent>
    </EmptyState>
  );
}
