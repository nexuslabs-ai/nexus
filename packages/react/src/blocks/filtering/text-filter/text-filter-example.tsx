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
  const rule = { kind: 'rule', id, field } as const;
  if (!('value' in condition)) return { ...rule, ...condition, value: '' };
  return { ...rule, ...condition };
}
