import type * as React from 'react';

/** Layout only. Compose conditions, Add controls and optional clear actions as children. */
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
