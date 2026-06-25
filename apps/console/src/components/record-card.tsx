import type { ReactNode } from 'react';

interface RecordCardProps {
  /** The card heading — typically a Link to the record's detail page. */
  title: ReactNode;
  /** Optional status badge, pinned to the top-right corner. */
  badge?: ReactNode;
  /** Secondary fields, stacked under the heading as muted lines. */
  children: ReactNode;
}

/**
 * The mobile record card — one per data-table row below `lg`, where the full
 * table can't fit. A titled, bordered tile with an optional status badge in the
 * corner and a stack of secondary fields below. Modules compose it with their
 * own curated title / badge / field lines (reading raw row data, never the
 * table's `<td>` cell renderers).
 *
 * Renders an `<li>` — always lives inside a card list's `<ul>`.
 */
export function RecordCard({ title, badge, children }: RecordCardProps) {
  return (
    <li className="nx:border-border-default nx:bg-container nx:rounded-lg nx:border nx:p-4">
      <div className="nx:flex nx:items-start nx:justify-between nx:gap-3">
        <div className="nx:min-w-0 nx:flex-1">{title}</div>
        {badge ? <div className="nx:shrink-0">{badge}</div> : null}
      </div>
      <div className="nx:text-muted-foreground nx:mt-2 nx:space-y-1 nx:typography-label-default">
        {children}
      </div>
    </li>
  );
}
