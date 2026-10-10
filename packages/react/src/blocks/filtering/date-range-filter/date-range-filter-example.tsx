import { useState } from 'react';

import type { FilterRule } from '../../../lib/filter-model';

import { type DateRangeCondition, DateRangeFilter } from './date-range-filter';

export function DateRangeFilterExample() {
  const [value, setValue] = useState<DateRangeCondition | null>({
    operator: 'between',
    from: '2026-09-01',
    to: '2026-09-10',
  });
  return <DateRangeFilter label="Created" value={value} onChange={setValue} />;
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function dateRangeRule(
  id: string,
  field: string,
  condition: DateRangeCondition | null
): FilterRule | null {
  if (!condition) return null;
  const rule = { kind: 'rule', id, field } as const;
  if (condition.operator !== 'between')
    return { ...rule, ...condition, value: '' };
  return {
    ...rule,
    operator: 'between',
    value: [condition.from, condition.to],
  };
}
