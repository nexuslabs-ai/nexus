import type { ComponentProps } from 'react';

import { useCreateLocation } from '../use-create-location';

import { type ExploreSearch, validateExploreSearch } from './catalog';

export function useTokenSearch() {
  const { search } = useCreateLocation();
  return validateExploreSearch(Object.fromEntries(search));
}
export function useTokenNavigate() {
  const { navigate } = useCreateLocation();
  return ({
    search,
    replace = false,
  }: {
    search: ExploreSearch;
    replace?: boolean;
    resetScroll?: boolean;
  }) =>
    navigate(
      {
        q: undefined,
        group: undefined,
        type: undefined,
        mode: undefined,
        token: undefined,
        variant: undefined,
        page: undefined,
        ...search,
        view: 'tokens',
      },
      replace
    );
}
export function TokenLink({
  search,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { search: ExploreSearch }) {
  const navigate = useTokenNavigate();
  const params = new URLSearchParams({ view: 'tokens' });
  for (const [key, value] of Object.entries(search))
    if (value !== undefined) params.set(key, String(value));
  function visit(event: React.MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate({ search });
  }
  return (
    <a {...props} href={'/create?' + params} onClick={visit}>
      {children}
    </a>
  );
}
