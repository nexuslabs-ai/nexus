# Design Token Rules

> Scope: the non-obvious _why_ behind the token system — rationale, footguns, governance, and judgment calls. Values, file patterns, the DTCG shape, CLI flags, and variable names are not restated here; they live in `packages/core/tokens/`, the generated CSS, and `package.json`, and are the ground truth.

## Color Token Pipeline

**On-disk: hex; runtime: OKLCH.** `color.json` stores hex (8-digit for alpha shades); the build converts to `oklch(...)` at emit time, pinning each shade's lightness to a palette-uniform grid (`perceptual-grid.json`) so every palette's shade-500 reads at the same perceived depth. Hex is the on-disk format because Tokens Studio and Figma Variables hex-normalise on export and cannot round-trip OKLCH — it's the only viable source for a Figma-driven workflow.

### Alpha Token Scale

The 5 surface palettes (`slate`, `neutral`, `gray`, `stone`, `zinc`) plus `white`/`black` ship alpha shades `a50`–`a950`; chromatic palettes (`red`, `green`, `blue`, …) **do not** — Tier-A practice (Radix, Geist, Stripe, Linear, Atlassian): alpha is for surface chrome (scrims, hovers, frosted panels), not chromatic tints. Translucent surfaces reference these instead of hand-written `rgba()` so they blend correctly across every base; `overlay` follows this (`{palette.a700}` light / `{palette.a800}` dark), not a hardcoded `rgba`.

**`.base` convention.** The fully-opaque value of `white`/`black` lives at `.base` (`{white.base}`) — _not_ `{white}` or a numbered shade. Alpha shades nest under the solid (`{slate.a200}`, `{white.a900}`).

**Not APCA-gated.** Alpha tokens blend with their backdrop, so contrast is context-dependent — they're excluded from `audit:contrast`. `oklchToSrgbInts()` throws on an alpha-bearing color, so any future pair needing one must pre-blend against its surface first.

### Warning for designers

When you change a hex in Figma for a palette shade, only **hue and chroma** carry through — the **lightness is overwritten by the grid**. `#ff0000` and `#400000` at the same shade key produce identical lightness. To change a shade's lightness, edit `packages/core/src/lib/perceptual-grid.json`, not the hex.

### DTCG deviation

We keep `$value` as a hex string on disk, not the DTCG-2025.10 structured-object form (`{ "colorSpace": "oklch", "components": [...] }`). Design tools round-trip hex; they don't round-trip the structured form, so it would be lost on the next Figma export. Revisit if a consumer needs spec-compliant import.

### Browser floor

OKLCH requires Chrome 111+ / Safari 15.4+ / Firefox 113+ (Baseline 2023). No hex fallback is emitted — consumers needing older browsers pin to the last pre-migration tag. **No `@media (color-gamut: p3)` query needed:** emitted `oklch(...)` carries P3 chroma and browsers gamut-map at render time, so the CSS is identical everywhere — capable hardware just shows more chroma.

### APCA contrast gate

`yarn audit:contrast` runs APCA Lc on every foreground↔background pair (the exact pairs + thresholds live in `audit-contrast.js`), gated by intended-use tier:

- **Body text** `|Lc| ≥ 75` — fluent reading (`foreground ↔ background`).
- **UI labels** `|Lc| ≥ 60` — buttons, badges, nav labels, chart marks, labels on subtle fills.
- **Incidental** `|Lc| ≥ 45` — muted / disabled / tertiary text, focus rings, nav metadata.

**Scoring is sRGB-equivalent** — the audit measures what a legacy sRGB display renders (the lowest common denominator), so guarantees hold on P3 hardware too. Failures are fixed by re-pointing the semantic token to a different shade or adjusting the L grid — **never by lowering a threshold.** The tiers come from APCA's published intended-use guidance and are not negotiable per-finding.

## Semantic Token Categories

Semantic colors group into Layout, Brand (`primary` / `secondary`), Status (`error` / `success` / `warning` / `information`), Borders, Navigation, Focus, and Data viz — the per-group tokens are visible in the `base-*` / `brands-*` files. Each brand/status group carries the same 9 state keys (`background`, `-hover`, `-active`, `foreground`, `disabled`, `subtle`, `subtle-foreground`, `subtle-hover`, `subtle-active`).

### Data viz tokens

Categorical chart palette: hues rotate (teal → lime → orange → rose → indigo) for rhythm in stacked/grouped marks and deliberately avoid status-semantic hues (green / yellow / red) so a series doesn't read as an error. The `categorical` infix locks scale-type in both the filename and the token path, so future scale shapes (`sequential`, `diverging`) land as their own files and never collide on the same CSS variable.

## Light/Dark Theme Tokens

CSS output: light values in the `@theme` block, dark overrides in the `.dark` selector. **Authoring rule:** because `.dark` already overrides the semantic token values, never write `dark:` modifiers on semantic-named utilities in component code — the modifier is a no-op (see [`components.md` § Adaptive-by-default semantic tokens](components.md#adaptive-by-default-semantic-tokens)). Shadow and focus primitives are the exception that splits by theme: a black drop-shadow that defines a card edge in light mode vanishes against a near-black dark canvas, so each theme tunes its own opacity/offset/blur.

## Font loading — variable-font axes

A `fontFamily` token can carry `$extensions.nx-font-source` (`type: "google"` with `family`/`weights`/`styles`, or `"system"`) to drive `@import` generation. The `weights` array requests Inter's variable `wght` axis as a single payload. **Only `wght` is requested** — Inter also ships an `opsz` (optical-size) axis, but Google Fonts serves only the axes named in the request URL, so `opsz` is never delivered and the utilities deliberately do **not** emit `font-optical-sizing: auto` (a no-op without the axis loaded). Activating it would mean requesting `opsz` in the import; no token field consumes one today.

## Spacing & CSS-variable gotchas

> **Spacing emits two forms with different jobs.** `--spacing-{N}` lives in `@theme {}` as a **build-time** input — Tailwind reads it to decide which utilities to emit (`nx:p-4`, `nx:gap-4`, …). `--nx-spacing-{N}` is the **runtime** variable those utilities reference; per-mode `[data-style="X"]` blocks override it, so mode-switching cascades to every `nx:p-*` utility without a rebuild. For runtime use outside Tailwind (inline styles, SVG, canvas), use `var(--nx-spacing-N)` — `var(--spacing-N)` may not exist at runtime.

> **Standalone semantic vars.** `--breakpoint-*` and `--z-index-*` are semantic-only (no `--nx-` prefix, no primitive layer) — the token name IS the full variable. Spacing likewise has no primitive layer (per-mode `spacing-{mode}.json` carries direct px).

> **Spacing isn't a per-mode build flag.** All 7 spacing modes ship in every build; mode swap is the runtime `data-style="X"` attribute on `<html>` (or any subtree). `--spacingDefault=<mode>` only picks which mode lands under the `:root` cascade default.

> **Mode distinctness varies by axis.** A CLI flag being accepted ≠ unique values. `shadow` is genuinely distinct across its 5 modes; `typography` ships only 3 (`nova` / `vega` / `maia` — `lyra` / `mira` were byte-identical to `vega` and removed); `borderwidth` exposes 5 flags but only 3 designs (`borderwidth-nova` 1.5/3px, `maia` 1/1px, and the `vega` cluster `lyra` = `mira` = `vega` 1/2px). Don't read a surviving flag as a distinct design.

## Typography

`typography-*` composite utilities emit `text-wrap: pretty` on the **body tier only** — orphan/widow protection for multi-line copy, unwanted on headings. Letter-spacing is **proportional**: `tight` (−0.4px) on display + headings ≥ 30px, `normal` (0) at 24px and below — there's no intermediate step, so 30px is the threshold. Three modes differ by a uniform ±1px per size step, mapped to product archetypes:

| Mode     | Archetype            | Use for                                                        |
| -------- | -------------------- | -------------------------------------------------------------- |
| `nova`   | Tool / dense         | dashboards, data-heavy UIs (Figma / Linear density)            |
| `vega` ★ | Standard product     | SaaS, consumer apps — the recommended default and bundled mode |
| `maia`   | Editorial / document | reading-focused UIs, document editors (Notion density)         |

All three share Inter / Georgia / JetBrains Mono — they differ by scale only. `lyra` / `mira` were byte-duplicates of `vega` and removed; reintroduce them only with a real typeface or scale-ratio decision behind them.

## Do Not

- Edit files in `dist/` or `packages/tailwind/` directly (they're generated — re-run `yarn tokens:tailwind`)
- Use raw hex in semantic **color** tokens — reference a primitive (`{slate.500}`)
- Add a themed color file (`base-*`, `brands-*`, `chart-*`) without **both** light and dark variants
- Add any token without a `$type` property
