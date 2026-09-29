import { useState } from 'react';

import type { FilterRule } from '../../../components/filter-model';

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
  const value = 'value' in condition ? String(condition.value) : '';
  return { kind: 'rule', id, field, operator: condition.operator, value };
}
