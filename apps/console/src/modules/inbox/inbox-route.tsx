import { Skeleton } from '@nexus/react';
import { IconInbox } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

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

      <div className="nx:border-border-default nx:flex nx:min-h-0 nx:flex-1 nx:overflow-hidden nx:rounded-lg nx:border">
        {/* List pane — full-width on mobile, fixed on desktop; hidden on mobile
            once a thread is open so the thread gets the whole screen. */}
        <aside
          className={`nx:border-border-default nx:w-full nx:min-h-0 nx:min-w-0 nx:flex-col nx:lg:flex nx:lg:w-80 nx:lg:border-r ${c ? 'nx:hidden' : 'nx:flex'}`}
        >
          {isPending && <ListSkeleton />}
          {isError && <ListError />}
          {conversations && (
            <ConversationList conversations={conversations} activeId={c} />
          )}
        </aside>

        {/* Thread pane — hidden on mobile until a conversation is selected. */}
        <section
          className={`nx:min-h-0 nx:min-w-0 nx:flex-1 nx:flex-col nx:lg:flex ${c ? 'nx:flex' : 'nx:hidden'}`}
        >
          {/* key={c} remounts on conversation switch so a drafted reply doesn't
              bleed into the next thread's composer (cached data still renders
              immediately, so there's no skeleton flash). */}
          {c ? <ConversationThread id={c} key={c} /> : <EmptyPane />}
        </section>
      </div>
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
    <div className="nx:flex nx:flex-1 nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:p-12 nx:text-center">
      <div className="nx:bg-muted nx:text-muted-foreground nx:flex nx:size-12 nx:items-center nx:justify-center nx:rounded-full">
        <IconInbox />
      </div>
      <h2 className="nx:typography-heading-medium nx:text-foreground">
        No conversation selected
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-sm">
        Pick a conversation from the list to read the thread and reply.
      </p>
    </div>
  );
}
