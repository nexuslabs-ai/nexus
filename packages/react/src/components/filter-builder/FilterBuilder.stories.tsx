import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  type FilterField,
  type FilterGroup,
  getFilterErrors,
} from '../../lib/filter-model';
import { Button } from '../button';

import { FilterBuilder } from './filter-builder';
const exampleFields: FilterField[] = [
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
const exampleTree: FilterGroup = {
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
const simple: FilterGroup = {
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
  ],
};
function Demo({
  initial = exampleTree,
  disabled = false,
  fields = exampleFields,
  maxDepth = 3,
  onValueChange,
}: {
  initial?: FilterGroup;
  disabled?: boolean;
  fields?: readonly FilterField[];
  maxDepth?: number;
  onValueChange?: (value: FilterGroup) => void;
}) {
  const [value, setValue] = React.useState(initial);
  const errors = getFilterErrors(value, fields, maxDepth);
  function change(next: FilterGroup) {
    setValue(next);
    onValueChange?.(next);
  }
  return (
    <div className="nx:grid nx:gap-4">
      <FilterBuilder
        data-example="controlled"
        fields={fields}
        value={value}
        onValueChange={change}
        disabled={disabled}
        maxDepth={maxDepth}
      />
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {errors.length
          ? `${errors.length} incomplete conditions or groups`
          : 'Ready to apply'}
      </p>
      <Button variant="outline" onClick={() => setValue(initial)}>
        Reset example
      </Button>
    </div>
  );
}
const meta = {
  title: 'Components/FilterBuilder',
  component: FilterBuilder,
  args: {
    fields: exampleFields,
    value: exampleTree,
    onValueChange: fn(),
    disabled: false,
    maxDepth: 3,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Packaged controlled editor for fields, operators, values and nested All/Any groups. Pass an editable rule tree and onValueChange; drafts can be incomplete. getFilterErrors validates built-in text, number, date and finite-choice fields. An empty root means no filters; empty nested groups are invalid. Root depth is zero; maxDepth defaults to three. Apply/Cancel, query execution, URLs, permissions and fetching belong to the application. Date values are calendar strings (YYYY-MM-DD), numbers are draft strings. IDs must be unique; field/option IDs must be nonempty. Restrict available operators per field using operators. The Filtering pattern demonstrates grouped conditions and the application boundary.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="nx:mx-auto nx:w-full nx:max-w-5xl nx:p-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Demo
      initial={args.value}
      fields={args.fields}
      disabled={args.disabled}
      maxDepth={args.maxDepth}
      onValueChange={args.onValueChange}
    />
  ),
} satisfies Meta<typeof FilterBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Filters match' })
    );
    await userEvent.click(page.getByRole('option', { name: 'Any' }));
    await expect(args.onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ conjunction: 'any' })
    );
  },
};
export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-8">
      <Demo initial={simple} />
      <Demo />
      <Demo
        initial={{
          kind: 'group',
          id: 'empty',
          conjunction: 'all',
          children: [],
        }}
      />
    </div>
  ),
};
export const Empty: Story = {
  render: () => (
    <Demo
      initial={{ kind: 'group', id: 'empty', conjunction: 'all', children: [] }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('No conditions. All results are included.')
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    await expect(canvas.getByRole('combobox', { name: 'Field' })).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await expect(canvas.queryByText('Enter a value.')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('combobox', { name: 'Field' }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole('option', {
        name: 'Team',
      })
    );
    await expect(canvas.getByText('Enter a value.')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Team condition' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add condition' })
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
  },
};
function RestoredIdsDemo() {
  const [value, setValue] = React.useState<FilterGroup>({
    kind: 'group',
    id: 'root',
    conjunction: 'all',
    children: [],
  });
  // Swaps the probe rule for a saved one holding the ID the next Add would generate, as a tree saved on an earlier page load can.
  function restoreSavedTree() {
    const [probe] = value.children;
    const nextId = (probe?.id ?? '').replace(/\d+$/, (count) =>
      String(Number(count) + 1)
    );
    setValue({
      ...value,
      children: [
        {
          kind: 'rule',
          id: nextId,
          field: 'status',
          operator: 'is',
          value: 'active',
        },
      ],
    });
  }
  return (
    <div className="nx:grid nx:gap-4">
      <FilterBuilder
        fields={exampleFields}
        value={value}
        onValueChange={setValue}
      />
      <Button variant="outline" onClick={restoreSavedTree}>
        Restore saved filters
      </Button>
    </div>
  );
}
export const RestoredIdsStayUnique: Story = {
  render: () => <RestoredIdsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    function nodeIds() {
      return Array.from(
        canvasElement.querySelectorAll<HTMLElement>('[data-node-id]'),
        (node) => node.dataset.nodeId
      );
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore saved filters' })
    );
    const [restoredId] = nodeIds();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    const ids = nodeIds();
    await expect(ids).toHaveLength(2);
    await expect(new Set(ids).size).toBe(2);
    await expect(ids[0]).toBe(restoredId);
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Remove Status condition' })[0]!
    );
    await expect(nodeIds()).toEqual([ids[1]]);
  },
};
export const OperatorAndFieldChanges: Story = {
  render: () => <Demo initial={simple} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Status operator' })
    );
    await userEvent.click(page.getByRole('option', { name: 'is empty' }));
    await expect(
      canvas.queryByRole('combobox', { name: 'Status value' })
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.click(canvas.getByRole('combobox', { name: 'Field' }));
    await userEvent.click(page.getByRole('option', { name: 'Projects' }));
    await expect(
      canvas.getByRole('spinbutton', { name: 'Projects value' })
    ).toHaveValue(null);
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await userEvent.type(
      canvas.getByRole('spinbutton', { name: 'Projects value' }),
      '-2'
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset example' })
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Status value' })
    ).toHaveTextContent('Active');
  },
};
export const KeyboardInteraction: Story = {
  render: () => <Demo initial={simple} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    canvas.getByRole('combobox', { name: 'Status operator' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(page.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(
      canvas.getByRole('combobox', { name: 'Status operator' })
    ).toHaveTextContent('is not');
    await waitFor(() =>
      expect(
        canvas.getByRole('combobox', { name: 'Status operator' })
      ).toHaveFocus()
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('combobox', { name: 'Status value' })
    ).toHaveFocus();
  },
};
export const MultipleChoices: Story = {
  render: () => (
    <Demo
      initial={{
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'teams',
            field: 'team',
            operator: 'isAnyOf',
            value: ['design'],
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Team values' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await expect(
      canvas.getByRole('button', { name: 'Team values' })
    ).toHaveTextContent('Design, Engineering');
    await userEvent.type(
      page.getByRole('textbox', { name: 'Search Team options' }),
      'missing'
    );
    await expect(page.getByText('No options found.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Team values' })).toHaveFocus()
    );
  },
};
export const RangeValidation: Story = {
  render: () => (
    <Demo
      initial={{
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'range',
            field: 'projects',
            operator: 'between',
            value: ['5', '2'],
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('The start must not be after the end.')
    ).toBeVisible();
    await userEvent.clear(
      canvas.getByRole('spinbutton', { name: 'Projects start' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await userEvent.type(
      canvas.getByRole('spinbutton', { name: 'Projects start' }),
      '0'
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
  },
};
export const NestedGroups: Story = {
  render: () => <Demo initial={simple} maxDepth={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add group' }));
    const nested = within(
      canvas.getByRole('group', { name: 'Filters group 2' })
    );
    await expect(
      nested.queryByRole('button', { name: 'Add group' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      nested.getByRole('button', { name: 'Remove Status condition' })
    );
    await expect(
      nested.getByText('Add a condition or remove this group.')
    ).toBeVisible();
    await userEvent.click(
      nested.getByRole('button', { name: 'Remove Filters group 2' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await expect(
      canvas.getByRole('button', { name: 'Add condition' })
    ).toHaveFocus();
  },
};
export const InvalidExternalValues: Story = {
  render: () => (
    <Demo
      maxDepth={0}
      initial={{
        ...exampleTree,
        children: [
          ...exampleTree.children,
          {
            kind: 'rule',
            id: 'unknown',
            field: 'removed',
            operator: 'is',
            value: 'x',
          },
          {
            kind: 'rule',
            id: 'date',
            field: 'joined',
            operator: 'is',
            value: '2026-02-31',
          },
          {
            kind: 'rule',
            id: 'hex',
            field: 'projects',
            operator: 'is',
            value: '0x10',
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Choose an available field.')).toBeVisible();
    await expect(canvas.getByText('Enter a valid date.')).toBeVisible();
    await expect(canvas.getByText('Enter a valid number.')).toBeVisible();
    await expect(
      canvas.getByText('Use at most 0 levels of nested groups.')
    ).toBeVisible();
  },
};
export const Disabled: Story = {
  render: () => <Demo disabled />,
  play: async ({ canvasElement }) => {
    const group = within(
      within(canvasElement).getByRole('group', { name: 'Filters' })
    );
    for (const control of [
      ...group.getAllByRole('button'),
      ...group.getAllByRole('combobox'),
      ...group.getAllByRole('spinbutton'),
    ])
      await expect(control).toBeDisabled();
  },
};
export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="filter-builder"]')
    ).toHaveAttribute('data-example', 'controlled');
  },
};
export const NarrowContainer: Story = {
  render: () => (
    <div className="nx:w-full nx:max-w-sm">
      <Demo />
    </div>
  ),
};

export const TextAndDates: Story = {
  render: () => (
    <Demo
      initial={{
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'name',
            field: 'name',
            operator: 'contains',
            value: 'Priya',
          },
          {
            kind: 'rule',
            id: 'date',
            field: 'joined',
            operator: 'between',
            value: ['2026-09-01', '2026-09-25'],
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Name value' }));
    await expect(canvas.getByText('Enter a value.')).toBeVisible();
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Name value' }),
      'Maya'
    );
    await expect(canvas.getByLabelText('Joined start')).toHaveValue(
      '2026-09-01'
    );
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Joined operator' })
    );
    await userEvent.click(page.getByRole('option', { name: 'is before' }));
    await expect(canvas.getByLabelText('Joined value')).toHaveValue('');
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
  },
};
export const RestrictedOperators: Story = {
  render: () => (
    <Demo
      initial={simple}
      fields={exampleFields.map((field) => ({
        ...field,
        operators: ['is', 'isNot'],
      }))}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Status operator' })
    );
    await expect(page.getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
  },
};
export const UnavailableChoice: Story = {
  render: () => (
    <Demo
      initial={{
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'stale',
            field: 'status',
            operator: 'is',
            value: 'deleted',
          },
        ],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Choose an available option.')).toBeVisible();
    await expect(
      canvas.getByRole('combobox', { name: 'Status value' })
    ).toHaveTextContent('Unavailable selection');
  },
};
