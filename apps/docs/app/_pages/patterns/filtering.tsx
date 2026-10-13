import type { ReactNode } from 'react';

import Link from 'next/link';

import type { MemberResults } from '@/patterns/filtering/member-directory';

import { SectionHeading, SubsectionHeading } from '../../_components/Heading';
import { InlineCode } from '../../_components/InlineCode';

import {
  AdvancedFiltering,
  AppliedFiltersExample,
  ConvertedRules,
  InvoiceFilteringExample,
  ResultState,
  TeamDirectory,
} from './_filtering-examples';

/**
 * Patterns → Filtering. Server component — the two decisions first (when a
 * change applies, flat or grouped), then where to start, the result states,
 * and the worked examples as client islands. Block source lives on each
 * block's page, not here.
 *
 * Source: packages/react/src/patterns/filtering/.
 */

const TIMING: {
  timing: string;
  when: string;
  build: string;
  example: string;
}[] = [
  {
    timing: 'Immediately',
    when: 'Each choice is complete, easy to undo and cheap to apply, such as picking one status.',
    build: 'ChoiceFilter',
    example: 'Team directory example',
  },
  {
    timing: 'Per filter, on Apply',
    when: 'One condition needs several inputs or a review first, such as a range, a date span or several checked values.',
    build:
      'MultiChoiceFilter, TextFilter, NumberComparisonFilter, NumberRangeFilter, DateRangeFilter',
    example: 'Invoice list example',
  },
  {
    timing: 'Whole set, on one Apply',
    when: 'Several conditions are edited together and results should change only once, such as a grouped query.',
    build: 'FilterBuilder, with draft and applied state',
    example: 'Grouped conditions example',
  },
];

const BLOCKS: { slug: string; name: string; summary: string }[] = [
  {
    slug: 'choice-filter',
    name: 'ChoiceFilter',
    summary: 'one value from a short list. Applies immediately.',
  },
  {
    slug: 'multi-choice-filter',
    name: 'MultiChoiceFilter',
    summary: 'several values. Applies with Apply.',
  },
  {
    slug: 'text-filter',
    name: 'TextFilter',
    summary: 'text. Applies with Apply.',
  },
  {
    slug: 'number-comparison-filter',
    name: 'NumberComparisonFilter',
    summary: 'one number against a threshold. Applies with Apply.',
  },
  {
    slug: 'number-range-filter',
    name: 'NumberRangeFilter',
    summary: 'a number between two ends. Applies with Apply.',
  },
  {
    slug: 'date-range-filter',
    name: 'DateRangeFilter',
    summary: 'a range of calendar days. Applies with Apply.',
  },
];

const NO_MEMBERS: MemberResults = {
  state: 'ready',
  data: { members: [], total: 0, page: 1, pageCount: 1 },
};

const BODY_CLASS = 'nx:typography-body-default nx:mb-4 nx:max-w-[64ch]';
const SECTION_CLASS = 'nx:typography-heading-small nx:mb-3';
const SUBSECTION_CLASS =
  'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

function Example({ children }: { children: ReactNode }) {
  return (
    <div
      data-md-skip
      className="nx:mb-4 nx:min-w-0 nx:rounded-lg nx:border nx:border-border-default nx:p-4"
    >
      {children}
    </div>
  );
}

export default function Filtering() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Filtering</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Build filters for a list from ChoiceFilter, FilterBuilder and the other
        filter blocks and components. Keep the results and every active filter
        visible, and make each filter easy to edit or clear. Start with two
        decisions: when a change applies, and whether filters can be grouped.
      </p>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          1. Decide when a change applies
        </SectionHeading>
        <div className="nx:mb-4 nx:overflow-x-auto">
          <table className="nx:w-full nx:typography-body-small nx:border-collapse">
            <thead>
              <tr className="nx:text-left nx:border-b nx:border-border-default">
                <th className="nx:py-2 nx:pr-4">Timing</th>
                <th className="nx:py-2 nx:pr-4">Use it when</th>
                <th className="nx:py-2 nx:pr-4">Build it with</th>
                <th className="nx:py-2">Example</th>
              </tr>
            </thead>
            <tbody>
              {TIMING.map((row) => (
                <tr
                  key={row.timing}
                  className="nx:align-top nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-4 nx:font-medium">
                    {row.timing}
                  </td>
                  <td className="nx:py-2 nx:pr-4">{row.when}</td>
                  <td className="nx:py-2 nx:pr-4">{row.build}</td>
                  <td className="nx:py-2">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={BODY_CLASS}>
          Choose the timing by how the filter is used, not by its field type.
          Closing a filter never applies it. Cancel, Escape and clicking outside
          all discard the draft (the edits not yet applied).
        </p>
        <p className={BODY_CLASS}>
          Changing the operator applies at once, unless the new operator needs a
          value first. If a panel has its own Apply button, pass the
          panel&rsquo;s draft to each filter. Don&rsquo;t add a second Apply
          inside it.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          2. Decide flat or grouped
        </SectionHeading>
        <p className={BODY_CLASS}>
          With flat filters, every condition must match. An All group matches
          when every condition in it matches, and an Any group matches when at
          least one does. Use groups only when people need a query like
          &ldquo;Active members who are in Design or have more than three
          projects&rdquo;.
        </p>
        <p className={BODY_CLASS}>
          Build grouped queries with FilterBuilder. Keep the query as a draft
          until it&rsquo;s applied, so results don&rsquo;t change mid-edit.
        </p>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Grouped conditions
        </SubsectionHeading>
        <Example>
          <AdvancedFiltering />
        </Example>
        <p className={BODY_CLASS}>
          To move from quick filters to a grouped query, convert each
          block&rsquo;s value into one FilterBuilder rule. Each block&rsquo;s
          example file exports its own conversion. FilterBuilder doesn&rsquo;t
          re-check a block&rsquo;s number limits.
        </p>
        <Example>
          <ConvertedRules />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          3. Start from a minimal example
        </SectionHeading>
        <p className={BODY_CLASS}>
          Each block page starts with a minimal example and the files to copy:
        </p>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          {BLOCKS.map(({ slug, name, summary }) => (
            <li key={slug}>
              <Link href={`/blocks/${slug}`} className={LINK_CLASS}>
                <strong>{name}</strong>
              </Link>
              : {summary}
            </li>
          ))}
        </ul>
        <p className={BODY_CLASS}>
          Lay several filters out with{' '}
          <InlineCode>blocks/filtering/applied-filters.tsx</InlineCode>. It
          wraps filters onto new lines as needed, and holds no filter state. If
          filters are edited in a separate panel, show the applied ones as
          removable chips:
        </p>
        <Example>
          <AppliedFiltersExample />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          4. Show the result states
        </SectionHeading>
        <p className={BODY_CLASS}>
          Keep active filters visible while results load or fail. Show a
          different message for an empty list, no matches and a failed request.
          Retry keeps the filters.
        </p>
        <p className={BODY_CLASS}>
          Show the total count across all pages, and go back to page one when a
          filter changes. The result-state examples use native inputs, but the
          same states apply to the blocks.
        </p>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Loading
        </SubsectionHeading>
        <Example>
          <ResultState filtered results={{ state: 'loading' }} />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Empty collection
        </SubsectionHeading>
        <Example>
          <ResultState filtered={false} results={NO_MEMBERS} />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          No matches
        </SubsectionHeading>
        <Example>
          <ResultState filtered results={NO_MEMBERS} />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Failure and retry
        </SubsectionHeading>
        <Example>
          <ResultState
            filtered
            results={{
              state: 'error',
              message: 'Members could not be loaded. Your filters are kept.',
            }}
          />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>Examples</SectionHeading>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Team directory: immediate updates
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Choosing a status or team updates the table at once. The filters have
          no Apply button.
        </p>
        <Example>
          <TeamDirectory />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Invoice list: Apply per filter
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Each filter opens a checklist with its own Apply button. The trigger
          shows the applied values. Escape or clicking outside discards the
          changes.
        </p>
        <Example>
          <InvoiceFilteringExample />
        </Example>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          These examples use sample data. The filtering blocks are experimental,
          so test them with your own data before you ship.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          What your app owns
        </SectionHeading>
        <p className={BODY_CLASS}>
          Your app owns the fields, permissions, values, filtering logic,
          requests, pagination and URL state. Cancel outdated requests and
          ignore late responses in your data layer.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          Where to go next
        </SectionHeading>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            Components:{' '}
            <Link href="/components/filter-chip" className={LINK_CLASS}>
              FilterChip
            </Link>{' '}
            for a removal-only summary,{' '}
            <Link href="/components/filter-condition" className={LINK_CLASS}>
              FilterCondition
            </Link>{' '}
            for independently editable parts,{' '}
            <Link href="/components/filter-builder" className={LINK_CLASS}>
              FilterBuilder
            </Link>{' '}
            for grouped conditions.
          </li>
          <li>
            The source lives in{' '}
            <InlineCode>packages/react/src/blocks/filtering</InlineCode> and{' '}
            <InlineCode>packages/react/src/patterns/filtering</InlineCode>.
          </li>
        </ul>
      </section>
    </>
  );
}
