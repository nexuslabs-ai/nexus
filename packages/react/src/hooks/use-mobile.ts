import * as React from 'react';

/**
 * Media query matching viewports below the Nexus Standard layout floor
 * (`lg` = 64rem / 1024px at a 16px root). The query is rem-based so it tracks
 * the user's base font size exactly as the `nx:lg:` utilities do — a px query
 * would diverge under an enlarged font and leave a band where neither the
 * docked panel nor the mobile drawer renders.
 */
const MOBILE_QUERY = '(max-width: 63.99rem)';

/**
 * useIsMobile
 *
 * Tracks whether the viewport is below the Standard layout floor (`lg`).
 * Subscribes to a `matchMedia` query so it stays in sync as the viewport
 * resizes. Page-shell components (e.g. Sidebar) read this to decide between a
 * docked panel and a mobile drawer.
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * return isMobile ? <Drawer /> : <DockedPanel />;
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
