import { DataPager } from '../../components/data-pager';
import { FilterInput } from '../../components/filter-input';
import { useFilterPaginate } from '../../hooks/use-filter-paginate';
import type { Issue } from '../../lib/projects-api';

import { IssueCard } from './issue-card';

// Title-only, matching the desktop table's `filterColumn="title"` + the
// "Filter by title…" placeholder — so the two views filter identically.
const searchIssue = (issue: Issue) => issue.title;

/**
 * The Issues table's `<lg` counterpart: one card per issue, filterable by key or
 * title and paginated like the desktop table (sort and bulk-select are
 * desktop-only affordances).
 */
export function IssueCardList({ issues }: { issues: Issue[] }) {
  const { query, setQuery, pageItems, total, page, pageCount, prev, next } =
    useFilterPaginate(issues, { search: searchIssue });

  return (
    <div className="nx:space-y-4">
      <FilterInput
        value={query}
        onChange={setQuery}
        placeholder="Filter by title…"
      />
      {pageItems.length === 0 ? (
        <p className="nx:text-muted-foreground nx:py-8 nx:text-center nx:typography-body-default">
          No results.
        </p>
      ) : (
        <ul className="nx:space-y-3">
          {pageItems.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
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
