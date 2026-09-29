import * as React from 'react';

import { Button } from '../../../components/button';
import { DatePicker } from '../../../components/date-picker';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../../components/filter-condition';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { ConditionOperator } from '../filter-operator';

export type DateRangeCondition =
  | { operator: 'between'; from: Date; to: Date }
  | { operator: 'isEmpty' | 'isNotEmpty' };
export type DateRangeFilterProps = {
  label: string;
  icon?: React.ReactNode;
  value: DateRangeCondition | null;
  onChange: (value: DateRangeCondition | null) => void;
  disabled?: boolean;
  today?: Date;
};

export function DateRangeFilter({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  today = new Date(),
}: DateRangeFilterProps) {
  const applied = value && 'from' in value ? value : null;
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<'between' | null>(null);
  const [draft, setDraft] = React.useState<
    { from: Date | undefined; to?: Date } | undefined
  >();

  const addRef = React.useRef<HTMLButtonElement>(null);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const restoreAdd = React.useRef(false);
  const nextSnapshot = JSON.stringify([value, disabled]);
  const [snapshot, setSnapshot] = React.useState(nextSnapshot);
  // External replacements invalidate unfinished edits instead of committing stale drafts.
  if (snapshot !== nextSnapshot) {
    setSnapshot(nextSnapshot);
    setOpen(false);
    setPending(null);
  }
  const [month, setMonth] = React.useState(applied?.from ?? today);
  const valid = Boolean(
    draft?.from &&
    draft.to &&
    Number.isFinite(draft.from.getTime()) &&
    Number.isFinite(draft.to.getTime()) &&
    draft.from <= draft.to
  );
  const summary = applied
    ? `${applied.from.toLocaleDateString()} – ${applied.to.toLocaleDateString()}`
    : 'Choose…';
  const operator = pending ?? applied?.operator ?? 'between';
  function preset(days: number) {
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const from = new Date(to);
    from.setDate(from.getDate() - days + 1);
    setDraft({ from, to });
    setMonth(from);
  }
  function changeOpen(next: boolean) {
    if (disabled && next) return;
    if (next) {
      setMonth(applied?.from ?? today);
      setDraft(
        applied
          ? { from: new Date(applied.from), to: new Date(applied.to) }
          : undefined
      );
    }
    setOpen(next);
    if (!next) setPending(null);
  }
  function changeOperator(next: DateRangeCondition['operator']) {
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
    if (!valid || disabled || !draft?.from || !draft.to) return;
    onChange({
      operator,
      from: new Date(draft.from),
      to: new Date(draft.to),
    });
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
              options={['between', 'isEmpty', 'isNotEmpty']}
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
          <div className="nx:grid nx:grid-cols-2 nx:gap-2 nx:border-b nx:border-border-default nx:p-3">
            <Button
              type="button"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              variant="outline"
              disabled={disabled}
              onClick={() => preset(1)}
            >
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              variant="outline"
              disabled={disabled}
              onClick={() => preset(7)}
            >
              Last 7 days
            </Button>
          </div>
          <div className="nx:flex nx:justify-center nx:overflow-x-auto nx:p-3">
            <DatePicker
              mode="range"
              month={month}
              onMonthChange={setMonth}
              today={today}
              selected={draft}
              onSelect={setDraft}
              disabled={disabled}
            />
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
