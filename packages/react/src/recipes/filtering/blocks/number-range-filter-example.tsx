import { useState } from 'react';

import type { FilterRule } from '../../../components/filter-model';

import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from './number-range-filter';

export function NumberRangeFilterExample() {
  const [value, setValue] = useState<NumberRangeCondition | null>({
    operator: 'between',
    min: 100,
    max: 500,
  });
  return (
    <NumberRangeFilter
      label="Size"
      value={value}
      onChange={setValue}
      unit="KB"
      lowerBound={0}
    />
  );
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function numberRangeRule(
  id: string,
  field: string,
  condition: NumberRangeCondition | null
): FilterRule | null {
  if (!condition) return null;
  const value =
    condition.operator === 'between'
      ? [String(condition.min), String(condition.max)]
      : '';
  return { kind: 'rule', id, field, operator: condition.operator, value };
}
