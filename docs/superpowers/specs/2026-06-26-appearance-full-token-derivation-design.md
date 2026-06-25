# Full-Token Derivation — Design Spec (Epic Phase A)

**Date:** 2026-06-26
**Status:** Approved design; pending implementation plan (`writing-plans`).
**Part of:** [Appearance Theming → Nexus Package APIs epic](../plans/2026-06-26-appearance-package-extraction-epic.md) — this is **Phase A**, the gating workstream. B/C/D depend on the token surface this spec settles.

## Problem

`deriveTheme` today emits ~66 of the ~156 `--nx-color-*` tokens (surfaces, text tiers, primary). The remaining ~90 — the four **status** families, **secondary**, the five **chart-categorical** colors, and the **alpha/translucent** tokens — cascade from a static curated base CSS file. Consequence: if a consumer drops the per-tone `<link>` (the goal of the package extraction), those ~90 tokens freeze at the baked default tone. So a "surface tone" or custom brand is only ~40% real.

## Goal

Extend the engine so its output token set **equals** the curated set — every `--nx-color-*` is derived, none cascades from static CSS. The engine becomes the single source of truth; the 5 named tones become 5 calibrated background **seeds**; static base CSS is retired **per-tone, gated on parity**. No new inputs enter the public contract.

## Decisions (recorded)

| #   | Decision                                                                                                                 | Rationale                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Status hues are fixed canonical** (the existing green/orange/red/blue ramp hues), tiers re-toned per mode + APCA-gated | Status carries meaning (red = danger); keep meaning stable, guarantee legibility + tonal fit. Brand expresses via primary/accent.                           |
| Q2  | **Chart-categorical is a fixed colorblind-safe set**, re-toned L/C per mode                                              | Categorical distinguishability is a correctness property; must pass `audit:colorblind`, which an arbitrary brand-derived set can't guarantee.               |
| Q3  | **Engine = single source of truth**; 5 tones → seeds; drop static base CSS, **gated** on per-tone parity sign-off        | Keeping 5 static base files alongside the engine reintroduces the static-CSS dependency the engine exists to retire, and keeps the source-order race alive. |
| Q4  | **Per-mode surface-step model: stepped in dark, flat in light**                                                          | Matches the shipped curated look (no light-mode regression) and the Tier-A norm (Linear/Stripe/Notion light surfaces are flat-with-borders).                |

## Core abstraction — one family deriver

The existing `derivePrimary(accentHex, mode)` already builds a 9-state family + borders from one seed via `rampFromSeed`. Generalize it:

```
deriveFamily(seed: { hue, chroma } | hex, mode) → TokenMap   // ramp-based, APCA on-color
```

Apply it to every ramp-shaped family:

- **primary** — `deriveFamily(accent, mode)` (unchanged behavior, refactored onto the shared deriver)
- **secondary** — `deriveFamily(neutralSeed, mode)` where `neutralSeed` = the background seed's hue/chroma (a neutral counterpart to primary; no second brand seed exists)
- **success / warning / error / information** — `deriveFamily(CANON[status], mode)` with `CANON` = the fixed canonical hues (calibrated to the existing `green/orange/red/blue` primitive ramp hues in `color.css`, so derived status matches what shipped)

Each family produces the same token shape it has today: `-background` / `-hover` / `-active`, `-foreground` (APCA on-color), `-disabled`, `-subtle` / `-subtle-hover` / `-subtle-active` / `-subtle-foreground`, and the matching `border-{family}` / `border-{family}-active`.

## Families NOT ramp-shaped

- **Surfaces** — keep the current `deriveSurfaces` (background seed + Δ steps). **Add a per-mode step model:** in `light`, `container` / `popover` / `muted` steps collapse to ≈0 (flat surfaces, elevation via border/shadow); in `dark`, keep the current stepping. (Q4.)
- **Text** — keep `deriveText` (APCA `quietText`).
- **Chart-categorical (×5)** — a fixed, colorblind-audited 5-hue set emitted as constants, re-toned L/C per mode. Not family-shaped.
- **Alpha / translucent** (`overlay`, `popover-backdrop`, `*-alpha`, `border-*-alpha`) — fixed-opacity formula: the neutral seed's hue/chroma at a fixed lightness (dark for scrims) and a fixed per-token α (mirrors the curated `slate-a700` overlay / `slate-a900` backdrop pattern, without shipping a separate alpha ramp).

## Public contract — unchanged

```
{ appearance: 'light'|'dark'|'system',
  light: { accent, background, foreground },
  dark:  { accent, background, foreground },
  contrast: 0..100 }
```

Status hues are fixed, chart is fixed, secondary + alpha are neutral-derived — so the engine needs **no new seed inputs**. "Surface tone" is a UI-level preset that sets `background`/`foreground` (+ a calibrated tone hue/chroma) on the contract; it is not a new contract field.

## Parity & cutover (the C-gate)

1. Calibrate the 5 named-tone seeds (background hue/chroma/L per mode) so the engine's neutrals match today's curated values within tolerance.
2. For each tone, sign off the derived light+dark result against the curated values (the comparison the `curated-vs-engine-tones` artifact performs) **before** deleting that tone's static CSS. A tone that can't be matched keeps its curated file and is logged as a follow-up.
3. The light surface-model change (Q4) is a deliberate, documented visual decision, not a regression.

## Invariants & tests

- **Token-parity test:** the set of `--nx-color-*` keys `deriveTheme` emits **equals** the curated base+brand key set — fails loudly on any omission (prevents silent freezing regressions).
- **APCA legibility sweep (extended):** the existing free-form-contract sweep must additionally cover every status family's `-foreground` on its `-background` and `-subtle`, and secondary's text/surface pairs, at the tier thresholds.
- **Colorblind:** the fixed chart set passes `audit:colorblind`.
- **Per-tone parity snapshot:** derived light+dark for each named tone is within tolerance of the curated values (the cutover gate).
- **No `light-dark()`** in emitted CSS (browserslist floor) — direct assertion on `themeToCss` output.

## Out of scope (Phase A)

- Packaging / `@nexus/react/appearance` / the provider (Phase B–D).
- Subtree-scoped theming (`themeToCss` stays `:root` / `:root.dark`).
- Whether the 5 curated base CSS files are _physically deleted now_ vs after the package extraction lands — Phase A makes them redundant and gates their removal; the actual deletion can ride with Phase D's console cleanup.

## Open items for the plan

- Exact canonical status hues/chromas (calibrate to `green/orange/red/blue` ramps in `color.css`).
- The fixed chart-categorical 5-set values (must clear `audit:colorblind` in both modes).
- Per-token alpha opacities for the translucent set (read from the curated `*-a*` primitives).
- The 5 tone-seed calibration values (the parity pass).
