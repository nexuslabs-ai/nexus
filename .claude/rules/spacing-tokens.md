# Spacing Token Architecture Rules

> **Partial implementation status (post-#119).** The build pipeline now reads per-mode `semantic/spacing-{mode}.json` files and emits direct-px `[data-style="X"]` blocks; the `--nx-size-*` primitive layer is gone, `collectSpacingTokens` returns the per-mode shape, and `nx:px-control-*` / `nx:py-control-*` / `nx:p-container` / `nx:gap-layout-*` utilities are generated. Still pending: `validate-spacing-modes.js` schema validator (#125), `nexus/canonical-spacing-steps` and `nexus/prefer-role-utilities` lint rules (#127), the role-to-component-coupling enforcement (#128), and the canonical-step-set reconciliation noted under "Open Items" in PR #223. Treat sections in this file as the **spec the build now satisfies**, except for the validator + lint enforcement which are still ahead.

> Companion to `tokens.md`. Spacing has a different architecture than color, typography, radius, etc. — there is **no primitive size layer**. This file documents that decision, the rules that replace what primitives used to enforce, and the authoring patterns that follow from it.

## TL;DR

Spacing in Nexus is a **two-tier** system, not the three-tier (primitive → semantic → component) model used elsewhere in the project. Each mode (`vega`, `nova`, `maia`, `lyra`, `mira`, `luma`, `sera`) owns its own self-contained file with **direct px values** for both numeric tokens and role-named tokens.

There is no `--nx-size-*` primitive layer. Mode files do not reference primitives. Mode files reference px values directly.

## Why this differs from typography / color

Typography, color, radius, and shadow follow the canonical three-tier model:

```
primitive  →  semantic alias  →  component utility
--nx-color-blue-500  →  --color-primary-background  →  nx:bg-primary-background
```

Spacing was originally on this model too — `--nx-size-*` primitives feeding `--spacing-*` semantic aliases. **The model was abandoned for spacing** because:

1. **Cross-mode coupling.** Editing `--nx-size-9` to tune one mode broke every other mode that referenced it. The "additive primitive" workaround (only ever add new primitive values, never edit) added cognitive overhead without earning its place.
2. **Number mismatch confusion.** Under any per-mode remap (e.g., Lyra's `--spacing-4` pointing to `--nx-size-3`), the utility name `nx:p-4` no longer reflects its intuitive numeric value. The indirection made code harder to read, not easier.
3. **Authoring friction.** Mode authors had to think about which primitive to point to rather than just writing the desired value. The primitive layer became a gate, not an aid.

Spacing has more granular variance per mode than the other axes (every component's padding/height/gap shifts when density changes), so the coupling penalty hit harder. Typography has fewer roles and is more stable across modes — primitives still earn their keep there.

## The architecture

### File structure

```
packages/core/tokens/semantic/
├── spacing-vega.json     # Default mode
├── spacing-nova.json
├── spacing-maia.json
├── spacing-lyra.json
├── spacing-mira.json
├── spacing-luma.json
└── spacing-sera.json
```

No `packages/core/tokens/primitives/size/` directory. No `size.json`. Spacing primitives do not exist.

### What each mode file contains

Every mode file MUST contain the same set of keys — enforced by JSON schema validation in CI. Each key has a direct px value (or rem where the design system explicitly chose rem).

```json
{
  "spacing": {
    "0": { "$value": { "value": 0, "unit": "px" }, "$type": "dimension" },
    "0_5": { "$value": { "value": 2, "unit": "px" }, "$type": "dimension" },
    "1": { "$value": { "value": 4, "unit": "px" }, "$type": "dimension" },
    "1_5": { "$value": { "value": 6, "unit": "px" }, "$type": "dimension" },
    "2": { "$value": { "value": 8, "unit": "px" }, "$type": "dimension" },
    "...": "...",
    "96": { "$value": { "value": 384, "unit": "px" }, "$type": "dimension" }
  },
  "control": {
    "padding-x": {
      "sm": { "$value": { "value": 12, "unit": "px" }, "$type": "dimension" },
      "md": { "$value": { "value": 16, "unit": "px" }, "$type": "dimension" },
      "lg": { "$value": { "value": 32, "unit": "px" }, "$type": "dimension" }
    },
    "padding-y": {
      "sm": { "$value": { "value": 6, "unit": "px" }, "$type": "dimension" },
      "md": { "$value": { "value": 8, "unit": "px" }, "$type": "dimension" },
      "lg": { "$value": { "value": 12, "unit": "px" }, "$type": "dimension" }
    },
    "gap": {
      "sm": { "$value": { "value": 6, "unit": "px" }, "$type": "dimension" },
      "md": { "$value": { "value": 8, "unit": "px" }, "$type": "dimension" },
      "lg": { "$value": { "value": 10, "unit": "px" }, "$type": "dimension" }
    }
  },
  "container": {
    "p": { "$value": { "value": 24, "unit": "px" }, "$type": "dimension" },
    "gap": { "$value": { "value": 16, "unit": "px" }, "$type": "dimension" }
  },
  "layout": {
    "section-gap": {
      "$value": { "value": 32, "unit": "px" },
      "$type": "dimension"
    },
    "stack-gap": {
      "$value": { "value": 8, "unit": "px" },
      "$type": "dimension"
    }
  }
}
```

Top-level keys are `spacing` (numeric scale), `control`, `container`, `layout` — flat siblings, no enclosing wrapper. `$value` is a DTCG `{ value, unit }` dimension object.

> **Placeholder values for `control.gap.{sm,md,lg}`.** The `md` value of each mode is the pre-#230 single `control.gap` value; `sm` and `lg` are seeded with the formula `sm = md − 2`, `lg = md + 2`, snapped to the canonical step set. These are placeholders pending designer tuning — the formula encodes intent (a single density step away from `md` in either direction), not a final design call. Retuning per-mode is fine and expected; the schema only requires the three keys to exist with canonical values.

### Emitted CSS

The build emits one CSS block per mode, all in a single bundle:

```css
:root,
[data-style='vega'] {
  --nx-spacing-0: 0px;
  --nx-spacing-1: 4px;
  --nx-spacing-2: 8px;
  /* ... */
  --nx-control-padding-x-md: 16px;
  --nx-control-padding-y-md: 8px;
  /* ... */
}

[data-style='nova'] {
  --nx-spacing-3: 10px;
  /* ... */
  --nx-control-padding-x-md: 12px;
  --nx-control-padding-y-md: 6px;
  /* ... */
}
```

Mode swap = change the `data-style` attribute on `<html>` (or any subtree). CSS variable cascade handles the rest. No rebuild.

### The `data-style` attribute carries spacing density only

`data-style` is the spacing-density attribute. It carries one value at a time (`vega`, `lyra`, `maia`, `mira`, `nova`, `luma`, `sera`) and resolves only the `--nx-spacing-*` / `--nx-control-*` / `--nx-container-*` / `--nx-layout-*` overrides.

If a future per-mode semantic category lands (per-mode color shading, per-mode shadow, etc.), it ships its **own** attribute name (e.g., `data-shadow-mode`, `data-color-density`). `data-style` does not multiplex — the contract is one attribute per per-mode axis, so consumers can compose densities independently (`<div data-style="mira" data-shadow-mode="vega">`) without one attribute meaning two things.

## The canonical step set

Without primitives, the scale must live as a project rule. **All numeric spacing values used in any mode file MUST be drawn from this set:**

```
0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256, 320, 384
```

These are the px values the design system has chosen as its scale. Any value outside this set (e.g., `5px`, `11px`, `17px`) is forbidden in mode files. The set is large enough to express any mode's needs across density variants while small enough to keep visual rhythm consistent.

**Half-step values (1px, 3px, 5px) are not in the canonical set** by design. If a mode needs an odd-pixel value, this is a signal to revisit the mode's design intent rather than introduce off-grid values.

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
- **No `control-h` token.** Control heights are intrinsic — they emerge from `py-control-{size}` + the control's content (text line-height or icon size). The earlier `--control-h-*` axis was over-specified (both `h` and `py` set together meant the visual padding eaten by content overflow didn't match the designer's `py` value). Cross-control alignment is achieved by Button / Input / Select / Tabs / Badge sharing the same `py-control-{size}` and same text-size body.
- ❌ Don't write raw px values (`style={{ padding: '10px' }}`). Always go through a token.
- ❌ Don't use `nx:p-[5px]` arbitrary-value escape hatches. If the canonical set doesn't have what you need, propose the change to the set.

### For LLMs / agents generating component code

Load these into context when generating Nexus FE code:

1. **The `nx:` prefix is mandatory.** Vanilla `p-3` does not work — every utility must be prefixed.
2. **Canonical step set above.** Any spacing value emitted should map to one of these.
3. **Role-named utilities take priority over numeric** when a clear role applies. Button padding → `nx:px-control-md`, not `nx:px-2.5`.
4. **Mode switching is via `data-style="X"` attribute** on the root or a subtree. To make a component appear in compact density, wrap it in `<div data-style="mira">`.

## Schema validation _(planned — #125)_

CI **will** enforce that all 7 mode files have **identical key sets**. The schema is to be generated from `spacing-vega.json` (the canonical default) and applied to all other modes. A mode file with missing or extra keys will fail the build.

Planned implementation: `scripts/validate-spacing-modes.js` reads the Vega key set and validates the other six against it. Will run in pre-commit hook and CI. Tracked by #125. Until it lands, parity is enforced indirectly by the cross-mode CSS-variable-name parity assertion in `generate-tailwind-package.test.js`.

## Lint rules _(planned — #127)_

Two ESLint/Stylelint rules **will** guard the architecture:

1. **`nexus/canonical-spacing-steps`** — flags any spacing value in `spacing-*.json` mode files outside the canonical step set. Configurable via the canonical step list in this rule file.
2. **`nexus/prefer-role-utilities`** — flags raw numeric utilities (`nx:p-N`, `nx:h-N`, `nx:gap-N`) in `packages/react/src/components/ui/*.tsx` files when a role-named utility would apply. Reads the role-to-component coupling table (see below). Allow-list with `// nexus-allow-numeric: reason` comment.

Both rules are tracked by #127. Until they land, the architecture is enforced through review.

## Role-to-component coupling table

Components should use specific roles for specific spacing decisions. This table is authoritative; lint rule #2 references it.

> **Status: target state, not current code.** Button / Input / Select / Tabs / Badge currently use numeric `nx:p-N` utilities; #123 is the migration that moves them onto these role tokens. Read this table as the post-#123 contract that `nexus/prefer-role-utilities` (#127) will enforce — not as a description of what's shipped today.

| Component                                | Role used for                     | Tokens                                                                 |
| ---------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Button (default)                         | padding-x, padding-y, gap         | `--control-padding-x-md`, `--control-padding-y-md`, `--control-gap-md` |
| Button (sm)                              | padding-x, padding-y, gap         | `--control-padding-x-sm`, `--control-padding-y-sm`, `--control-gap-sm` |
| Button (lg)                              | padding-x, padding-y, gap         | `--control-padding-x-lg`, `--control-padding-y-lg`, `--control-gap-lg` |
| Button (icon)                            | square padding (numeric)          | `nx:p-2.5` (10px, canonical step) — see note below                     |
| Input (default)                          | padding-x, padding-y              | `--control-padding-x-md`, `--control-padding-y-md`                     |
| Select trigger                           | padding-x, padding-y, gap         | `--control-padding-x-md`, `--control-padding-y-md`, `--control-gap-md` |
| Tabs trigger                             | padding-x, padding-y (sm/md)      | `--control-padding-x-{sm,md}`, `--control-padding-y-{sm,md}`           |
| Tooltip                                  | padding-x, padding-y              | `--control-padding-x-sm`, `--control-padding-y-sm`                     |
| Badge / Chip                             | padding-x, padding-y (sm)         | `--control-padding-x-sm`, `--control-padding-y-sm`                     |
| Card                                     | interior padding, gap             | `--container-p`, `--container-gap`                                     |
| Card header                              | container padding                 | `--container-p` (sub-element offsets use numeric `spacing-N`)          |
| Dialog                                   | interior padding, gap             | `--container-p`, `--container-gap`                                     |
| Avatar                                   | (uses sizing tokens, not spacing) | N/A — see `nx:size-*` numeric utilities                                |
| Section between blocks                   | vertical gap                      | `--layout-section-gap`                                                 |
| Stack utility                            | gap between siblings              | `--layout-stack-gap`                                                   |
| Page gutter, inline groups, layout-level | (no named role yet)               | Use numeric `spacing-N` from canonical step set                        |

When a new component is authored, the author adds a row to this table.

**Note — Button (icon) is intentionally density-stable.** An icon-only button has no text to scale and no role-family token (`p-control-*`) exists for square padding. Using `--control-padding-x-{size}` and `--control-padding-y-{size}` together would scale the icon button's hit target down in compact modes (e.g., nova: 12px + 6px ≠ square; the icon becomes vertically squeezed) — so icon buttons stay on the canonical numeric step `nx:p-2.5` (10px). Hit-target size remains identical across all 7 modes by design. A future `--control-icon-p-{size}` family could change this if the design system wants density-aware icon buttons; out of scope for this iteration.

## How this relates to Figma

The Figma side of Nexus mirrors this architecture. Figma Variables for spacing live in mode-specific collections (one per mode), each with the same key set as the JSON mode files. There is no Figma "spacing primitives" collection.

The `audit:figma-parity` script **will** compare each mode's Figma collection against the corresponding `spacing-{mode}.json` file — same intent as the existing color audit, but mode-scoped. The `spacing` category is `Pending` in [`figma.md`](figma.md)'s categories table (tracked under the #117 epic); the audit only supports `--category color` today.

## When to revisit

Architectural decisions are not load-bearing forever. The conditions under which this design would need to be revisited:

- **A real consumer asks for a per-step ad-hoc value** that doesn't fit the canonical set, and the answer "extend the canonical set globally" causes design friction repeatedly. Indicates the canonical set is too restrictive or too coarse.
- **The schema validation gates become a productivity tax** because adding a new role requires touching 7 files. If this happens frequently, consider introducing a tooling helper that prompts for "value per mode" once and writes all 7 files.
- **Mode count grows beyond ~10.** The "all modes must have all keys" rule scales linearly; at 10+ modes it becomes painful. Revisit then.

The architecture is **correct for the current scope** (7 modes, ~20 roles, ~30 numeric steps). It is not necessarily correct at 20 modes and 50 roles.
