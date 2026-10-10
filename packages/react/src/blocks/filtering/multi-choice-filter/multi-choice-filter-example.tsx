import { useState } from 'react';

import type { FilterRule } from '../../../lib/filter-model';

import {
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from './multi-choice-filter';

export function MultiChoiceFilterExample() {
  const [value, setValue] = useState<MultiChoiceCondition | null>({
    operator: 'isAnyOf',
    values: ['design'],
  });
  return (
    <MultiChoiceFilter
      label="Team"
      value={value}
      onChange={setValue}
      options={[
        { value: 'design', label: 'Design' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'operations', label: 'Operations', disabled: true },
      ]}
    />
  );
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function multiChoiceRule(
  id: string,
  field: string,
  condition: MultiChoiceCondition | null
): FilterRule | null {
  if (!condition) return null;
  const rule = { kind: 'rule', id, field } as const;
  if (!('values' in condition)) return { ...rule, ...condition, value: '' };
  return {
    ...rule,
    operator: condition.operator,
    value: [...condition.values],
  };
}
