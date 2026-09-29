import * as React from 'react';

import { Button } from '../../components/button';
import { FilterBuilder } from '../../components/filter-builder';
import { getFilterErrors } from '../../components/filter-model';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';

import {
  exampleFields,
  exampleTree,
  matches,
  members,
} from './advanced-fixtures';

export function AdvancedFiltering() {
  const [applied, setApplied] = React.useState(exampleTree);
  const [draft, setDraft] = React.useState(applied);
  const errors = getFilterErrors(draft, exampleFields);
  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const results = members.filter((member) => matches(member, applied));
  function apply(event: React.FormEvent) {
    event.preventDefault();
    if (errors.length) return;
    setApplied(draft);
  }
  function clear() {
    setDraft({ ...draft, children: [] });
  }
  return (
    <div className="nx:grid nx:gap-6">
      <header className="nx:flex nx:flex-wrap nx:items-start nx:justify-between nx:gap-3">
        <div>
          <h2 className="nx:typography-heading-small">Team members</h2>
          <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
            Filter your team by status, team or activity.
          </p>
        </div>
      </header>
      <form
        onSubmit={apply}
        className="nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container"
      >
        <FilterBuilder
          className="nx:rounded-none nx:border-0"
          fields={exampleFields}
          value={draft}
          onValueChange={setDraft}
        />
        <div className="nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3 nx:border-t nx:border-border-default nx:p-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={!draft.children.length}
            onClick={clear}
            className="nx:text-muted-foreground"
          >
            Clear conditions
          </Button>
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <p
              role="status"
              className="nx:typography-body-small nx:text-muted-foreground"
            >
              {errors.length
                ? 'Complete every condition to apply'
                : dirty
                  ? 'Unapplied changes'
                  : ''}
            </p>
            <Button
              size="sm"
              variant="ghost"
              disabled={!dirty}
              onClick={() => setDraft(applied)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!!errors.length || !dirty}
            >
              Apply filters
            </Button>
          </div>
        </div>
      </form>
      <section aria-label="Matching members" className="nx:grid nx:gap-3">
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
          <h3 className="nx:typography-label-default">Matching members</h3>
          <span
            className="nx:typography-body-small nx:text-muted-foreground"
            aria-live="polite"
          >
            {results.length} of {members.length} members
          </span>
        </div>
        <div className="nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="nx:text-right">Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((member) => (
                <TableRow key={member.name}>
                  <TableCell className="nx:whitespace-nowrap">
                    {member.name}
                  </TableCell>
                  <TableCell className="nx:capitalize">
                    {member.status}
                  </TableCell>
                  <TableCell className="nx:capitalize">{member.team}</TableCell>
                  <TableCell className="nx:text-right">
                    {member.projects}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!results.length && (
            <div className="nx:p-6 nx:text-center">
              <p className="nx:typography-label-default">No matching members</p>
              <p className="nx:mt-1 nx:typography-body-small nx:text-muted-foreground">
                Change a condition or clear the filters to broaden your results.
              </p>
            </div>
          )}
        </div>
      </section>
      <details className="nx:typography-body-small nx:text-muted-foreground">
        <summary className="nx:cursor-pointer">
          View applied filter data
        </summary>
        <pre className="nx:mt-2 nx:max-h-64 nx:overflow-auto nx:rounded-md nx:bg-muted nx:p-3">
          {JSON.stringify(applied, null, 2)}
        </pre>
      </details>
    </div>
  );
}
