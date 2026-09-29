import { useState } from 'react';

import type { FilterRule } from '../../../components/filter-model';

import { type DateRangeCondition, DateRangeFilter } from './date-range-filter';

export function DateRangeFilterExample() {
  const [value, setValue] = useState<DateRangeCondition | null>({
    operator: 'between',
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 10),
  });
  return <DateRangeFilter label="Created" value={value} onChange={setValue} />;
}

// FilterBuilder dates are calendar days; toISOString() would shift a local
// midnight to the previous day in timezones ahead of UTC.
function calendarDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function dateRangeRule(
  id: string,
  field: string,
  condition: DateRangeCondition | null
): FilterRule | null {
  if (!condition) return null;
  const value =
    condition.operator === 'between'
      ? [calendarDay(condition.from), calendarDay(condition.to)]
      : '';
  return { kind: 'rule', id, field, operator: condition.operator, value };
}
