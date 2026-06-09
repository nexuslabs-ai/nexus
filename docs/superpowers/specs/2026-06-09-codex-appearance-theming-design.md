# Codex — runtime appearance theming for Nexus

**Status:** Design (awaiting review) · **Date:** 2026-06-09 · **Owner:** @aishvarya

> A "Codex" product surface, built on Nexus, that reproduces the Codex
> **Appearance** screen pixel-faithfully — and, underneath it, a real
> **runtime theme-derivation engine** in `@nexus/core` that turns a compact
> set of user-editable appearance values into the full semantic token set,
> live, in the browser.

---

## 1 · Goal

Codex's "Appearance" screen is not a styled settings page — it is a **theming
contract**. A dozen user values (accent, background, foreground, a single
contrast scalar, fonts, translucency…) feed a derivation step that regenerates
the whole token set, and every component repaints from it.

Deliver the same capability in Nexus, in two layers:

1. **Engine** (`@nexus/core`): `deriveTheme(contract)` — pure, browser-safe
   TypeScript that expands the contract into the `--nx-color-*` semantic token
   set, reusing Nexus's existing OKLCH / perceptual-grid / APCA math.
2. **Screen** (`apps/console`): a new **Codex** scene that reproduces the
   Appearance screen faithfully and drives the engine live.

**Headline differentiator:** Codex's contrast slider is _manual_ — nothing
stops the user from producing illegible text. Nexus's derivation runs every
text/surface pair through the **APCA gate** (`adjustContrast`), so the same
free-form freedom yields **guaranteed-legible** output. Free input, safe output.

---

## 2 · Locked decisions

| Decision    | Choice                                                        | Rationale                                                                                                                                          |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine home | **`@nexus/core`**, new runtime export beside `adjustContrast` | The OKLCH/grid/APCA math already lives here; keeps the capability reusable by console, docs, and consumers.                                        |
| Screen home | **New scene in `apps/console`** (`modules/codex/`)            | Reuses the app shell, `ThemeProvider`, router, and `PageHeader`; fastest path to a runnable artifact. Models on the existing `AppearanceSettings`. |
| v1 scope    | **Pixel-faithful full screen**                                | Reproduce every row of the screenshot, the code-diff preview, all segmented controls and toggles — engine underneath.                              |

---

## 3 · Why this is mostly already true (grounding)

Verified against source before writing this spec:

- **The token cascade is 100% runtime CSS-variable-driven.** Utilities resolve
  `nx:bg-primary-background` → `var(--nx-color-primary-background)` →
  (a primitive) → `oklch(...)`. Overriding the variable at runtime repaints the
  whole UI. _(packages/tailwind/nexus.css `@theme` block; emitted utilities.)_
- **The injection point is `--nx-color-*` — proven.** The existing preset path
  swaps a pre-built CSS file (`apps/console/public/themes/base-*.css`,
  `brands-*.css`) that sets exactly these variables on `html` / `html.dark`, and
  theme switching demonstrably works today. A computed value must therefore be
  written to `--nx-color-*` (NOT the build-time `--color-*` `@theme` input).
  _(useTheme.ts:66–182; base-stone.css; brands-blue.css.)_
- **The derivation math is already browser-safe.** `adjustContrast(hex, …)`
  (snap any hex to a contrast-safe shade) is pure TS exported from `@nexus/core`
  — `culori` + `apca-w3` + static JSON imports, no Node. The ramp generator
  (`scripts/lib/perceptual-grid.js` → `hexToOklchPinned`) is identical math; its
  only Node coupling is `fs.readFileSync` of the two grid JSONs, which the
  `src/lib` copy replaces with a static `import` (as `adjust-contrast.ts`
  already does).
- **Nexus already ships a runtime theme layer + an Appearance page.** They are
  _preset-selection_ (1 of 5 bases × 1 of 6 brands, applied by CSS-file swap).
  This spec adds the **free-form derivation path alongside** the preset path —
  not instead of it. (Codex itself is presets — the "Codex ▾" dropdown +
  Import/Copy — _plus_ free-form overrides.)

**The only genuinely new stage is `derive()`.** Everything downstream is proven.

---

## 4 · Architecture

```
 contract (≈12 values, per-theme seeds)
        │
        ▼
 deriveTheme(contract)            ← @nexus/core, pure TS, reuses grid + APCA
        │   • accent → primary ramp (pinned L grid + P3-cusp chroma)
        │   • background + contrast → surface tiers (L-ladder)
        │   • foreground + contrast → text tiers (APCA-gated)
        │   • borders; keep status + secondary from base preset
        ▼
 DerivedTheme { light: Record<var,oklch>, dark: Record<var,oklch> }
        │
        ▼
 applyDerivedTheme()              ← console: inject ONE <style data-theme="derived">
        │   :root { --nx-color-…: oklch(…) }  .dark { … }
        ▼
 every Nexus component repaints (var() cascade — no per-element styling)
```

`applyDerivedTheme` is the runtime-generated analogue of the preset
`base-*.css` + `brands-*.css` files: same variables, same `html` / `html.dark`
scoping, computed in-browser instead of pre-built. It **coexists** with the
preset path; when a derived theme is active it simply layers after (and wins
over) the base/brand `<link>`s.

---

## 5 · The contract (data shape)

Mirrors the screenshot's structure, including its separate **"Dark theme"**
panel → per-theme seed blocks.

```ts
// @nexus/core
export interface ThemeSeeds {
  accent: string; // any CSS color → primary family ramp
  background: string; // → surface tiers
  foreground: string; // → text tiers
}

export interface CodexThemeContract {
  appearance: 'light' | 'dark' | 'system';
  light: ThemeSeeds;
  dark: ThemeSeeds;
  /** 0–100. Separation between background↔surfaces and foreground↔text. */
  contrast: number;
  /** Sidebar surface → alpha shade + backdrop-blur. */
  translucentSidebar: boolean;

  // Typography (CSS var overrides, not derived)
  uiFont: string;
  codeFont: string;
  uiFontSize: number; // px → root rem
  codeFontSize: number; // px

  // App preferences (NOT tokens — class/attr toggles)
  pointerCursors: boolean;
  reduceMotion: 'system' | 'on' | 'off';
  diffMarkers: 'color' | 'symbols';
  fontSmoothing: boolean;
}
```

The contract is a plain serializable object — this is the "theme-as-data" that
powers **Import** / **Copy theme** and named presets (§9). Nexus's console
already persists its `ThemeConfig` to `localStorage`; this is the richer
free-form sibling.

---

## 6 · The derivation engine (`deriveTheme`)

`deriveTheme(contract): DerivedTheme` returns a `{ light, dark }` pair of
`Record<cssVarName, oklchString>` maps. For each theme block it derives:

### 6.1 Accent → primary family

Reuse the pinned-ramp math (`hexToOklchPinned` ported to `src/lib`): parse the
accent, take its hue, and build a shade ramp by walking `PERCEPTUAL_L_GRID`
(50→950) at **P3-cusp chroma × 0.95** per shade (the "re-pitched" path,
generalized to an arbitrary hue since a free-form accent has no named hue
curve; chroma policy is a decision point — §10.5). Map to the 9 primary states
the same way `brands-blue.css` does:

| Token                              | Light                                   | Dark      |
| ---------------------------------- | --------------------------------------- | --------- |
| `primary-background`               | shade-600                               | 600       |
| `primary-background-hover`         | 700                                     | 700       |
| `primary-background-active`        | 800                                     | 800       |
| `primary-foreground`               | auto (black/white by APCA vs shade-600) | auto      |
| `primary-disabled`                 | 300                                     | 950       |
| `primary-subtle`                   | 50                                      | 950       |
| `primary-subtle-foreground`        | 600                                     | 300       |
| `primary-subtle-hover` / `-active` | 100 / 200                               | 900 / 800 |
| `border-primary` / `-active`       | 200 / 400                               | 700 / 500 |

### 6.2 Background + contrast → surface tiers

From the block's `background` L, build an elevation ladder. Direction is
theme-dependent (matching the base files): **dark elevates lighter**
(950→900→800), **light elevates/recesses subtly darker** (white→stone-50→100).
The **contrast scalar** sets the step size:

```
t   = contrast / 100
Δ   = lerp(Δ_min, Δ_max, t)        // PROPOSED: Δ_min ≈ 0.015, Δ_max ≈ 0.06 (tunable)
L_k = clamp(bg_L  ±  k · Δ, 0, 1)  // k = tier index; sign by appearance
```

Targets (with hover/active/`-alpha` variants): `background(-hover/-active)`,
`container(-hover/-active)`, `popover(-hover/-active/-alpha/-backdrop)`,
`muted`, `control-background(-hover)`, `nav-background`, `nav-item-hover`,
`nav-item-active`, `nav-border`, `disabled`, `overlay` (alpha shade),
`border-default(-alpha)`, `border-active`, `border-disabled`. Chroma follows the
background seed (tinted neutrals supported, e.g. a warm-gray canvas).

### 6.3 Foreground + contrast → text tiers (APCA-gated)

The **primary** foregrounds use the **seed as-is** when it already clears the
`body` floor on its surface, and are snapped only if they fail — so a pure-white
fg stays pure white while it's legible. The **muted** tiers are produced by
**`adjustContrast(foregroundSeed, { background: <the surface it sits on>, tier
})`**, which walks the grid and returns the first (lightest-touch) shade
clearing the tier — exactly the "as quiet as legibility allows" behaviour muted
text wants. Either way the APCA floor is enforced, so no contrast setting can
produce illegible text:

| Token                                                                        | APCA tier              | Sits on     |
| ---------------------------------------------------------------------------- | ---------------------- | ----------- |
| `foreground`, `container-foreground`, `popover-foreground`, `nav-foreground` | `body` (Lc ≥ 75)       | its surface |
| `muted-foreground`, `nav-muted-foreground`                                   | `ui` (Lc ≥ 60)         | its surface |
| `muted-foreground-subtle`, `disabled-foreground`                             | `incidental` (Lc ≥ 45) | its surface |

`contrast` biases _which_ tier target the muted ramp aims for (higher contrast →
push muted tiers toward `body`), but the APCA floor is always enforced.

### 6.4 Kept from the preset (not derived)

`error` / `success` / `warning` / `information` families and `secondary` retain
the loaded base/brand preset values — Codex does not expose status hues, and
keeping them preserves status semantics and APCA guarantees. `secondary` MAY be
re-derived from the background neutral ramp (decision point §10).

### 6.5 Output & application

`deriveTheme` is pure (returns the maps). A thin console helper
`applyDerivedTheme(derived)` serializes them into one `<style data-theme=
"derived">html{…}html.dark{…}</style>` and swaps it on change — mirroring
`loadCSS()` in `useTheme.ts`. `appearance` toggles `.dark` (existing path);
`system` honors `prefers-color-scheme`.

---

## 7 · Runtime wiring in console

- Extend the theme layer with a free-form mode. Cleanest: a sibling hook
  `useDerivedTheme(contract)` (effect-syncs the injected `<style>`), mounted in
  `ThemeProvider` next to `useTheme`. The preset path stays untouched; the Codex
  scene writes the contract, the hook injects.
- Persist the contract to `localStorage` (key `nexus-codex-contract`), sanitized
  on load exactly like `sanitizeTheme`.
- Typography/prefs: `uiFontSize` → root rem; fonts → `--nx-font-*`;
  `pointerCursors` → a `data-pointer` attr + cursor utility; `reduceMotion` →
  honor/override `prefers-reduced-motion`; `fontSmoothing` →
  `-webkit-font-smoothing`. These are CSS-var/attr toggles, not derivation.

---

## 8 · The screen (pixel-faithful)

Lives in `apps/console/src/modules/codex/`. Every row maps to a shipped Nexus
component; only three small **presentational** pieces are new (console-local —
candidates to promote to `@nexus/react` later, not in scope now):

| Screenshot element                                         | Nexus component(s)                                                                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Appearance" page title                                    | `PageHeader`                                                                                                                                                               |
| Theme · Light / Dark / System                              | `ToggleGroup` (single)                                                                                                                                                     |
| Code-diff `ThemeConfig` preview                            | **`ThemeConfigDiff`** (new) — 2-col syntax view of prev→next contract; honors the `diffMarkers` knob (color bg vs `+`/`-`), colored with `error-subtle` / `success-subtle` |
| "Dark theme" header · Import · Copy theme                  | `Button` (ghost/link)                                                                                                                                                      |
| Preset dropdown ("Codex ▾")                                | `Select` or `DropdownMenu`                                                                                                                                                 |
| Accent / Background / Foreground rows                      | **`ColorField`** (new) — swatch (native `<input type=color>`) + hex `Input`                                                                                                |
| UI font / Code font                                        | `Select` (font stacks) or read-only `Input`                                                                                                                                |
| Translucent sidebar / Use pointer cursors / Font Smoothing | `Switch`                                                                                                                                                                   |
| Contrast                                                   | `Slider` + numeric readout                                                                                                                                                 |
| Reduce motion · Diff markers                               | `ToggleGroup`                                                                                                                                                              |
| UI / Code font size (`px`)                                 | `InputGroup` (number + `px` addon)                                                                                                                                         |
| Row scaffolding (title + description + control)            | **`SettingRow`** (new layout helper)                                                                                                                                       |
| Section cards                                              | `Card` + `Separator`                                                                                                                                                       |

Faithfulness target: the screenshot's dark, dense, hairline-separated look,
reproduced via the contract itself (accent `#339CFF`, bg `#181818`, fg
`#FFFFFF`, contrast 60) — i.e. "Codex" ships as the default preset, dogfooding
the engine.

---

## 9 · Theme-as-data (Import / Copy / presets)

- **Copy theme** → `JSON.stringify(contract)` to clipboard.
- **Import** → parse + sanitize + apply.
- **Presets** (the "Codex ▾" dropdown) → a small registry of named
  `CodexThemeContract`s (`Codex`, plus a couple of Nexus-authored examples).
  Selecting one replaces the contract; editing any value forks to "Custom".

---

## 10 · Open decision points (confirm in review)

1. **Contrast scalar formula** (§6.2) — `Δ_min`/`Δ_max` and linear-vs-eased
   mapping are _proposed_, inferred from the screenshot's `contrast: 42→68`
   preview. Nexus has no 0–100 scalar today (it has discrete APCA tiers); this
   is new design. Needs a visual tuning pass.
2. **Dark derivation** — contract carries explicit `light`/`dark` seed blocks
   (faithful to Codex's "Dark theme" panel). Alternative: derive `dark` by
   inverting `light` L. Proposed: explicit blocks.
3. **`secondary` family** — keep from preset, or re-derive from the background
   neutral ramp. Proposed: keep (smaller, safer); revisit if it looks off.
4. **Spacing / radius / type density** — the screenshot's density is tighter
   than Nexus default. Use existing preset modes (`data-style`, radius CSS) set
   alongside the contract, or leave at default? Proposed: pin the Codex preset
   to a dense `data-style` + sharp radius; not part of `deriveTheme`.
5. **Accent chroma policy** (§6.1) — _proposed_ to take chroma at the P3 cusp
   (vivid, gamut-max) per shade, generalizing Nexus's re-pitched-hue path to any
   accent. Alternative: preserve the seed's own chroma, so a muted accent yields
   a muted ramp (more literal). Proposed synthesis: cusp chroma **capped at the
   seed's chroma** — punchy where the user asked for saturation, restrained
   where they didn't.

---

## 11 · Non-goals (v1)

- No changes to the build-time token pipeline or the preset CSS files.
- No new `@nexus/react` components (the 3 new pieces stay console-local).
- No WASM — `adjustContrast`/ramp math bundle as plain TS.
- Not theming status hues from the contract.
- No real diff _engine_ — `ThemeConfigDiff` is presentational.

---

## 12 · Testing

- **Engine** (`@nexus/core`, unit, `*.test.ts`): `deriveTheme` is a pure
  input→output function — ideal for fixture tests. Assert (a) known contract →
  expected key tokens, (b) **every** derived text/surface pair clears its APCA
  tier across a sweep of random accents/backgrounds (the legibility guarantee —
  the load-bearing invariant), (c) determinism.
- **Screen** (`apps/console`): the console has no story gate; a light
  render/interaction smoke test (drag contrast → a sampled `--nx-color-*`
  changes) is enough. New promotable pieces (`ColorField`) get stories only if
  promoted to `@nexus/react` (out of scope).
- `pnpm typecheck` + `pnpm lint` clean; `@nexus/core` size-limit re-checked
  (new exports + any culori surface).

---

## 13 · Rough phases (detailed plan via writing-plans)

1. **Engine core** — port `hexToOklchPinned` to `src/lib`; `deriveTheme` +
   types + the APCA-gated text/surface/accent derivations; unit tests incl. the
   APCA sweep. _(No UI — provable in isolation.)_
2. **Runtime application** — `useDerivedTheme` + `applyDerivedTheme` in console;
   contract persistence; the `Codex` default preset; verify live repaint.
3. **The screen** — `SettingRow`, `ColorField`, `ThemeConfigDiff`; assemble the
   pixel-faithful Appearance scene; register the route; wire every knob.
4. **Theme-as-data + polish** — Import/Copy/presets; typography & app-pref
   knobs; density preset; faithfulness pass against the screenshot.

```

```
