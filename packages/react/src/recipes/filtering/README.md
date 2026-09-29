# Filtering — file map

Filtering is the first family held to the [recipes checklist](../README.md).
Behaviour, value shapes and delivery live on the Storybook pages that test
them; this file only maps the source.

| Where to read        | What it covers                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `Patterns/Filtering` | When a change applies, flat or grouped conditions, result states, and the two product examples |
| `Blocks/*`           | Each block's purpose, value shape, exactly when it emits, states, delivery and evidence        |
| `Components/*`       | FilterChip, FilterCondition and FilterBuilder APIs                                             |

## Files

**Blocks** — copy-source, not package exports. Each block page lists its files,
the Nexus component folders it imports and any npm peer.

| File                                  | Block or helper                                                        |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `blocks/choice-filter.tsx`            | ChoiceFilter, and ChoiceEditor for your own menu                       |
| `blocks/multi-choice-filter.tsx`      | MultiChoiceFilter, and MultiChoiceEditor for your own popover          |
| `blocks/text-filter.tsx`              | TextFilter                                                             |
| `blocks/number-comparison-filter.tsx` | NumberComparisonFilter                                                 |
| `blocks/number-range-filter.tsx`      | NumberRangeFilter                                                      |
| `blocks/date-range-filter.tsx`        | DateRangeFilter (needs the `react-day-picker` v9 peer)                 |
| `blocks/applied-filters.tsx`          | AppliedFilters: a wrapping row; owns layout only                       |
| `filter-operator.tsx`                 | The operator menu every block uses                                     |
| `blocks/*-example.tsx`                | Each block's minimal composition and its FilterBuilder rule conversion |

**Examples** — runnable compositions shown on `Patterns/Filtering`. Replace the
fixtures and local matching with your own query.

| File                                                             | Example                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `team-directory.tsx` + `quick-fixtures.ts` + `local-results.tsx` | Team directory: immediate updates                             |
| `invoice-filtering.tsx`                                          | Invoice list: Apply per filter                                |
| `advanced-filters.tsx` + `advanced-fixtures.ts`                  | Grouped conditions with FilterBuilder                         |
| `applied-filters-example.tsx`                                    | A Filters panel with removable summaries                      |
| `member-directory.tsx`                                           | Result states: loading, empty collection, no matches, failure |

**Internal** — kept for internal stories only; not part of the handoff.

| File                  | Used by                                     |
| --------------------- | ------------------------------------------- |
| `quick-filters.tsx`   | `Internal/Filtering/Quick filters`          |
| `value-editors.tsx`   | `Internal/Filtering/Value editors`          |
| `member-query-url.ts` | `Internal/Filtering/Request and URL states` |

Do not copy `*.stories.tsx`; they hold tests and simulated services. None of
these files ship in the package `dist`.

## Application boundary

Applications own the fields and options, permissions, query evaluation,
fetching, pagination, URL state and saved views. Keep applied filters visible
while loading or retrying, and cancel obsolete requests in your data layer.
Match counts should cover the whole query, not one page.

## Readiness

Experimental. Every block rule is pinned by a story on its own page. Connecting
the blocks to asynchronous data in an outside app is tracked in
[#793](https://github.com/nexuslabs-ai/nexus/issues/793); theme and density
evidence waits for the styling isolation work in
[#796](https://github.com/nexuslabs-ai/nexus/issues/796).

## References

- Stripe's individual Status filter
  ([Mobbin](https://mobbin.com/screens/78430f40-1d9b-45de-8c03-d25b8e33d728))
  is the structural reference for the invoice example: one field per popover,
  checkbox rows and an Apply action. Nexus keeps its own typography, spacing,
  colours and focus treatment.
- [Linear's filters](https://linear.app/docs/filters) update the list as
  filters are applied, the reference for the immediate example.
