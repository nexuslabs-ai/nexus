import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Skeleton,
} from '@nexus/react';
import { IconInbox } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { useMediaQuery } from '../../hooks/use-media-query';
import { fetchConversations, inboxKeys } from '../../lib/inbox-api';

import { ConversationList } from './conversation-list';
import { ConversationThread } from './conversation-thread';

const inboxRoute = getRouteApi('/app/m/inbox');

export function InboxRoute() {
  const { data, isPending, isError } = useQuery({
    queryKey: inboxKeys.conversations,
    queryFn: fetchConversations,
  });
  const { c } = inboxRoute.useSearch();
  const conversations = data?.conversations;
  // The resizable split is a desktop affordance; below lg the panes toggle one
  // at a time (driven by `c`), so that layout renders instead of a drag handle.
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const listPane = (
    <>
      {isPending && <ListSkeleton />}
      {isError && <ListError />}
      {conversations && (
        <ConversationList conversations={conversations} activeId={c} />
      )}
    </>
  );

  // key={c} remounts on conversation switch so a drafted reply doesn't bleed
  // into the next thread's composer (cached data still renders immediately, so
  // there's no skeleton flash).
  const threadPane = c ? <ConversationThread id={c} key={c} /> : <EmptyPane />;

  return (
    // 3.5rem = the Topbar's fixed h-14, so the two-pane fills the rest of the
    // viewport and each pane scrolls internally instead of the whole page.
    <div className="nx:flex nx:h-[calc(100svh-3.5rem)] nx:flex-col nx:gap-4 nx:p-6">
      <header className="nx:space-y-1">
        <h1 className="nx:typography-heading-large nx:text-foreground">
          Inbox
        </h1>
        <p className="nx:text-muted-foreground">
          Customer conversations across every channel. Pick one to read and
          reply.
        </p>
      </header>

      {isDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="nx:border-border-default nx:min-h-0 nx:flex-1 nx:overflow-hidden nx:rounded-lg nx:border"
        >
          <ResizablePanel
            defaultSize="28%"
            minSize="20%"
            maxSize="45%"
            className="nx:flex nx:min-h-0 nx:flex-col"
          >
            {listPane}
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize conversation list" />
          <ResizablePanel className="nx:flex nx:min-h-0 nx:flex-col">
            {threadPane}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Below lg only one pane shows at a time, toggled by `c`.
        <div className="nx:border-border-default nx:flex nx:min-h-0 nx:flex-1 nx:overflow-hidden nx:rounded-lg nx:border">
          <aside
            className={`nx:min-h-0 nx:w-full nx:min-w-0 nx:flex-col ${c ? 'nx:hidden' : 'nx:flex'}`}
          >
            {listPane}
          </aside>
          <section
            className={`nx:min-h-0 nx:min-w-0 nx:flex-1 nx:flex-col ${c ? 'nx:flex' : 'nx:hidden'}`}
          >
            {threadPane}
          </section>
        </div>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="nx:flex-1 nx:space-y-4 nx:p-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="nx:space-y-2">
          <Skeleton className="nx:h-4 nx:w-32" />
          <Skeleton className="nx:h-3 nx:w-full" />
        </div>
      ))}
    </div>
  );
}

function ListError() {
  return (
    <p className="nx:text-error-foreground nx:p-4 nx:text-sm">
      Couldn&apos;t load conversations. Please try again.
    </p>
  );
}

function EmptyPane() {
  return (
    <EmptyState>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconInbox />
        </EmptyStateMedia>
        <EmptyStateTitle>No conversation selected</EmptyStateTitle>
        <EmptyStateDescription>
          Pick a conversation from the list to read the thread and reply.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  );
}
