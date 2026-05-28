# Spacing Token Architecture Rules

> Companion to `tokens.md`. Spacing is **two-tier** — no primitive `--nx-size-*` layer; each density mode owns a self-contained `semantic/spacing-{mode}.json` of direct px values, swapped at runtime via the `data-style` attribute. This file holds only what the code can't tell you: why it's shaped this way, and the judgment calls.

## Why two-tier, not three

Spacing was originally three-tier like color/typography (`--nx-size-*` primitives → `--spacing-*` aliases). It was abandoned because:

1. **Cross-mode coupling.** Editing one primitive to tune one mode broke every other mode referencing it. The "only ever add, never edit" workaround added overhead without earning its place.
2. **Number mismatch.** A per-mode remap (Lyra's `--spacing-4` → `--nx-size-3`) made `nx:p-4` no longer mean "4" — indirection that hurt readability, not helped it.
3. **Authoring friction.** Authors had to pick which primitive to point at instead of just writing the value.

Spacing varies more per mode than any other axis — every component's padding/gap shifts with density — so the coupling penalty hit hardest here. **Don't reintroduce a primitive layer.**

## Role tokens vs raw numerics

Use **role utilities** (`nx:px-control-md`, `nx:py-control-md`, `nx:gap-control-md`, `nx:p-container`, `nx:gap-layout-section`) for component-internal spacing with a clear semantic tier — they mode-couple automatically, and `@nexus/prefer-role-utilities` (an `error`-level lint rule) enforces them where one applies. Use **numeric utilities** (`nx:gap-2`) for ad-hoc and between-component layout spacing.

**Item-tier components stay numeric.** Chips (Badge), menu rows (DropdownMenu / Select items), callouts (Alert), accordion headers, and card/dialog sub-element offsets all sit _below_ the smallest control token. Forcing a role token onto them would reshape them (a chip would balloon toward `Button(sm)` size). That's why these carry `// nexus-allow-numeric:` comments — the raw value is the design, not a miss; don't "fix" it to a role token. Same for icon-only buttons (square hit-target — no role token exists for square padding) and popover frame chrome (sub-canonical inner padding).

**Input / Select keep `padding-x` numeric** (only `padding-y` / `gap` migrate to role tokens). Form inputs are narrower than Buttons at the same size and sit visually _inside_ their button neighbours — the shadcn-derived convention Nexus ships. The consequence is a **deliberate cross-mode gap drift**: Input's px is mode-stable while Button's `--control-padding-x-md` scales (12px nova → 16px vega → 24px sera), so the gap between an Input and an adjacent Button ranges from flush (nova) to ~12px/side (sera). This is accepted as intentional design surface (#124) — compact modes render form fields tight against buttons, breathy modes give the button visible chrome. Re-tuning to force flush alignment everywhere is a separate, larger conversation, not a bug.

**No `control-h` token.** Control heights are intrinsic — they emerge from `py-control-{size}` + content (text line-height or icon size). Setting both `h` and `py` over-specified it (content overflow made the visual padding diverge from the designer's `py`). Cross-control alignment comes from Button / Input / Select / Tabs / Badge sharing the same `py-control-{size}` and text size.

## The canonical step set

Numeric values must come from the canonical step set (`packages/eslint-plugin-nexus/src/canonical-step-set.json`, lint-enforced by `@nexus/canonical-spacing-steps`). **Half-steps (1 / 3 / 5px) are excluded by design** — an odd-pixel need signals revisiting the design intent, not adding an off-grid value. If a design genuinely needs a value the set lacks, change the set, don't one-off it. (The shipped set is currently the _union_ of every value across the 7 modes — wider than the aspirational 30-step scale; reconciliation tracked in PR #223.)

Only the small steps are **mode-invariant**: `0`, `0_5` (2px), `1` (4px), `1_5` (6px), `2` (8px) hold the same value across all 7 modes; `2_5` and up diverge. A component that must be _genuinely_ density-stable can only assert that with numerics drawn from this stable subset (Badge and Tabs `sm` do, backed by `expectHeightPinnedAcrossModes`).

## Adding a mode

Author `spacing-{mode}.json` (copy an existing mode, keep the exact key set — every mode file must share it, schema-enforced by `validate-spacing-modes.js`). Then **register the mode in both `SPACING_MODES` tuples** — `apps/playground/src/hooks/useTheme.ts` and `packages/react/src/stories/spacing-modes.tsx` are duplicated, not cross-imported, so both need the entry. Run `yarn validate:spacing-modes`, then `yarn tokens:tailwind` + `yarn tokens:modular`.

## data-style carries spacing density only

`data-style` resolves only the `--nx-spacing-*` / `--nx-control-*` / `--nx-container-*` / `--nx-layout-*` overrides. A future per-mode axis (shadow density, color shading) gets its **own** attribute — `data-style` does not multiplex, so consumers can compose densities independently (`<div data-style="mira" data-shadow-mode="vega">`). (`control.gap.{sm,md,lg}` is currently placeholder-seeded `sm = md − 2`, `lg = md + 2` pending designer tuning — #230.)
