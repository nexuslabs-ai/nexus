import * as React from 'react';

import { Button } from '../../../components/button';
import { isValuelessOperator } from '../../../components/filter-builder';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../../components/filter-condition';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { ConditionOperator } from '../filter-operator';

export type NumberRangeCondition =
  | { operator: 'between'; min: number; max: number }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };

export function NumberRangeFilter({
  label,
  icon,
  unit,
  lowerBound,
  upperBound,
  disabled = false,
  value,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  unit?: string;
  lowerBound?: number;
  upperBound?: number;
  disabled?: boolean;
  value: NumberRangeCondition | null;
  onChange: (value: NumberRangeCondition | null) => void;
}) {
  const operator = value?.operator ?? 'between';
  const range = value?.operator === 'between' ? value : null;
  const id = React.useId();
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [min, setMin] = React.useState('');
  const [max, setMax] = React.useState('');
  const [removed, setRemoved] = React.useState(false);
  const restoreAdd = React.useRef(false);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = React.useState(
    JSON.stringify([value, disabled])
  );
  const nextSnapshot = JSON.stringify([value, disabled]);
  if (snapshot !== nextSnapshot) {
    setSnapshot(nextSnapshot);
    setOpen(false);
    setPending(false);
  }
  const addRef = React.useRef<HTMLButtonElement>(null);
  const valid =
    min !== '' &&
    max !== '' &&
    Number.isFinite(Number(min)) &&
    Number.isFinite(Number(max)) &&
    (lowerBound === undefined || Number(min) >= lowerBound) &&
    (upperBound === undefined || Number(max) <= upperBound) &&
    Number(max) >= Number(min);
  const error = valid
    ? ''
    : `Enter an ordered range${lowerBound === undefined ? '' : ` from ${lowerBound}`}${upperBound === undefined ? '' : ` up to ${upperBound}`}.`;
  function changeOpen(next: boolean) {
    if (next) {
      setMin(range ? String(range.min) : '');
      setMax(range ? String(range.max) : '');
      setRemoved(false);
    }
    setOpen(next && !disabled);
    if (!next) setPending(false);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid || disabled) return;
    onChange({ operator: 'between', min: Number(min), max: Number(max) });
    setOpen(false);
  }
  function remove() {
    if (disabled) return;
    restoreAdd.current = true;
    setOpen(false);
    onChange(null);
    setRemoved(true);
  }
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node && restoreAdd.current) {
      restoreAdd.current = false;
      node.focus();
    }
  }
  function restoreFocus(event: Event) {
    if (removed || !value) {
      event.preventDefault();
      addRef.current?.focus();
    } else if (value.operator !== 'between') {
      event.preventDefault();
      operatorRef.current?.focus();
    }
  }
  function changeOperator(next: NumberRangeCondition['operator']) {
    if (disabled) return;
    if (next === 'between') {
      setPending(true);
      return;
    }
    onChange({ operator: next });
  }
  const summary = range
    ? `${label} is ${range.min}–${range.max}${unit ? ` ${unit}` : ''}`
    : label;
  return (
    <Popover open={open && !disabled} onOpenChange={changeOpen}>
      {value ? (
        <FilterCondition className="nx:flex-wrap nx:gap-y-1">
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0">
            <FilterConditionField
              className="nx:min-w-0 nx:shrink"
              title={label}
            >
              {icon}
              <span className="nx:truncate">{label}</span>
            </FilterConditionField>
            <ConditionOperator
              label={label}
              disabled={disabled}
              triggerRef={operatorRef}
              onCloseAutoFocus={
                pending
                  ? (event) => {
                      event.preventDefault();
                      changeOpen(true);
                    }
                  : undefined
              }
              value={operator}
              options={['between', 'isEmpty', 'isNotEmpty']}
              onChange={changeOperator}
            />
          </div>
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0 nx:border-s-default nx:border-border-default nx:-ms-(--nx-borderwidth-default)">
            {(!isValuelessOperator(operator) || pending) && (
              <PopoverTrigger asChild>
                <FilterConditionSegment
                  disabled={disabled}
                  aria-label={`Edit ${summary}`}
                >
                  {range
                    ? `${range.min}–${range.max}${unit ? ` ${unit}` : ''}`
                    : 'Choose…'}
                </FilterConditionSegment>
              </PopoverTrigger>
            )}
            <FilterConditionRemove
              disabled={disabled}
              aria-label={`Remove ${label.toLowerCase()} filter`}
              onClick={remove}
            />
          </div>
        </FilterCondition>
      ) : (
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            ref={focusAdd}
            type="button"
            size="sm"
            className="nx:h-(--nx-spacing-8)"
            variant="outline"
          >
            Add {label.toLowerCase()} filter
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent
        className="nx:w-72 nx:max-w-(--radix-popover-content-available-width) nx:max-h-(--radix-popover-content-available-height) nx:overflow-y-auto nx:p-0"
        aria-label={`Filter by ${label.toLowerCase()}`}
        align="start"
        onCloseAutoFocus={restoreFocus}
      >
        <form onSubmit={apply}>
          <div className="nx:grid nx:grid-cols-2 nx:gap-3 nx:p-3">
            <p className="nx:col-span-2 nx:typography-label-small">
              {label}{' '}
              {unit && (
                <span className="nx:text-muted-foreground">({unit})</span>
              )}
            </p>
            <div className="nx:grid nx:gap-1">
              <Label htmlFor={`${id}-min`}>Minimum</Label>
              <Input
                id={`${id}-min`}
                type="number"
                min={lowerBound}
                max={upperBound}
                disabled={disabled}
                step="any"
                value={min}
                onChange={(event) => setMin(event.target.value)}
                aria-describedby={`${id}-error`}
                aria-invalid={!valid}
              />
            </div>
            <div className="nx:grid nx:gap-1">
              <Label htmlFor={`${id}-max`}>Maximum</Label>
              <Input
                id={`${id}-max`}
                type="number"
                min={lowerBound}
                max={upperBound}
                disabled={disabled}
                step="any"
                value={max}
                onChange={(event) => setMax(event.target.value)}
                aria-describedby={`${id}-error`}
                aria-invalid={!valid}
              />
            </div>
            <p
              id={`${id}-error`}
              role="status"
              className="nx:col-span-2 nx:typography-body-small nx:text-error-subtle-foreground nx:empty:hidden"
            >
              {error}
            </p>
          </div>
          <div className="nx:flex nx:justify-between nx:gap-2 nx:border-t nx:border-border-default nx:bg-control-background/20 nx:p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              disabled={!valid || disabled}
            >
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
