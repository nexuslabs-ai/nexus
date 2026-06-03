import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Kbd,
  KbdGroup,
  ScrollArea,
  Skeleton,
  Textarea,
  toast,
} from '@nexus/react';
import { IconArrowLeft, IconChevronDown, IconSend } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { ErrorState } from '../../components/error-state';
import { formatDateTime, initials } from '../../lib/format';
import {
  type ConversationDetail,
  type ConversationStatus,
  fetchConversation,
  inboxKeys,
  type Message,
  replyToConversation,
  updateConversationStatus,
} from '../../lib/inbox-api';

import {
  ConversationStatusBadge,
  STATUS_OPTIONS,
  statusLabel,
} from './inbox-ui';

export function ConversationThread({ id }: { id: string }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: inboxKeys.conversation(id),
    queryFn: () => fetchConversation(id),
  });

  if (isPending) return <ThreadSkeleton />;
  if (isError) {
    return (
      <ErrorState
        message="Couldn't open this conversation."
        onRetry={refetch}
      />
    );
  }
  return <ThreadContent conversation={data.conversation} />;
}

function ThreadContent({ conversation }: { conversation: ConversationDetail }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // A reply changes this thread (new message) and the list (preview, time,
  // unread, order), so both keys are invalidated.
  const replyMutation = useMutation({
    mutationFn: (text: string) => replyToConversation(conversation.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboxKeys.conversation(conversation.id),
      });
      queryClient.invalidateQueries({ queryKey: inboxKeys.conversations });
      setBody('');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // A status change shows in both the thread header badge and the list row.
  const statusMutation = useMutation({
    mutationFn: (status: ConversationStatus) =>
      updateConversationStatus(conversation.id, status),
    onSuccess: ({ conversation: updated }) => {
      queryClient.invalidateQueries({
        queryKey: inboxKeys.conversation(conversation.id),
      });
      queryClient.invalidateQueries({ queryKey: inboxKeys.conversations });
      toast.success(`Marked as ${statusLabel(updated.status)}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Keep the latest message in view when the thread opens or grows — a sent
  // reply lands below the fold on mobile otherwise.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [conversation.messages.length]);

  const handleSend = () => {
    // ⌘↵ calls this directly, bypassing the Button's disabled state — guard
    // against a double-submit within the in-flight round-trip.
    if (replyMutation.isPending) return;
    const text = body.trim();
    if (!text) return;
    replyMutation.mutate(text);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="nx:flex nx:min-h-0 nx:flex-1 nx:flex-col">
      <header className="nx:border-border-default nx:flex nx:items-start nx:justify-between nx:gap-4 nx:border-b nx:px-6 nx:py-4">
        <div className="nx:flex nx:min-w-0 nx:items-start nx:gap-2">
          {/* Below lg the list is hidden once a thread is open, so the thread
              needs its own way back to it. */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="nx:-ml-2 nx:shrink-0 nx:lg:hidden"
          >
            <Link to="/m/inbox" search={{}} aria-label="Back to conversations">
              <IconArrowLeft />
            </Link>
          </Button>
          <div className="nx:min-w-0 nx:space-y-1">
            <h2 className="nx:typography-heading-medium nx:text-foreground nx:truncate">
              {conversation.subject}
            </h2>
            <p className="nx:text-muted-foreground nx:truncate nx:text-sm">
              {conversation.customer} · {conversation.customerEmail}
            </p>
          </div>
        </div>
        <div className="nx:flex nx:shrink-0 nx:items-center nx:gap-2">
          <ConversationStatusBadge status={conversation.status} />
          <StatusMenu
            status={conversation.status}
            onChange={(status) => statusMutation.mutate(status)}
            disabled={statusMutation.isPending}
          />
        </div>
      </header>

      <ScrollArea className="nx:min-h-0 nx:flex-1">
        <div className="nx:space-y-6 nx:px-6 nx:py-6">
          {conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="nx:border-border-default nx:border-t nx:p-4">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={`Reply to ${conversation.customer}…`}
          rows={3}
          aria-label="Reply message"
        />
        <div className="nx:mt-3 nx:flex nx:items-center nx:justify-between nx:gap-2">
          <p className="nx:text-muted-foreground nx:text-xs">
            Replies as {conversation.assignee} ·{' '}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
            </KbdGroup>{' '}
            to send
          </p>
          <Button
            onClick={handleSend}
            loading={replyMutation.isPending}
            disabled={!body.trim()}
          >
            <IconSend />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusMenu({
  status,
  onChange,
  disabled,
}: {
  status: ConversationStatus;
  onChange: (status: ConversationStatus) => void;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Status
          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* The radio items below are built from CONVERSATION_STATUSES, so the
            emitted value is always a ConversationStatus — the cast is sound. */}
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => onChange(value as ConversationStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.author === 'agent';
  return (
    <div className={`nx:flex nx:gap-3 ${isAgent ? 'nx:flex-row-reverse' : ''}`}>
      <Avatar className="nx:size-8 nx:shrink-0">
        <AvatarFallback className="nx:text-xs">
          {initials(message.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="nx:max-w-[75%] nx:min-w-0">
        <div
          className={`nx:flex nx:items-baseline nx:gap-2 ${isAgent ? 'nx:flex-row-reverse' : ''}`}
        >
          <span className="nx:text-foreground nx:text-sm nx:font-medium">
            {message.authorName}
          </span>
          <span className="nx:text-muted-foreground nx:text-xs">
            {formatDateTime(message.at)}
          </span>
        </div>
        <div
          className={`nx:mt-1 nx:rounded-lg nx:px-3 nx:py-2 nx:text-sm nx:whitespace-pre-wrap ${isAgent ? 'nx:bg-primary-subtle nx:text-primary-subtle-foreground' : 'nx:bg-muted nx:text-foreground'}`}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div className="nx:flex nx:min-h-0 nx:flex-1 nx:flex-col">
      <div className="nx:border-border-default nx:space-y-2 nx:border-b nx:px-6 nx:py-4">
        <Skeleton className="nx:h-6 nx:w-64 nx:max-w-full" />
        <Skeleton className="nx:h-4 nx:w-48" />
      </div>
      <div className="nx:flex-1 nx:space-y-6 nx:px-6 nx:py-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="nx:h-16 nx:w-3/4" />
        ))}
      </div>
    </div>
  );
}
