# Storybook Rules

**Note:** All Tailwind utility classes in stories must use the `nx:` prefix (e.g. `nx:flex nx:gap-2`).

## File Naming

Stories file: `{ComponentName}.stories.tsx` (PascalCase) — e.g. `Button.stories.tsx`, `Card.stories.tsx`. No separate `*.test.tsx` for components; tests live in stories.

## Adaptation Note

The templates assume components with `variant`, `size`, `disabled`, and `asChild` props — adapt to the actual component API:

| Component Type              | Typical Stories                   |
| --------------------------- | --------------------------------- |
| Interactive (Button, Input) | Variants, Sizes, Disabled, States |
| Container (Card, Dialog)    | Default, WithContent, Composition |
| Display (Badge, Avatar)     | Variants, Sizes                   |
| Layout (Separator, Spacer)  | Default, Orientation              |

Skip sections that don't apply; add component-specific stories as needed.

## Meta Configuration

`meta` sets `title` (`Components/{Name}`), `component`, `args` (with `fn()` spies from `storybook/test` for callbacks), `parameters.layout`, and `argTypes` (a `control` type + `description` per prop — `select` for enums, `boolean` for flags). Export `meta` as default and `type Story = StoryObj<typeof Component>`. See any shipped `*.stories.tsx` for the exact shape.

## Required Stories

Every component has: **Default**; one story **per variant** and **per size**; **Disabled**; the interaction stories (**ClickInteraction**, **KeyboardInteraction**, **WithDataAttributes**, each with a play function); **asChild** where applicable; edge cases (empty / long content); and an **AllVariants** showcase. `testing-react.md` owns the canonical required-stories matrix and the archetype-equivalence contract.

### AllVariants Grid

A single render-based story that lays out every variant / size / disabled group in labelled rows (`layout: 'padded'`). It's the showcase the per-base variant generator reuses (see § Per-Base Variant Generation), so it must be `render`-based, not args-only.

## Layout Parameters

| Layout       | Use Case                               |
| ------------ | -------------------------------------- |
| `centered`   | Single component display (default)     |
| `padded`     | Multi-component grids like AllVariants |
| `fullscreen` | Full-page components                   |

## Theme Testing

The Storybook toolbar has a theme toggle; stories support light mode (default) and dark mode (via a `.dark` class wrapper) automatically.

## Running Storybook

`yarn storybook` runs the dev server (port 6006); `yarn build-storybook` builds the static site.

## Story Organization

Stories appear in the sidebar under `Components/{ComponentName}`.

## Autodocs

Autodocs is enabled globally in `.storybook/preview.tsx` (`tags: ['autodocs']`) — every story gets a component description, props table, interactive playground, and the story examples. Exclude a single story with `tags: ['!autodocs']`.

## Play Functions (Testing)

Interactive component stories include play functions — stories serve as both documentation and tests. Required play-function stories:

| Story               | Tests                                     |
| ------------------- | ----------------------------------------- |
| Disabled            | Verify disabled state, click does nothing |
| ClickInteraction    | Click triggers handler                    |
| KeyboardInteraction | Tab focuses, Enter/Space triggers         |
| WithDataAttributes  | Verify data-slot, data-variant, data-size |

Import test helpers from `storybook/test` (`expect`, `fn`, `userEvent`, `within`) — Storybook 10, **not** `@storybook/test`. Spy on callbacks with `fn()` in `meta.args`, then assert with `expect(args.onClick).toHaveBeenCalledTimes(...)`. Run story tests with `yarn test:storybook` (plus `:watch`, `:ui`).

### A11y Testing

A11y is automatic via `addon-a11y` with `a11y: { test: 'error' }` in preview — every story is checked against axe-core (keyboard nav, ARIA semantics, focus management, role/landmark structure) and violations fail the test.

**Color contrast is APCA-gated, not axe-gated.** Axe-core's `color-contrast` (and `color-contrast-enhanced`) rules are disabled in `preview.tsx` because they enforce WCAG 2.x ratios that don't match Nexus's APCA tier model. Color contrast is verified at the token layer by `yarn workspace @nexus/core audit:contrast` (see [tokens.md § APCA contrast gate](tokens.md#apca-contrast-gate)); stories carry no responsibility for re-checking it.

## Per-Base Variant Generation

Nexus's headline claim is perceptual consistency across its 5 bases (slate / neutral / gray / stone / zinc). To make that claim _visible_, a generator emits one story per component that renders the component's existing showcase across **all 5 bases × 2 themes** in a single grid — 10 permutations per component, from one template, not hand-written.

### What it produces

`packages/react/scripts/generate-base-variants.mjs` reads `base-variants.config.json` and writes to `packages/react/src/components/__generated__/` (gitignored, regenerated on every run):

| Output                             | Contents                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `base-variants.css`                | Each base's semantic tokens scoped to `[data-nexus-base="…"]` (light) / `[data-nexus-base="…"].dark` (dark)  |
| `{Name}.base-variants.stories.tsx` | One per component — a 2×5 grid (light/dark rows × 5 base columns), under the `Base Variants/*` sidebar group |

The stories run as render/smoke tests under `@storybook/addon-vitest` — they assert each base × theme renders without throwing, not pixel output. Pixel-level visual-regression diffing is a deliberate non-goal of this generator (no Chromatic); these grids exist for side-by-side human comparison.

### Opting a component in

Add an entry to `packages/react/scripts/base-variants.config.json` like `{ "name": "Button", "showcase": "AllVariants" }`:

- `name` — the component. Used as the sidebar title, the output filename prefix, and to locate the canonical stories module (`../ui/{name}.stories`).
- `showcase` — a **render-based** export from that module (e.g. `AllVariants`; Avatar uses `AllSizes`). The generator reuses this story's `render()` directly, so it must not be args-only. Generation fails fast if the stories file is missing, the export is absent, or the export has no `render:` (args-only).

Then re-run `yarn workspace @nexus/react generate:base-variants` (or just `yarn storybook` — see Lifecycle below).

### How the scoping works

Tailwind utilities here read **prefixed** theme variables (`nx:bg-background` → `var(--nx-color-background)`), because `@import 'tailwindcss' prefix(nx)` prefixes the `@theme` vars. So the generator emits `--nx-color-{token}: var(--nx-color-{primitive})` scoped to `[data-nexus-base]`. Each grid cell carries `data-nexus-base={base}` (and `dark` on dark rows), so every token-driven utility inside it resolves to that base+theme through CSS custom-property inheritance. Primitives are global (`variables.css` ships all palettes), so the refs resolve everywhere.

Each cell emits the **full** semantic set (base + the `neutral` brand) for its theme, so a cell is hermetic — it never inherits a leaked `--nx-color-primary-*` from the global `.dark` decorator when the toolbar is flipped.

### Conventions specific to generated stories

- **Inline styles, not `nx:` utilities, for the grid scaffolding.** The wrapper (grid, cell chrome) uses `style={{ … 'var(--nx-color-…)' }}`. This is the one place the `nx:`-prefix rule is intentionally relaxed: generated files are gitignored, and Tailwind's content scanner ignores gitignored paths — so an `nx:` class used _only_ here would never be emitted. The actual component content comes from the reused showcase, whose classes are emitted from the (scanned) canonical story file.
- **Component decorators are applied; the global one is not.** The reused showcase is wrapped in its own meta + story decorators (e.g. Tooltip's `TooltipProvider`, Input's width wrapper) so it renders faithfully — but the global preview decorator (dark / centering wrapper) is skipped so each cell controls its own theme via `data-nexus-base` + `.dark`.
- **`a11y: { test: 'off' }`** — a11y and contrast are covered by the canonical stories and `yarn workspace @nexus/core audit:contrast`; these grids are visual-comparison duplicates and would only add noise (duplicated controls / ids across 10 renders).
- **`tags: ['!autodocs']`** — no docs page per generated story.

### Caveats

- **Overlay components** (Dialog, DropdownMenu, Select, Tooltip): only the closed trigger renders in-place and scopes correctly. Open/portal content renders outside the `[data-nexus-base]` subtree (React portals attach to `document.body`) and falls back to the default base. The static showcases render closed, so this is rarely visible.
- **`chart-categorical-{1..5}`** are the only ~5 of ~100 semantic colors not per-cell-scoped (they live in a separate token file and no covered component renders charts). Add them to the merge in the generator if a charted component is ever opted in.
- **Static ids in a showcase collide across cells.** The generator reuses a showcase's `render()` once per cell (10×), so any hardcoded `id` in it would emit as a duplicate DOM id across the cells, breaking that cell's `htmlFor`↔control pairing — and the generator can't scope ids it doesn't own. **Showcase-authoring constraint:** a story opted into base-variant generation must not embed static ids — use `aria-label`, or namespace each id with `React.useId` (as Switch's `AllVariants` does). Duplicate-id breakage would otherwise be masked here by `a11y: { test: 'off' }` and smoke-only assertions.

### Lifecycle

Generation is chained ahead of the scripts that consume the stories — it is never run by hand in CI:

| Script                                                  | Effect                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `yarn storybook` / `yarn build-storybook`               | regenerate, then start / build Storybook                                      |
| `yarn test` / `yarn test:storybook` (+ `:watch`, `:ui`) | regenerate, then run vitest (addon-vitest sees them)                          |
| `yarn workspace @nexus/react typecheck`                 | regenerate, then `tsc` — gives generated stories type coverage at the CI gate |

The output is gitignored, so a fresh checkout has no generated files until one of the above runs. Because every consuming script regenerates first, the gitignored output is never relied upon — including the `typecheck` gate, which would otherwise skip the absent files on a fresh checkout.
