import type {
  FilterOperator,
  FilterRule,
} from '../../components/filter-model';

import type { ChoiceCondition } from './blocks/choice-filter';
import type { DateRangeCondition } from './blocks/date-range-filter';
import type { MultiChoiceCondition } from './blocks/multi-choice-filter';
import type { NumberComparisonCondition } from './blocks/number-comparison-filter';
import type { NumberRangeCondition } from './blocks/number-range-filter';
import type { TextCondition } from './blocks/text-filter';

/*
 * Copy-source examples: one function per block, turning that block's condition
 * into a FilterBuilder rule. `id` must be unique in the tree and `field` must
 * match a FilterField id of a compatible type. A null condition produces no
 * rule. FilterBuilder fields carry no numeric bounds, so bounds a block
 * enforced are not re-checked once the value is a rule.
 */

function rule(
  id: string,
  field: string,
  operator: FilterOperator,
  value: string | string[]
): FilterRule {
  return { kind: 'rule', id, field, operator, value };
}

// FilterBuilder dates are calendar days; toISOString() would shift a local
// midnight to the previous day in timezones ahead of UTC.
function calendarDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function choiceRule(
  id: string,
  field: string,
  condition: ChoiceCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (!('value' in condition)) return rule(id, field, condition.operator, '');
  return rule(id, field, condition.operator, condition.value);
}

export function multiChoiceRule(
  id: string,
  field: string,
  condition: MultiChoiceCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (!('values' in condition)) return rule(id, field, condition.operator, '');
  return rule(id, field, condition.operator, [...condition.values]);
}

export function textRule(
  id: string,
  field: string,
  condition: TextCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (!('value' in condition)) return rule(id, field, condition.operator, '');
  return rule(id, field, condition.operator, condition.value);
}

export function numberComparisonRule(
  id: string,
  field: string,
  condition: NumberComparisonCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (!('value' in condition)) return rule(id, field, condition.operator, '');
  return rule(id, field, condition.operator, String(condition.value));
}

export function numberRangeRule(
  id: string,
  field: string,
  condition: NumberRangeCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (condition.operator !== 'between')
    return rule(id, field, condition.operator, '');
  return rule(id, field, 'between', [
    String(condition.min),
    String(condition.max),
  ]);
}

export function dateRangeRule(
  id: string,
  field: string,
  condition: DateRangeCondition | null
): FilterRule | null {
  if (!condition) return null;
  if (condition.operator !== 'between')
    return rule(id, field, condition.operator, '');
  return rule(id, field, 'between', [
    calendarDay(condition.from),
    calendarDay(condition.to),
  ]);
}
