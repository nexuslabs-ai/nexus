import type {
  FilterField,
  FilterGroup,
  FilterRule,
} from '../../components/filter-builder';

export const exampleFields: FilterField[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'choice',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'invited', label: 'Invited' },
      { value: 'suspended', label: 'Suspended' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    type: 'choice',
    options: [
      { value: 'design', label: 'Design' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'operations', label: 'Operations' },
    ],
  },
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'projects', label: 'Projects', type: 'number' },
  { id: 'joined', label: 'Joined', type: 'date' },
];
export const exampleTree: FilterGroup = {
  kind: 'group',
  id: 'root',
  conjunction: 'all',
  children: [
    {
      kind: 'rule',
      id: 'status-rule',
      field: 'status',
      operator: 'is',
      value: 'active',
    },
    {
      kind: 'group',
      id: 'team-group',
      conjunction: 'any',
      children: [
        {
          kind: 'rule',
          id: 'team-rule',
          field: 'team',
          operator: 'is',
          value: 'design',
        },
        {
          kind: 'rule',
          id: 'projects-rule',
          field: 'projects',
          operator: 'greaterThan',
          value: '3',
        },
      ],
    },
  ],
};

export const members = [
  {
    name: 'Priya Shah',
    status: 'active',
    team: 'design',
    projects: 2,
    joined: '2026-09-10',
  },
  {
    name: 'Maya Chen',
    status: 'active',
    team: 'engineering',
    projects: 6,
    joined: '2026-08-20',
  },
  {
    name: 'Alex Morgan',
    status: 'invited',
    team: 'design',
    projects: 5,
    joined: '2026-09-18',
  },
  {
    name: 'Noor Ahmed',
    status: 'active',
    team: 'operations',
    projects: 1,
    joined: '2026-07-02',
  },
  {
    name: 'Sam Rivera',
    status: 'suspended',
    team: 'engineering',
    projects: 0,
    joined: '2026-06-15',
  },
];
// This evaluator is fixture-specific. Applications translate the tree into their own queries.
export function matches(
  member: (typeof members)[number],
  node: FilterGroup | FilterRule
): boolean {
  if (node.kind === 'group') {
    if (!node.children.length) return true;
    return node.conjunction === 'all'
      ? node.children.every((child) => matches(member, child))
      : node.children.some((child) => matches(member, child));
  }
  const field = exampleFields.find((item) => item.id === node.field);
  const raw = member[node.field as keyof typeof member];
  const actual = String(raw ?? '').toLocaleLowerCase();
  const operands = (Array.isArray(node.value) ? node.value : [node.value]).map(
    (item) => item.toLocaleLowerCase()
  );
  const first = operands[0] ?? '';
  switch (node.operator) {
    case 'isEmpty':
      return actual === '';
    case 'isNotEmpty':
      return actual !== '';
    case 'is':
      return field?.type === 'number'
        ? Number(actual) === Number(first)
        : actual === first;
    case 'isNot':
      return field?.type === 'number'
        ? Number(actual) !== Number(first)
        : actual !== first;
    case 'contains':
      return actual.includes(first);
    case 'startsWith':
      return actual.startsWith(first);
    case 'isAnyOf':
      return operands.includes(actual);
    case 'isNoneOf':
      return !operands.includes(actual);
    case 'greaterThan':
      return Number(actual) > Number(first);
    case 'lessThan':
      return Number(actual) < Number(first);
    case 'before':
      return actual < first;
    case 'after':
      return actual > first;
    case 'between':
      return field?.type === 'number'
        ? Number(actual) >= Number(first) &&
            Number(actual) <= Number(operands[1])
        : actual >= first && actual <= (operands[1] ?? '');
  }
}
