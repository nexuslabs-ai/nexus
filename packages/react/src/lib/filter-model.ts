/**
 * The meaning every evaluator of a rule follows — the blocks' conditions,
 * FilterBuilder trees and the application's own queries:
 *
 * - Text comparisons (`is`, `isNot`, `contains`, `startsWith`) ignore case.
 * - Choice values (`is`, `isNot`, `isAnyOf`, `isNoneOf` on a choice field)
 *   compare option values exactly.
 * - Numbers compare numerically; dates compare as `YYYY-MM-DD` calendar days.
 * - `between` includes both ends. `greaterThan`, `lessThan`, `before` and
 *   `after` exclude the operand.
 * - `isEmpty` matches a record with no value: missing, an empty string or an
 *   empty list. `isNotEmpty` is its negation.
 * - `isNot` and `isNoneOf` are the negations of `is` and `isAnyOf`, so they
 *   also match records with no value.
 */
export type FilterOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'startsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'before'
  | 'after'
  | 'isAnyOf'
  | 'isNoneOf'
  | 'isEmpty'
  | 'isNotEmpty';

export interface FilterOption {
  value: string;
  label: string;
}
export type FilterField = {
  id: string;
  label: string;
  operators?: readonly FilterOperator[];
} & (
  | { type: 'text' | 'number' | 'date' }
  | { type: 'choice'; options: readonly FilterOption[] }
);
type ValuelessOperator = 'isEmpty' | 'isNotEmpty';
type ListOperator = 'isAnyOf' | 'isNoneOf';
type FilterValue<Operator extends FilterOperator> =
  Operator extends ValuelessOperator
    ? ''
    : Operator extends ListOperator
      ? string[]
      : Operator extends 'between'
        ? [string, string]
        : string;
/** Numeric and date operands stay strings, so a rule can hold an unfinished draft. */
export type FilterRule = {
  [Operator in FilterOperator]: {
    kind: 'rule';
    id: string;
    field: string;
    operator: Operator;
    value: FilterValue<Operator>;
  };
}[FilterOperator];
export interface FilterGroup {
  kind: 'group';
  id: string;
  conjunction: 'all' | 'any';
  children: (FilterRule | FilterGroup)[];
}
export type FilterErrorCode =
  | 'duplicateId'
  | 'unknownField'
  | 'unknownOperator'
  | 'unexpectedValue'
  | 'valueShape'
  | 'incompleteRange'
  | 'missingValue'
  | 'invalidNumber'
  | 'invalidDate'
  | 'unknownOption'
  | 'reversedRange'
  | 'tooDeep'
  | 'emptyGroup';
export interface FilterError {
  id: string;
  code: FilterErrorCode;
}

export const filterOperatorLabels: Record<FilterOperator, string> = {
  is: 'is',
  isNot: 'is not',
  contains: 'contains',
  startsWith: 'starts with',
  greaterThan: 'is greater than',
  lessThan: 'is less than',
  between: 'is between',
  before: 'is before',
  after: 'is after',
  isAnyOf: 'is any of',
  isNoneOf: 'is none of',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
};
const operatorsByType: Record<FilterField['type'], readonly FilterOperator[]> =
  {
    text: ['contains', 'is', 'isNot', 'startsWith', 'isEmpty', 'isNotEmpty'],
    number: [
      'is',
      'isNot',
      'greaterThan',
      'lessThan',
      'between',
      'isEmpty',
      'isNotEmpty',
    ],
    date: [
      'is',
      'isNot',
      'before',
      'after',
      'between',
      'isEmpty',
      'isNotEmpty',
    ],
    choice: ['is', 'isNot', 'isAnyOf', 'isNoneOf', 'isEmpty', 'isNotEmpty'],
  };
export function getFilterOperators(
  field: FilterField
): readonly FilterOperator[] {
  const compatible = operatorsByType[field.type];
  return field.operators
    ? compatible.filter((operator) => field.operators?.includes(operator))
    : compatible;
}
export function isValuelessOperator(
  operator: FilterOperator
): operator is ValuelessOperator {
  return operator === 'isEmpty' || operator === 'isNotEmpty';
}
function isListOperator(operator: FilterOperator): operator is ListOperator {
  return operator === 'isAnyOf' || operator === 'isNoneOf';
}
export function emptyFilterRule(
  id: string,
  field: string,
  operator: FilterOperator
): FilterRule {
  const rule = { kind: 'rule', id, field } as const;
  if (isValuelessOperator(operator)) return { ...rule, operator, value: '' };
  if (isListOperator(operator)) return { ...rule, operator, value: [] };
  if (operator === 'between') return { ...rule, operator, value: ['', ''] };
  return { ...rule, operator, value: '' };
}
/** Keeps the value when the new operator takes the same shape of value; otherwise starts empty. */
export function changeFilterOperator(
  rule: FilterRule,
  operator: FilterOperator
): FilterRule {
  const next = emptyFilterRule(rule.id, rule.field, operator);
  if (next.operator === 'isEmpty' || next.operator === 'isNotEmpty')
    return next;
  if (next.operator === 'between')
    return rule.operator === 'between' ? { ...next, value: rule.value } : next;
  if (next.operator === 'isAnyOf' || next.operator === 'isNoneOf')
    return rule.operator === 'isAnyOf' || rule.operator === 'isNoneOf'
      ? { ...next, value: rule.value }
      : next;
  return typeof rule.value === 'string' ? { ...next, value: rule.value } : next;
}
/** Plain decimal notation; `Number()` alone also accepts `0x10` and `0b1`. */
const decimalNumber = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
/** A real `YYYY-MM-DD` calendar day. */
export function isCalendarDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000'))
    return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function getFilterRuleError(
  rule: FilterRule,
  fields: readonly FilterField[]
): FilterErrorCode | undefined {
  const field = fields.find((item) => item.id === rule.field);
  if (!field) return 'unknownField';
  if (!getFilterOperators(field).includes(rule.operator))
    return 'unknownOperator';
  if (isValuelessOperator(rule.operator))
    return rule.value === '' ? undefined : 'unexpectedValue';
  const multiple = isListOperator(rule.operator);
  const range = rule.operator === 'between';
  if ((multiple || range) !== Array.isArray(rule.value)) return 'valueShape';
  const values = Array.isArray(rule.value) ? rule.value : [rule.value];
  if (range && values.length !== 2) return 'incompleteRange';
  if (!values.length || values.some((value) => !value.trim()))
    return 'missingValue';
  if (
    field.type === 'number' &&
    values.some((value) => !decimalNumber.test(value.trim()))
  )
    return 'invalidNumber';
  if (field.type === 'date' && values.some((value) => !isCalendarDay(value)))
    return 'invalidDate';
  if (
    field.type === 'choice' &&
    values.some(
      (value) => !field.options.some((option) => option.value === value)
    )
  )
    return 'unknownOption';
  if (range) {
    const [start = '', end = ''] = values;
    if (field.type === 'number' ? Number(start) > Number(end) : start > end)
      return 'reversedRange';
  }
  return undefined;
}
/** Root depth is zero. An empty root means no filters; empty nested groups are incomplete. */
export function getFilterErrors(
  group: FilterGroup,
  fields: readonly FilterField[],
  maxDepth = 3
): FilterError[] {
  const errors: FilterError[] = [];
  const ids = new Set<string>();
  function visit(node: FilterGroup | FilterRule, depth: number) {
    if (!node.id || ids.has(node.id))
      errors.push({ id: node.id, code: 'duplicateId' });
    ids.add(node.id);
    if (node.kind === 'rule') {
      const code = getFilterRuleError(node, fields);
      if (code) errors.push({ id: node.id, code });
      return;
    }
    if (depth > maxDepth) errors.push({ id: node.id, code: 'tooDeep' });
    if (depth > 0 && !node.children.length)
      errors.push({ id: node.id, code: 'emptyGroup' });
    for (const child of node.children)
      visit(child, child.kind === 'group' ? depth + 1 : depth);
  }
  visit(group, 0);
  return errors;
}
