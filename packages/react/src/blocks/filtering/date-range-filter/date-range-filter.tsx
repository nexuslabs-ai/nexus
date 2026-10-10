import * as React from 'react';
import type { DateRange } from 'react-day-picker';

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
import { isCalendarDay } from '../../../lib/filter-model';
import { ConditionOperator } from '../filter-operator';
import { useConditionEditor } from '../use-condition-editor';

/** `from` and `to` are calendar days (`YYYY-MM-DD`), so JSON and URLs keep the same day in every timezone. */
export type DateRangeCondition =
  | { operator: 'between'; from: string; to: string }
  | { operator: 'isEmpty' | 'isNotEmpty' };
export type DateRangeFilterProps = {
  label: string;
  icon?: React.ReactNode;
  value: DateRangeCondition | null;
  onChange: (value: DateRangeCondition | null) => void;
  disabled?: boolean;
  today?: Date;
};

export function toCalendarDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
function fromCalendarDay(day: string) {
  const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}
export function formatCalendarDay(day: string) {
  return fromCalendarDay(day).toLocaleDateString();
}
/** A malformed controlled range reads as no range rather than "Invalid Date". */
function toDateRange(
  condition: { from: string; to: string } | null
): DateRange | undefined {
  if (!condition) return undefined;
  if (!isCalendarDay(condition.from) || !isCalendarDay(condition.to))
    return undefined;
  return {
    from: fromCalendarDay(condition.from),
    to: fromCalendarDay(condition.to),
  };
}

export function DateRangeFilter({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  today = new Date(),
}: DateRangeFilterProps) {
  const [draft, setDraft] = React.useState<DateRange | undefined>();
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
  const appliedRange = toDateRange(applied);
  const [month, setMonth] = React.useState(appliedRange?.from ?? today);
  const valid = Boolean(draft?.from && draft.to && draft.from <= draft.to);
  const summary =
    applied && appliedRange
      ? `${formatCalendarDay(applied.from)} – ${formatCalendarDay(applied.to)}`
      : 'Choose…';
  function seedDraft(current: { from: string; to: string } | null) {
    const range = toDateRange(current);
    setMonth(range?.from ?? today);
    setDraft(range);
  }
  function preset(days: number) {
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const from = new Date(to);
    from.setDate(from.getDate() - days + 1);
    setDraft({ from, to });
    setMonth(from);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid || !draft?.from || !draft.to) return;
    commit({
      operator: 'between',
      from: toCalendarDay(draft.from),
      to: toCalendarDay(draft.to),
    });
  }
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
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              variant="outline"
              disabled={disabled}
              onClick={() => preset(1)}
            >
              Today
            </Button>
            <Button
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
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-2 nx:border-t nx:border-border-default nx:bg-muted-extralight nx:p-3">
            <Button
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
