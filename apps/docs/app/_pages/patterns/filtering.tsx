import type { ReactNode } from 'react';

import Link from 'next/link';

import { SectionHeading } from '../../_components/Heading';
import { InlineCode } from '../../_components/InlineCode';

import {
  AdvancedFiltering,
  AppliedFiltersExample,
  InvoiceFilteringExample,
  Showcase,
  TeamDirectory,
} from './_filtering-examples';

/**
 * Patterns → Filtering. Server component — the browse → add → choose → see
 * matches → edit/remove flow, with the pattern's examples as client islands.
 * Block source lives on each block's page, not here.
 *
 * Source: packages/react/src/patterns/filtering/.
 */

const BLOCKS: { slug: string; name: string; summary: string }[] = [
  {
    slug: 'choice-filter',
    name: 'ChoiceFilter',
    summary:
      'a labelled field, independent operator, choice menu and removal. Pass options as IDs and labels, a condition (or null), and onChange.',
  },
  {
    slug: 'multi-choice-filter',
    name: 'MultiChoiceFilter',
    summary:
      'several option IDs with is any of / is none of operators and a draft checklist.',
  },
  {
    slug: 'text-filter',
    name: 'TextFilter',
    summary:
      'contains, is, is not and starts with operators with a draft text input.',
  },
  {
    slug: 'number-comparison-filter',
    name: 'NumberComparisonFilter',
    summary:
      'equals, not equals, greater than and less than operators with one numeric input.',
  },
  {
    slug: 'number-range-filter',
    name: 'NumberRangeFilter',
    summary:
      'draft bounds with Apply/Cancel. Configure the label, unit and optional limits.',
  },
  {
    slug: 'date-range-filter',
    name: 'DateRangeFilter',
    summary: 'a calendar, Today / Last 7 days presets, and a draft date range.',
  },
];

const BODY_CLASS = 'nx:typography-body-default nx:mb-4 nx:max-w-[64ch]';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="nx:mb-4 nx:min-w-0 nx:rounded-lg nx:border nx:border-border-default nx:p-4">
      {children}
    </div>
  );
}

function Disclosure({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="nx:mb-4 nx:rounded-lg nx:border nx:border-border-default nx:p-4">
      <summary className="nx:cursor-pointer nx:typography-label-default">
        {summary}
      </summary>
      <div className="nx:mt-4">{children}</div>
    </details>
  );
}

export default function Filtering() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Filtering</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-4 nx:max-w-[64ch]">
        Filtering helps people narrow a collection without losing their place.
        Start with the results, make the active conditions visible, and keep
        editing or clearing them within reach.
      </p>
      <p className="nx:typography-label-default nx:mb-8">
        Browse results → add a filter → choose a condition → see matches → edit
        or remove
      </p>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Edit filters directly
        </SectionHeading>
        <p className={BODY_CLASS}>
          Find invited people in Design. Add a status filter and choose Invited,
          then add a team filter and choose Design. Each choice updates the
          table immediately — there is no Apply button. Remove a condition with
          ×, or clear everything to return to the collection.
        </p>
        <Example>
          <TeamDirectory />
        </Example>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          The table provides context for this example. The filtering interaction
          can also sit above cards or files; changing the result layout does not
          create a separate pattern.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Apply each filter explicitly
        </SectionHeading>
        <p className={BODY_CLASS}>
          Each field opens its own checklist and Apply button. Selecting options
          edits only that field’s draft; the trigger shows the applied values.
          Escape or an outside click discards the draft, and an empty selection
          means no restriction.
        </p>
        <Example>
          <InvoiceFilteringExample />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Choose in a panel, show applied summaries
        </SectionHeading>
        <p className={BODY_CLASS}>
          Use this approach when the editing controls live in a Filters menu or
          panel. FilterChip keeps each applied condition visible beside results.
          Clicking a chip removes it; editing happens in the Filters panel. Use
          editable conditions above when people should change values directly.
          Preserve focus handling when chips disappear.
        </p>
        <Example>
          <AppliedFiltersExample />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Choose a condition
        </SectionHeading>
        <p className={BODY_CLASS}>
          A condition connects a field, a comparison and a value:{' '}
          <strong>Status · is · Invited</strong>. Let people edit the comparison
          and value separately when both are useful. For a common choice such as
          status, the product can keep “is” implicit and show only the choices.
        </p>
        <p className={BODY_CLASS}>
          Use a short list for a few choices, search for a long list, checkboxes
          for several values, and appropriate inputs for text, numbers and
          dates. “Is empty” and “is not empty” need no value input.
        </p>
        <Disclosure summary="Explore value inputs">
          <Showcase />
        </Disclosure>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Show matching results
        </SectionHeading>
        <p className={BODY_CLASS}>
          Apply a single choice immediately when the change is easy to
          understand and undo. Keep a draft when people need to finish several
          inputs, such as the minimum and maximum of a range. Apply commits that
          draft; Cancel, Escape and outside dismissal discard it.
        </p>
        <p className={BODY_CLASS}>
          Components supply controls; blocks decide when a complete condition is
          committed. ChoiceFilter commits on selection: outside click only
          closes its menu. MultiChoiceFilter, TextFilter,
          NumberComparisonFilter, NumberRangeFilter and DateRangeFilter keep
          value edits as drafts until Apply. Complete operator changes apply
          immediately; an operator needing a missing value waits for that value.
          No block saves a draft on dismissal.
        </p>
        <p className={BODY_CLASS}>
          Keep active filters visible while results update. Distinguish loading
          from no matches, and a failed request from an empty collection. A
          retry should retain the conditions. Show the matching count across all
          pages and reset pagination when a condition changes.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Edit or remove a filter
        </SectionHeading>
        <p className={BODY_CLASS}>
          Keep the current condition readable beside the results. Clicking its
          value opens the appropriate editor. × removes that condition and
          returns keyboard focus to its Add control. Clear filters resets the
          whole search. When nothing matches, offer a direct way to adjust or
          clear the conditions.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Combine conditions when the task needs it
        </SectionHeading>
        <p className={BODY_CLASS}>
          Multiple filters often mean all conditions must match. Add explicit
          All/Any grouping only when people need a query such as “Active members
          who are in Design or have more than three projects.” Keep the whole
          query as a draft so intermediate edits do not change the results.
        </p>
        <Disclosure summary="Try grouped conditions">
          <AdvancedFiltering />
        </Disclosure>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-3">
          Implementation
        </SectionHeading>
        <p className={BODY_CLASS}>
          Use{' '}
          <Link href="/components/filter-chip" className={LINK_CLASS}>
            FilterChip
          </Link>{' '}
          for a removal-only summary,{' '}
          <Link href="/components/filter-condition" className={LINK_CLASS}>
            FilterCondition
          </Link>{' '}
          for independently editable parts, and{' '}
          <Link href="/components/filter-builder" className={LINK_CLASS}>
            FilterBuilder
          </Link>{' '}
          when grouped conditions are needed.
        </p>
        <p className={BODY_CLASS}>
          For flat filters, copy the block that matches the value type and
          connect your state. Each edit emits a complete condition; a removed
          condition is null.
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
          Wrap the controls and your Add/Clear actions in AppliedFilters (
          <InlineCode>blocks/applied-filters/applied-filters.tsx</InlineCode>
          ). It owns layout, not query state.
        </p>
        <p className={BODY_CLASS}>
          Applications own available fields, permissions, values, query
          evaluation, requests, pagination and URL persistence. Keep that logic
          outside the visual components. Cancel obsolete requests, reject stale
          responses, and restore controls and results together when navigating
          Back or Forward.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          These examples use local demonstration data. The blocks remain
          experimental: block contracts and interaction checks support developer
          handoff; production adoption is separate evidence.
        </p>
      </section>
    </>
  );
}
