import * as React from 'react';

import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { NativeSelect } from '../../components/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';

export const memberStatuses = ['Active', 'Invited'] as const;
export const memberTeams = ['Design', 'Engineering', 'Operations'] as const;
export type MemberQuery = {
  name: string;
  status: (typeof memberStatuses)[number] | '';
  team: (typeof memberTeams)[number] | '';
  page: number;
};
export type Member = { id: string; name: string; team: string; status: string };
export type MemberPage = {
  members: Member[];
  total: number;
  page: number;
  pageCount: number;
};
export type MemberResults =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; data: MemberPage };
/** Narrows untrusted input — a URL parameter or a select's value — to an allowed value, or `''` for none. */
export function pickAllowed<Value extends string>(
  allowed: readonly Value[],
  value: string
): Value | '' {
  return allowed.find((item) => item === value) ?? '';
}
export const emptyMemberQuery: MemberQuery = {
  name: '',
  status: '',
  team: '',
  page: 1,
};

export function MemberDirectory({
  query,
  onQueryChange,
  results,
  onRetry,
}: {
  query: MemberQuery;
  onQueryChange: (query: MemberQuery) => void;
  results: MemberResults;
  onRetry: () => void;
}) {
  const id = React.useId();
  const filtered = Boolean(query.name || query.status || query.team);
  function changeFilter(change: Partial<MemberQuery>) {
    onQueryChange({ ...query, ...change, page: 1 });
  }
  const data = results.state === 'ready' ? results.data : null;
  return (
    <section
      aria-label="Member directory"
      className="nx:@container/directory nx:grid nx:min-w-0 nx:gap-5"
    >
      <header>
        <h2 className="nx:typography-heading-small">Team members</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          Find people across your teams.
        </p>
      </header>
      <div className="nx:grid nx:gap-3 nx:@xl/directory:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="nx:grid nx:gap-2">
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input
            id={`${id}-name`}
            type="search"
            placeholder="Search members…"
            value={query.name}
            onChange={(event) => changeFilter({ name: event.target.value })}
          />
        </div>
        <div className="nx:grid nx:gap-2">
          <Label htmlFor={`${id}-status`}>Status</Label>
          <NativeSelect
            id={`${id}-status`}
            value={query.status}
            onChange={(event) =>
              changeFilter({
                status: pickAllowed(memberStatuses, event.target.value),
              })
            }
          >
            <option value="">All statuses</option>
            {memberStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="nx:grid nx:gap-2">
          <Label htmlFor={`${id}-team`}>Team</Label>
          <NativeSelect
            id={`${id}-team`}
            value={query.team}
            onChange={(event) =>
              changeFilter({
                team: pickAllowed(memberTeams, event.target.value),
              })
            }
          >
            <option value="">All teams</option>
            {memberTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="nx:flex nx:min-h-8 nx:items-center nx:justify-between nx:gap-3">
        <p
          role="status"
          className="nx:typography-body-default nx:text-muted-foreground"
        >
          {results.state === 'loading'
            ? 'Loading members…'
            : data
              ? `${data.total} ${data.total === 1 ? 'member' : 'members'}`
              : 'Members unavailable'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!filtered}
          onClick={() => onQueryChange(emptyMemberQuery)}
        >
          Clear filters
        </Button>
      </div>
      {results.state === 'error' && (
        <div
          role="alert"
          className="nx:grid nx:justify-items-start nx:gap-3 nx:rounded-lg nx:border nx:border-border-default nx:p-5"
        >
          <p className="nx:typography-body-default">{results.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {data && data.total === 0 && !filtered && (
        <div className="nx:grid nx:justify-items-center nx:gap-2 nx:rounded-lg nx:border nx:border-border-default nx:px-4 nx:py-8 nx:text-center">
          <h3 className="nx:typography-label-default">No members yet</h3>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Invite people to your teams to see them here.
          </p>
        </div>
      )}
      {data && data.total === 0 && filtered && (
        <div className="nx:grid nx:justify-items-center nx:gap-2 nx:rounded-lg nx:border nx:border-border-default nx:px-4 nx:py-8 nx:text-center">
          <h3 className="nx:typography-label-default">No matching members</h3>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Try another name or clear the filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQueryChange(emptyMemberQuery)}
          >
            Reset filters
          </Button>
        </div>
      )}
      {data && data.total > 0 && (
        <>
          <div className="nx:overflow-hidden nx:rounded-lg nx:border nx:border-border-default">
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="nx:hidden nx:@xl/directory:table-cell">
                    Team
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <span>{member.name}</span>
                      <span className="nx:block nx:typography-body-small nx:text-muted-foreground nx:@xl/directory:hidden">
                        {member.team}
                      </span>
                    </TableCell>
                    <TableCell className="nx:hidden nx:@xl/directory:table-cell">
                      {member.team}
                    </TableCell>
                    <TableCell>{member.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <nav
            aria-label="Member pages"
            className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3"
          >
            <span className="nx:typography-body-default nx:text-muted-foreground">
              Page {data.page} of {data.pageCount}
            </span>
            <div className="nx:flex nx:gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => onQueryChange({ ...query, page: data.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.pageCount}
                onClick={() => onQueryChange({ ...query, page: data.page + 1 })}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      )}
    </section>
  );
}
