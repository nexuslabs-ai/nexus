import * as React from 'react';

import { emptyMemberQuery, type MemberQuery } from './member-directory';

export function readMemberQuery(url: URL): MemberQuery {
  const status = url.searchParams.get('members.status') ?? '';
  const team = url.searchParams.get('members.team') ?? '';
  const page = Number(url.searchParams.get('members.page') ?? 1);
  return {
    name: (url.searchParams.get('members.name') ?? '').slice(0, 200),
    status: ['Active', 'Invited'].includes(status) ? status : '',
    team: ['Design', 'Engineering', 'Operations'].includes(team) ? team : '',
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

// Mount once per document. Router applications should use their router's search-parameter API.
export function useMemberQueryUrl() {
  const [query, setQuery] = React.useState<MemberQuery>(() =>
    typeof window === 'undefined'
      ? emptyMemberQuery
      : readMemberQuery(new URL(window.location.href))
  );
  React.useEffect(() => {
    function restore() {
      setQuery(readMemberQuery(new URL(window.location.href)));
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  function changeQuery(next: MemberQuery) {
    const url = writeMemberQuery(new URL(window.location.href), next);
    if (url.href !== window.location.href)
      window.history.pushState(null, '', url);
    setQuery(readMemberQuery(url));
  }
  return [query, changeQuery] as const;
}
