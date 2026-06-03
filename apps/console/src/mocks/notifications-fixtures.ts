import type { Notification } from '../lib/notifications-api';

/**
 * Seven deterministic notifications spanning every kind and both read states
 * (the first three unread → the bell shows "3"). Dated into the recent past,
 * newest first, matching the sibling modules' ~Jun 3 ceiling. They reference
 * real fixture records (ATL- issues, teammate names, an invoice) so the feed
 * reads as genuine cross-module activity rather than lorem.
 */
export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n-01',
    kind: 'mention',
    title: 'Grace Hopper mentioned you',
    body: 'in ATL-102 — can you take a look at the keyboard-nav fix?',
    at: '2026-06-03T08:30:00Z',
    read: false,
  },
  {
    id: 'n-02',
    kind: 'assignment',
    title: 'You were assigned ATL-118',
    body: 'Persisted theme drops stale mode values on load',
    at: '2026-06-03T06:15:00Z',
    read: false,
  },
  {
    id: 'n-03',
    kind: 'comment',
    title: 'Tom Becker replied',
    body: 'SSO login redirect loop — thanks, that did the trick!',
    at: '2026-06-02T16:40:00Z',
    read: false,
  },
  {
    id: 'n-04',
    kind: 'system',
    title: 'Weekly digest is ready',
    body: 'Your team closed 12 issues and replied to 34 conversations.',
    at: '2026-06-02T09:00:00Z',
    read: true,
  },
  {
    id: 'n-05',
    kind: 'billing',
    title: 'Invoice INV-2026-05 is ready',
    body: '$240.00 was billed to Visa ending 4242.',
    at: '2026-06-01T11:20:00Z',
    read: true,
  },
  {
    id: 'n-06',
    kind: 'mention',
    title: 'Ada Lovelace mentioned you',
    body: 'in the Q3 planning doc — looped you in on the timeline.',
    at: '2026-05-31T14:05:00Z',
    read: true,
  },
  {
    id: 'n-07',
    kind: 'assignment',
    title: 'Barbara Liskov requested your review',
    body: 'on Naledi Mokoena’s contact record.',
    at: '2026-05-30T10:45:00Z',
    read: true,
  },
];
