import * as React from 'react';

import { IconFile, IconTag } from '@tabler/icons-react';

import { AppliedFilters } from '../../blocks/filtering/applied-filters';
import {
  type ChoiceCondition,
  ChoiceFilter,
} from '../../blocks/filtering/choice-filter/choice-filter';
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

import { matchesChoice, Results } from './local-results';
import { files, templates } from './quick-fixtures';

function matchesSize(size: number, condition: NumberRangeCondition | null) {
  if (!condition) return true;
  // Every file has a size.
  if (condition.operator === 'isEmpty') return false;
  if (condition.operator === 'isNotEmpty') return true;
  return size >= condition.min && size <= condition.max;
}

function NoMatches() {
  return (
    <p className="nx:typography-body-default nx:text-muted-foreground">
      No matches. Remove a condition or clear all to see more results.
    </p>
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
        <Button ref={clearRef} variant="ghost" size="sm" onClick={clear}>
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
    (file) => matchesChoice(file.type, type) && matchesSize(file.size, size)
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
        <Button size="sm" variant="ghost" onClick={clear}>
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
            className="nx:flex nx:flex-wrap nx:justify-between nx:gap-2 nx:rounded-lg nx:border-default nx:border-border-default nx:p-3"
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
