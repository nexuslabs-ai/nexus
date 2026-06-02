/**
 * Inbox API client. Thin typed wrappers over the mock endpoints served by MSW
 * (`src/mocks/handlers.ts`) — there is no real backend. Mirrors the CRM/Projects
 * shape: a single query-key object, fetch/mutate fns, and an `as const` enum that
 * single-sources both the union type and the status badge.
 *
 * The list and detail payloads deliberately differ: the list row carries a lean
 * `preview` + `lastMessageAt`, while the thread carries the full `messages` array
 * — so the conversation list never ships every message body.
 */

/**
 * Conversation lifecycle statuses — the single source for the
 * {@link ConversationStatus} union and the thread's status menu.
 */
export const CONVERSATION_STATUSES = ['open', 'pending', 'closed'] as const;

/** Where a conversation sits in its lifecycle — rendered as a status badge. */
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

/** A single message in a conversation thread. */
export type Message = {
  id: string;
  /** Who wrote it — drives bubble alignment and the avatar. */
  author: 'customer' | 'agent';
  authorName: string;
  body: string;
  /** ISO timestamp (date + time) — rendered with {@link formatDateTime}. */
  at: string;
};

/** Fields shared by the list row and the thread header. */
type ConversationBase = {
  id: string;
  customer: string;
  customerEmail: string;
  subject: string;
  status: ConversationStatus;
  /** Team member handling the conversation — also signs agent replies. */
  assignee: string;
  /** Whether the latest customer message is still unhandled — shown as a dot. */
  unread: boolean;
};

/** List-row shape: the lean preview, without the message bodies. */
export type Conversation = ConversationBase & {
  /** The most recent message's body — the list preview (CSS-truncated). */
  preview: string;
  /** ISO timestamp of the most recent message — the list sorts + labels by it. */
  lastMessageAt: string;
};

/** Thread shape: the full message history, without the list-only preview fields. */
export type ConversationDetail = ConversationBase & {
  messages: Message[];
};

/**
 * TanStack Query keys for the Inbox module — declared once so the list, thread,
 * and mutations can't drift apart (a mismatched key silently breaks cache
 * invalidation).
 */
export const inboxKeys = {
  all: ['inbox'] as const,
  conversations: ['inbox', 'conversations'] as const,
  conversation: (id: string) => ['inbox', 'conversation', id] as const,
};

export async function fetchConversations(): Promise<{
  conversations: Conversation[];
}> {
  const res = await fetch('/api/inbox/conversations');
  if (!res.ok) {
    throw new Error('Failed to load conversations. Please try again.');
  }
  return (await res.json()) as { conversations: Conversation[] };
}

export async function fetchConversation(
  id: string
): Promise<{ conversation: ConversationDetail }> {
  const res = await fetch(`/api/inbox/conversations/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load conversation.');
  }
  return (await res.json()) as { conversation: ConversationDetail };
}

/** Post an agent reply — appends a message and returns the updated thread. */
export async function replyToConversation(
  id: string,
  body: string
): Promise<{ conversation: ConversationDetail }> {
  const res = await fetch(`/api/inbox/conversations/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error('Failed to send reply. Please try again.');
  }
  return (await res.json()) as { conversation: ConversationDetail };
}

/** Change a conversation's status — returns the updated thread. */
export async function updateConversationStatus(
  id: string,
  status: ConversationStatus
): Promise<{ conversation: ConversationDetail }> {
  const res = await fetch(`/api/inbox/conversations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update status. Please try again.');
  }
  return (await res.json()) as { conversation: ConversationDetail };
}
