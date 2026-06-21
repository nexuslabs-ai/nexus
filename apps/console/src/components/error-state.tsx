import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@nexus/react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface ErrorStateProps {
  /** What failed to load, shown as the title — e.g. "Couldn't load contacts.". */
  message: string;
  /** Retry handler, typically the query's `refetch`. */
  onRetry: () => void;
  /** Border the frame to match a bordered-skeleton slot, so loading→error doesn't reflow. Default borderless. */
  bordered?: boolean;
}

/**
 * The shared load-error state for the console's data routes: an alert medallion,
 * the failure message, and a Try-again button. A thin wrapper over `EmptyState`
 * (the design system ships no separate error compound) so every route's error
 * reads the same and offers a retry — replacing the ad-hoc one-liners modules
 * used to inline.
 */
export function ErrorState({ message, onRetry, bordered }: ErrorStateProps) {
  return (
    <EmptyState bordered={bordered}>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconAlertTriangle />
        </EmptyStateMedia>
        <EmptyStateTitle>{message}</EmptyStateTitle>
      </EmptyStateHeader>
      <EmptyStateContent>
        {/* Wrap so the click event never reaches `onRetry` (refetch takes opts). */}
        <Button variant="outline" onClick={() => onRetry()}>
          <IconRefresh />
          Try again
        </Button>
      </EmptyStateContent>
    </EmptyState>
  );
}
