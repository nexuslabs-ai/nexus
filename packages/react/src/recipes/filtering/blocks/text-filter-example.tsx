import { useState } from 'react';

import type { FilterRule } from '../../../lib/filter-model';

import { type TextCondition, TextFilter } from './text-filter';

export function TextFilterExample() {
  const [value, setValue] = useState<TextCondition | null>({
    operator: 'contains',
    value: 'design',
  });
  return <TextFilter label="Name" value={value} onChange={setValue} />;
}

/** Converts this block's condition to a FilterBuilder rule; null adds no rule. */
export function textRule(
  id: string,
  field: string,
  condition: TextCondition | null
): FilterRule | null {
  if (!condition) return null;
  const value = 'value' in condition ? condition.value : '';
  return { kind: 'rule', id, field, operator: condition.operator, value };
}
