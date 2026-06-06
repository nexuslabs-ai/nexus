# Component Review Notes

Issues found reviewing `packages/react/src/components/ui/`. One section per component.

## accordion

Typography — use composites:

- trigger: `nx:text-sm nx:font-medium` → `nx:typography-label-default`
- content: `nx:text-sm` → `nx:typography-body-small`

Escape-hatch (ok): `nexus-allow-numeric: item-tier rhythm` on trigger `nx:py-4`.

## alert

Typography — use composites:

- AlertDescription: `nx:text-sm` → `nx:typography-body-small`
- AlertTitle: `nx:font-medium nx:leading-none nx:tracking-tight` → `nx:typography-label-default` (confirm title size)

`data-variant` omitted on default variant → use `data-variant={variant ?? 'default'}`.

Escape-hatch (ok): `nexus-allow-numeric: callout rhythm` on `nx:p-4` — alert intentionally denser than `p-container` (16px vs 24px). Design Q: keep tight or scale like a container?

Minor: no `information` variant; old shadcn icon pattern with `translate-y-[-3px]` nudge.

## alert-dialog

Typography — use composites:

- Title: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall` (confirm size)
- Description: `nx:text-sm` → `nx:typography-body-small` (keep `text-muted-foreground`)

`AlertDialogCancel` data/style mismatch: renders `variant ?? 'outline'` but `data-variant={variant}` (no fallback) → default Cancel has no `[data-variant]`. Fix: `data-variant={variant ?? 'outline'}`.

Discuss w/ designer: open animation drifts diagonally (top-right → center) instead of a clean centered zoom. Cause: `slide-in-from-left-1/2` + `slide-in-from-top-[48%]` not cancelling the `-translate-x/y-1/2` centering under Tailwind v4. Same block in `dialog.tsx`. Option: drop the directional slide, keep zoom+fade only.

Escape-hatches (ok): `nexus-allow-numeric: ... sub-element rhythm` on header `nx:gap-1.5` and footer `nx:sm:gap-2`.

## aspect-ratio

No issues.

## avatar

Discuss w/ designer: fallback initials don't scale — `AvatarFallback` has `nx:font-medium` but no font-size, so "JD" stays ~16px across all 9 sizes (tiny on `4xl`/96px). Scale fallback text with the `size` variant?

Minor: `data-size`/`data-shape` omitted on default (`md`/`circle`).

## badge

Likely bug: `leftIcon`/`rightIcon` wrapper is `nx:size-3.5` but doesn't constrain the SVG → Tabler's 24px default icon overflows the 14px box. JSDoc "automatically sized to 14px" is inaccurate. Fix: `nx:[&>svg]:size-3.5` on the wrapper. (Visible in WithLeftIcon/WithRightIcon stories — confirm visually.)

Minor: `data-variant`/`data-fill` omitted on default (`default`/`solid`).

Escape-hatches (ok): three `nexus-allow-numeric: chip rhythm` on `gap-1` and chip `px/py`.

## breadcrumb

No-op escape-hatch: `nexus-allow-numeric: ellipsis hit-slot footprint` sits on `size-9`, but the rule only flags `p/px/py/gap` — suppresses nothing. Remove or move.

Touch targets (mobile, discuss): breadcrumb links are bare inline text (~20px); ellipsis is `size-9` (36px). Both under the ~44px floor.

Trivial: `BreadcrumbPage` adds raw `nx:font-normal` (list already sets `typography-body-small`).

## button

Typography (raw, on the canonical component): base `nx:text-sm nx:font-medium` → `nx:typography-label-default`; `sm` size `nx:text-xs` → `nx:typography-label-small`. Badge uses composites, button doesn't — inconsistent.

Touch target (mobile, discuss): `size="icon"` = `p-2.5` (10px) + `size-4` icon = 36px square, under ~44px floor. Add `::after` hit-area or accept as pointer-dense.

Minor: `data-variant`/`data-size` omitted on default (`default`/`default`).

Escape-hatch (ok): `nexus-allow-numeric: density-stable square hit-target` on icon `p-2.5` (ties into touch-target note).

## button-group

No-op escape-hatch (line 10): `nexus-allow-numeric: joined-cluster layout rhythm` on the base — its only numeric (`gap-2`) is inside a `has-[...]` variant the rule can't match (verified). Suppresses nothing; remove. (Line-96 hatch on addon `gap-2`/`px-4` is legit.)

Minor: `data-orientation` omitted on default (`horizontal`).

## calendar

Typography: pervasive raw (`text-sm`, `font-medium`, `font-normal`, `text-xs`) → composites. Weekday/week-number use arbitrary `nx:text-[0.8rem]` (un-tokenized 12.8px) → `typography-label-small`.

No-op escape-hatch (line 130): `nexus-allow-numeric: week-row rhythm` on `nx:mt-2` — `mt` isn't flagged by the rule (verified). Remove. (Other hatches legit.)

Minor (mobile): day buttons = `--cell-size` (`--nx-spacing-8` = 32px), under ~44px. Inherent to dense calendars.

## card

Typography — use composites:

- CardTitle: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall` (confirm size)
- CardDescription: `nx:text-sm` → `nx:typography-body-small`

Discuss: `CardAction` is `absolute` top-right (not grid-reserved), so a long `CardTitle` can render under it. shadcn's newer Card uses CSS grid + `has-data-[slot=card-action]` to reserve the column.

Escape-hatches (ok): `nexus-allow-numeric: ... rhythm` on header `gap-1.5`, action `gap-2`, footer `gap-2`.

## carousel

Minor: controls are `size="icon"` (36px), under ~44px (recurring touch-target batch).

## chart

Typography (raw, lower priority — dense data-viz): `text-xs` (root + tooltip), `font-medium` (tooltip labels) → composites. Value's `font-mono tabular-nums` is intentional, leave it.

Escape-hatch (legit): file-level `eslint-disable @nexus/no-render-prop-types` — recharts-mandated render-prop shapes, allowed by composition rule + carries a reason.

## checkbox

Touch target (mobile, discuss): `nx:size-4` (16px) with no hit-area extension (no padding/`::after`) — far under ~44px. Consider the Sidebar `::after:-inset-2` pattern; today relies on a wired `<label>`.

## command

Typography (raw): `text-sm` (input/empty/item), `text-xs`/`font-medium` (group heading, shortcut) → composites. `tracking-widest` on shortcut is intentional.

Minor: `CommandList` `max-h-[300px]` is an un-tokenized magic value.

Minor: `CommandInput` is `outline-none`; focus shown only via wrapper `focus-within:border-border-active` (1px border), not the canonical ring.

Escape-hatches (ok): `nexus-allow-numeric` on `px-3` (input), `py-6` (empty), `p-1` (group), `gap-2`/`px-2` (item).

## context-menu

Typography (raw): `text-sm` (sub-trigger/items/checkbox/radio), `font-semibold` (label), `text-xs` (shortcut) → composites.

Escape-hatches (ok): `nexus-allow-numeric` menu-rhythm on `gap-2`/`px-2` (sub-trigger, item, label), popover `p-1` (content, sub-content).
