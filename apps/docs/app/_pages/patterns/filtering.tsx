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
    example: 'Team directory, below',
  },
  {
    timing: 'Per filter, on Apply',
    when: 'One condition needs several inputs or a review first, such as a range, a date span or several checked values.',
    build:
      'MultiChoiceFilter, TextFilter, NumberComparisonFilter, NumberRangeFilter, DateRangeFilter',
    example: 'Invoice list, below',
  },
  {
    timing: 'Whole set, on one Apply',
    when: 'Several conditions are edited together and results should change only once, such as a grouped query.',
    build: 'FilterBuilder, with draft and applied state',
    example: 'Grouped conditions, below',
  },
];

const BLOCKS: { slug: string; name: string; summary: string }[] = [
  {
    slug: 'choice-filter',
    name: 'ChoiceFilter',
    summary: 'one value from a short list; applies immediately.',
  },
  {
    slug: 'multi-choice-filter',
    name: 'MultiChoiceFilter',
    summary: 'several values; applies with Apply.',
  },
  {
    slug: 'text-filter',
    name: 'TextFilter',
    summary: 'text; applies with Apply.',
  },
  {
    slug: 'number-comparison-filter',
    name: 'NumberComparisonFilter',
    summary: 'one number against a threshold; applies with Apply.',
  },
  {
    slug: 'number-range-filter',
    name: 'NumberRangeFilter',
    summary: 'a number between two ends; applies with Apply.',
  },
  {
    slug: 'date-range-filter',
    name: 'DateRangeFilter',
    summary: 'a range of calendar days; applies with Apply.',
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
    <div className="nx:mb-4 nx:min-w-0 nx:rounded-lg nx:border nx:border-border-default nx:p-4">
      {children}
    </div>
  );
}

export default function Filtering() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Filtering</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Filtering helps people narrow a collection without losing their place.
        Keep the results in view, keep every active condition visible, and keep
        editing or clearing within reach. Two decisions shape the whole
        interaction; make them first.
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
          Choose the timing from the interaction, not the field type. No block
          applies a change when it is dismissed: Cancel, Escape and clicking
          outside discard a draft. A complete operator change applies at once;
          an operator that needs a missing value waits for it. When a
          surrounding panel owns one Apply, feed its editors the panel draft
          instead of nesting a second Apply.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          2. Decide flat or grouped
        </SectionHeading>
        <p className={BODY_CLASS}>
          This is a separate decision from timing. Several flat filters mean
          every condition must match. Reach for explicit All/Any groups only
          when people need a query such as “Active members who are in Design or
          have more than three projects”. Grouped queries use FilterBuilder;
          keep the whole query as a draft so intermediate edits do not change
          results.
        </p>
        <Example>
          <AdvancedFiltering />
        </Example>
        <p className={BODY_CLASS}>
          Moving from quick filters to a grouped query? Each block value
          converts to one FilterBuilder rule. The conversion is explicit per
          block, not a general engine, and FilterBuilder does not re-check a
          block’s numeric bounds. Each block’s example file exports its
          conversion next to its minimal composition.
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
          Each block page opens with a minimal controlled example and the files
          to copy:
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
          <InlineCode>blocks/filtering/applied-filters.tsx</InlineCode>; it
          wraps them as space allows and owns layout, not query state. When
          editing lives in a Filters panel instead, show applied conditions as
          removable summaries:
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
          Keep active filters visible while results load or fail, and tell apart
          an empty collection, no matches and a failed request. Retry keeps the
          conditions. Show the count across all pages and reset pagination when
          a condition changes. This directory uses native inputs rather than the
          blocks; the states apply to either.
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
        <SectionHeading className={SECTION_CLASS}>
          5. Where to go next
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
          <li>
            Applications own fields, permissions, values, query evaluation,
            requests, pagination and URL state. Cancel obsolete requests and
            ignore stale responses in your data layer.
          </li>
        </ul>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>Examples</SectionHeading>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Team directory: immediate updates
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Choosing a status or team updates the table at once. There is no Apply
          button; closing a menu only closes it.
        </p>
        <Example>
          <TeamDirectory />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Invoice list: Apply per filter
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Each field opens its own checklist and Apply button. Checking options
          edits only that field’s draft; the trigger shows applied values.
          Escape or clicking outside discards the draft.
        </p>
        <Example>
          <InvoiceFilteringExample />
        </Example>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          These examples use local demonstration data. The blocks and examples
          are experimental: their stories pin the interaction, but production
          adoption needs its own evidence.
        </p>
      </section>
    </>
  );
}
