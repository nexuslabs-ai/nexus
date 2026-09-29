import * as React from 'react';

import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FilterBuilder } from '../../components/filter-builder';
import {
  type FilterGroup,
  getFilterErrors,
} from '../../components/filter-model';

import { AdvancedFiltering } from './advanced-filters';
import { exampleFields } from './advanced-fixtures';
import { AppliedFiltersExample } from './applied-filters-example';
import appliedExampleSource from './applied-filters-example.tsx?raw';
import appliedFiltersSource from './blocks/applied-filters.tsx?raw';
import {
  choiceRule,
  dateRangeRule,
  multiChoiceRule,
  numberComparisonRule,
  numberRangeRule,
  textRule,
} from './filter-rule-examples';
import rulesSource from './filter-rule-examples.ts?raw';
import { InvoiceFilteringExample } from './invoice-filtering';
import invoiceSource from './invoice-filtering.tsx?raw';
import {
  emptyMemberQuery,
  MemberDirectory,
  type MemberResults,
} from './member-directory';
import { TeamDirectory } from './team-directory';
import teamSource from './team-directory.tsx?raw';

const convertedRules = [
  choiceRule('status-rule', 'status', { operator: 'is', value: 'active' }),
  multiChoiceRule('team-rule', 'team', {
    operator: 'isAnyOf',
    values: ['design', 'engineering'],
  }),
  textRule('name-rule', 'name', { operator: 'startsWith', value: 'Ma' }),
  numberComparisonRule('projects-rule', 'projects', {
    operator: 'greaterThan',
    value: 3,
  }),
  numberRangeRule('projects-range-rule', 'projects', {
    operator: 'between',
    min: 1,
    max: 10,
  }),
  dateRangeRule('joined-rule', 'joined', {
    operator: 'between',
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 30),
  }),
].filter((rule) => rule !== null);
function ConvertedRules() {
  const [tree, setTree] = React.useState<FilterGroup>({
    kind: 'group',
    id: 'root',
    conjunction: 'all',
    children: convertedRules,
  });
  return (
    <FilterBuilder
      aria-label="Converted block conditions"
      fields={exampleFields}
      value={tree}
      onValueChange={setTree}
    />
  );
}
function ResultState({
  results,
  filtered,
  onRetry = () => {},
}: {
  results: MemberResults;
  filtered: boolean;
  onRetry?: () => void;
}) {
  return (
    <MemberDirectory
      query={
        filtered ? { ...emptyMemberQuery, status: 'Invited' } : emptyMemberQuery
      }
      onQueryChange={() => {}}
      results={results}
      onRetry={onRetry}
    />
  );
}
const noMembers: MemberResults = {
  state: 'ready',
  data: { members: [], total: 0, page: 1, pageCount: 1 },
};
const meta = {
  title: 'Patterns/Filtering',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      page: () => (
        <>
          <Title />
          <p>
            Filtering helps people narrow a collection without losing their
            place. Keep the results in view, keep every active condition
            visible, and keep editing or clearing within reach. Two decisions
            shape the whole interaction; make them first.
          </p>
          <h2>1. Decide when a change applies</h2>
          <table>
            <thead>
              <tr>
                <th>Timing</th>
                <th>Use it when</th>
                <th>Build it with</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Immediately</td>
                <td>
                  Each choice is complete, easy to undo and cheap to apply, such
                  as picking one status.
                </td>
                <td>ChoiceFilter</td>
                <td>Team directory, below</td>
              </tr>
              <tr>
                <td>Per filter, on Apply</td>
                <td>
                  One condition needs several inputs or a review first, such as
                  a range, a date span or several checked values.
                </td>
                <td>
                  MultiChoiceFilter, TextFilter, NumberComparisonFilter,
                  NumberRangeFilter, DateRangeFilter
                </td>
                <td>Invoice list, below</td>
              </tr>
              <tr>
                <td>Whole set, on one Apply</td>
                <td>
                  Several conditions are edited together and results should
                  change only once, such as a grouped query.
                </td>
                <td>FilterBuilder, with draft and applied state</td>
                <td>Grouped conditions, below</td>
              </tr>
            </tbody>
          </table>
          <p>
            Choose the timing from the interaction, not the field type. No block
            applies a change when it is dismissed: Cancel, Escape and clicking
            outside discard a draft. A complete operator change applies at once;
            an operator that needs a missing value waits for it. When a
            surrounding panel owns one Apply, feed its editors the panel draft
            instead of nesting a second Apply.
          </p>
          <h2>2. Decide flat or grouped</h2>
          <p>
            This is a separate decision from timing. Several flat filters mean
            every condition must match. Reach for explicit All/Any groups only
            when people need a query such as “Active members who are in Design
            or have more than three projects”. Grouped queries use
            FilterBuilder; keep the whole query as a draft so intermediate edits
            do not change results.
          </p>
          <Canvas of={GroupedConditions} />
          <p>
            Moving from quick filters to a grouped query? Each block value
            converts to one FilterBuilder rule. The conversion is explicit per
            block, not a general engine, and FilterBuilder does not re-check a
            block’s numeric bounds.
          </p>
          <Canvas of={BlockConditionsToRules} />
          <details>
            <summary>filter-rule-examples.ts</summary>
            <Source code={rulesSource} language="tsx" />
          </details>
          <h2>3. Start from a minimal example</h2>
          <p>
            Each block page opens with a minimal controlled example, the value
            it emits and exactly when, and the files to copy:
          </p>
          <ul>
            <li>
              <a href="/?path=/docs/blocks-choicefilter--docs" target="_top">
                ChoiceFilter
              </a>
              : one value from a short list; applies immediately.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-multichoicefilter--docs"
                target="_top"
              >
                MultiChoiceFilter
              </a>
              : several values; applies with Apply.
            </li>
            <li>
              <a href="/?path=/docs/blocks-textfilter--docs" target="_top">
                TextFilter
              </a>
              : text; applies with Apply.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-numbercomparisonfilter--docs"
                target="_top"
              >
                NumberComparisonFilter
              </a>
              : one number against a threshold; applies with Apply.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-numberrangefilter--docs"
                target="_top"
              >
                NumberRangeFilter
              </a>
              : a number between two ends; applies with Apply.
            </li>
            <li>
              <a href="/?path=/docs/blocks-daterangefilter--docs" target="_top">
                DateRangeFilter
              </a>
              : a range of calendar days; applies with Apply.
            </li>
          </ul>
          <p>
            Lay several filters out with <code>blocks/applied-filters.tsx</code>
            ; it wraps them as space allows and owns layout, not query state.
            When editing lives in a Filters panel instead, show applied
            conditions as removable summaries:
          </p>
          <Canvas of={PanelSummaries} />
          <details>
            <summary>applied-filters-example.tsx</summary>
            <Source code={appliedExampleSource} language="tsx" />
          </details>
          <details>
            <summary>blocks/applied-filters.tsx</summary>
            <Source code={appliedFiltersSource} language="tsx" />
          </details>
          <h2>4. Show the result states</h2>
          <p>
            Keep active filters visible while results load or fail, and tell
            apart an empty collection, no matches and a failed request. Retry
            keeps the conditions. Show the count across all pages and reset
            pagination when a condition changes. This directory uses native
            inputs rather than the blocks; the states apply to either.
          </p>
          <h3>Loading</h3>
          <Canvas of={LoadingResults} />
          <h3>Empty collection</h3>
          <Canvas of={EmptyCollection} />
          <h3>No matches</h3>
          <Canvas of={NoMatches} />
          <h3>Failure and retry</h3>
          <Canvas of={FailureAndRetry} />
          <h2>5. Where to go next</h2>
          <ul>
            <li>
              Components: FilterChip for a removal-only summary, FilterCondition
              for independently editable parts, FilterBuilder for grouped
              conditions.
            </li>
            <li>
              The source lives in{' '}
              <code>packages/react/src/recipes/filtering</code>; its README maps
              every file.
            </li>
            <li>
              Applications own fields, permissions, values, query evaluation,
              requests, pagination and URL state. Cancel obsolete requests and
              ignore stale responses in your data layer.
            </li>
          </ul>
          <h2>Examples</h2>
          <h3>Team directory: immediate updates</h3>
          <p>
            Choosing a status or team updates the table at once. There is no
            Apply button; closing a menu only closes it.
          </p>
          <Canvas of={TeamFiltering} />
          <details>
            <summary>Copy the team directory</summary>
            <p>
              Copy team-directory.tsx, quick-fixtures.ts,
              blocks/choice-filter.tsx, blocks/applied-filters.tsx and
              filter-operator.tsx. Replace the fixture records and the local
              results predicate with your query.
            </p>
            <Source code={teamSource} language="tsx" />
          </details>
          <h3>Invoice list: Apply per filter</h3>
          <p>
            Each field opens its own checklist and Apply button. Checking
            options edits only that field’s draft; the trigger shows applied
            values. Escape or clicking outside discards the draft.
          </p>
          <Canvas of={InvoiceFiltering} />
          <details>
            <summary>Copy the invoice list</summary>
            <p>
              Copy invoice-filtering.tsx, blocks/multi-choice-filter.tsx and
              filter-operator.tsx. Connect the applied filters and search to
              your query. An empty selection means no restriction for that
              field.
            </p>
            <Source code={invoiceSource} language="tsx" />
          </details>
          <p>
            These examples use local demonstration data. The recipes are
            experimental: their stories pin the interaction, but production
            adoption needs its own evidence.
          </p>
        </>
      ),
      description: {
        component:
          'How to choose when filter changes apply, whether to group conditions, and which block to start from.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedConditions: Story = {
  name: 'Grouped conditions',
  render: () => <AdvancedFiltering />,
};
export const PanelSummaries: Story = {
  name: 'Panel with applied summaries',
  render: () => <AppliedFiltersExample />,
};
export const LoadingResults: StoryObj<typeof ResultState> = {
  name: 'Loading results',
  render: () => <ResultState filtered results={{ state: 'loading' }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Loading members…'
    );
  },
};
export const EmptyCollection: StoryObj<typeof ResultState> = {
  name: 'Empty collection',
  render: () => <ResultState filtered={false} results={noMembers} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No members yet')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Reset filters' })
    ).not.toBeInTheDocument();
  },
};
export const NoMatches: StoryObj<typeof ResultState> = {
  name: 'No matches',
  render: () => <ResultState filtered results={noMembers} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No matching members')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Reset filters' })
    ).toBeVisible();
  },
};
export const FailureAndRetry: StoryObj<typeof ResultState> = {
  name: 'Failure and retry',
  args: { onRetry: fn() },
  render: (args) => (
    <ResultState
      filtered
      onRetry={args.onRetry}
      results={{
        state: 'error',
        message: 'Members could not be loaded. Your filters are kept.',
      }}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Your filters are kept.'
    );
    await expect(canvas.getByRole('combobox', { name: 'Status' })).toHaveValue(
      'Invited'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const TeamFiltering: Story = {
  name: 'Team directory',
  render: () => <TeamDirectory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = within(
      canvas.getByRole('region', { name: 'Member filtering' })
    );
    const page = within(canvasElement.ownerDocument.body);
    await expect(table.getByText('6 of 6 members')).toBeVisible();
    await userEvent.click(
      table.getByRole('button', { name: 'Add status filter' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Invited' }));
    await userEvent.click(
      await table.findByRole('button', { name: 'Add team filter' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Design' }));
    await expect(table.getByText('1 of 6 members')).toBeVisible();
    await expect(
      await table.findByRole('cell', { name: /Maya Chen/ })
    ).toBeVisible();
    await userEvent.click(table.getByRole('button', { name: 'Clear all' }));
    await expect(table.getByText('6 of 6 members')).toBeVisible();
    await userEvent.type(
      table.getByRole('searchbox', { name: 'Search members' }),
      'missing'
    );
    await expect(table.getByText('No matches')).toBeVisible();
    await userEvent.click(table.getByRole('button', { name: 'Reset filters' }));
    await expect(table.getByText('6 of 6 members')).toBeVisible();
  },
};

export const InvoiceFiltering: Story = {
  name: 'Invoice list',
  render: () => <InvoiceFilteringExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const count = canvas.getByRole('status', { name: 'Invoice count' });
    await userEvent.click(canvas.getByRole('button', { name: 'Status' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Paid' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Overdue' }));
    await expect(count).toHaveTextContent('6 of 6');
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Status: Paid, Overdue' })
      ).toHaveFocus()
    );
    await expect(count).toHaveTextContent('4 of 6');
    await userEvent.click(canvas.getByRole('button', { name: 'Country' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'India' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Country' })).toHaveFocus()
    );
    await expect(count).toHaveTextContent('4 of 6');
    await userEvent.click(canvas.getByRole('button', { name: 'Country' }));
    await expect(
      page.getByRole('checkbox', { name: 'India' })
    ).not.toBeChecked();
    await userEvent.click(page.getByRole('checkbox', { name: 'India' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Country: India' })
      ).toHaveFocus()
    );
    await expect(count).toHaveTextContent('2 of 6');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Country: India' })
    );
    await userEvent.click(
      page.getByRole('checkbox', { name: 'United States' })
    );
    await userEvent.click(canvas.getByRole('heading', { name: 'Invoices' }));
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(count).toHaveTextContent('2 of 6');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear filters' })
    );
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search invoices' }),
      'missing'
    );
    await expect(canvas.getByText('No invoices found')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset search and filters' })
    );
    await expect(count).toHaveTextContent('6 of 6');
  },
};
export const BlockConditionsToRules: Story = {
  name: 'Block conditions as FilterBuilder rules',
  render: () => <ConvertedRules />,
  parameters: { docs: { source: { code: rulesSource, language: 'tsx' } } },
  play: async ({ canvasElement }) => {
    await expect(convertedRules).toMatchObject([
      { field: 'status', operator: 'is', value: 'active' },
      { field: 'team', operator: 'isAnyOf', value: ['design', 'engineering'] },
      { field: 'name', operator: 'startsWith', value: 'Ma' },
      { field: 'projects', operator: 'greaterThan', value: '3' },
      { field: 'projects', operator: 'between', value: ['1', '10'] },
      {
        field: 'joined',
        operator: 'between',
        value: ['2026-09-01', '2026-09-30'],
      },
    ]);
    const root: FilterGroup = {
      kind: 'group',
      id: 'root',
      conjunction: 'all',
      children: convertedRules,
    };
    await expect(getFilterErrors(root, exampleFields)).toEqual([]);
    await expect(
      within(canvasElement).queryByText(
        /Choose an available|Enter a|The start must|This operator takes/
      )
    ).not.toBeInTheDocument();
    await expect(choiceRule('none', 'status', null)).toBeNull();
    await expect(
      textRule('empty', 'name', { operator: 'isEmpty' })
    ).toMatchObject({ operator: 'isEmpty', value: '' });
    const retired = choiceRule('retired', 'status', {
      operator: 'is',
      value: 'retired-id',
    });
    await expect(
      getFilterErrors(
        {
          kind: 'group',
          id: 'root',
          conjunction: 'all',
          children: retired ? [retired] : [],
        },
        exampleFields
      )
    ).toEqual([{ id: 'retired', code: 'unknownOption' }]);
  },
};
