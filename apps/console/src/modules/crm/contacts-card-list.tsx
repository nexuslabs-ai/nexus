import { DataPager } from '../../components/data-pager';
import { FilterInput } from '../../components/filter-input';
import { useFilterPaginate } from '../../hooks/use-filter-paginate';
import type { Contact } from '../../lib/crm-api';

import { ContactCard } from './contact-card';

const searchContact = (contact: Contact) => contact.name;

/**
 * The Contacts table's `<lg` counterpart: one card per contact, with the same
 * name filter + pagination as the desktop table (sort and bulk-select are
 * desktop-only affordances). Receives the already status-filtered list.
 */
export function ContactCardList({ contacts }: { contacts: Contact[] }) {
  const { query, setQuery, pageItems, total, page, pageCount, prev, next } =
    useFilterPaginate(contacts, { search: searchContact });

  return (
    <div className="nx:space-y-4">
      <FilterInput
        value={query}
        onChange={setQuery}
        placeholder="Filter by name…"
      />
      {pageItems.length === 0 ? (
        <p className="nx:text-muted-foreground nx:py-8 nx:text-center nx:typography-body-default">
          No results.
        </p>
      ) : (
        <ul className="nx:space-y-3">
          {pageItems.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </ul>
      )}
      <DataPager
        page={page}
        pageCount={pageCount}
        total={total}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}
