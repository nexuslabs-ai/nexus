# Full-Token Derivation — Design Spec (Epic Phase A)

**Date:** 2026-06-26
**Status:** Approved design; pending implementation plan (`writing-plans`). Revised after external review (surfaceTone, light-surface model).
**Part of:** [Appearance Theming → Nexus Package APIs epic](../plans/2026-06-26-appearance-package-extraction-epic.md) — this is **Phase A**, the gating workstream. B/C/D depend on the token surface this spec settles.

## Problem

`deriveTheme` today emits ~66 of the ~156 `--nx-color-*` tokens (surfaces, text tiers, primary). The remaining ~90 — the four **status** families, **secondary**, the five **chart-categorical** colors, and the **alpha/translucent** tokens — cascade from a static curated base CSS file. Consequence: if a consumer drops the per-tone `<link>` (the goal of the package extraction), those ~90 tokens freeze at the baked default tone. So a "surface tone" or custom brand is only ~40% real.

## Goal

Extend the engine so its output token **key set** equals the curated set — every `--nx-color-*` key is derived, none cascades from static CSS. Values are gated by family: dark tone values match curated, light tone values match the new evident-tone contract, and status/secondary/chart values keep their own exact gates. The engine becomes the single source of truth; static base CSS is retired **per-tone, gated on parity**. The neutral surface family is selected by a first-class **`surfaceTone`** enum.

## Decisions (recorded)

| #   | Decision                                                                                                                                                                                                                                         | Rationale                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Status hues fixed canonical** (existing green/orange/red/blue ramp hues), tiers re-toned per mode + APCA-gated. Warning uses the orange ramp but promotes its solid tier to `orange.700` so emitted success/warning clear the colorblind gate. | Status carries meaning (red = danger); keep meaning stable, guarantee legibility. Brand expresses via primary/accent.                                                                    |
| Q2  | **Chart-categorical = fixed curated primitive set**, re-toned L/C per mode. Light chart series 1/2 use `teal.700` and `green.700` so chart marks clear both APCA on light paper and colorblind pairwise distinguishability.                      | Categorical distinguishability and readable filled marks are correctness; must pass derived APCA and `audit:colorblind` without bespoke chart-only colors.                               |
| Q3  | **Engine = single source of truth**; drop static base CSS, **gated** per-tone on parity sign-off                                                                                                                                                 | Keeping static base files alongside the engine reintroduces the dependency the engine exists to retire + the source-order race.                                                          |
| Q4  | **Per-mode surface model: dark stepped; light flat for base `container`/`popover` only** — `muted` and `*-hover`/`*-active` stay stepped + tone-tinted in light                                                                                  | Matches curated (light keeps base surfaces white, but `muted`=tone-50, `container-hover`=tone-50 — so containers still get hover feedback). Tier-A light surfaces are flat-with-borders. |
| Q5  | **`surfaceTone` is a first-class contract enum** (`stone\|neutral\|zinc\|slate\|gray`), NOT a hidden derivation                                                                                                                                  | The neutral surface family is a product choice the consumer makes explicitly. (See _Contract_ below — this reverses the earlier "no new inputs" stance.)                                 |

## Contract — **changed** (surfaceTone added)

```
{ appearance: 'light'|'dark'|'system',
  surfaceTone: 'stone'|'neutral'|'zinc'|'slate'|'gray',   // optional, default 'neutral'
  light: { accent, background, foreground },
  dark:  { accent, background, foreground },
  contrast: 0..100 }
```

**Why the contract changes now:** Phase B freezes the public package API, so the abstraction must be right _before_ freezing — patching it after is a breaking change for consumers. The earlier "no new inputs" rule is **retired**.

**Why `surfaceTone` and not "derive the tone from a seed":** curated light themes used a **pure-white `background`** seed (chroma 0) while still carrying **tone-tinted** `muted` / `nav` / `border-active` / `overlay` (e.g. `overlay: slate-a700`). The tint cannot come from the white background seed. The rejected alternative — read the tone from the _dark-block_ background seed — works but makes light-mode tint secretly depend on the dark seed: spooky cross-mode coupling, and `background` would mean two different things. An explicit `surfaceTone` says what it means: _the input seed may be white; the emitted light paper and surfaces are Slate._

## Core abstraction — one family deriver

Generalize `derivePrimary` into `deriveFamily(name, ramp, mode)` — it takes a **ramp object** + APCA-derived on-colors (including an APCA-checked `-subtle-foreground`, not a hoped-to-pass fixed shade), applied to:

- **primary** — `deriveFamily('primary', rampFromSeed(accent), mode)` (brand-derived)
- **success / warning / error / information** — `deriveFamily(name, STATUS_RAMP[name], mode)`, where `STATUS_RAMP` is the **fixed curated** green/orange/red/blue ramps. Status is emitted from the curated ramps, **not** regenerated via `rampFromSeed` (Nexus's perceptual grid need not reproduce the curated primitive ramps — so regrinding would shift the status hues). Warning keeps the orange ramp but uses `orange.700` as its solid background (`orange.800`/`orange.900` for hover/active) to clear the derived colorblind gate against success.

**Secondary is NOT this shape.** A dedicated `deriveSecondary(mode)` emits a **subtle tone-independent neutral** surface family (curated maps it to `neutral-*` in every brand: light `bg=100/fg=900`, dark `bg=900/fg=100`) — not a solid ramp-600.

## Surfaces, nav, borders, alpha — tinted by `surfaceTone`

- **`deriveSurfaces(background, surfaceTone, mode, delta)`** — lightness from the step model; **hue/chroma from `surfaceTone`** via two baked anchors, `lightC` and `darkC` (see Q6). In **light**, tinted tones anchor at a **paper lightness ≈ 0.987** (not pure white — white can't hold the tint) so the tone is visible; `neutral` stays white. In **dark**, surfaces carry `darkC` and use a calibrated dark step table so tone-owned surfaces line up with the curated 950/900/800/700/400 ladder. Only base `container`/`popover` flatten in light (Q4); `muted` + states stay stepped, tone-tinted.
- **nav + `border-active`** flow through the surface machinery (opaque, tone-tinted; add `nav-border` to the step set). **`border-default` / `border-disabled` are ALPHA** (contrast-ink: black light / white dark) — emitted by `deriveAlpha`, **not** opaque surface steps.
- **`deriveAlpha(surfaceTone, mode)`** — the translucent "ink" carries the **tone** tint (slate overlay ≠ neutral overlay), at mode-specific α (overlay 0.7529/0.8471, border-default-alpha 0.0941/0.1882, popover-backdrop 0.9098; `popover-alpha` is white in light, tone-ink in dark).
- **text** — keep `deriveText` (APCA `quietText`). **chart** — fixed colorblind set, re-toned per mode.

## Evident light-mode tones (Q6)

**Decision:** light surfaces carry a deliberate tonal tint — the page **paper** (background) _and_ the surfaces on it — so the five tones are _nameable at a glance_ in light, not only in dark. Degree **B** (clearly tonal: warm-paper stone vs cool-paper slate), mechanism **C** (tinted paper + tinted surfaces), strength **Tonal**, baked into `SURFACE_TONE` (a design-time calibration, **not** a runtime knob). This **diverges from curated/Tailwind** (whose light ramps are near-neutral) — a conscious Nexus stance, folded into Phase A calibration.

**Why a paper tint is required:** chroma rides on darkness — at pure-white lightness there's no gamut room for tint, so curated light tones are imperceptibly different. Holding a visible tint means dropping the light paper off pure `#fff` to ≈ 0.987 lightness, where a small chroma reads as colored paper.

**Baked calibration (Tonal):**

| tone    | hue    | lightC (paper) | darkC | reads as   |
| ------- | ------ | -------------- | ----- | ---------- |
| slate   | 264.7° | 0.011          | 0.040 | cool       |
| gray    | 261.7° | 0.008          | 0.027 | cool-mid   |
| zinc    | 262.8° | 0.005          | 0.005 | faint cool |
| stone   | 70°    | 0.008          | 0.006 | warm       |
| neutral | —      | 0              | 0     | true grey  |

**Known limit (accepted):** slate / gray / zinc share the cool hue family (~262–264°), so in light they differ by _intensity_, not hue; only stone (warm) and neutral (grey) are hue-distinct. Stronger per-tone light separation would require spreading the tone hues — out of scope for Phase A (it would redefine the tones).

**Consequences:** (1) light `--nx-color-background` is tinted paper, **not pure `#fff`** (documented divergence; iOS/macOS do the same). (2) The tone-parity gate is **mode-split** — dark vs curated, light vs the new evident values (see Invariants).

## Parity & cutover (the C-gate)

1. Calibrate each `surfaceTone`'s hue/chroma + the light step magnitudes with a mode-split gate: **dark** tone-owned values match today's curated values within tolerance; **light** tone-owned values match the committed evident-tone fixture within tighter tolerance because light intentionally diverges from curated near-white.
2. Per-tone sign-off **before** deleting that tone's static CSS. **Phase A is not complete until all five tones pass** (no silent "keep the curated file" follow-up). A genuinely unmatchable token becomes an _explicit, documented_ public-contract item, not a silent residual.

## Invariants & tests

- **Exact key-parity test:** derived `--nx-color-*` keys **exactly equal** (no missing, **no extras**) the curated set in **both** modes — sourced from `@nexus/core`'s own `tokens/semantic/*.json` (base + brand + chart), never `apps/console`.
- **APCA sweep (extended):** every status family **and secondary**, `-foreground` on `-background` **and** `-subtle-foreground` on `-subtle`, both modes.
- **Colorblind:** the fixed chart set passes `audit:colorblind`; derived status backgrounds use emitted `success`/`warning`/`error`/`information` values, including the retuned orange warning solid, rather than relying only on the static primitive helper.
- **Tone parity (mode-split):** **dark** tone-owned surfaces match **curated** within tolerance; **light** tone-owned surfaces match the new calibrated **evident-tone** fixture (light deliberately diverges — curated light is near-white). Every named tone visibly tints **light** `paper`/`muted`/`nav`/`border-active`/`overlay` (differs from `neutral`), not only dark. The gate classifies every base semantic color leaf as tone-owned, contrast/text ink, fixed-white, status/brand/chart/secondary, or intentionally excluded, and fails on unclassified leaves; text value quality remains covered by APCA because the engine emits opaque APCA-derived text instead of literal alpha text primitives.
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
