import type * as React from 'react';

/** Row that lays out the filter conditions, Add buttons and clear actions you pass as children. */
export function AppliedFilters({
  children,
  label = 'Filters',
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-2"
    >
      {children}
    </div>
  );
}
