import { Badge, type BadgeProps } from '@nexus_ds/react';

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
