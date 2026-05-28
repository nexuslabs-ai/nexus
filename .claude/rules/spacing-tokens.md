# Spacing Token Architecture Rules

> **Partial implementation status (post-#127).** The build pipeline reads per-mode `semantic/spacing-{mode}.json` files and emits direct-px `[data-style="X"]` blocks; the `--nx-size-*` primitive layer is gone, and `nx:px-control-*` / `nx:py-control-*` / `nx:p-container` / `nx:gap-layout-*` utilities are generated. The role-to-component coupling table reflects shipped code as of #123/#124. Schema validation ships via `validate-spacing-modes.js` (#126); the ESLint rules `@nexus/canonical-spacing-steps` and `@nexus/prefer-role-utilities` ship in `packages/eslint-plugin-nexus/` (#127), both gated at `error`. Still pending: the canonical-step-set reconciliation under PR #223's "Open Items" — the rule currently accepts the union of every px value shipped across the 7 mode files (~80 values), wider than the aspirational 30-step set.

> Companion to `tokens.md`. Spacing has a different architecture than color, typography, radius, etc. — there is **no primitive size layer**. This file documents that decision, the rules that replace what primitives used to enforce, and the authoring patterns that follow.

## TL;DR

Spacing in Nexus is a **two-tier** system, not the three-tier (primitive → semantic → component) model used elsewhere. Each mode (`vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`) owns a self-contained file with **direct px values** for both numeric and role-named tokens. There is no `--nx-size-*` primitive layer; mode files reference px directly, not primitives.

## Why this differs from typography / color

Typography, color, radius, and shadow follow the canonical three-tier model (`--nx-color-blue-500` → `--color-primary-background` → `nx:bg-primary-background`). Spacing was originally on this model too — `--nx-size-*` primitives feeding `--spacing-*` aliases. **The model was abandoned for spacing** because:

1. **Cross-mode coupling.** Editing `--nx-size-9` to tune one mode broke every other mode referencing it. The "additive primitive" workaround (only add, never edit) added cognitive overhead without earning its place.
2. **Number mismatch confusion.** Under a per-mode remap (e.g. Lyra's `--spacing-4` → `--nx-size-3`), the utility name `nx:p-4` no longer reflects its intuitive value. The indirection made code harder to read, not easier.
3. **Authoring friction.** Mode authors had to think about which primitive to point to rather than just writing the desired value. The primitive layer became a gate, not an aid.

Spacing has more granular variance per mode than the other axes (every component's padding/height/gap shifts with density), so the coupling penalty hit harder. Typography has fewer roles and is more stable across modes — primitives still earn their keep there.

## The architecture

No `--nx-size-*` primitive layer exists. Each mode owns a self-contained `semantic/spacing-{mode}.json` with direct px values under four flat top-level keys — `spacing` (the numeric scale), `control`, `container`, `layout` (`$value` is a DTCG `{ value, unit }` dimension). Every mode file MUST carry the **same key set** (schema-enforced — see § Schema validation). The build emits one `[data-style="X"]` CSS block per mode in a single bundle; mode swap is changing the `data-style` attribute on `<html>` (or any subtree) at runtime — the CSS-variable cascade handles the rest, no rebuild.

> **Placeholder values for `control.gap.{sm,md,lg}`.** The `md` value of each mode is the pre-#230 single `control.gap` value; `sm` and `lg` are seeded with the formula `sm = md − 2`, `lg = md + 2`, snapped to the canonical step set. These are placeholders pending designer tuning — the formula encodes intent (a single density step away from `md` in either direction), not a final design call. Retuning per-mode is fine and expected; the schema only requires the three keys to exist with canonical values.

### The `data-style` attribute carries spacing density only

`data-style` is the spacing-density attribute. It carries one value at a time (`vega`, `lyra`, `maia`, `mira`, `nova`, `luma`, `sera`) and resolves only the `--nx-spacing-*` / `--nx-control-*` / `--nx-container-*` / `--nx-layout-*` overrides.

If a future per-mode semantic category lands (per-mode color shading, per-mode shadow, etc.), it ships its **own** attribute name (e.g. `data-shadow-mode`, `data-color-density`). `data-style` does not multiplex — the contract is one attribute per per-mode axis, so consumers can compose densities independently (`<div data-style="mira" data-shadow-mode="vega">`) without one attribute meaning two things.

## The canonical step set

Without primitives, the scale lives as a project rule: every numeric spacing value in any mode file must be drawn from the canonical step set, which lives in `packages/eslint-plugin-nexus/src/canonical-step-set.json` and is lint-enforced. Values outside it (`5px`, `11px`, `17px`) are forbidden. **Half-steps (1px, 3px, 5px) are excluded by design** — if a mode needs an odd-pixel value, that's a signal to revisit the design intent, not to add an off-grid value. If a design genuinely needs a value the set lacks, propose a change to the set itself rather than a one-off.

## Authoring rules

### For human authors editing mode files

- ✅ Edit one mode's value to retune that mode. No other mode is affected.
- ✅ Add the same role key to all 7 mode files when introducing a new role. Schema validation enforces this.
- ✅ Pick values from the canonical step set. Lint enforces this.
- ❌ Don't add new keys to one mode without adding them to all 7.
- ❌ Don't introduce off-canonical pixel values to "fit" a specific design. If 13px is what the design needs, the canonical set is wrong — propose a change to the set itself.

### For component authors writing JSX

- **Use numeric utilities (`nx:p-2`, `nx:gap-4`, `nx:h-9`)** for layout-level and ad-hoc spacing inside components. They shift with mode automatically.
- **Use role-named utilities (`nx:px-control-md`, `nx:py-control-md`, `nx:gap-control-md`, `nx:p-container`, `nx:gap-layout-section`)** for component-internal spacing that has a clear semantic role. Control utilities carry an explicit size suffix (`-sm`, `-md`, `-lg`); container/layout utilities have no size suffix.
- **Mix freely.** A Button uses `nx:px-control-md nx:py-control-md nx:gap-control-md` for its internal semantic spacing at md; a toolbar wrapping multiple Buttons reaches for `nx:gap-2` to space them apart — role tokens express component-internal intent, numeric utilities space components in context.
- **No `control-h` token.** Control heights are intrinsic — they emerge from `py-control-{size}` + the control's content (text line-height or icon size). The earlier `--control-h-*` axis was over-specified (setting both `h` and `py` meant the visual padding eaten by content overflow didn't match the designer's `py` value). Cross-control alignment is achieved by Button / Input / Select / Tabs / Badge sharing the same `py-control-{size}` and same text-size body.
- ❌ Don't write raw px values (`style={{ padding: '10px' }}`). Always go through a token.
- ❌ Don't use `nx:p-[5px]` arbitrary-value escape hatches. If the canonical set doesn't have what you need, propose the change to the set.

## How to add a new mode

Mechanical once the design values are decided: author `spacing-{mode}.json` (copy an existing mode, keep the exact key set), then **register the mode in both `SPACING_MODES` tuples** — `apps/playground/src/hooks/useTheme.ts` and `packages/react/src/stories/spacing-modes.tsx` are duplicated, not cross-imported, so both need the entry (Storybook's `Style` toolbar then picks it up automatically). Run `yarn validate:spacing-modes` (key-set parity), then `yarn tokens:tailwind` + `yarn tokens:modular` to regenerate.

## Schema validation

`packages/core/scripts/validate-spacing-modes.js` enforces that all 7 mode files share an **identical key set** (Vega is the baseline; any missing or extra leaf path fails). It runs pre-commit (lint-staged, when a `spacing-*.json` is staged) and in CI (the `audit-tokens` job, before regeneration). Exit codes: `0` match, `1` drift, `2` config error.

## Lint rules

Two custom ESLint rules (in `packages/eslint-plugin-nexus/`, wired into the root `eslint.config.js` at `error`) guard the architecture:

- **`@nexus/canonical-spacing-steps`** flags any px value in `spacing-*.json` not in the canonical set. The set lives in `canonical-step-set.json` and is currently the **union** of every value shipped across the 7 modes (~80), wider than the aspirational 30-step set — reconciliation tracked under PR #223's "Open Items", so the rule prevents _new_ drift without forcing snap-to-grid on existing values. Refresh with `yarn workspace @nexus/eslint-plugin refresh:canonical-set` (deliberate; pre-commit does not auto-regenerate).
- **`@nexus/prefer-role-utilities`** flags raw numeric `p` / `px` / `py` / `gap` utilities (and modifier-prefixed variants like `nx:hover:p-4`) in `components/ui/*.tsx` where a role utility exists per the coupling table. `…-0` is not flagged. Out-of-scope prefixes (`pt`, `pb`, `m*`, `h*`, `w*`, `gap-x/y`, …) are silent — the rule grows as role families grow.

### Allowlist syntax

When a raw numeric is intentional, annotate the line **immediately above** the literal:

```tsx
// nexus-allow-numeric: chip rhythm — Badge note in spacing-tokens.md
className: 'nx:px-2 nx:py-0.5',
```

The comment text after the colon is free-form; keep it terse and cite the rule note that justifies the deviation. Only `Line` comments are honoured (not block comments, not trailing same-line). Multiple matches on the next line are silenced by a single comment.

The shipped components all carry such annotations where the role-coupling table calls for numerics (Alert callout rhythm, Accordion item-tier, Badge chip rhythm, Button icon density-stable hit-target, sub-element offsets in Card / Dialog, item-tier menu rows in DropdownMenu / Select, Input px-numeric, Tabs `sm` sub-control). See those files for live examples.

## Role-to-component coupling table

Components should use specific roles for specific spacing decisions. This table is authoritative; the `@nexus/prefer-role-utilities` rule references it.

> **Status: shipped (#123, #124).** Button, Input, Select, Tabs, Badge, and the remaining containers/internal components (Card, Dialog, Alert, Accordion, plus DropdownMenu / Tooltip / Tabs internals) now use these role tokens. `@nexus/prefer-role-utilities` (#127) mechanically enforces it.

| Component                                | Role used for                          | Tokens                                                                             |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Button (default)                         | padding-x, padding-y, gap              | `--control-padding-x-md`, `--control-padding-y-md`, `--control-gap-md`             |
| Button (sm)                              | padding-x, padding-y, gap              | `--control-padding-x-sm`, `--control-padding-y-sm`, `--control-gap-sm`             |
| Button (lg)                              | padding-x, padding-y, gap              | `--control-padding-x-lg`, `--control-padding-y-lg`, `--control-gap-lg`             |
| Button (icon)                            | square padding (numeric)               | `nx:p-2.5` (10px, canonical step) — see note below                                 |
| Input ({sm,default,lg})                  | padding-y per size                     | `--control-padding-y-{sm,md,lg}`; `padding-x` stays numeric — see note             |
| Select trigger                           | padding-y, gap                         | `--control-padding-y-md`, `--control-gap-md`; `padding-x` stays numeric — see note |
| Tabs trigger                             | padding-x, padding-y (sm/md)           | `--control-padding-x-{sm,md}`, `--control-padding-y-{sm,md}`                       |
| Tooltip                                  | padding-x, padding-y                   | `--control-padding-x-sm`, `--control-padding-y-sm` — see portal note               |
| Badge / Chip                             | (numeric — chip rhythm)                | Use numeric `spacing-N` from canonical step set — see note                         |
| Card                                     | interior padding, gap, action position | `--container-p`, `--container-gap` — see note                                      |
| Card header                              | container padding                      | `--container-p` (sub-element offsets use numeric `spacing-N`) — see note           |
| Dialog                                   | interior padding, gap                  | `--container-p`, `--container-gap` — see note                                      |
| Alert                                    | (numeric — callout rhythm)             | Use numeric `spacing-N` from canonical step set — see note                         |
| Accordion                                | (numeric — item rhythm)                | Use numeric `spacing-N` from canonical step set — see note                         |
| Avatar                                   | (uses sizing tokens, not spacing)      | N/A — see `nx:size-*` numeric utilities                                            |
| Section between blocks                   | vertical gap                           | `--layout-section-gap`                                                             |
| Stack utility                            | gap between siblings                   | `--layout-stack-gap`                                                               |
| Page gutter, inline groups, layout-level | (no named role yet)                    | Use numeric `spacing-N` from canonical step set                                    |

When a new component is authored, the author adds a row to this table.

**Note — Button (icon) is intentionally density-stable.** An icon-only button has no text to scale and no role-family token (`p-control-*`) exists for square padding. Using `--control-padding-x-{size}` and `--control-padding-y-{size}` together would scale the icon button's hit target down in compact modes (e.g., nova: 12px + 6px ≠ square; the icon becomes vertically squeezed) — so icon buttons stay on the canonical numeric step `nx:p-2.5` (10px). Hit-target size remains identical across all 7 modes by design. A future `--control-icon-p-{size}` family could change this if the design system wants density-aware icon buttons; out of scope for this iteration.

**Note — Input and Select trigger keep `padding-x` numeric.** Input/Select are _narrower_ than Button at the same logical size — Input default `nx:px-3` (12px) vs Button default `nx:px-control-md` (16px in vega). Migrating Input/Select to `--control-padding-x-md` would expand them by +4px each side at default and +16px at `lg`, which conflicts with the shadcn-derived convention Nexus already ships (form inputs sit visually inside their button neighbours, not flush). `padding-y` and `gap` still migrate to the role tokens because they match in vega — height stays mode-coupled, width stays numeric.

**Cross-mode visual consequence — design call: accept the drift.** Because `padding-x` is mode-stable while Button's `padding-x` is mode-coupled, the visual gap between an Input and an adjacent Button varies by mode: `--control-padding-x-md` is 12px (nova) → 16px (vega/lyra/luma/mira) → 20px (maia) → 24px (sera). At Input's fixed 12px that lands as: **flush in nova (0px gap), ~4px in vega, ~8px in maia, ~12px in sera per side.** This is the explicit decision for #124 (made in batch 2, 2026-05-27) — the per-mode gap drift is treated as intentional design surface: compact modes render form fields tight against their button neighbours, breathy modes give the button visible chrome. Tier-A systems (Linear, Stripe) ship a single density and so do not face this question; Nexus's 7-density spread surfaces it, and the call here is to let the densities express themselves rather than force flush alignment everywhere. The alternative paths (retune `--control-padding-x-md` to match Input's 12px and re-derive other modes, or introduce an `--input-padding-x-*` family) remain open if real consumer complaints arrive — both are larger conversations than this migration and would land as their own issues. Select trigger inherits this same shape in batch 2.

**Note — Tooltip migrates fully but the cascade test is structural.** Tooltip content portals to `document.body`, escaping any subtree `[data-style="X"]` wrapper. The role tokens still resolve at runtime — they pick up the document's mode — so a Tooltip nested in `<div data-style="nova">` _does_ render with whatever data-style sits on `<html>`, not nova. The dimensional cascade sentinels (`expectModeCascadeWorks` / `expectHeightPinned`) therefore can't see the role-utility variation across a wrapper. Tooltip's regression coverage instead asserts `getComputedStyle(content).paddingLeft === '12px'` after opening — verifying the role utility resolved to a valid pixel value, not that the wrapper cascade reached it.

**Note — Badge / Chip stays on the canonical numeric step set.** Badge's existing utilities (`nx:py-0.5` = 2px, `nx:px-2`/`nx:px-2.5` = 8/10px, `nx:gap-1` = 4px) sit _below_ the smallest control token (`--control-padding-x-sm` = 12px / `--control-padding-y-sm` = 6px in vega) — a chip is not a control. Migrating to `control-sm` would 3× the vertical padding (2 → 6) and ~1.5× the horizontal (8 → 12), reshaping the chip into something the size of a `Button(sm)`. A future `--chip-padding-*` family could exist; out of scope for this iteration. Density stability is intentional and is asserted in `Badge.stories.tsx` via `expectHeightPinnedAcrossModes`.

**Note — Tabs `sm` size is sub-control; `TabsList` / `TabsContent` chrome stays numeric.** Tabs `default` (`nx:px-3 nx:py-1.5` = 12,6) and `lg` (`nx:px-4 nx:py-2` = 16,8) match `control-sm` and `control-md` byte-identically in vega, so they migrate. The `sm` size (`nx:px-2 nx:py-1` = 8,4) sits below `control-sm`, mirroring Badge's chip rhythm — Tabs `sm` is the "dense pill" use-case (a sidebar nav, a filter row) where even `control-sm` reads too generous. `TabsList`'s `nx:p-1` outer frame (4px) and `TabsContent`'s `nx:mt-2` content offset are chrome scaffolding rather than control padding — neither maps to a role-token semantic ("the gap between tab-frame and tab-content" is not a `layout-section-gap`; "the tab-list inner padding" is not a `container-p`). Both stay numeric.

**Note — Menu items (DropdownMenu, Select) keep `padding-x` and `gap` numeric; only `padding-y` migrates.** Menu-item utilities are tighter than form controls — `DropdownMenuItem` / `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem` / `DropdownMenuSubTrigger` / `DropdownMenuLabel` and `SelectItem` / `SelectLabel` all use `nx:px-2 nx:py-1.5` (8, 6), with `DropdownMenuSubTrigger` and `DropdownMenuItem` carrying `nx:gap-2` (8) for icon/label spacing. `py-1.5` matches `--control-padding-y-sm` (6px in vega) and migrates, giving menu rows the same vertical density-coupling as compact buttons. `px-2` (8px) sits below `--control-padding-x-sm` (12px) by design — a menu row is _denser_ than a control row, and forcing `px-control-sm` would visually merge adjacent rows into oversized buttons. `gap-2` (8px) stays for the same item-tier reason: a menu row's icon↔label gap is part of its dense rhythm and should not breathe with mode density (forcing `gap-control-sm` = 6/8/10 across modes would visibly shift icon↔label spacing on the same row, which reads as a layout bug rather than a density signal). Same item-tier rationale as Badge. By contrast, `SelectTrigger` migrates `gap-2`→`gap-control-md` because it is _itself a control_ (form input row), not a menu item — control-tier rules apply to the trigger; item-tier rules apply to the rows inside the popover. The menu container chrome — `DropdownMenuContent` / `DropdownMenuSubContent` / `SelectContent` Viewport `nx:p-1` (4px), `DropdownMenuSeparator` / `SelectSeparator` `nx:-mx-1 nx:my-1`, `SelectScrollUpButton` / `SelectScrollDownButton` `nx:py-1` (4px) — stays numeric: these are sub-canonical-step offsets used to compose the popover frame, not container-tier padding. Cascade sentinels for these components run via computed-style on opened content (portaled), not dimensional measurement.

**Note — Card positional offsets align with `--container-p`.** `CardAction` is absolute-positioned relative to its `CardHeader` parent, so its `right` / `top` offsets must match the header's `p-container` to land at the visible edge of the header surface. The action uses `nx:right-(--nx-container-p) nx:top-(--nx-container-p)` — the Tailwind 4 arbitrary-property-value syntax for referencing a role-token var without re-emitting it through a new utility — so the offset tracks `p-container` across all modes (nova 20 → vega-cluster 24 → maia/luma 28 → sera 40). The previous fixed `right-6 top-6` (24px) decoupled from header padding under the role-token migration: in nova the action would overlap inward of the padding; in sera it would float 16px short of the edge. The bordered-header override (`[.nx\:border-b]:pb-6`) was dropped for the same reason — pinning bottom padding at 24px while the sides scaled inverted the bordered-vs-unbordered relationship across modes (in nova, bordered pb _exceeded_ the sides; in sera, it fell short). Default `p-container` already covers the bordered case. The remaining `CardAction` styles (`nx:gap-2` for icon↔label rhythm inside the action row) stay numeric — they sit below `gap-container` by the same item-tier rationale as Badge.

**Note — Alert stays on the canonical numeric step set.** Alert's `nx:p-4` (16px in vega) sits _below_ `--container-p` (24px in vega) — an alert is a _callout_, not a container. The visual rhythm is tighter: alerts compete for attention against body copy and need to read as inline notices, not as raised containers. Migrating `p-4` → `p-container` would 1.5× the vertical and horizontal padding (16 → 24), pushing alert chrome into Card territory and visually competing with adjacent Cards. The sub-element offsets (`nx:mb-1` between AlertTitle and AlertDescription, `nx:left-4 nx:top-4` for the icon positioning) likewise stay numeric. A future `--callout-padding-*` family could exist; out of scope for this iteration. **Alert still mode-couples** — `nx:p-4` resolves to `--nx-spacing-4` which varies per mode (nova 14 / vega-cluster 16 / maia 18), so an Alert _does_ visibly grow in maia and compress in nova. The point of staying-numeric is not density stability; it's that Alert reuses the document's spacing scale rather than the raised-container's, keeping the callout rhythm distinct. The `Alert.stories.tsx` cascade + pinned sentinels run on `nova` + `maia` (the two modes where `spacing-4` diverges from the vega cluster).

**Note — Accordion trigger and content stay on the canonical numeric step set.** `AccordionTrigger`'s `nx:py-4` (16px in vega) sits _above_ `--control-padding-y-lg` (12px in vega) and below any "container" semantic — an accordion row is _item-tier_, not a control and not a container. It is a clickable section header with its own visual rhythm distinct from buttons or popovers. Migrating `py-4` → `py-control-lg` would compress the trigger by 4px each side (16 → 12), breaking the established document-section feel. `AccordionContent`'s inner `nx:pb-4 nx:pt-0` is the same item-tier bottom-padding mirroring the trigger's `py-4`; both stay numeric. A future `--item-padding-*` family could exist; out of scope for this iteration. **Accordion still mode-couples** — `nx:py-4` resolves to `--nx-spacing-4`, which varies per mode (see Alert note above). The point is not density stability; it's that Accordion uses the document's spacing scale rather than the control or container scales. The `Accordion.stories.tsx` cascade + pinned sentinels run on `nova` + `maia`.

**Aside — which numeric steps are actually density-stable.** Per the per-mode `spacing-{mode}.json` files, only the small steps are mode-invariant: `0`, `0_5` (2px), `1` (4px), `1_5` (6px), and `2` (8px) hold the same value in all 7 modes. From `2_5` upward the values diverge (e.g. `4`: nova 14 / vega-cluster 16 / maia 18; `10`: nova 38 / vega-cluster 40 / maia 44). Components that should be _genuinely_ density-stable can only assert that via numeric utilities drawn from the stable subset — Badge does this with `nx:px-2 nx:py-0.5 nx:gap-1`, and Tabs `sm` does this with `nx:px-2 nx:py-1`. Both back the claim with `expectHeightPinnedAcrossModes`. Alert / Accordion / Card sub-elements (`gap-1.5`, `pt-0`, etc.) happen to land in the stable subset for the specific offsets used; the components as a whole still mode-couple via their main padding tokens.

## Migration history

The two-tier per-mode architecture landed across the [Spacing tokens · Phase 1](https://github.com/nexuslabs-ai/nexus/milestone/5) milestone (issue numbers unless prefixed with `PR`):

- **#117** — audit existing spacing utilities, finalise the role vocabulary (`control` / `container` / `layout`).
- **#118** — author the 7 per-mode `semantic/spacing-{mode}.json` files.
- **#119** — switch the token build to read per-mode semantic spacing; emit `[data-style="X"]` blocks.
- **#120** — refactor playground `useTheme` to activate modes via `data-style`; add Luma + Sera to the picker.
- **#121** — delete the `--nx-size-*` primitive layer (the two-tier shape becomes load-bearing here).
- **#122** — add the Storybook `style` globalType + decorator so stories can be exercised across every mode.
- **#123** — migrate Button to role-named utilities (proof point for the role-token migration).
- **#124** — roll out role-named utilities to the remaining 12 components.
- **PR #130** — populate this file's role-coupling table with the audit-grounded 14-role version; sync the FE brief.
- **#230** — add `--control-gap-{sm,md,lg}` per-size gap roles (the `control.gap` token splits from a single value into a size-keyed bundle).
- **#126** — ship `validate-spacing-modes.js`; wire to pre-commit (lint-staged) and CI (`audit-tokens` job, before regen).
- **#127** — ship `@nexus/eslint-plugin` with `canonical-spacing-steps` and `prefer-role-utilities`; wire both into root `eslint.config.js` at `error`; sweep the 10 UI components to annotate intentional raw-numeric sites with `// nexus-allow-numeric:` comments.

## When to revisit

Architectural decisions are not load-bearing forever. Revisit this design when:

- **A real consumer asks for a per-step ad-hoc value** that doesn't fit the canonical set, and "extend the canonical set globally" causes design friction repeatedly. Indicates the set is too restrictive or too coarse.
- **The schema validation gates become a productivity tax** because adding a new role requires touching 7 files. If frequent, consider a tooling helper that prompts for "value per mode" once and writes all 7.
- **Mode count grows beyond ~10.** The "all modes must have all keys" rule scales linearly; at 10+ modes it becomes painful.

The architecture is **correct for the current scope** (7 modes, ~20 roles, ~30 numeric steps). It is not necessarily correct at 20 modes and 50 roles.
