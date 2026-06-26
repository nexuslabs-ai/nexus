# Full-Token Derivation — Design Spec (Epic Phase A)

**Date:** 2026-06-26
**Status:** Approved design; pending implementation plan (`writing-plans`). Revised after external review (surfaceTone, light-surface model).
**Part of:** [Appearance Theming → Nexus Package APIs epic](../plans/2026-06-26-appearance-package-extraction-epic.md) — this is **Phase A**, the gating workstream. B/C/D depend on the token surface this spec settles.

## Problem

`deriveTheme` today emits ~66 of the ~156 `--nx-color-*` tokens (surfaces, text tiers, primary). The remaining ~90 — the four **status** families, **secondary**, the five **chart-categorical** colors, and the **alpha/translucent** tokens — cascade from a static curated base CSS file. Consequence: if a consumer drops the per-tone `<link>` (the goal of the package extraction), those ~90 tokens freeze at the baked default tone. So a "surface tone" or custom brand is only ~40% real.

## Goal

Extend the engine so its output token set **equals** the curated set — every `--nx-color-*` is derived, none cascades from static CSS. The engine becomes the single source of truth; static base CSS is retired **per-tone, gated on parity**. The neutral surface family is selected by a first-class **`surfaceTone`** enum.

## Decisions (recorded)

| #   | Decision                                                                                                                                                        | Rationale                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Status hues fixed canonical** (existing green/orange/red/blue ramp hues), tiers re-toned per mode + APCA-gated                                                | Status carries meaning (red = danger); keep meaning stable, guarantee legibility. Brand expresses via primary/accent.                                                                    |
| Q2  | **Chart-categorical = fixed colorblind-safe set**, re-toned L/C per mode                                                                                        | Categorical distinguishability is correctness; must pass `audit:colorblind`.                                                                                                             |
| Q3  | **Engine = single source of truth**; drop static base CSS, **gated** per-tone on parity sign-off                                                                | Keeping static base files alongside the engine reintroduces the dependency the engine exists to retire + the source-order race.                                                          |
| Q4  | **Per-mode surface model: dark stepped; light flat for base `container`/`popover` only** — `muted` and `*-hover`/`*-active` stay stepped + tone-tinted in light | Matches curated (light keeps base surfaces white, but `muted`=tone-50, `container-hover`=tone-50 — so containers still get hover feedback). Tier-A light surfaces are flat-with-borders. |
| Q5  | **`surfaceTone` is a first-class contract enum** (`stone\|neutral\|zinc\|slate\|gray`), NOT a hidden derivation                                                 | The neutral surface family is a product choice the consumer makes explicitly. (See _Contract_ below — this reverses the earlier "no new inputs" stance.)                                 |

## Contract — **changed** (surfaceTone added)

```
{ appearance: 'light'|'dark'|'system',
  surfaceTone: 'stone'|'neutral'|'zinc'|'slate'|'gray',   // optional, default 'neutral'
  light: { accent, background, foreground },
  dark:  { accent, background, foreground },
  contrast: 0..100 }
```

**Why the contract changes now:** Phase B freezes the public package API, so the abstraction must be right _before_ freezing — patching it after is a breaking change for consumers. The earlier "no new inputs" rule is **retired**.

**Why `surfaceTone` and not "derive the tone from a seed":** curated light themes have a **pure-white `background`** (chroma 0) yet **tone-tinted** `muted` / `nav` / `border-active` / `overlay` (e.g. `overlay: slate-a700`). The tint cannot come from the white background seed. The rejected alternative — read the tone from the _dark-block_ background seed — works but makes light-mode tint secretly depend on the dark seed: spooky cross-mode coupling, and `background` would mean two different things. An explicit `surfaceTone` says what it means: _page background is white; the neutral surface family is Slate._

## Core abstraction — one family deriver

Generalize `derivePrimary` into `deriveFamily(name, seedHex, mode, { borders? })` (ramp + APCA on-color), applied to:

- **primary** — `deriveFamily('primary', accent, mode)`
- **success / warning / error / information** — `deriveFamily(name, CANON_HUE[name], mode)`, hues calibrated to the existing `green/orange/red/blue` ramps

**Secondary is NOT this shape.** A dedicated `deriveSecondary(mode)` emits a **subtle tone-independent neutral** surface family (curated maps it to `neutral-*` in every brand: light `bg=100/fg=900`, dark `bg=900/fg=100`) — not a solid ramp-600.

## Surfaces, nav, borders, alpha — tinted by `surfaceTone`

- **`deriveSurfaces(background, surfaceTone, mode, delta)`** — lightness from the step model + the `background` seed; **hue/chroma from `surfaceTone`** (the white light-background can't carry it). Chroma fades toward white (`tone.c * (1 - L)`): slate-50 ≈ C 0.003 … slate-950 ≈ C 0.04. Only base `container`/`popover` flatten in light (Q4); `muted` + states keep stepped, tone-tinted.
- **nav + borders** flow through the same surface machinery (add `nav-border` to the step set).
- **`deriveAlpha(surfaceTone, mode)`** — the translucent "ink" carries the **tone** tint (slate overlay ≠ neutral overlay), at mode-specific α (overlay 0.7529/0.8471, border-default-alpha 0.0941/0.1882, popover-backdrop 0.9098; `popover-alpha` is white in light, tone-ink in dark).
- **text** — keep `deriveText` (APCA `quietText`). **chart** — fixed colorblind set, re-toned per mode.

## Parity & cutover (the C-gate)

1. Calibrate each `surfaceTone`'s hue/chroma + the light step magnitudes so derived neutrals match today's curated values within tolerance — in **both** modes.
2. Per-tone sign-off **before** deleting that tone's static CSS. **Phase A is not complete until all five tones pass** (no silent "keep the curated file" follow-up). A genuinely unmatchable token becomes an _explicit, documented_ public-contract item, not a silent residual.

## Invariants & tests

- **Key-parity test:** derived `--nx-color-*` keys **equal** the curated base+brand+**chart** key set — fails on any omission.
- **APCA sweep (extended):** every status family **and secondary**, `-foreground` on `-background` **and** `-subtle-foreground` on `-subtle`, both modes.
- **Colorblind:** the fixed chart set passes `audit:colorblind`.
- **Tone parity (both modes):** each named tone reproduces curated within tolerance — and demonstrably tints **light** `muted` / `nav-background` / `nav-border` / `border-active` / `overlay` (differs from `neutral`), not only dark surfaces.
- **No `light-dark()`** in emitted CSS — direct assertion on `themeToCss` output.

## Out of scope (Phase A)

- Packaging / `@nexus/react/appearance` / the provider (Phase B–D).
- Subtree-scoped theming (`themeToCss` stays `:root` / `:root.dark`).
- Physical deletion of the 5 curated base CSS files (Phase A makes them redundant + gates removal; deletion rides with Phase D's console cleanup).

## Open items for the plan

- Exact canonical status hues/chromas (calibrate to `green/orange/red/blue`).
- The fixed chart-categorical 5-set values (clear `audit:colorblind` in both modes).
- Per-token alpha opacities (read from the curated `*-a*` primitives).
- The per-`surfaceTone` hue/chroma + light step-size calibration (the parity pass).
