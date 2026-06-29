import { useState } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
  Skeleton,
} from '@nexus/react';
import { IconPlus, IconUsers } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { DataTable } from '../../components/data-table';
import { ErrorState } from '../../components/error-state';
import { PageHeader } from '../../components/page-header';
import { useMediaQuery } from '../../hooks/use-media-query';
import { crmKeys, fetchContacts } from '../../lib/crm-api';

import { ContactFormSheet } from './contact-form-sheet';
import { ContactsBoard } from './contacts-board';
import { ContactCardList } from './contacts-card-list';
import { contactColumns } from './contacts-columns';
import type { ContactsView } from './contacts-search';
import { ContactsToolbar } from './contacts-toolbar';

const crmRoute = getRouteApi('/app/m/crm');

export function ContactsRoute() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: crmKeys.contacts,
    queryFn: fetchContacts,
  });
  const contacts = data?.contacts;
  const { view, status } = crmRoute.useSearch();
  const navigate = crmRoute.useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  // The status facet applies to the table / card list (board is organised by
  // status, so it ignores the facet).
  const tableData = contacts
    ? status.length > 0
      ? contacts.filter((c) => status.includes(c.status))
      : contacts
    : [];

  const setSearch = (patch: Partial<ContactsView>) =>
    navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        // The status facet is table-only — the board is organised by status, so
        // never carry a hidden status filter into board view (incl. when applying
        // a saved board view).
        return next.view === 'board' ? { ...next, status: [] } : next;
      },
    });

  return (
    <div className="nx:space-y-6 nx:p-6">
      <PageHeader
        title="Contacts"
        description="Everyone in your pipeline. Sort, filter, and select to act in bulk."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus />
          New contact
        </Button>
      </PageHeader>

      <ContactsToolbar view={view} status={status} setSearch={setSearch} />

      {isPending && <ContactsSkeleton />}
      {isError && (
        <ErrorState
          message="Couldn't load contacts."
          onRetry={refetch}
          bordered
        />
      )}
      {contacts &&
        (contacts.length === 0 ? (
          <ContactsEmpty />
        ) : view === 'board' ? (
          <ContactsBoard contacts={contacts} />
        ) : isDesktop ? (
          <DataTable
            columns={contactColumns}
            data={tableData}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        ) : (
          <ContactCardList contacts={tableData} />
        ))}

      <ContactFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export function ContactsSkeleton() {
  return (
    <div className="nx:space-y-4">
      <Skeleton className="nx:h-9 nx:max-w-xs" />
      <div className="nx:border-border-default nx:space-y-3 nx:rounded-md nx:border-default nx:p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="nx:h-8 nx:w-full" />
        ))}
      </div>
    </div>
  );
}

export function ContactsEmpty() {
  return (
    <EmptyState bordered>
      <EmptyStateHeader>
        <EmptyStateMedia variant="icon">
          <IconUsers />
        </EmptyStateMedia>
        <EmptyStateTitle>No contacts yet</EmptyStateTitle>
        <EmptyStateDescription>
          Contacts you add will show up here, ready to sort, filter, and work in
          bulk.
        </EmptyStateDescription>
      </EmptyStateHeader>
    </EmptyState>
  );
}
