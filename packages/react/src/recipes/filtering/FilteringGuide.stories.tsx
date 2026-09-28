import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AdvancedFiltering } from './advanced-filters';
import { AppliedFiltersExample } from './applied-filters-example';
import appliedExampleSource from './applied-filters-example.tsx?raw';
import rowSource from './blocks/applied-filters.tsx?raw';
import choiceSource from './blocks/choice-filter.tsx?raw';
import dateSource from './blocks/date-range-filter.tsx?raw';
import multiSource from './blocks/multi-choice-filter.tsx?raw';
import comparisonSource from './blocks/number-comparison-filter.tsx?raw';
import rangeSource from './blocks/number-range-filter.tsx?raw';
import textSource from './blocks/text-filter.tsx?raw';
import operatorSource from './filter-operator.tsx?raw';
import { InvoiceFilteringExample } from './invoice-filtering';
import invoiceSource from './invoice-filtering.tsx?raw';
import { TeamDirectory } from './team-directory';
import teamSource from './team-directory.tsx?raw';
import { Showcase } from './value-editors';

function FilteringGuide() {
  return (
    <article className="nx:mx-auto nx:grid nx:w-full nx:min-w-0 nx:max-w-4xl nx:gap-10 nx:p-4 nx:typography-body-default">
      <header className="nx:grid nx:gap-3">
        <p className="nx:text-muted-foreground">
          Filtering helps people narrow a collection without losing their place.
          Start with the results, make the active conditions visible, and keep
          editing or clearing them within reach.
        </p>
        <p className="nx:typography-label-default">
          Browse results → add a filter → choose a condition → see matches →
          edit or remove
        </p>
      </header>
      <section className="nx:grid nx:gap-4" aria-labelledby="filtering-flow">
        <h2 id="filtering-flow" className="nx:typography-heading-small">
          Edit filters directly
        </h2>
        <p>
          Find invited people in Design. Add a status filter and choose Invited,
          then add a team filter and choose Design. Change either value to
          explore the results. Remove a condition with ×, or clear everything to
          return to the collection.
        </p>
        <div className="nx:rounded-lg nx:border nx:border-border-default nx:p-4">
          <TeamDirectory />
        </div>
        <p className="nx:text-muted-foreground">
          The table provides context for this example. The filtering interaction
          can also sit above cards or files; changing the result layout does not
          create a separate pattern.
        </p>
      </section>
      <section className="nx:grid nx:gap-4" aria-labelledby="filtering-panel">
        <h2 id="filtering-panel" className="nx:typography-heading-small">
          Choose in a panel, show applied summaries
        </h2>
        <p>
          Use this approach when the editing controls live in a Filters menu or
          panel. FilterChip keeps each applied condition visible beside results.
          Clicking a chip removes it; editing happens in the Filters panel. Use
          editable conditions above when people should change values directly.
        </p>
        <div className="nx:rounded-lg nx:border nx:border-border-default nx:p-4">
          <AppliedFiltersExample />
        </div>
        <details>
          <summary>Copy this example and connect your data</summary>
          <p>
            This example imports Nexus components from @nexus_ds/react. Replace
            the paid and india state with your conditions and connect them to
            your matching or fetching logic. The status text demonstrates state
            only; it does not fetch invoices. Preserve focus handling when chips
            disappear.
          </p>
          <p>
            Copy applied-filters-example.tsx from the source section below this
            example.
          </p>
        </details>
      </section>
      <section
        className="nx:grid nx:gap-4"
        aria-labelledby="filtering-condition"
      >
        <h2 id="filtering-condition" className="nx:typography-heading-small">
          Choose a condition
        </h2>
        <p>
          A condition connects a field, a comparison and a value:{' '}
          <strong>Status · is · Invited</strong>. Let people edit the comparison
          and value separately when both are useful. For a common choice such as
          status, the product can keep “is” implicit and show only the choices.
        </p>
        <p>
          Use a short list for a few choices, search for a long list, checkboxes
          for several values, and appropriate inputs for text, numbers and
          dates. “Is empty” and “is not empty” need no value input.
        </p>
        <details className="nx:rounded-lg nx:border nx:border-border-default nx:p-4">
          <summary className="nx:cursor-pointer nx:typography-label-default">
            Explore value inputs
          </summary>
          <div className="nx:mt-4">
            <Showcase />
          </div>
        </details>
      </section>
      <section className="nx:grid nx:gap-4" aria-labelledby="filtering-apply">
        <h2 id="filtering-apply" className="nx:typography-heading-small">
          Show matching results
        </h2>
        <p>
          Apply a single choice immediately when the change is easy to
          understand and undo. Keep a draft when people need to finish several
          inputs, such as the minimum and maximum of a range. Apply commits that
          draft; Cancel, Escape and outside dismissal discard it.
        </p>
        <p>
          Components supply controls; blocks decide when a complete condition is
          committed. ChoiceFilter commits on selection: outside click only
          closes its menu. MultiChoiceFilter, TextFilter,
          NumberComparisonFilter, NumberRangeFilter and DateRangeFilter keep
          value edits as drafts until Apply. Their Cancel, Escape and outside
          click discard the draft. Complete operator changes apply immediately;
          an operator needing a missing value waits for that value. No block
          saves a draft on dismissal.
        </p>
        <p>
          Multiple selections can also apply immediately when each choice is
          independent and results are cheap to update. These blocks deliberately
          batch them. In an advanced query, the pattern owns a draft of the
          whole query and its Apply action commits all conditions together.
        </p>
        <p>
          Keep active filters visible while results update. Distinguish loading
          from no matches, and a failed request from an empty collection. A
          retry should retain the conditions. Show the matching count across all
          pages and reset pagination when a condition changes.
        </p>
      </section>
      <section className="nx:grid nx:gap-4" aria-labelledby="filtering-edit">
        <h2 id="filtering-edit" className="nx:typography-heading-small">
          Edit or remove a filter
        </h2>
        <p>
          Keep the current condition readable beside the results. Clicking its
          value opens the appropriate editor. × removes that condition and
          returns keyboard focus to its Add control. Clear filters resets the
          whole search. When nothing matches, offer a direct way to adjust or
          clear the conditions.
        </p>
      </section>
      <section className="nx:grid nx:gap-4" aria-labelledby="filtering-groups">
        <h2 id="filtering-groups" className="nx:typography-heading-small">
          Combine conditions when the task needs it
        </h2>
        <p>
          Multiple filters often mean all conditions must match. Add explicit
          All/Any grouping only when people need a query such as “Active members
          who are in Design or have more than three projects.” Keep the whole
          query as a draft so intermediate edits do not change the results.
        </p>
        <details className="nx:rounded-lg nx:border nx:border-border-default nx:p-4">
          <summary className="nx:cursor-pointer nx:typography-label-default">
            Try grouped conditions
          </summary>
          <div className="nx:mt-4">
            <AdvancedFiltering />
          </div>
        </details>
      </section>
      <section
        className="nx:grid nx:gap-4"
        aria-labelledby="filtering-implementation"
      >
        <h2
          id="filtering-implementation"
          className="nx:typography-heading-small"
        >
          Implementation guidance
        </h2>
        <p>
          Use FilterChip for a removal-only summary, FilterCondition for
          independently editable parts, and FilterBuilder when grouped
          conditions are needed. These components have separate API
          documentation under Components.
        </p>
        <div className="nx:grid nx:gap-3">
          <h3 className="nx:typography-label-default">
            Copy a block, connect your state
          </h3>
          <ul className="nx:list-disc nx:space-y-2 nx:ps-5">
            <li>
              <a href="/?path=/docs/blocks-choicefilter--docs" target="_top">
                <strong>ChoiceFilter</strong>
              </a>
              : a labelled field, independent operator, choice menu and removal.
              Pass options as IDs and labels, a condition (or null), and
              onChange.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-numberrangefilter--docs"
                target="_top"
              >
                <strong>NumberRangeFilter</strong>
              </a>
              : the same condition anatomy with draft bounds and Apply/Cancel.
              Configure the label, unit and optional limits.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-multichoicefilter--docs"
                target="_top"
              >
                <strong>MultiChoiceFilter</strong>
              </a>
              : several option IDs with is any of / is none of operators and a
              draft checklist.
            </li>
            <li>
              <a href="/?path=/docs/blocks-daterangefilter--docs" target="_top">
                <strong>DateRangeFilter</strong>
              </a>
              : a calendar, Today / Last 7 days presets, and a draft date range.
            </li>
            <li>
              <a href="/?path=/docs/blocks-textfilter--docs" target="_top">
                <strong>TextFilter</strong>
              </a>
              : contains, is, is not and starts with operators with a draft text
              input.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-numbercomparisonfilter--docs"
                target="_top"
              >
                <strong>NumberComparisonFilter</strong>
              </a>
              : equals, not equals, greater than and less than operators with
              one numeric input.
            </li>
            <li>
              <strong>AppliedFilters:</strong> a wrapping row for those controls
              and your Add/Clear actions. It owns layout, not query state.
            </li>
          </ul>
          <p>
            The six value-type examples above use these blocks. The searchable
            owner example is a separate custom composition. Copy their source
            from <code>recipes/filtering/blocks</code>; import the underlying
            components from <code>@nexus_ds/react</code>. Each edit emits a
            complete condition. A removed condition is null.
          </p>
          <p>
            For grouped conditions, use FilterBuilder with controlled draft and
            applied state. All six blocks above use controlled conditions and
            the shared FilterCondition anatomy. Choose the block by its value
            type. Draft editors commit only complete values on Apply.
          </p>
        </div>

        <p>
          Applications own available fields, permissions, values, query
          evaluation, requests, pagination and URL persistence. Keep that logic
          outside the visual components. Cancel obsolete requests, reject stale
          responses, and restore controls and results together when navigating
          Back or Forward.
        </p>
        <p>
          Copyable source lives in{' '}
          <code>packages/react/src/recipes/filtering</code>. Its README lists
          the exact files, dependencies and integration inputs. Stories retain
          the loading, retry, URL and keyboard checks as internal verification,
          rather than separate pattern categories.
        </p>
        <p className="nx:text-muted-foreground">
          These examples use local demonstration data. The recipes remain
          experimental. Block contracts and interaction checks support developer
          handoff; production adoption is separate evidence.
        </p>
      </section>
    </article>
  );
}
function BlockSource() {
  return (
    <details className="nx:min-w-0 nx:rounded-lg nx:border nx:border-border-default nx:p-4">
      <summary className="nx:cursor-pointer nx:typography-label-default">
        Copy block source
      </summary>
      <p className="nx:my-3">
        Copy only what you need. All six filter blocks require the shared
        filter-operator.tsx file. AppliedFilters stands alone. Preserve the
        blocks folder or update relative imports. Include copied files in your
        Tailwind source scan.
      </p>
      <h3 className="nx:typography-label-default">
        applied-filters-example.tsx
      </h3>
      <Source code={appliedExampleSource} language="tsx" />
      <h3 className="nx:typography-label-default">blocks/choice-filter.tsx</h3>
      <Source code={choiceSource} language="tsx" />
      <h3 className="nx:typography-label-default">
        blocks/number-range-filter.tsx
      </h3>
      <Source code={rangeSource} language="tsx" />
      <h3 className="nx:typography-label-default">
        blocks/multi-choice-filter.tsx
      </h3>
      <Source code={multiSource} language="tsx" />
      <h3 className="nx:typography-label-default">
        blocks/date-range-filter.tsx
      </h3>
      <Source code={dateSource} language="tsx" />
      <h3 className="nx:typography-label-default">blocks/text-filter.tsx</h3>
      <Source code={textSource} language="tsx" />
      <h3 className="nx:typography-label-default">
        blocks/number-comparison-filter.tsx
      </h3>
      <Source code={comparisonSource} language="tsx" />
      <h3 className="nx:typography-label-default">filter-operator.tsx</h3>
      <Source code={operatorSource} language="tsx" />
      <h3 className="nx:typography-label-default">
        blocks/applied-filters.tsx
      </h3>
      <Source code={rowSource} language="tsx" />
    </details>
  );
}
const meta = {
  title: 'Patterns/Filtering',
  component: FilteringGuide,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      page: () => (
        <>
          <Title />
          <h2>Team directory — immediate updates</h2>
          <p>
            Select Status or Team to update the table immediately. Removing a
            condition or clearing filters updates results too. There is no Apply
            button; closing the menu only closes it.
          </p>
          <Canvas of={TeamFiltering} />
          <details>
            <summary>Copy team directory and connect your data</summary>
            <p>
              Copy team-directory.tsx, quick-fixtures.ts,
              blocks/choice-filter.tsx, blocks/applied-filters.tsx and
              filter-operator.tsx. Replace members with your records. Status,
              team and query are applied state; connect them to your query
              instead of the local results predicate. Handle loading and request
              errors in your application.
            </p>
            <Source code={teamSource} language="tsx" />
          </details>
          <h2>Invoice list — explicit Apply</h2>
          <p>
            Each field opens its own checklist and Apply button. Selecting
            options edits only that field’s draft. The trigger shows applied
            values. This local-data recipe adapts the individual Status filter
            structure observed in Stripe; it is not a Stripe clone.
          </p>
          <Canvas of={InvoiceFiltering} />
          <details>
            <summary>Copy invoice list and connect your data</summary>
            <p>
              Copy invoice-filtering.tsx, blocks/multi-choice-filter.tsx and
              filter-operator.tsx. Replace invoices with your records. Each
              editor keeps a draft; submit commits it to filters. Connect
              filters and search to your query. Escape or outside click discards
              the draft. Empty selections mean no restriction.
            </p>
            <Source code={invoiceSource} language="tsx" />
          </details>
          <h2>Filtering guidance</h2>
          <Canvas of={Overview} />
          <BlockSource />
        </>
      ),
      description: {
        component:
          'One filtering flow, with supporting guidance for values, application timing and grouped conditions.',
      },
    },
  },
} satisfies Meta<typeof FilteringGuide>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};

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
