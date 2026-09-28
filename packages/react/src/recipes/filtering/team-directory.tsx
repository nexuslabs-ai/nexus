import * as React from 'react';

import { IconList, IconUsers } from '@tabler/icons-react';

import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';

import { AppliedFilters } from './blocks/applied-filters';
import { type ChoiceCondition, ChoiceFilter } from './blocks/choice-filter';
import { members } from './quick-fixtures';

// Replace the fixture records and local results predicate with your data/query.
// Status, team and query are applied state: every change updates results directly.
function matchesChoice(actual: string, condition: ChoiceCondition | null) {
  if (!condition) return true;
  if (condition.operator === 'isEmpty') return actual === '';
  if (condition.operator === 'isNotEmpty') return actual !== '';
  if ('value' in condition)
    return condition.operator === 'isNot'
      ? actual !== condition.value
      : actual === condition.value;
  return false;
}

function Results({
  count,
  total,
  noun,
}: {
  count: number;
  total: number;
  noun: string;
}) {
  return (
    <p
      role="status"
      className="nx:typography-body-small nx:text-muted-foreground"
    >
      {count} of {total} {noun}
    </p>
  );
}
export function TeamDirectory({
  initiallyFiltered = false,
}: {
  initiallyFiltered?: boolean;
}) {
  const id = React.useId();
  const search = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<ChoiceCondition | null>(
    initiallyFiltered ? { operator: 'is', value: 'Active' } : null
  );
  const [team, setTeam] = React.useState<ChoiceCondition | null>(
    initiallyFiltered ? { operator: 'is', value: 'Design' } : null
  );
  const filtered = !!query || !!status || !!team;
  const results = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      matchesChoice(member.status, status) &&
      matchesChoice(member.team, team)
  );
  function clear() {
    setQuery('');
    setStatus(null);
    setTeam(null);
    search.current?.focus();
  }
  return (
    <section
      aria-label="Member filtering"
      className="nx:@container/members nx:grid nx:w-full nx:min-w-0 nx:max-w-4xl nx:gap-5"
    >
      <div className="nx:flex nx:flex-wrap nx:items-end nx:justify-between nx:gap-4">
        <div>
          <h2 className="nx:typography-heading-small">Team members</h2>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            Find people across your teams.
          </p>
        </div>
        <div className="nx:grid nx:w-full nx:gap-1 nx:@xl/members:max-w-xs">
          <Label className="nx:sr-only" htmlFor={id}>
            Search members
          </Label>
          <Input
            id={id}
            ref={search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members…"
          />
        </div>
      </div>
      <AppliedFilters>
        <ChoiceFilter
          label="Status"
          icon={<IconList aria-hidden="true" />}
          value={status}
          options={['Active', 'Invited'].map((value) => ({
            value,
            label: value,
          }))}
          onChange={setStatus}
        />
        <ChoiceFilter
          label="Team"
          icon={<IconUsers aria-hidden="true" />}
          value={team}
          options={['Design', 'Engineering', 'Operations'].map((value) => ({
            value,
            label: value,
          }))}
          onChange={setTeam}
        />
      </AppliedFilters>
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
        <Results count={results.length} total={members.length} noun="members" />
        <Button
          type="button"
          size="sm"
          className="nx:h-(--nx-spacing-8)"
          variant="ghost"
          disabled={!filtered}
          onClick={clear}
        >
          Clear all
        </Button>
      </div>
      <div className="nx:min-w-0 nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <Table containerClassName="nx:min-w-0 nx:max-w-full">
          <TableCaption className="nx:sr-only">
            Matching team members
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="nx:hidden nx:@lg/members:table-cell">
                Team
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="nx:text-right">Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((member) => (
              <TableRow key={member.name}>
                <TableCell>
                  <div className="nx:flex nx:items-center nx:gap-3">
                    <span
                      aria-hidden="true"
                      className="nx:hidden nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-full nx:bg-control-background nx:typography-label-small nx:text-muted-foreground nx:@lg/members:inline-flex"
                    >
                      {member.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                    <div>
                      <span>{member.name}</span>
                      <p className="nx:typography-body-small nx:text-muted-foreground nx:@lg/members:hidden">
                        {member.team}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="nx:hidden nx:@lg/members:table-cell">
                  {member.team}
                </TableCell>
                <TableCell>
                  <span className="nx:inline-flex nx:items-center nx:gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        member.status === 'Active'
                          ? 'nx:size-1.5 nx:rounded-full nx:bg-foreground'
                          : 'nx:size-1.5 nx:rounded-full nx:border-default nx:border-border-default'
                      }
                    />
                    {member.status}
                  </span>
                </TableCell>
                <TableCell className="nx:text-right nx:tabular-nums">
                  {member.projects}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!results.length && (
          <div className="nx:grid nx:justify-items-center nx:gap-2 nx:px-4 nx:py-10 nx:text-center">
            <h3 className="nx:typography-label-default">No matches</h3>
            <p className="nx:typography-body-default nx:text-muted-foreground">
              Try another name or remove a filter.
            </p>
            <Button
              className="nx:h-(--nx-spacing-8)"
              size="sm"
              variant="outline"
              onClick={clear}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
