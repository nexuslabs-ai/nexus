import { useState } from 'react';

import { Button, Skeleton } from '@nexus/react';
import {
  IconLayoutKanban,
  IconPlus,
  IconTable,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { DataTable } from '../../components/data-table';
import { crmKeys, fetchContacts } from '../../lib/crm-api';

import { ContactFormSheet } from './contact-form-sheet';
import { ContactsBoard } from './contacts-board';
import { contactColumns } from './contacts-columns';

const crmRoute = getRouteApi('/app/m/crm');

export function ContactsRoute() {
  const { data, isPending, isError } = useQuery({
    queryKey: crmKeys.contacts,
    queryFn: fetchContacts,
  });
  const contacts = data?.contacts;
  const { view } = crmRoute.useSearch();
  const navigate = crmRoute.useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="nx:space-y-6 nx:p-6">
      <header className="nx:flex nx:items-start nx:justify-between nx:gap-4">
        <div className="nx:space-y-1">
          <h1 className="nx:typography-heading-large nx:text-foreground">
            Contacts
          </h1>
          <p className="nx:text-muted-foreground">
            Everyone in your pipeline. Sort, filter, and select to act in bulk.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus />
          New contact
        </Button>
      </header>

      <div className="nx:inline-flex nx:gap-1">
        <Button
          variant={view === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate({ search: { view: 'table' } })}
        >
          <IconTable />
          Table
        </Button>
        <Button
          variant={view === 'board' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate({ search: { view: 'board' } })}
        >
          <IconLayoutKanban />
          Board
        </Button>
      </div>

      {isPending && <ContactsSkeleton />}
      {isError && (
        <p className="nx:text-error-foreground nx:text-sm">
          Couldn&apos;t load contacts. Please try again.
        </p>
      )}
      {contacts &&
        (contacts.length === 0 ? (
          <ContactsEmpty />
        ) : view === 'board' ? (
          <ContactsBoard contacts={contacts} />
        ) : (
          <DataTable
            columns={contactColumns}
            data={contacts}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        ))}

      <ContactFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <div className="nx:space-y-4">
      <Skeleton className="nx:h-9 nx:max-w-xs" />
      <div className="nx:border-border-default nx:space-y-3 nx:rounded-md nx:border nx:p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="nx:h-8 nx:w-full" />
        ))}
      </div>
    </div>
  );
}

// App-local empty state — the polished @nexus/react EmptyState is tracked in #282.
function ContactsEmpty() {
  return (
    <div className="nx:border-border-default nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-3 nx:rounded-md nx:border nx:border-dashed nx:p-12 nx:text-center">
      <div className="nx:bg-muted nx:text-muted-foreground nx:flex nx:size-12 nx:items-center nx:justify-center nx:rounded-full">
        <IconUsers />
      </div>
      <h2 className="nx:typography-heading-medium nx:text-foreground">
        No contacts yet
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-sm">
        Contacts you add will show up here, ready to sort, filter, and work in
        bulk.
      </p>
    </div>
  );
}
