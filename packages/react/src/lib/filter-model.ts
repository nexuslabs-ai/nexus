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
export interface FilterRule {
  kind: 'rule';
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | string[];
}
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
export function isValuelessOperator(operator: FilterOperator) {
  return operator === 'isEmpty' || operator === 'isNotEmpty';
}
export function emptyFilterValue(operator: FilterOperator): string | string[] {
  if (operator === 'between') return ['', ''];
  if (operator === 'isAnyOf' || operator === 'isNoneOf') return [];
  return '';
}
function validDate(value: string) {
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
  const multiple = rule.operator === 'isAnyOf' || rule.operator === 'isNoneOf';
  const range = rule.operator === 'between';
  if ((multiple || range) !== Array.isArray(rule.value)) return 'valueShape';
  const values = Array.isArray(rule.value) ? rule.value : [rule.value];
  if (range && values.length !== 2) return 'incompleteRange';
  if (!values.length || values.some((value) => !value.trim()))
    return 'missingValue';
  if (
    field.type === 'number' &&
    values.some((value) => !Number.isFinite(Number(value)))
  )
    return 'invalidNumber';
  if (field.type === 'date' && values.some((value) => !validDate(value)))
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
