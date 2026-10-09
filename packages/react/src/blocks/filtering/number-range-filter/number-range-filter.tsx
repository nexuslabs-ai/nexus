import * as React from 'react';

import { Button } from '../../../components/button';
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
import { useConditionEditor } from '../use-condition-editor';

export type NumberRangeCondition =
  | { operator: 'between'; min: number; max: number }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };

export type NumberRangeFilterProps = {
  label: string;
  icon?: React.ReactNode;
  unit?: string;
  lowerBound?: number;
  upperBound?: number;
  disabled?: boolean;
  value: NumberRangeCondition | null;
  onChange: (value: NumberRangeCondition | null) => void;
};

export function NumberRangeFilter({
  label,
  icon,
  unit,
  lowerBound,
  upperBound,
  disabled = false,
  value,
  onChange,
}: NumberRangeFilterProps) {
  const id = React.useId();
  const [min, setMin] = React.useState('');
  const [max, setMax] = React.useState('');
  const {
    applied,
    open,
    pending,
    changeOpen,
    changeOperator,
    commit,
    openPending,
    remove,
    focusAdd,
    operatorRef,
    restoreFocus,
  } = useConditionEditor({ value, onChange, disabled, onOpen: seedDraft });
  const valid =
    min !== '' &&
    max !== '' &&
    Number.isFinite(Number(min)) &&
    Number.isFinite(Number(max)) &&
    (lowerBound === undefined || Number(min) >= lowerBound) &&
    (upperBound === undefined || Number(max) <= upperBound) &&
    Number(max) >= Number(min);
  const invalid = min !== '' && max !== '' && !valid;
  const error = invalid
    ? `Enter an ordered range${lowerBound === undefined ? '' : ` from ${lowerBound}`}${upperBound === undefined ? '' : ` up to ${upperBound}`}.`
    : '';
  function seedDraft(current: { min: number; max: number } | null) {
    setMin(current ? String(current.min) : '');
    setMax(current ? String(current.max) : '');
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid) return;
    commit({ operator: 'between', min: Number(min), max: Number(max) });
  }
  const summary = applied
    ? `${applied.min}–${applied.max}${unit ? ` ${unit}` : ''}`
    : 'Choose…';
  return (
    <Popover open={open} onOpenChange={changeOpen}>
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
              onCloseAutoFocus={openPending}
              value={pending ?? value.operator}
              options={['between', 'isEmpty', 'isNotEmpty']}
              onChange={changeOperator}
            />
          </div>
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0 nx:border-s-default nx:border-border-default nx:-ms-(--nx-borderwidth-default)">
            {(applied || pending) && (
              <PopoverTrigger asChild>
                <FilterConditionSegment
                  className="nx:min-w-20"
                  disabled={disabled}
                  aria-label={`Edit ${label}: ${summary}`}
                >
                  {summary}
                </FilterConditionSegment>
              </PopoverTrigger>
            )}
            <FilterConditionRemove
              disabled={disabled}
              aria-label={`Remove ${label} filter`}
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
                aria-invalid={invalid}
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
                aria-invalid={invalid}
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
