import { useCallback, useSyncExternalStore } from 'react';

/**
 * useMediaQuery
 *
 * Subscribes to a CSS media query and re-renders when it starts/stops matching.
 * Reads the current match synchronously via `useSyncExternalStore`, so there is
 * no first-render flash — important when layout branches on the result.
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 64rem)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
