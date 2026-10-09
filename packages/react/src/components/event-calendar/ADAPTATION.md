# Event Calendar — Nexus adaptation record

Ported from the [ReUI](https://reui.io) `@reui/event-calendar` registry item,
**`radix-nova` style** (`https://reui.io/r/radix-nova/event-calendar.json`).

The `default` style is byte-identical to `base-nova` and depends on
`@base-ui/react`. The `radix-*` styles use `radix-ui` for `Slot` only, which is
why that variant was chosen: it matches the Nexus `asChild` model and needs no
new runtime dependency.

## Dependencies

| Package        | Status                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| `radix-ui`     | **not added** — `Slot` re-imported from the existing `@radix-ui/react-slot` |
| `date-fns`     | promoted to a direct dep (already resolved via `react-day-picker`)          |
| `@date-fns/tz` | promoted to a direct dep (already resolved via `react-day-picker`)          |

Net new packages in the dependency tree: **zero**.

## Component substitutions

| ReUI import                     | Nexus                                        |
| ------------------------------- | -------------------------------------------- |
| `@/components/ui/button`        | `../button`                                  |
| `@/components/ui/dropdown-menu` | `../dropdown-menu`                           |
| `@/components/ui/popover`       | `../popover`                                 |
| `@/components/ui/scroll-area`   | `../scroll-area`                             |
| `@/components/ui/tooltip`       | `../tooltip`                                 |
| `@/components/ui/calendar`      | `../date-picker` (`Calendar` → `DatePicker`) |
| `@reui/icon-stack`              | deleted → `../empty-state`                   |
| `IconPlaceholder` (×8)          | `@tabler/icons-react`                        |

`Calendar` → `DatePicker` is a rename only: Nexus `DatePicker` is
`ComponentProps<typeof DayPicker> & {…}`, so `mode`, `selected`, `defaultMonth`,
`onSelect`, `onDayClick`, `locale`, and `weekStartsOn` pass through unchanged.

Nexus `ScrollArea` already emits `data-slot="scroll-area-viewport"`, so the
`nx:**:data-[slot=scroll-area-viewport]:max-h-…` selector survived verbatim.

## Alpha-modifier → token mapping

**No new tokens were introduced.** Every alpha-modified colour utility maps onto
an existing Nexus semantic token.

| ReUI class                          | Context                     | Nexus replacement                   |
| ----------------------------------- | --------------------------- | ----------------------------------- |
| `bg-primary/3` `/5` `/10`           | today tint, slot draft      | `nx:bg-primary-subtle`              |
| `border-primary/40` `/50`           | draft + drop outline        | `nx:border-border-primary`          |
| `border-b-primary/40`               | today column underline      | `nx:border-b-border-primary`        |
| `bg-muted/25` `/60`                 | off-day cell, sticky header | `nx:bg-muted`                       |
| `bg-foreground/40`                  | agenda summary dot          | `nx:bg-muted-foreground`            |
| `hover:bg-accent/40`                | agenda row hover            | `nx:hover:bg-background-hover`      |
| `bg-destructive/10`                 | invalid drop fill           | `nx:bg-error-subtle`                |
| `bg-destructive/40`                 | invalid marker bar          | `nx:bg-error-background`            |
| `border-destructive/40` `/60` `/70` | invalid ghost borders       | `nx:border-border-error`            |
| `ring-destructive/60`               | invalid carry-clone ring    | `nx:ring-border-error`              |
| `text-destructive`                  | validation hint             | `nx:text-error-foreground`          |
| `text-primary`                      | today emphasis              | `nx:text-primary-subtle-foreground` |
| `focus-visible:ring-2 ring-ring/50` | focus                       | canonical Nexus focus ring (below)  |

Focus now uses the canonical treatment:
`nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)`.

### Deliberate losses

- **`bg-primary/3` · `/5` · `/10` collapse to one `primary-subtle`.** Three
  intensities became one token. Where the weaker of a pair would have sat inside
  the stronger (a draft inside a today-cell) the weaker fill is dropped rather
  than emitting a second identical layer.
- **`bg-amber-500/10`** was the only raw Tailwind primitive, and it existed
  **only inside a JSDoc example** for `dayClassName`. Both are gone.

### Alpha that survives, and why

The eight `--ec-event-color` alphas (`/8 /15 /20 /25 /30 /40 /50 /70`) are kept.
The base colour is a **per-event value the consumer supplies at runtime**, not a
Nexus token — there is no token for "this event's colour at 15%". Removing the
alpha would delete the event-chip tint system entirely. This is alpha applied to
consumer data, not to a semantic token.

Both `dark:` variants (`dark:bg-(--ec-event-color)/20`,
`dark:hover:…/30`) were **deleted**: they only existed because the var pointed at
a raw `--color-blue-500`. Pointing it at a chart token that already carries its
own dark value makes the manual lift a no-op. The component now has zero `dark:`
modifiers.

## Event palette: 10 → 5

`EVENT_CALENDAR_COLORS` was remapped onto the existing categorical chart scale.

| ReUI                             | Nexus token                   |
| -------------------------------- | ----------------------------- |
| Blue                             | `--color-chart-categorical-1` |
| Emerald                          | `--color-chart-categorical-2` |
| Violet                           | `--color-chart-categorical-3` |
| Rose                             | `--color-chart-categorical-4` |
| Amber                            | `--color-chart-categorical-5` |
| Cyan, Orange, Pink, Teal, Indigo | **dropped** (no fifth+ token) |

The per-event fallback also changed: ReUI's `var(--color-primary)` does not exist
in Nexus (it is `--color-primary-background`), so it now resolves to
`var(--color-chart-categorical-1)`.

## Removed API surface

All **18 optional render props** plus the `components` view-override prop were
removed per `composition-over-render-props.md`. Every one was optional with a
working default, so no behaviour is lost when they are unused:

`renderEvent`, `renderAgendaEvent`, `renderEventTooltip`, `renderDragPreview`,
`renderMonthCell`, `renderDayColumnBackground`, `renderDayHeader`,
`renderTimeGutterSlot`, `renderAllDaySection`, `renderMoreIndicator`,
`renderMoreContent`, `renderAgendaEventDetails`, `renderNowIndicator`,
`renderNoEvents`, `renderResourceHeader`, `renderAgendaDayHeader`,
`renderAgendaDaySummary`, `EventCalendarTitle.format`, `components`.

Also removed: `dayClassName` (a `(day) => string` callback).

**Kept:** `classNames` — a map of plain strings, not a render prop, and the main
styling hook alongside the 50 `data-slot` values.

Ripple-effect removals that followed: the internal `allDaySegments` selectors in
`event-calendar-time-grid.tsx` and `event-calendar-resource-view.tsx` (they only
existed to feed `renderAllDaySection`), and the now-unused `TData` generic on
`EventCalendarViewConfig` / `useEventCalendarViewConfig`.

`DEFAULT_VIEW_COMPONENTS` **stays** — it is the internal view switchboard, a
module const rather than a prop.

## Typography

Raw type utilities were replaced with Nexus composites: `text-sm`/`font-medium`
→ `nx:typography-label-default`, `text-xs`/`font-medium` →
`nx:typography-label-small`, bare `text-sm`/`text-xs` →
`nx:typography-body-small`, and the view-shortcut kbd badge
(`font-sans text-xs`) → `nx:typography-shortcut`. Three `leading-*` utilities
were dropped so the composite owns line-height.

## Escape hatches

Every suppression added during the port, per repo policy:

| Location                                                                       | Rule                                                                              | Reason                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `event-calendar-time-grid.tsx` / `event-calendar-resource-view.tsx` day column | `jsx-a11y/no-noninteractive-element-interactions`, `click-events-have-key-events` | Pointer-only slot-creation affordance. See the gap below. |

Pre-existing ReUI suppressions kept: one
`@typescript-eslint/no-explicit-any` on the chip context in
`event-calendar-event.tsx`.

`[&>*:last-child>*:last-child]:border-b-0` in the agenda view is kept as an
arbitrary selector — the nested last-child pair is not expressible with the
canonical `*:` shorthand.

## Known gaps

1. **Keyboard slot creation is not wired.** Clicking or dragging an empty day
   column creates a slot; there is no keyboard equivalent. Event chips inside are
   real focusable `<button>`s and month cells expose a "+" add button, so nothing
   is _unreachable_ — but the empty-surface gesture is pointer-only. This is the
   reason for the two `jsx-a11y` suppressions above and the 5 remaining
   `jsx-a11y` **warnings** (0 errors). Fixing it means designing a keyboard
   slot-creation model, which is a feature addition beyond this port.
2. **Storybook coverage is a smoke test only.** `EventCalendar.stories.tsx`
   renders the views; it does not yet meet the `testing-react.md` matrix
   (interaction play functions, disabled/empty/error states, `AllVariants`).
3. **No visual review has been done.** Typecheck and lint pass; the component has
   not been rendered and compared against the ReUI original.
4. **Polish gate not attempted** — `polish.md` Tier-A (density, motion,
   composed-scene fit, reduced-motion evidence) is untouched.

## Verification

```
npx tsc --noEmit -p packages/react/tsconfig.json   # clean
npx eslint packages/react/src/components/event-calendar --ext .ts,.tsx
#   0 errors, 5 warnings (all the pointer-only gesture above)
```
