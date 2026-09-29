# Filtering — components, blocks and pattern

The **pattern** is the flow: browse → add → choose → see matches → edit/remove.
`Patterns/Filtering` demonstrates that flow. Tables, cards and file lists provide
small result contexts; they are not different filtering APIs or required pages.

## What developers receive

| Layer      | Use                                                                                                                     | Delivery                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Components | FilterChip, FilterCondition parts, FilterBuilder, filter model                                                          | Package exports; the recipes import their folders by relative path. API documentation lives under Components.        |
| Blocks     | ChoiceFilter, MultiChoiceFilter, NumberRangeFilter, NumberComparisonFilter, TextFilter, DateRangeFilter, AppliedFilters | Copy the source below. Controlled compositions of Nexus components; no fixtures, fetching or Storybook dependencies. |
| Pattern    | Timing, visibility, recovery and grouping guidance                                                                      | Follow the Filtering page; adapt a recipe only when its interaction fits the task.                                   |

There is no packaged FilterBar, hidden query evaluator or required product page.

The recipes import Nexus components through relative paths
(`../../components/*` from this directory, `../../../components/*` from
`blocks/`). When copying, keep that structure or point those imports at your
copies of the same component folders and their `lib/` helpers. Standalone
installation and theme isolation belong to the separate adoption work.

Storybook exposes all six filter blocks under **Blocks**, with working examples, states, usage and copyable implementation. The Filtering pattern links to each. AppliedFilters remains a layout helper.

## Copy the smallest useful block

Paths are relative to this directory. Preserve this structure or update relative imports.

| Block                  | Copy these files                                             | Contract                                                                                            |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| ChoiceFilter           | `blocks/choice-filter.tsx`, `filter-operator.tsx`            | `label`, optional `icon`, `value`, `options`, `onChange`, optional `disabled`                       |
| NumberRangeFilter      | `blocks/number-range-filter.tsx`, `filter-operator.tsx`      | `label`, optional `icon`/`unit`/`lowerBound`/`upperBound`, `value`, `onChange`, optional `disabled` |
| MultiChoiceFilter      | `blocks/multi-choice-filter.tsx`, `filter-operator.tsx`      | Option IDs in `values: string[]`; `isAnyOf` / `isNoneOf`; draft checklist                           |
| DateRangeFilter        | `blocks/date-range-filter.tsx`, `filter-operator.tsx`        | `from: Date`, `to: Date`; `between`; optional reference `today`                                     |
| TextFilter             | `blocks/text-filter.tsx`, `filter-operator.tsx`              | `value: string`; `contains` / `is` / `isNot` / `startsWith`                                         |
| NumberComparisonFilter | `blocks/number-comparison-filter.tsx`, `filter-operator.tsx` | `value: number`; `is` / `isNot` / `greaterThan` / `lessThan`; optional unit and bounds              |
| AppliedFilters         | `blocks/applied-filters.tsx`                                 | `children`, optional accessible `label`; wraps controls as space allows                             |

`value` is controlled: the caller must pass the updated value back after `onChange`.
`null` means absent. Removal emits `null`. The blocks never evaluate records or write
URL state. `AppliedFilters` does not inspect or alter children; compose your own Clear
button and decide what it clears. It uses a group, not toolbar keyboard navigation.

### A complete controlled composition

```tsx
import { useState } from 'react';
import { Button } from '../../components/button';
import { AppliedFilters } from './blocks/applied-filters';
import { ChoiceFilter, type ChoiceCondition } from './blocks/choice-filter';

export function StatusFilters() {
  const [status, setStatus] = useState<ChoiceCondition | null>(null);
  return (
    <AppliedFilters>
      <ChoiceFilter
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'invited', label: 'Invited' },
        ]}
      />
      <Button
        size="sm"
        variant="ghost"
        disabled={!status}
        onClick={() => setStatus(null)}
      >
        Clear filters
      </Button>
    </AppliedFilters>
  );
}
```

Replace `setStatus` with your application's update handler when the query includes
other filters or pagination. Update the condition and reset the page together. The
IDs (`active`) are data; labels (`Active`) are display text. IDs must be unique,
nonempty strings. Missing IDs remain visible as their raw value until the user
replaces or removes them; option changes never silently change the applied filter.
An option can be disabled without removing it from the list.

## State and interaction contracts

**ChoiceFilter** accepts exactly one of:

```ts
null;
{
  operator: 'is' | 'isNot';
  value: string;
}
{
  operator: 'isEmpty';
}
{
  operator: 'isNotEmpty';
}
```

- A choice or compatible operator edit emits one complete condition immediately.
- Empty operators hide the value. Returning to `is`/`isNot` opens the choice menu;
  no incomplete condition is emitted. Escape/outside dismissal keeps the applied
  empty operator. Selecting a choice commits operator and value together.
- Removed values are not remembered or resurrected when adding again.
- Empty option lists show “No options available”. A missing option is not treated
  as a cleared filter. Remote search and permission resolution belong to the app.

**NumberRangeFilter** accepts:

```ts
null;
{
  operator: 'between';
  min: number;
  max: number;
}
{
  operator: 'isEmpty';
}
{
  operator: 'isNotEmpty';
}
```

- Both bounds are required, finite and ordered. Signed decimals are supported.
  Optional `lowerBound`/`upperBound` constrain the permitted range. The optional
  `unit` is a display label, not a conversion or currency-formatting engine.
- Opening copies the applied bounds into a draft. Apply emits both bounds together.
  Cancel, Escape and outside dismissal discard the draft.
- Returning from an empty operator to `between` requires a valid range before
  emitting a change. Empty operator changes commit immediately.
- Replacing the controlled condition or changing `disabled` closes an unfinished
  editor. Disabled blocks cannot change operators, values or remove conditions.
- The application owns inclusive/exclusive matching and missing-value semantics.

Both use density-aware compact condition controls and default Nexus inputs inside
editors. Labels/operators/icons are muted; selected values remain foreground text.
Remove returns keyboard focus to Add. Menu controls retain Nexus keyboard behavior.

## Grouped conditions

Use the existing public `FilterBuilder`; it already owns field/operator/value
editing, All/Any nesting and structural validation. `advanced-filters.tsx` shows
controlled `draft` and `applied` trees: Apply copies a valid draft to applied;
Cancel restores applied; clearing edits the draft first. A second builder block
would duplicate that component.

Copy `advanced-filters.tsx` plus `advanced-fixtures.ts` only if you want that runnable
example. Replace fixture fields, records and evaluation with application-owned
schema/query handling. `getFilterErrors` checks structure and values, not permissions
or backend query validity.

## Supporting examples and exact source dependencies

| Example                                     | Copy together                                                                                                                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quick filters above a table, cards or files | `quick-filters.tsx`, `quick-fixtures.ts`, `local-results.tsx`, `blocks/choice-filter.tsx`, `blocks/number-comparison-filter.tsx`, `blocks/number-range-filter.tsx`, `blocks/applied-filters.tsx`, `filter-operator.tsx` |
| Other value editors                         | `value-editors.tsx`, all six block files, `filter-operator.tsx`                                                                                                                                                         |
| Grouped conditions                          | `advanced-filters.tsx`, `advanced-fixtures.ts`                                                                                                                                                                          |

The value-editor showcase composes the six dedicated blocks documented above.
Applications choose timezone, boundary and serialization rules.

`member-directory.tsx`, `member-query-url.ts` and their internal stories are existing
optional integration simulations. They are not prerequisites, a recommended new page,
or the definition of the filtering pattern. Do not copy `*.stories.tsx`; those contain
tests and simulated services. None of these source recipes is shipped in package dist.

## Setup and application boundary

Use React 19. The blocks require only React and the Nexus component folders they import
(including `components/filter-model` for operator labels). Examples additionally use
`@tabler/icons-react`; date examples require the optional `react-day-picker` v9 peer.

Use your existing Nexus token/styles setup (`@nexus_ds/tailwind` and
AppearanceProvider where applicable). Include the
copied source directory in Tailwind v4 scanning. Component CSS does not supply theme
tokens or generate the copied block's utilities by itself.

Applications own available fields/options, permissions, query evaluation, fetching,
pagination, URL state and saved views. Keep applied filters visible while loading or
retrying; distinguish failed requests, an empty collection and no matching results.
Reject stale responses. Match counts must represent the whole query, not one page.

## Readiness

These are experimental copy-source contracts, with browser interaction coverage and
an isolated package-consumer typecheck. Those checks establish a usable handoff at
this scope. They do not establish production adoption or validate your server logic.
Product-specific pages and additional block APIs can be added when their needs are
known; they are not required to explain or consume these blocks.

## Additional value blocks

All four new blocks share `label`, optional `icon`, controlled `value`, `onChange`
and optional `disabled`. They support `isEmpty` and `isNotEmpty` without a value.
Remove emits null and focuses the Add button. Compatible operator changes apply
immediately; switching from an empty operator waits for a complete value and Apply.
Cancel, Escape and outside dismissal discard drafts. External condition changes
close the editor to avoid committing stale values.

- **MultiChoiceFilter:** `options` uses unique, nonempty IDs and labels, with optional
  disabled options. Apply emits distinct IDs; at least one is required. Removed
  option IDs remain visible and removable, never silently dropped. `isAnyOf` means
  at least one selected ID matches; `isNoneOf` means no selected IDs match. Apps
  decide how a multivalued record is compared.
- **TextFilter:** Apply trims surrounding whitespace and rejects blank text.
  Applications decide case sensitivity, normalization and query escaping.
- **NumberComparisonFilter:** Apply rejects blank, non-finite and out-of-bound
  values. Zero, negative numbers and decimals work. Bounds are optional and
  inclusive; `unit` is display text, not conversion logic.
- **DateRangeFilter:** values are local calendar Date objects with an ordered,
  complete range. Pass valid dates; reconstruct Date objects after URL/JSON parsing.
  Presets include today and become fixed dates on Apply, not rolling queries.
  Applications own locale/timezone conversion and inclusive end-date semantics.
  Optional `today` makes reference-day behavior deterministic in previews.

The blocks do not include records, query evaluation, remote option fetching or
URL persistence. Use the usage snippet on each block's docs page to connect state.

### When edits commit

Components provide accessible controls and dismissal events. Blocks own the
commit behavior for one condition; patterns explain and coordinate that behavior
across conditions. The application owns applied queries and fetching.

- **Immediate:** ChoiceFilter commits on selection. Outside click closes the menu;
  it does not apply a separate draft. Use this for complete, reversible choices.
- **Draft:** MultiChoiceFilter, TextFilter, NumberComparisonFilter, NumberRangeFilter
  and DateRangeFilter commit value edits on Apply. Cancel, Escape and outside click
  discard them. Use this when users need to finish or review an edit.
- **Operators:** A compatible operator change is complete and commits immediately.
  Switching from an empty operator to one requiring a value waits for that value.
- **Whole query:** The advanced pattern holds a draft tree; its Apply commits the
  whole tree, even if an individual control updates that draft immediately.

Multi-choice is not inherently batch-only: instant checkboxes are appropriate when
each selection is independent and updates are inexpensive. Our supplied block
deliberately uses a draft checklist. None of these blocks commits on dismissal.
The value-type showcase renders the six real blocks.

Choose live versus draft behavior from the interaction, not the field type or
backend architecture. Live updates suit complete, reversible selections with
acceptable response cost. Drafts suit incomplete ranges, several coordinated
changes, expensive requests or review before committing. A sync engine is not
required for live filtering; applications may debounce, cancel obsolete requests
and ignore stale responses. If a surrounding panel owns Apply, avoid nested Apply
buttons: its editors should update the panel draft and the panel commits once.
Apply-on-dismissal is a separate policy, not another name for live filtering.

### Reuse the choice editors with different commit policies

`ChoiceEditor` is exported from `blocks/choice-filter.tsx`. It is a controlled
radio menu and requires Nexus DropdownMenuContent around it. ChoiceFilter already
supplies that shell and emits complete conditions through onChange. Give it applied
state for live results, or the parent panel's draft state for a shared Apply.

`MultiChoiceEditor` is exported from `blocks/multi-choice-filter.tsx`. It receives
option IDs in `value`, options, label, disabled and onChange. It owns neither a
popover nor Apply/Cancel. MultiChoiceFilter composes it with the existing local
draft/footer. `invoice-filtering.tsx` composes the checklist into a compact,
individual filter popover with its own Apply button. Empty selection means no
restriction for that field in this recipe. The standalone MultiChoiceFilter
still requires a nonempty selection before Apply.

Copy `invoice-filtering.tsx`, `blocks/multi-choice-filter.tsx` and
`filter-operator.tsx`. Replace the six local records and matching function with
your data integration. The recipe is copy-source, not a package export.

### Evidence and adaptation boundary

- Stripe Status reference: https://mobbin.com/screens/78430f40-1d9b-45de-8c03-d25b8e33d728
- Stripe selected Status reference: https://mobbin.com/screens/373146e1-8686-43b0-8a10-5da707dc8873
  Observed: one field per popover, checkbox rows, an Apply action at its foot,
  applied selection labels in the trigger. These screenshots do not establish
  outside-dismissal behavior, keyboard behavior or current Stripe implementation.
- Linear documentation: https://linear.app/docs/filters
  Documents updating the issue list as filters are applied. This supports the
  immediate-filter comparison, not a claim about Linear's internal sync engine.
- Refero search did not return a relevant Linear screen. Unrelated search results
  were rejected rather than treated as evidence.

Reference lock: Stripe's individual Status popover is the structural reference
for the invoice recipe. Nexus retains its own typography, spacing, corners,
colors, focus treatment and components. Applying that anatomy to Country,
using invoice data, allowing an empty selection to clear a field and discarding
on Escape/outside dismissal are explicit Nexus recipe decisions. No grouped
All filters panel, shared preview counter or nested filter chip is included.
The immediate example remains the existing member-filtering recipe; no claim
is made that its visuals reproduce Linear. No apply-on-close behavior is added.

### Focused product examples

- **Team directory** (`patterns-filtering--team-filtering`): Status, Team and search update results immediately, with no Apply button. Copy `team-directory.tsx`, `quick-fixtures.ts`, `blocks/choice-filter.tsx`, `blocks/applied-filters.tsx` and `filter-operator.tsx`. Replace fixture records and the local `results` predicate with your data/query.
- **Invoice list** (`patterns-filtering--invoice-filtering`): each checklist keeps its own draft until Apply. Outside dismissal discards that draft. Copy `invoice-filtering.tsx`, `blocks/multi-choice-filter.tsx` and `filter-operator.tsx`; connect applied `filters` and search to your query.

Both are local-data recipes, with clearing and empty results. Applications own remote loading, errors and request cancellation. These examples intentionally have no interaction-policy toggle.

### Verification and remaining handoff work

Filtering contracts are checked by the block stories, `FilterBlocks.stories.tsx`, `FilteringAudit.stories.tsx`, the component stories, and `FilteringGuide.stories.tsx`.

| Contract                                                                     | Evidence                                                                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Immediate selection, operator changes, empty operators, disabled options     | ChoiceFilter and block-contract stories                                                              |
| Draft values, Apply, Cancel, invalid/incomplete input                        | MultiChoiceFilter, NumberRangeFilter, NumberComparisonFilter, TextFilter and DateRangeFilter stories |
| Escape, outside dismissal, removal and focus restoration                     | Block stories and DismissalAcrossEditors                                                             |
| Controlled replacement and disabling an open editor                          | ExternalReset and DisabledWhileOpen audit stories                                                    |
| Long values and visible removal in narrow containers                         | NarrowLongContent and per-block narrow stories                                                       |
| Six densities, five roundness settings and dark appearance                   | Audit appearance stories; compact controls are measured against the active spacing token             |
| Nested rules, unavailable values, range validation, keyboard editing         | FilterBuilder stories                                                                                |
| Immediate versus per-filter Apply beside results, clearing and empty results | Team directory and Invoice list stories                                                              |

Compact filter heights use `--nx-spacing-8`, including builder fields, rather than assuming the fixed `h-8` utility follows density. The default is 32px; other modes follow the existing Nexus spacing map. This work does not redefine that map.

These checks validate the local recipes and component contracts, not real backend adoption. Clean consumer integration with asynchronous data is tracked separately in [#793](https://github.com/nexuslabs-ai/nexus/issues/793).
