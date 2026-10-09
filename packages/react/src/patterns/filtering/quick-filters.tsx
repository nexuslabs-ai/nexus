import * as React from 'react';

import {
  IconFile,
  IconHash,
  IconList,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';

import { AppliedFilters } from '../../blocks/filtering/applied-filters';
import {
  type ChoiceCondition,
  ChoiceFilter,
} from '../../blocks/filtering/choice-filter/choice-filter';
import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from '../../blocks/filtering/number-comparison-filter/number-comparison-filter';
import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from '../../blocks/filtering/number-range-filter/number-range-filter';
import { Button } from '../../components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
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

import { matchesChoice, Results } from './local-results';
import { files, members, templates } from './quick-fixtures';

function matchesProjects(
  count: number,
  condition: NumberComparisonCondition | null
) {
  if (!condition) return true;
  // Every member has a project count.
  if (!('value' in condition)) return condition.operator === 'isNotEmpty';
  if (condition.operator === 'greaterThan') return count > condition.value;
  if (condition.operator === 'lessThan') return count < condition.value;
  if (condition.operator === 'isNot') return count !== condition.value;
  return count === condition.value;
}

function NoMatches() {
  return (
    <p className="nx:typography-body-default nx:text-muted-foreground">
      No matches. Remove a condition or clear all to see more results.
    </p>
  );
}
export function TableFilters({
  initiallyFiltered = true,
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
  const [projects, setProjects] =
    React.useState<NumberComparisonCondition | null>(null);
  const filtered = !!query || !!status || !!team || !!projects;
  const results = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      matchesChoice(member.status, status) &&
      matchesChoice(member.team, team) &&
      matchesProjects(member.projects, projects)
  );
  function clear() {
    setProjects(null);
    setQuery('');
    setStatus(null);
    setTeam(null);
    search.current?.focus();
  }
  return (
    <section
      aria-label="Member filtering"
      className="nx:@container/members nx:grid nx:min-w-0 nx:gap-5"
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
        <NumberComparisonFilter
          label="Projects"
          icon={<IconHash aria-hidden="true" />}
          lowerBound={0}
          value={projects}
          onChange={setProjects}
        />
      </AppliedFilters>
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
        <Results count={results.length} total={members.length} noun="members" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!filtered}
          onClick={clear}
        >
          Clear all
        </Button>
      </div>
      <div className="nx:min-w-0 nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <Table>
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
            <Button size="sm" variant="outline" onClick={clear}>
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
export function CardFilters() {
  const [category, setCategory] = React.useState<ChoiceCondition | null>({
    operator: 'is',
    value: 'Planning',
  });
  const [format, setFormat] = React.useState<ChoiceCondition | null>(null);
  const clearRef = React.useRef<HTMLButtonElement>(null);
  const results = templates.filter(
    (item) =>
      matchesChoice(item.category, category) &&
      matchesChoice(item.format, format)
  );
  function clear() {
    setCategory(null);
    setFormat(null);
    clearRef.current?.focus();
  }
  return (
    <section
      aria-label="Template filtering"
      className="nx:@container/templates nx:grid nx:min-w-0 nx:gap-4"
    >
      <div>
        <h2 className="nx:typography-heading-small">Templates</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Explore categories and formats with immediate feedback.
        </p>
      </div>
      <AppliedFilters>
        <ChoiceFilter
          label="Category"
          icon={<IconTag aria-hidden="true" />}
          value={category}
          options={['Planning', 'Research'].map((value) => ({
            value,
            label: value,
          }))}
          onChange={setCategory}
        />
        <ChoiceFilter
          label="Format"
          icon={<IconFile aria-hidden="true" />}
          value={format}
          options={['Document', 'Checklist'].map((value) => ({
            value,
            label: value,
          }))}
          onChange={setFormat}
        />
        <Button
          ref={clearRef}
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
        >
          Clear all
        </Button>
      </AppliedFilters>
      <Results
        count={results.length}
        total={templates.length}
        noun="templates"
      />
      <ul
        aria-label="Matching templates"
        className="nx:m-0 nx:grid nx:list-none nx:gap-4 nx:p-0 nx:@lg/templates:grid-cols-2"
      >
        {results.map((item) => (
          <li key={item.name}>
            <Card>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.category} · {item.format}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="nx:typography-body-default">{item.description}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {!results.length && <NoMatches />}
    </section>
  );
}
export function FileFiltersExample() {
  const [type, setType] = React.useState<ChoiceCondition | null>({
    operator: 'is',
    value: 'PDF',
  });
  const [size, setSize] = React.useState<NumberRangeCondition | null>({
    operator: 'between',
    min: 100,
    max: 500,
  });
  const results = files.filter(
    (file) =>
      matchesChoice(file.type, type) &&
      (size?.operator === 'isEmpty'
        ? false
        : size?.operator === 'isNotEmpty' ||
          !size ||
          (file.size >= size.min && file.size <= size.max))
  );
  function clear() {
    setType(null);
    setSize(null);
  }
  return (
    <section
      aria-label="File filtering"
      className="nx:grid nx:min-w-0 nx:gap-4"
    >
      <div>
        <h2 className="nx:typography-heading-small">Shared files</h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Type updates immediately. Finish both size limits, then Apply.
        </p>
      </div>
      <AppliedFilters>
        <ChoiceFilter
          label="Type"
          icon={<IconFile aria-hidden="true" />}
          value={type}
          options={['PDF', 'Image'].map((value) => ({ value, label: value }))}
          onChange={setType}
        />
        <NumberRangeFilter
          label="Size"
          unit="KB"
          lowerBound={0}
          icon={<IconFile aria-hidden="true" />}
          value={size}
          onChange={setSize}
        />
        <Button type="button" size="sm" variant="ghost" onClick={clear}>
          Clear all
        </Button>
      </AppliedFilters>
      <Results count={results.length} total={files.length} noun="files" />
      <ul
        aria-label="Matching files"
        className="nx:m-0 nx:grid nx:list-none nx:gap-2 nx:p-0"
      >
        {results.map((file) => (
          <li
            key={file.name}
            className="nx:flex nx:flex-wrap nx:justify-between nx:gap-2 nx:rounded-base nx:border-default nx:border-border-default nx:p-3"
          >
            <span className="nx:typography-label-default">{file.name}</span>
            <span className="nx:typography-body-small nx:text-muted-foreground">
              {file.owner} · {file.size} KB
            </span>
          </li>
        ))}
      </ul>
      {!results.length && <NoMatches />}
    </section>
  );
}
