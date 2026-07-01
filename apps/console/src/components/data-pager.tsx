import type { ReactNode } from 'react';

import { Button } from '@nexus_ds/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface DataPagerProps {
  /** 0-based page index. */
  page: number;
  pageCount: number;
  /** Total filtered row count, shown on the left when `summary` is omitted. */
  total: number;
  /** Overrides the left summary text, such as a selection count. */
  summary?: ReactNode;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The shared prev/next pager for the console's table and card-list views: row
 * count or a caller summary, "Page X of Y", and bounded chevrons.
 */
export function DataPager({
  page,
  pageCount,
  total,
  summary,
  onPrev,
  onNext,
}: DataPagerProps) {
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
      <p className="nx:text-muted-foreground nx:typography-body-default">
        {summary ?? `${total} row(s)`}
      </p>
      <div className="nx:flex nx:items-center nx:gap-3">
        <span className="nx:text-muted-foreground nx:typography-label-default">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onPrev}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
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
