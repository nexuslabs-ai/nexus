import { Link } from '@tanstack/react-router';

import { RecordCard } from '../../components/record-card';
import type { Contact } from '../../lib/crm-api';
import { formatCurrency, formatDate } from '../../lib/format';

import { ContactStatusBadge } from './contact-ui';

/** Mobile card for one contact — the `<lg` stand-in for a Contacts table row. */
export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <RecordCard
      title={
        <Link
          to="/m/crm/$id"
          params={{ id: contact.id }}
          className="nx:text-foreground nx:typography-label-default nx:hover:underline"
        >
          {contact.name}
        </Link>
      }
      badge={<ContactStatusBadge status={contact.status} />}
    >
      <p className="nx:truncate">
        {contact.company} · {contact.owner}
      </p>
      <p className="nx:tabular-nums">
        {formatCurrency(contact.value)} · Last:{' '}
        {formatDate(contact.lastContacted)}
      </p>
    </RecordCard>
  );
}
