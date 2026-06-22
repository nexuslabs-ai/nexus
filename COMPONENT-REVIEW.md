# Component Review Notes

Issues found reviewing `packages/react/src/components/ui/`. One section per component.
Numeric spacing notes call out unresolved raw spacing/rhythm decisions; `eslint-disable`
comments remain deviations to reconsider and should justify themselves.

## accordion

Typography — use composites:

- trigger: `nx:text-sm nx:font-medium` → `nx:typography-label-default`
- content: `nx:text-sm` → `nx:typography-body-small`

Numeric spacing note: trigger uses `nx:py-4` for item-tier rhythm.

## alert

Typography — use composites:

- AlertDescription: `nx:text-sm` → `nx:typography-body-small`
- AlertTitle: `nx:font-medium nx:leading-none nx:tracking-tight` → `nx:typography-label-default` (confirm title size)

`data-variant` omitted on default variant → use `data-variant={variant ?? 'default'}`.

Numeric spacing note: `nx:p-4` callout rhythm is denser than `p-container` (16px vs 24px). Keep tight or scale like a container?

Minor: no `information` variant; old shadcn icon pattern with `translate-y-[-3px]` nudge.

## alert-dialog

Typography — use composites:

- Title: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall` (confirm size)
- Description: `nx:text-sm` → `nx:typography-body-small` (keep `text-muted-foreground`)

`AlertDialogCancel` data/style mismatch: renders `variant ?? 'outline'` but `data-variant={variant}` (no fallback) → default Cancel has no `[data-variant]`. Fix: `data-variant={variant ?? 'outline'}`.

Discuss w/ designer: open animation drifts diagonally (top-right → center) instead of a clean centered zoom. Cause: `slide-in-from-left-1/2` + `slide-in-from-top-[48%]` not cancelling the `-translate-x/y-1/2` centering under Tailwind v4. Same block in `dialog.tsx`. Option: drop the directional slide, keep zoom+fade only.

Numeric spacing notes: header `nx:gap-1.5`, footer `nx:sm:gap-2`.

## aspect-ratio

No issues.

## avatar

Discuss w/ designer: fallback initials don't scale — `AvatarFallback` has `nx:font-medium` but no font-size, so "JD" stays ~16px across all 9 sizes (tiny on `4xl`/96px). Scale fallback text with the `size` variant?

Minor: `data-size`/`data-shape` omitted on default (`md`/`circle`).

## badge

Likely bug: `leftIcon`/`rightIcon` wrapper is `nx:size-3.5` but doesn't constrain the SVG → Tabler's 24px default icon overflows the 14px box. JSDoc "automatically sized to 14px" is inaccurate. Fix: `nx:[&>svg]:size-3.5` on the wrapper. (Visible in WithLeftIcon/WithRightIcon stories — confirm visually.)

Minor: `data-variant`/`data-fill` omitted on default (`default`/`solid`).

Numeric spacing notes: chip rhythm on `gap-1` and chip `px`/`py`.

## breadcrumb

Resolved: `BreadcrumbPage` drops raw `nx:font-normal` (the list's
`typography-body-small` already sets normal weight) and no longer advertises
`role="link"`/`aria-disabled`; the current page is announced via
`aria-current="page"` only.

Resolved: `BreadcrumbEllipsis` and `BreadcrumbMenuTrigger` are interactive
`<button>` triggers composed with `DropdownMenuTrigger asChild` — no longer a
presentational span.

Decision: breadcrumb is a desktop / pointer-fine control (not used on touch or
small screens), so the ~44px touch-target floor does not apply — segments and
icon triggers keep their compact sizing and the touch-only hit-area overlays were
removed (responsive.md: the touch case sets the floor).

Resolved: `BreadcrumbList` is a keyboard-focusable horizontal scroll region
(`overflow-x-auto` + `tabIndex`), so an overflowing trail — including the
non-focusable current page — can be scrolled into reach instead of being clipped.

Note: segment corners use `rounded-[4px]` to match Figma; the Nexus radius scale
is currently `0px` (sharp), so no token maps to 4px — kept as a deliberate
arbitrary value.

## button

Typography (raw, on the canonical component): base `nx:text-sm nx:font-medium` → `nx:typography-label-default`; `sm` size `nx:text-xs` → `nx:typography-label-small`. Badge uses composites, button doesn't — inconsistent.

Touch target (mobile, discuss): `size="icon"` = `p-2.5` (10px) + `size-4` icon = 36px square, under ~44px floor. Add `::after` hit-area or accept as pointer-dense.

Minor: `data-variant`/`data-size` omitted on default (`default`/`default`).

Numeric spacing note: density-stable square hit-target on icon `p-2.5` ties into the touch-target note.

## button-group

Obsolete numeric note (line 10): joined-cluster layout rhythm on the base — its only numeric (`gap-2`) is inside a `has-[...]` variant the old rule could not match. Suppresses nothing; remove.

Numeric spacing note: line-96 addon `gap-2`/`px-4`.

Minor: `data-orientation` omitted on default (`horizontal`).

## date-picker

Typography: pervasive raw (`text-sm`, `font-medium`, `font-normal`, `text-xs`) → composites. Weekday labels deliberately keep raw `text-sm font-normal` to match the day-button type (not the `typography-label-default` composite); week numbers use `typography-label-small`.

Numeric spacing notes: `p-3` (chrome), `gap-4` (month-grid ×2), `gap-1` (nav), `gap-1.5` (dropdown).

Minor (mobile): day buttons = `--cell-size` (`--nx-spacing-8` = 32px), under ~44px. Track with the recurring touch-target batch.

## card

Typography — use composites:

- CardTitle: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall` (confirm size)
- CardDescription: `nx:text-sm` → `nx:typography-body-small`

Discuss: `CardAction` is `absolute` top-right (not grid-reserved), so a long `CardTitle` can render under it. shadcn's newer Card uses CSS grid + `has-data-[slot=card-action]` to reserve the column.

Numeric spacing notes: header `gap-1.5`, action `gap-2`, footer `gap-2`.

## carousel

Minor: controls are `size="icon"` (36px), under ~44px (recurring touch-target batch).

## chart

Typography (raw, lower priority — dense data-viz): `text-xs` (root + tooltip), `font-medium` (tooltip labels) → composites. Value's `font-mono tabular-nums` is intentional, leave it.

ESLint exception: file-level `eslint-disable @nexus/no-render-prop-types` — recharts mandates render-prop shapes (`ChartConfig.icon`, Tooltip formatters). Composition rule permits a third-party opt-out; confirm the scope stays minimal.

## checkbox

Touch target (mobile, discuss): `nx:size-4` (16px) with no hit-area extension (no padding/`::after`) — far under ~44px. Consider the Sidebar `::after:-inset-2` pattern; today relies on a wired `<label>`.

## command

Typography (raw): `text-sm` (input/empty/item), `text-xs`/`font-medium` (group heading, shortcut) → composites. `tracking-widest` on shortcut is intentional.

Minor: `CommandList` `max-h-[300px]` is an un-tokenized magic value.

Minor: `CommandInput` is `outline-none`; focus shown only via wrapper `focus-within:border-border-active` (1px border), not the canonical ring.

Numeric spacing notes: `px-3` (input), `py-6` (empty), `p-1` (group), `gap-2`/`px-2` (item).

## context-menu

Typography (raw): `text-sm` (sub-trigger/items/checkbox/radio), `font-semibold` (label), `text-xs` (shortcut) → composites.

Numeric spacing notes: menu rhythm on `gap-2`/`px-2` (sub-trigger, item, label), popover `p-1` (content, sub-content).

## dialog

Typography — use composites:

- DialogTitle: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall`
- DialogDescription: `nx:text-sm` → `nx:typography-body-small`

Discuss (animation): canonical home of the diagonal-slide block (`slide-in-from-left-1/2` + `slide-in-from-top-[48%]`) — same drift as alert-dialog; fix both (drop directional slide, keep zoom+fade).

Touch target (mobile, discuss): close button is `absolute right-4 top-4` with a bare 16px `<IconX>`, no padding → ~16px tap target, under ~44px.

Numeric spacing notes: header `gap-1.5`, footer `sm:gap-2`.

## drawer

Typography — use composites:

- DrawerTitle: `nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight` → `nx:typography-heading-xsmall`
- DrawerDescription: `nx:text-sm` → `nx:typography-body-small`

Numeric spacing notes: header `gap-1.5`, footer `gap-2`.

## dropdown-menu (mirrors context-menu)

Typography (raw): `text-sm` (sub-trigger/items/checkbox/radio), `font-semibold` (label), `text-xs` (shortcut) → composites.

Numeric spacing notes: menu rhythm on `gap-2`/`px-2` (sub-trigger, item, label), popover `p-1` (content, sub-content).

## empty-state

Obsolete numeric notes: media wrapper rhythm on `mb-2` (line 83) and icon medallion footprint on `size-10` (line 89) — neither margin nor `size` needed a rule exemption. Remove both. (Uses typography composites correctly — no typography finding.)

Numeric spacing notes: `gap-6`/`p-6` (root), `gap-2` (header), `gap-4` (content).

## field

Unresolved: raw typography remains in `field.tsx`; the legend's 16px/500 treatment has no size-preserving composite, so `field.tsx` stays out of PR #462.

Obsolete numeric notes: legend caption spacing on `mb-3` (line 59) and separator inset on `-my-2` (line 244) — margins were not flagged. Remove.

Numeric spacing notes: `gap-6` (fieldset), `gap-7` (field-group), `gap-3` (field base), `gap-1.5` (content), `gap-2` (label, title), `px-2` (separator label), `gap-1` (error list).

## form

Resolved in PR #462: `FormDescription` / `FormMessage` use `nx:typography-body-small`; `className` remains last so consumer typography overrides still win by source order.

Numeric spacing note: `FormItem` `gap-2`.

## input

Resolved in PR #462: size typography now uses composites (`sm` → `nx:typography-body-small`, `default`/`lg` → `nx:typography-body-default`, file button → `nx:typography-label-default`).

Resolved in PR #462: `data-size` is emitted for the default size.

Numeric spacing notes: `px-3` (default), `px-2.5` (sm), `px-3.5` (lg). Horizontal padding stays numeric to preserve the fixed form-field geometry; `px-control-*` would over-widen field insets across looser modes.

## input-group

Resolved in PR #462: obsolete numeric note on field-internal addon/control padding rhythm removed; those `pl`/`pr`/`pb`/`pt` insets live inside `has-[…]` selectors and were not rule findings.

Resolved in PR #462: `InputGroupButton` uses `nx:typography-label-default` (addon/text already used composites).

Resolved in PR #462: arbitrary pull-in offsets use scale utilities instead of magic values.

Numeric spacing notes: addon `gap-2`/`py-1.5`, block `px-3`, button `gap`/`px`, text `gap-2`, textarea `py-3`.

## input-otp

Typography (raw): `InputOTPSlot` uses `nx:text-sm` for the character → composite.

## item

Obsolete numeric notes: icon medallion footprint on `size-8` (line 135) and thumbnail footprint on `size-10` (line 137) — `size` was not flagged. Remove. (Uses typography composites throughout — no typography finding.)

Numeric spacing notes: `gap-4`/`p-4` (default size), `gap-2.5`/`px-4`/`py-3` (sm size), `gap-2` (media), `gap-1` (content), `gap-2` (title, actions, header, footer).

## kbd

Numeric spacing notes: keycap `gap-1`/`px-1`, chord `gap-1`. (Otherwise clean; uses `typography-label-small`.)

## label

Typography (raw): `nx:text-sm nx:font-medium nx:leading-none` → `nx:typography-label-default`.

Numeric spacing note: `gap-2` icon gap to nested control.

## menubar (mirrors context-menu/dropdown-menu)

Typography (raw): `text-sm`/`font-medium` (trigger/items), `font-semibold` (label), `text-xs` (shortcut) → composites.

Numeric spacing notes: root `gap-1`/`p-1`, bar trigger `px-2`/`py-1`, sub-trigger + item `gap-2`/`px-2`, content `p-1` (×2), label `px-2`.

## native-select

Resolved in PR #462: default uses `nx:typography-body-default`; `sm` uses `nx:typography-body-small`.

Numeric spacing notes: `px-3` (default), `px-2.5` (sm), `pr-9` (chevron clearance). Horizontal padding stays numeric to preserve the fixed form-field geometry; `px-control-*` would over-widen field insets across looser modes.

## navigation-menu

Typography (raw): `text-sm`/`font-medium` (trigger), `text-sm` (link) → composites.

Obsolete numeric notes: `mt-1.5` (line 190, "inline-content offset"), `mt-1.5` (line 232, "viewport panel offset"), `h-1.5` (line 302, "indicator rail height") — margins/heights were not flagged. Remove.

Numeric spacing notes: list `gap-1`, trigger `px-4`/`py-2`, content `p-2`, link `gap-1`/`p-2`.

## pagination

Redundant ARIA: `role="navigation"` on the `<nav>` (line 55) — `<nav>` already is the navigation landmark; only the `aria-label` is needed.

Keep-in-sync smell: `PaginationEllipsis` hardcodes `nx:p-2.5` (line 219) to match the `size="icon"` link footprint — manual coupling to `buttonVariants` icon padding, drifts silently if that changes.

Numeric spacing notes: content `gap-1` (line 85), ellipsis `p-2.5` (line 219).

## popover

No issues.

## progress

Indeterminate mode documented but not implemented: JSDoc `@example` promises `<Progress aria-label="Loading" />` as indeterminate, but `value` omitted → `translateX(-${100 - (value || 0)}%)` = `translateX(-100%)` → indicator pushed fully off-screen. Radix sets `data-state="indeterminate"` but no CSS keys on it, so it's a blank static track. Add a `nx:data-[state=indeterminate]:` sweep or drop the doc claim.

`nx:transition-all` (indicator, line 49) → `nx:transition-transform` — only `transform` animates; `transition-all` is over-broad.

## radio-group

Touch target: control is `nx:size-4` (16px) with no `::after` hit-area overlay or padding — below the ~44px tap floor. Tappable only via a paired `Label`; the radio itself isn't. Fix with a Sidebar-style `nx:after:-inset-2` overlay.

No error-state wiring: no `aria-invalid:border-border-error` / `aria-invalid:focus-visible:outline-focus-error`, unlike `input.tsx`. Invalid/required group has no visual error cue. (likely shared with checkbox/switch)

Numeric spacing note: `gap-2` (line 53, group spacing).

## resizable

Handle hit area below floor: `::after` drag target is `after:w-1` (4px) / `after:h-1` (4px horizontal) — under the ~44px touch floor; visible grip is only `h-4 w-3`. Less acute (resize is pointer-fine) but the documented floor isn't met.

## select

Resolved in PR #462: `SelectTrigger` and `SelectItem` use `nx:typography-body-default`; `SelectLabel` uses `nx:typography-label-default`. The label intentionally moves from 600 to 500 weight because no 14px/600 composite exists.

Mixed padding convention resolved by documentation: vertical uses `py-control-*` role utilities while horizontal padding stays numeric because `px-control-*` would over-widen form-field insets across looser modes.

Numeric spacing notes: trigger `px-3` (70), scroll-up `py-1` (101), scroll-down `py-1` (124), viewport `p-1` (185), label `px-2` (225).

## separator

No issues.

## sheet

Typography (raw): Title `text-lg font-semibold leading-none tracking-tight` (290), Description `text-sm` (323) → composites.

Close-button touch target: `IconX` (16px) with no padding, only `right-4 top-4` positioning → hit area ~16px, below ~44px floor. Add padding or `::after` overlay. (likely mirrors dialog.tsx)

Numeric spacing notes: header `gap-1.5` (224), footer `gap-2` (258). (`sm:max-w-sm` is the sanctioned full-viewport-overlay exception — not flagged.)

## sidebar

`!important` (3×): `group-data-[collapsible=icon]:size-8!` + `:p-2!` (788), `:p-0!` (806). Violates no-`!important`. The `group-data-[collapsible=icon]:` variant adds attribute-selector specificity that likely already beats the base `p-2`/`h-*`, so the `!` is probably cargo-culted from shadcn — investigate + remove via specificity/merge order.

Typography (raw): group-label `text-xs`/`font-medium` (660), group-content `text-sm` (729), menu-button base+sizes (787, 804–806), badge `text-xs`/`font-medium` (967), sub-button `text-xs`/`text-sm` (1134–1135) → composites. (nav-\* color tokens are correct.)

Touch targets: SidebarTrigger forced to `size-7` (28px, 394), SidebarInput `h-8` (32px, 486) — under ~44px floor.

Numeric spacing notes: 12, all the same blanket "nav-chrome rhythm" comment — container `p-2` (347), header `gap-2`/`p-2` (508), footer `gap-2`/`p-2` (531), content `gap-2` (594), group `p-2` (620), group-label `px-2` (659), menu `gap-1` (752), menu-button `gap-2`/`p-2` (786), badge `px-1` (966), skeleton `gap-2`/`px-2` (1013), sub `gap-1`/`px-2.5`/`py-0.5` (1056), sub-button `gap-2`/`px-2` (1131). Justification is boilerplate, not per-numeric.

(Compound-ancestor selectors `[[data-side=x][data-state=y]_&]` at 430/432/433 — two attrs, same ancestor — have no `in-*` shorthand; leave. Single-attr ones already canonical `in-data-` at 429.)

## skeleton

No issues.

## slider

Touch target: thumb is `nx:size-4` (16px) with no `::after` hit-area or padding — below ~44px floor. Mitigated by Radix track-click, but the thumb grab target is small.

## sonner

`!important` (review): `nx:z-toast!` (107). Documented reason — sonner injects a runtime `<style>` hardcoding `z-index:999999999`, injected after the static Nexus CSS at equal specificity, so a non-`!` utility can't override it. Intent is sound (bring sonner into the Nexus layer scale at `toast`=100). Still surfaced per no-`!important`; check whether sonner exposes a z-index/CSS-var override that avoids it.

## spinner

Obsolete numeric note: default icon footprint on `nx:size-4` (37) — `size-*` was not rule-flagged, so it suppresses nothing. Remove.

## switch

Touch target: Root is `nx:h-5 nx:w-9` (20×36px) with no `::after` hit-area or padding — below ~44px floor.

Thumb `nx:shadow-sm` (55): components.md § "No shadow on focusable elements" lists Switch as a focusable control that should rely on border/background, not shadow elevation. Diverges from the rule — reconsider.

## table

Typography (raw): table base `text-sm` (44), footer `font-medium` (114), head `font-medium` (167), caption `text-sm` (217) → composites.

Numeric spacing notes: head `px-2`/`py-2.5` (166), cell `p-2` (192). Justified "not a control". (`tr` element selectors at 67/90/114 and the fixed `translate-y-[2px]` have no shorthand — left as-is.)

## tabs

Typography (raw): trigger base `font-medium` (74), size text `text-xs`/`text-sm`/`text-base` (106–108) → composites.

Numeric spacing notes: list `p-1` (55), sm size `px-2`/`py-1` (105). sm "dense pill" renders below ~44px on touch (deliberate dense variant; default/lg use `control-*` role utilities).

## textarea

Resolved in PR #462: `Textarea` uses `nx:typography-body-default`.

Numeric spacing note: `px-3` (38) stays numeric to preserve the fixed form-field geometry; `py-control-md` remains density-responsive. (`aria-invalid` error-state wiring correctly present, line 40.)

## toggle

Typography (raw): base `text-sm`/`font-medium` (9), sm `text-xs` (18) → composites. (No numeric spacing notes — all sizes use `control-*` role utilities.)

## toggle-group

Variant/size precedence contradicts JSDoc: `context.variant || variant` / `context.size || size` (114/115/119/120) makes the **group** win — when the group sets variant/size, a per-item prop is silently ignored. But ToggleGroupItem JSDoc says "Inherits … unless overridden" (promises item override). Reconcile: fix the doc (group wins) or flip to `variant ?? context.variant` (item wins). `context || prop` also reads backwards. (shadcn-inherited logic.)

## tooltip

Typography (raw): content `text-xs` (79) → composite. (No numeric spacing notes — uses `control-*` role utilities.)
