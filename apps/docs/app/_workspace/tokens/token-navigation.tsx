'use client';

import type { ComponentProps, MouseEvent } from 'react';

import { useWorkspaceLocation } from '../use-workspace-location';

import { type ExploreSearch, parseExploreSearch } from './token-index';

function toParams(search: ExploreSearch) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    if (value !== undefined) params.set(key, String(value));
  return params;
}

export function useTokenSearch() {
  const { search } = useWorkspaceLocation();
  return parseExploreSearch(search);
}

export function useTokenNavigate() {
  const { navigate } = useWorkspaceLocation();
  return (search: ExploreSearch, replace = false) =>
    navigate(toParams(search), replace);
}

export function TokenLink({
  search,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { search: ExploreSearch }) {
  const navigate = useTokenNavigate();
  const query = toParams(search).toString();
  function visit(event: MouseEvent<HTMLAnchorElement>) {
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.button !== 0 || modified) return;
    event.preventDefault();
    navigate(search);
  }
  return (
    <a {...props} href={query ? `/token?${query}` : '/token'} onClick={visit}>
      {children}
    </a>
  );
}
