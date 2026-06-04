import { DataPager } from '../../components/data-pager';
import { FilterInput } from '../../components/filter-input';
import { useFilterPaginate } from '../../hooks/use-filter-paginate';
import type { Member } from '../../lib/people-api';

import { MemberCard } from './member-card';

const searchMember = (member: Member) => member.name;

/**
 * The People table's `<lg` counterpart: one card per member, with the same name
 * filter + pagination as the desktop table (sort and bulk-select are
 * desktop-only affordances). Receives the already facet-filtered list.
 */
export function MemberCardList({ members }: { members: Member[] }) {
  const { query, setQuery, pageItems, total, page, pageCount, prev, next } =
    useFilterPaginate(members, { search: searchMember });

  return (
    <div className="nx:space-y-4">
      <FilterInput
        value={query}
        onChange={setQuery}
        placeholder="Filter by name…"
      />
      {pageItems.length === 0 ? (
        <p className="nx:text-muted-foreground nx:py-8 nx:text-center nx:text-sm">
          No results.
        </p>
      ) : (
        <ul className="nx:space-y-3">
          {pageItems.map((member) => (
            <MemberCard key={member.id} member={member} />
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
