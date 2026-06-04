import { useMemo, useState } from 'react';

interface FilterPaginateOptions<T> {
  /** Maps an item to the text the filter box matches against. */
  search: (item: T) => string;
  /** Items per page (default 10, matching the desktop DataTable). */
  pageSize?: number;
}

/**
 * Filter + pagination for the mobile card lists — the plain-array equivalent of
 * the desktop {@link DataTable}'s TanStack state, for the `<lg` card view where
 * the table (and its sort / selection machinery) doesn't render. Filtering
 * resets to the first page, and the page index is clamped so a shrinking result
 * set never strands the view past the end.
 */
export function useFilterPaginate<T>(
  items: T[],
  { search, pageSize = 10 }: FilterPaginateOptions<T>
) {
  const [query, setQueryState] = useState('');
  const [page, setPage] = useState(0);

  const setQuery = (next: string) => {
    setQueryState(next);
    setPage(0);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => search(item).toLowerCase().includes(q));
  }, [items, query, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;

  return {
    query,
    setQuery,
    pageItems: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page: safePage,
    pageCount,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: () => setPage((p) => Math.min(pageCount - 1, p + 1)),
  };
}
