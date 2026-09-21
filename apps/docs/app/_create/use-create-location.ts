'use client';
import { useCallback, useSyncExternalStore } from 'react';

import { isComponentId } from './gallery';
export type CreateView = 'examples' | 'components' | 'tokens';
function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('nexus-create-location', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('nexus-create-location', callback);
  };
}
export function useCreateLocation() {
  const query = useSyncExternalStore(
    subscribe,
    () => location.search,
    () => ''
  );
  const search = new URLSearchParams(query);
  const raw = search.get('view');
  const view: CreateView =
    raw === 'components' || raw === 'tokens' ? raw : 'examples';
  const selected = search.get('component');
  const component = isComponentId(selected) ? selected : 'button';
  const navigate = useCallback(
    (patch: Record<string, string | number | undefined>, replace = false) => {
      const next = new URL(location.href);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) next.searchParams.delete(key);
        else next.searchParams.set(key, String(value));
      }
      window.history[replace ? 'replaceState' : 'pushState'](null, '', next);
      window.dispatchEvent(new Event('nexus-create-location'));
    },
    []
  );
  return { view, component, search, navigate };
}
