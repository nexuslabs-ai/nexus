import * as React from 'react';

/**
 * Width (px) below which page-shell chrome should switch to its mobile layout.
 * Matches the Nexus Standard layout floor (`lg` = 1024px) — below it the Sidebar
 * collapses into a Sheet drawer rather than a docked panel.
 */
const MOBILE_BREAKPOINT = 1024;

/**
 * useIsMobile
 *
 * Tracks whether the viewport is below the Standard layout floor (1024px).
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
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
