/**
 * Notifications API client. Thin typed wrappers over the mock endpoints served
 * by MSW (`src/mocks/handlers.ts`) — there is no real backend. Drives the topbar
 * bell: a flat activity feed with a read/unread lifecycle (mark one, mark all).
 *
 * This is the app-activity feed (mentions, assignments, system) — distinct from
 * the Inbox module's per-conversation `unread`, which tracks customer support
 * threads. The two don't share a store.
 */

/**
 * Notification kinds — the single source for the {@link NotificationKind} union
 * and the kind→icon map in the menu. Each ties loosely to a module's activity.
 */
export const NOTIFICATION_KINDS = [
  'mention',
  'assignment',
  'comment',
  'system',
  'billing',
] as const;

/** What a notification is about — drives its leading icon. */
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type Notification = {
  id: string;
  kind: NotificationKind;
  /** One-line headline, e.g. "Grace Hopper mentioned you". */
  title: string;
  /** Supporting detail, e.g. "in ATL-102 — can you take a look?". */
  body: string;
  /** ISO timestamp (date + time) — rendered with {@link formatDateTime}. */
  at: string;
  /** Whether the recipient has seen it — drives the unread dot + bell count. */
  read: boolean;
};

/**
 * TanStack Query keys for notifications — declared once so the menu query and
 * the mark-read mutations can't drift apart (a mismatched key silently breaks
 * the optimistic cache writes).
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

export async function fetchNotifications(): Promise<{
  notifications: Notification[];
}> {
  const res = await fetch('/api/notifications');
  if (!res.ok) {
    throw new Error('Failed to load notifications. Please try again.');
  }
  return (await res.json()) as { notifications: Notification[] };
}

/** Mark a single notification read — returns the updated notification. */
export async function markNotificationRead(
  id: string
): Promise<{ notification: Notification }> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  if (!res.ok) {
    throw new Error('Failed to update notification. Please try again.');
  }
  return (await res.json()) as { notification: Notification };
}

/** Mark every notification read — returns the updated list. */
export async function markAllNotificationsRead(): Promise<{
  notifications: Notification[];
}> {
  const res = await fetch('/api/notifications/read-all', { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to update notifications. Please try again.');
  }
  return (await res.json()) as { notifications: Notification[] };
}
