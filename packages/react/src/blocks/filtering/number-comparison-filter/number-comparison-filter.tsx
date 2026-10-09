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

export type NumberComparisonCondition =
  | { operator: 'is' | 'isNot' | 'greaterThan' | 'lessThan'; value: number }
  | { operator: 'isEmpty' | 'isNotEmpty' };
export type NumberComparisonFilterProps = {
  label: string;
  icon?: React.ReactNode;
  value: NumberComparisonCondition | null;
  onChange: (value: NumberComparisonCondition | null) => void;
  disabled?: boolean;
  unit?: string;
  lowerBound?: number;
  upperBound?: number;
};

export function NumberComparisonFilter({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  unit,
  lowerBound,
  upperBound,
}: NumberComparisonFilterProps) {
  const applied = value && 'value' in value ? value : null;
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<
    'is' | 'isNot' | 'greaterThan' | 'lessThan' | null
  >(null);
  const [draft, setDraft] = React.useState('');
  const id = React.useId();
  const addRef = React.useRef<HTMLButtonElement>(null);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const restoreAdd = React.useRef(false);
  const nextSnapshot = JSON.stringify([
    value,
    disabled,
    lowerBound,
    upperBound,
  ]);
  const [snapshot, setSnapshot] = React.useState(nextSnapshot);
  // External replacements invalidate unfinished edits instead of committing stale drafts.
  if (snapshot !== nextSnapshot) {
    setSnapshot(nextSnapshot);
    setOpen(false);
    setPending(null);
  }
  const valid =
    draft.trim() !== '' &&
    Number.isFinite(Number(draft)) &&
    (lowerBound === undefined || Number(draft) >= lowerBound) &&
    (upperBound === undefined || Number(draft) <= upperBound);
  const summary = applied
    ? `${applied.value}${unit ? ` ${unit}` : ''}`
    : 'Choose…';
  const operator = pending ?? applied?.operator ?? 'greaterThan';

  function changeOpen(next: boolean) {
    if (disabled && next) return;
    if (next) {
      setDraft(applied ? String(applied.value) : '');
    }
    setOpen(next);
    if (!next) setPending(null);
  }
  function changeOperator(next: NumberComparisonCondition['operator']) {
    if (disabled) return;
    if (next === 'isEmpty' || next === 'isNotEmpty') {
      onChange({ operator: next });
      return;
    }
    if (applied) {
      onChange({ ...applied, operator: next });
      return;
    }
    setPending(next);
  }
  function openPending(event: Event) {
    if (!pending) return;
    event.preventDefault();
    changeOpen(true);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid || disabled) return;
    onChange({ operator, value: Number(draft) });
    setOpen(false);
    setPending(null);
  }
  function remove() {
    if (disabled) return;
    restoreAdd.current = true;
    setOpen(false);
    setPending(null);
    onChange(null);
  }
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node && restoreAdd.current) {
      restoreAdd.current = false;
      node.focus();
    }
  }
  function restoreFocus(event: Event) {
    if (!value) {
      event.preventDefault();
      addRef.current?.focus();
    } else if (!applied) {
      event.preventDefault();
      operatorRef.current?.focus();
    }
  }
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
              triggerRef={operatorRef}
              disabled={disabled}
              value={pending ?? value.operator}
              options={[
                'is',
                'isNot',
                'greaterThan',
                'lessThan',
                'isEmpty',
                'isNotEmpty',
              ]}
              onChange={changeOperator}
              onCloseAutoFocus={openPending}
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
            ref={focusAdd}
            type="button"
            size="sm"
            className="nx:h-(--nx-spacing-8)"
            variant="outline"
            disabled={disabled}
          >
            Add {label.toLowerCase()} filter
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        aria-label={`Filter by ${label.toLowerCase()}`}
        onCloseAutoFocus={restoreFocus}
        className="nx:w-72 nx:max-w-(--radix-popover-content-available-width) nx:max-h-(--radix-popover-content-available-height) nx:overflow-y-auto nx:p-0"
      >
        <form onSubmit={apply}>
          <div className="nx:grid nx:gap-2 nx:p-3">
            <Label htmlFor={id}>
              {label}
              {unit ? ` (${unit})` : ''}
            </Label>
            <Input
              id={id}
              type="number"
              step="any"
              min={lowerBound}
              max={upperBound}
              value={draft}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
              aria-describedby={`${id}-hint`}
            />
            <p
              id={`${id}-hint`}
              className="nx:typography-body-small nx:text-muted-foreground"
            >
              {lowerBound !== undefined || upperBound !== undefined
                ? `Allowed range: ${lowerBound ?? 'no minimum'} to ${upperBound ?? 'no maximum'}.`
                : 'Enter a number. Decimals and negative values are allowed.'}
            </p>
          </div>
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-2 nx:border-t nx:border-border-default nx:bg-control-background/20 nx:p-3">
            <Button
              type="button"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              variant="ghost"
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
