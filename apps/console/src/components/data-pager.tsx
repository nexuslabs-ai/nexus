import { Button } from '@nexus/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface DataPagerProps {
  /** 0-based page index. */
  page: number;
  pageCount: number;
  /** Total filtered row count, summarised on the left. */
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The prev/next pager for the mobile card lists — mirrors the pager built into
 * {@link DataTable} (row count, "Page X of Y", bounded chevrons) so the table
 * (≥lg) and card (<lg) views read consistently.
 */
export function DataPager({
  page,
  pageCount,
  total,
  onPrev,
  onNext,
}: DataPagerProps) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
      <p className="nx:text-muted-foreground nx:text-sm">{total} row(s)</p>
      <div className="nx:flex nx:items-center nx:gap-3">
        <span className="nx:text-muted-foreground nx:text-sm">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= pageCount - 1}
          aria-label="Next page"
        >
          <IconChevronRight />
        </Button>
      </div>
    </div>
  );
}
