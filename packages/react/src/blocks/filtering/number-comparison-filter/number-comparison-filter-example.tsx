import { useState } from 'react';

import type { FilterRule } from '../../../lib/filter-model';

import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from './number-comparison-filter';

export function NumberComparisonFilterExample() {
  const [value, setValue] = useState<NumberComparisonCondition | null>({
    operator: 'greaterThan',
    value: 500,
  });
  return (
    <NumberComparisonFilter label="Amount" value={value} onChange={setValue} />
  );
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function numberComparisonRule(
  id: string,
  field: string,
  condition: NumberComparisonCondition | null
): FilterRule | null {
  if (!condition) return null;
  const rule = { kind: 'rule', id, field } as const;
  if (!('value' in condition)) return { ...rule, ...condition, value: '' };
  return { ...rule, ...condition, value: String(condition.value) };
}
