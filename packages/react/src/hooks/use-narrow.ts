import * as React from 'react';

/**
 * Matches the Narrow tier — viewports below `md` (48rem), where the layout
 * drops to a drawer. `47.99rem` stops just below `md`'s `min-width: 48rem` so
 * the two tiers never overlap; keeping both in rem (not px) holds them aligned
 * as the user's base font size changes, the way the `nx:md:` utilities do.
 */
const NARROW_QUERY = '(max-width: 47.99rem)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * useIsNarrow
 *
 * Subscribes to a `matchMedia` query for the Narrow tier (below `md`), staying
 * in sync as the viewport resizes. Page-shell components (e.g. Sidebar) read it
 * to pick the tier-appropriate layout — a drawer when narrow, a docked panel
 * at or above `md`.
 */
export function useIsNarrow() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false
  );
}
