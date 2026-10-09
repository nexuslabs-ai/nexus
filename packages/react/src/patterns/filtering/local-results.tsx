import type { ChoiceCondition } from '../../blocks/filtering/choice-filter/choice-filter';

// Local-data stand-ins for the application's query and result count.
export function matchesChoice(
  actual: string,
  condition: ChoiceCondition | null
) {
  if (!condition) return true;
  if (condition.operator === 'isEmpty') return actual === '';
  if (condition.operator === 'isNotEmpty') return actual !== '';
  if (condition.operator === 'isNot') return actual !== condition.value;
  return actual === condition.value;
}

export function Results({
  count,
  total,
  noun,
}: {
  count: number;
  total: number;
  noun: string;
}) {
  return (
    <p
      role="status"
      className="nx:typography-body-small nx:text-muted-foreground"
    >
      {count} of {total} {noun}
    </p>
  );
}
