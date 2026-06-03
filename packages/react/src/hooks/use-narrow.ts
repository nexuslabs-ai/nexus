import * as React from 'react';

/**
 * Matches the Narrow tier — viewports below `lg` (64rem), where the layout
 * drops to a drawer. `63.99rem` stops just below `lg`'s `min-width: 64rem` so
 * the two tiers never overlap; keeping both in rem (not px) holds them aligned
 * as the user's base font size changes, the way the `nx:lg:` utilities do.
 */
const NARROW_QUERY = '(max-width: 63.99rem)';

/**
 * useIsNarrow
 *
 * Subscribes to a `matchMedia` query for the Narrow tier (below `lg`), staying
 * in sync as the viewport resizes. Page-shell components (e.g. Sidebar) read it
 * to pick the tier-appropriate layout — a drawer when narrow, a docked panel
 * at or above `lg`.
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
