import * as React from 'react';

import { IconHash, IconPlus } from '@tabler/icons-react';

import { Button } from '../../components/button';
import type { FilterOperator } from '../../components/filter-builder';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../components/filter-condition';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover';

import { ConditionOperator } from './filter-operator';

export type ProjectFilter = { operator: FilterOperator; value: number } | null;

export function matchesProjects(count: number, filter: ProjectFilter) {
  if (!filter) return true;
  if (filter.operator === 'greaterThan') return count > filter.value;
  if (filter.operator === 'lessThan') return count < filter.value;
  return count === filter.value;
}

export function ProjectCondition({
  value,
  onChange,
}: {
  value: ProjectFilter;
  onChange: (value: ProjectFilter) => void;
}) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const valid =
    draft.trim() !== '' &&
    Number.isSafeInteger(Number(draft)) &&
    Number(draft) >= 0;
  const showError = touched && !valid;
  function changeOpen(next: boolean) {
    if (next) {
      setDraft(value ? String(value.value) : '');
      setTouched(false);
      setRemoved(false);
    }
    setOpen(next);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid) {
      setTouched(true);
      return;
    }
    onChange({
      operator: value?.operator ?? 'greaterThan',
      value: Number(draft),
    });
    setOpen(false);
  }
  function remove() {
    setRemoved(true);
    setOpen(false);
    onChange(null);
  }
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node && removed) node.focus();
  }
  function restoreFocus(event: Event) {
    if (!removed) return;
    event.preventDefault();
    addRef.current?.focus();
  }
  function changeDraft(event: React.ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
    setTouched(true);
  }
  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {value ? (
        <FilterCondition>
          <FilterConditionField>
            <IconHash aria-hidden="true" />
            Projects
          </FilterConditionField>
          <ConditionOperator
            label="Projects"
            value={value.operator}
            options={['greaterThan', 'lessThan', 'is']}
            onChange={(operator) => onChange({ ...value, operator })}
          />
          <PopoverTrigger asChild>
            <FilterConditionSegment aria-label="Edit Projects value">
              {value.value}
            </FilterConditionSegment>
          </PopoverTrigger>
          <FilterConditionRemove
            aria-label="Remove Projects filter"
            onClick={remove}
          />
        </FilterCondition>
      ) : (
        <PopoverTrigger asChild>
          <Button ref={focusAdd} variant="ghost" size="sm">
            <IconPlus aria-hidden="true" />
            Projects
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        aria-label="Filter by project count"
        onCloseAutoFocus={restoreFocus}
        className="nx:w-64 nx:max-w-(--radix-popover-content-available-width) nx:overflow-hidden nx:p-0"
      >
        <form onSubmit={apply}>
          <div className="nx:grid nx:gap-2 nx:p-3">
            <Label htmlFor={id}>
              {value ? 'Number of projects' : 'More than'}
            </Label>
            <Input
              id={id}
              type="number"
              min="0"
              step="1"
              value={draft}
              placeholder="0"
              onChange={changeDraft}
              aria-invalid={showError}
              aria-describedby={showError ? `${id}-error` : undefined}
            />
            {showError && (
              <p
                id={`${id}-error`}
                role="alert"
                className="nx:typography-body-small nx:text-error-subtle-foreground"
              >
                Enter a whole number of 0 or more.
              </p>
            )}
          </div>
          <div className="nx:flex nx:items-center nx:justify-between nx:border-t nx:border-border-default nx:p-3">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!valid}>
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
