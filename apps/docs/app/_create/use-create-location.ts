'use client';

import { useCallback, useSyncExternalStore } from 'react';

const LOCATION_EVENT = 'nexus-create-location';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(LOCATION_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(LOCATION_EVENT, callback);
  };
}

/** Query-string state for the create workspaces, kept in the URL so views deep-link. */
export function useCreateLocation() {
  const query = useSyncExternalStore(
    subscribe,
    () => location.search,
    () => ''
  );
  const navigate = useCallback((params: URLSearchParams, replace = false) => {
    const next = new URL(location.href);
    next.search = params.toString();
    window.history[replace ? 'replaceState' : 'pushState'](null, '', next);
    window.dispatchEvent(new Event(LOCATION_EVENT));
  }, []);
  return { search: new URLSearchParams(query), navigate };
}
