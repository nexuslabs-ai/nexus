import * as React from 'react';

/**
 * Matches the Narrow tier — viewports below `md` (48rem), where the layout
 * drops to a drawer. `47.99rem` stops just below `md`'s `min-width: 48rem` so
 * the two tiers never overlap; keeping both in rem (not px) holds them aligned
 * as the user's base font size changes, the way the `nx:md:` utilities do.
 */
const NARROW_QUERY = '(max-width: 47.99rem)';

/**
 * useIsNarrow
 *
 * Subscribes to a `matchMedia` query for the Narrow tier (below `md`), staying
 * in sync as the viewport resizes. Page-shell components (e.g. Sidebar) read it
 * to pick the tier-appropriate layout — a drawer when narrow, a docked panel
 * at or above `md`.
 *
 * @example
 * ```tsx
 * const isNarrow = useIsNarrow();
 * return isNarrow ? <Drawer /> : <DockedPanel />;
 * ```
 */
export function useIsNarrow() {
  const [isNarrow, setIsNarrow] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const onChange = () => setIsNarrow(mql.matches);
    mql.addEventListener('change', onChange);
    setIsNarrow(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isNarrow;
}
