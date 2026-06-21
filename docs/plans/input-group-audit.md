# InputGroup Audit — Input fixed-height parity (implemented)

> **Status:** Implemented and combined with the Input fixed-height audit into a
> single PR against `prasad/components-cleanup`.
> Council-reviewed (4-lens) and advisor-checked before implementation.

## What shipped

Aligns the visible **InputGroup field frame** with the completed fixed-height
`Input` (`h-8`/`h-10`/`h-12`, `py-0`, semantic state tokens) while preserving
InputGroup's composition API and native input behavior. Two files changed:
`input-group.tsx` and `InputGroup.stories.tsx`.

## Hard dependency (sequencing)

The mechanism keys on the **new Input** (`data-size={size ?? 'default'}` +
`h-8/h-10/h-12` + semantic state tokens). The old Input (`data-size={size}`,
`py-control-*`, `opacity-50`) makes it inert — a default control emits no
`data-size`, so the height selector never matches. Because of this dependency, the InputGroup work and the Input fixed-height audit
ship together in a **single combined PR** to `prasad/components-cleanup` — the
InputGroup changes cannot land without the new Input.

## 1. Outer height parity (`sm` h-8 · default h-10 · lg h-12)

The wrapper carries the height, reacting to the control's `data-size` via
`:has()` — **no new prop** (sized via `<InputGroupInput size>`, mirroring
`<Input>`). Scoped to the inline (non-block) row so stacked layouts and the
textarea group are never clipped:

```
nx:not-has-[>[data-align=block-start]]:not-has-[>[data-align=block-end]]:has-[[data-slot=input-group-control][data-size=sm]]:h-8
…[data-size=default]:h-10
…[data-size=lg]:h-12
nx:not-has-[>[data-align=block-start]]:not-has-[>[data-align=block-end]]:[&>input]:h-full
```

- **Border doesn't add height:** `box-sizing: border-box` is in effect
  (`@import 'tailwindcss'` ships the preflight), so wrapper `h-10` = 40px
  _including_ its 1px border = exact standalone-Input parity. Confirmed.
- **Mutually exclusive** scoping — no two `height` rules ever both match (no
  source-order/specificity footgun).
- **Child fill from the wrapper, not the child** — `[&>input]:h-full` wins over
  Input's own `h-*` by selector specificity (compound `:has()` descendant); in
  the stacked case it's released and the control keeps its own height.
- **Heights are mode-variant** (`h-8/10/12` = `--nx-spacing-8/10/12`): vega
  32/40/48, nova 30/38/46, maia 36/44/52. Parity is "same utility, follows the
  mode," matching Input — verified in `nexus.css`.
- **Emission verified** in built `dist/react.css`:
  `:not(:has(>[data-align=block-start])):not(:has(>[data-align=block-end])):has([data-slot=input-group-control][data-size=default]){height:var(--nx-spacing-10,40px)}`

## 2. `InputGroupInput`

Keeps native `<input>` via `Input`; `flex-1 rounded-none border-0 bg-transparent
focus-visible:outline-none`; passes `size` through (per-size `px`/typography +
`data-size`). Dropped the redundant `shadow-none` (Input has no shadow). Height
comes from the wrapper's `[&>input]:h-full` (inline) or Input's own `h-*`
(stacked).

## 3. Visual-state parity with Input

| State           | Implementation                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rest surface    | `nx:bg-background` (prerequisite for hover parity)                                                                                                                                                     |
| Hover           | `nx:not-data-[disabled=true]:hover:bg-background-hover` (matches Input's hover token; a `<div>` is never `:enabled`, so gated on `data-disabled` rather than copying Input's `enabled:hover`)          |
| Disabled        | `nx:data-[disabled=true]:{bg-disabled,border-border-disabled,cursor-not-allowed}`; addon dims via `group-data-[disabled=true]/input-group:text-disabled-foreground` (semantic, **opacity-50 removed**) |
| Invalid border  | `nx:has-[[data-slot][aria-invalid=true]]:border-border-error` (unchanged)                                                                                                                              |
| Invalid + focus | `nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-focus-error` (specificity 0,4,0 > the default ring's 0,3,0)                                                         |
| Shadow          | **removed `nx:shadow-xs`**; `transition-[color,box-shadow]` → `transition-colors` (parity + components.md "inputs rely on border, not shadow")                                                         |

## 4. Scope boundaries (held)

No Button `min-w-*`; no new InputGroup props / Geist-style API (height is
`:has()`-reactive); **`InputGroupTextarea` unchanged** — the height/fill rules
are inline+input-scoped, so the textarea (block, auto-height, no `data-size`)
is untouched (its base-`Textarea` `opacity-50` is a separate audit — disclosed
cross-control inconsistency); no manual edits to generated base-variant stories.

## Retained from the earlier audit pass

Addon offset canonicalization (`has-[>button]:-ml-2`/`-mr-2`,
`has-[>kbd]:-ml-1.5`/`-mr-1.5`); `InputGroupButton` typography composite +
`data-slot="input-group-button"`; `InputGroupText` `data-slot`; the four named
prop types (`InputGroup/Text/Input/Textarea Props`, repo convention,
lint-safe via `allowInterfaces: 'with-single-extends'`).

## 5. Stories / tests (mirroring the completed Input)

- **`Sizes`** — sm / default (implicit) / lg, visual.
- **`HeightsFollowModes`** — vega-scoped; asserts control `data-size` + outer
  group computed heights 32/40/48 (`expectHeightPinned` with the group selector).
- **`VisualStateTokens`** — hover class + semantic disabled classes; addon
  `opacity === '1'` (proves opacity dim is gone).
- **`Invalid`** — `aria-invalid` attribute + invalid-vs-valid `borderTopColor`
  differs (always-on error border, focus-independent).
- **`WithKbd`** — addon `marginRight === '-6px'` (canonical `-1.5` step).
- **`WithDataAttributes`** — asserts all five slots + control `data-size` +
  button `data-size`.

> The earlier plan's "assert addon `opacity: 0.5`" item is **flipped**: opacity
> dimming is gone, so `VisualStateTokens` asserts the semantic token + `opacity
=== '1'` instead.

## Verification

| Gate                                                                          | Result                                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm --filter @nexus/react typecheck`                                        | clean                                                                        |
| `pnpm lint` (`eslint . --max-warnings 0`)                                     | clean                                                                        |
| `prettier --check` (changed files)                                            | clean                                                                        |
| `pnpm --filter @nexus/react audit:storybook-coverage --component input-group` | `0 missing, 0 drift, 2 info` (pre-existing info)                             |
| CSS emission (`dist/react.css`)                                               | all new utilities emit (height/fill/error-focus/offsets/disabled-text/hover) |

**`#429` caveat:** the storybook vitest gate collects 0 tests on this base
(the #429 fix isn't in `f17957a`), so the new play-fn pins don't _execute_ until
#429 lands. Verification meanwhile = typecheck + lint + audit + CSS-emission
grep + by-hand height math. "Green Test (React)" ≠ interaction tests ran.
