import { useState } from 'react';

import type { FilterRule } from '../../../lib/filter-model';

import { type ChoiceCondition, ChoiceFilter } from './choice-filter';

export function ChoiceFilterExample() {
  const [value, setValue] = useState<ChoiceCondition | null>({
    operator: 'is',
    value: 'active',
  });
  return (
    <ChoiceFilter
      label="Status"
      value={value}
      onChange={setValue}
      options={[
        { value: 'active', label: 'Active' },
        { value: 'invited', label: 'Invited' },
        { value: 'suspended', label: 'Suspended' },
      ]}
    />
  );
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function choiceRule(
  id: string,
  field: string,
  condition: ChoiceCondition | null
): FilterRule | null {
  if (!condition) return null;
  const value = 'value' in condition ? condition.value : '';
  return { kind: 'rule', id, field, operator: condition.operator, value };
}
