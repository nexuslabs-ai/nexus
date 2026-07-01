import { Badge, type BadgeProps } from '@nexus_ds/react';

import {
  CONVERSATION_STATUSES,
  type ConversationStatus,
} from '../../lib/inbox-api';

const STATUS_META: Record<
  ConversationStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  open: { label: 'Open', variant: 'information' },
  pending: { label: 'Pending', variant: 'warning' },
  closed: { label: 'Closed', variant: 'secondary' },
};

/** The status badge, shared by the conversation list and the thread header. */
export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  const { label, variant } = STATUS_META[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/** The human-readable label for a status — used in the status-change toast. */
export const statusLabel = (status: ConversationStatus) =>
  STATUS_META[status].label;

/** The ordered status options for the thread's status menu. */
export const STATUS_OPTIONS = CONVERSATION_STATUSES.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));
