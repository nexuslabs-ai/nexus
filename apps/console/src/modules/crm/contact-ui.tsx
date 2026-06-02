import { Badge, type BadgeProps } from '@nexus/react';

import type { ContactStatus } from '../../lib/crm-api';

const STATUS_META: Record<
  ContactStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  active: { label: 'Active', variant: 'success' },
  lead: { label: 'Lead', variant: 'information' },
  churned: { label: 'Churned', variant: 'secondary' },
};

/** The status badge, shared by the Contacts table and the detail page. */
export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { label, variant } = STATUS_META[status];
  return <Badge variant={variant}>{label}</Badge>;
}

/** First + last initial, e.g. "Ada Lovelace" → "AL". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
