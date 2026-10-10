import * as React from 'react';

import {
  emptyMemberQuery,
  type MemberQuery,
  memberStatuses,
  memberTeams,
  pickAllowed,
} from './member-directory';

export function readMemberQuery(url: URL): MemberQuery {
  const page = Number(url.searchParams.get('members.page') ?? 1);
  return {
    name: (url.searchParams.get('members.name') ?? '').slice(0, 200),
    status: pickAllowed(
      memberStatuses,
      url.searchParams.get('members.status') ?? ''
    ),
    team: pickAllowed(memberTeams, url.searchParams.get('members.team') ?? ''),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function writeMemberQuery(url: URL, query: MemberQuery): URL {
  const next = new URL(url);
  for (const key of ['name', 'status', 'team', 'page'] as const) {
    next.searchParams.delete(`members.${key}`);
    if (query[key] !== emptyMemberQuery[key])
      next.searchParams.set(`members.${key}`, String(query[key]));
  }
  return next;
}

// pushState and replaceState fire no event, so writes notify subscribers directly.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}
function getSearch() {
  return window.location.search;
}
function getServerSearch() {
  return null;
}

// Router applications should use their router's search-parameter API.
export function useMemberQueryUrl() {
  const search = React.useSyncExternalStore(
    subscribe,
    getSearch,
    getServerSearch
  );
  const query = React.useMemo(
    () =>
      search === null
        ? emptyMemberQuery
        : readMemberQuery(new URL(window.location.href)),
    [search]
  );
  function changeQuery(next: MemberQuery) {
    const url = writeMemberQuery(new URL(window.location.href), next);
    // Typing refines the current entry; discrete choices get their own Back step.
    const typing =
      next.name !== query.name &&
      next.status === query.status &&
      next.team === query.team;
    if (typing) window.history.replaceState(null, '', url);
    else if (url.href !== window.location.href)
      window.history.pushState(null, '', url);
    for (const listener of listeners) listener();
  }
  return [query, changeQuery] as const;
}
