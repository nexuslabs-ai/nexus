import { Link } from '@tanstack/react-router';

import { formatDateTime } from '../../lib/format';
import type { Conversation } from '../../lib/inbox-api';

import { ConversationStatusBadge } from './inbox-ui';

interface ConversationListProps {
  conversations: Conversation[];
  /** The currently open conversation (`?c`), highlighted in the list. */
  activeId?: string;
}

export function ConversationList({
  conversations,
  activeId,
}: ConversationListProps) {
  return (
    <div className="nx:flex nx:min-h-0 nx:flex-1 nx:flex-col">
      <div className="nx:border-border-default nx:text-muted-foreground nx:border-b nx:px-4 nx:py-3 nx:typography-label-default">
        {conversations.length} conversation
        {conversations.length === 1 ? '' : 's'}
      </div>
      {/* Plain overflow (not ScrollArea): the truncating rows need a non-table
          scroll parent; rows are links, so the region stays keyboard-reachable. */}
      <div className="nx:min-h-0 nx:flex-1 nx:overflow-y-auto">
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                active={conversation.id === activeId}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
}: {
  conversation: Conversation;
  active: boolean;
}) {
  return (
    <Link
      to="/m/inbox"
      search={{ c: conversation.id }}
      resetScroll={false}
      data-active={active || undefined}
      className="nx:border-border-default nx:hover:bg-background-hover nx:data-[active]:bg-muted nx:flex nx:gap-3 nx:border-b nx:px-4 nx:py-3"
    >
      <div className="nx:flex nx:w-2 nx:shrink-0 nx:justify-center nx:pt-1.5">
        {conversation.unread && (
          <span
            role="img"
            aria-label="Unread"
            className="nx:bg-primary-background nx:size-2 nx:rounded-full"
          />
        )}
      </div>
      <div className="nx:min-w-0 nx:flex-1 nx:space-y-1">
        <div className="nx:flex nx:items-baseline nx:justify-between nx:gap-2">
          <span className="nx:text-foreground nx:truncate nx:typography-label-default">
            {conversation.customer}
          </span>
          <span className="nx:text-muted-foreground nx:shrink-0 nx:typography-label-small">
            {formatDateTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="nx:text-foreground nx:truncate nx:typography-body-default">
          {conversation.subject}
        </p>
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
          <p className="nx:text-muted-foreground nx:truncate nx:typography-body-default">
            {conversation.preview}
          </p>
          <ConversationStatusBadge status={conversation.status} />
        </div>
      </div>
    </Link>
  );
}
