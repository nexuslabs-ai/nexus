# Token catalogue

`@nexus_ds/core/catalogue` describes every Nexus token for tools and docs:

| `family`      | Tokens                                                            |
| ------------- | ----------------------------------------------------------------- |
| `color`       | Primitive colours, and every runtime semantic colour              |
| `typography`  | Typography primitives, and the typography styles                  |
| `spacing`     | Numeric spacing and the role tokens, in every density mode        |
| `radius`      | Radius primitives, in every radius mode                           |
| `borderwidth` | Border width primitives, in every border width mode               |
| `shadow`      | Shadow layer primitives in every preset and theme, and the styles |
| `motion`      | Durations and easing curves                                       |
| `z-index`     | Stacking layers                                                   |
| `breakpoint`  | Responsive breakpoints                                            |

```ts
import { createTokenCatalogue } from '@nexus_ds/core/catalogue';

const tokens = createTokenCatalogue();
const muted = tokens.find(
  (token) => token.name === '--nx-color-muted-foreground'
);
```

The entry is browser-safe and does not touch the filesystem. Every token file
enters the bundle through a static JSON import, so it runs the same in Node, a
bundler, or at a docs site's build time. The main `@nexus_ds/core` entry does
not import it.

`createTokenCatalogue()` builds a fresh array on each call, with its own
copies of the authored values. Its types are read-only. It derives both
runtime colour modes, so call it once per build or page, not per render.

## Identity

- **`name`** is the canonical identity, an identifier in the `--nx-*` custom
  property scheme. Most tokens declare it in the generated CSS. Some are
  declared only under a Tailwind theme property or as a utility: typography
  styles, shadow styles, z-index layers, and breakpoints. Their names follow
  the same scheme (`--nx-typography-heading-large`, `--nx-shadow-sm`,
  `--nx-z-index-modal`, `--nx-breakpoint-lg`), are never declared, and the
  name the CSS uses is an alias.
- **`aliases`** map other names onto the token:
  - `css-variable`: a Tailwind theme property that reads or declares the
    token, such as `--color-muted-foreground`, `--radius-md`,
    `--spacing-4`, or `--shadow-sm`;
  - `utility`: an `nx:` utility the generated CSS declares for the token, such
    as `nx:typography-heading-large`, `nx:border-width-t-default`,
    `nx:duration-fast`, `nx:p-container`, or `nx:border-color-default`;
    utilities Tailwind derives from a theme property, such as `nx:rounded-md`
    or `nx:border-t-default`, are not listed;
  - `reference`: the DTCG reference paths other token files use, such as
    `size.3xl` and `typography.size.3xl`.
- **`variants`** hold one entry per theme mode and preset. Each variant sets
  two separate axes:
  - `mode` is the theme mode, `light` or `dark`, or `null` when the value
    applies in both. Runtime colours and shadow layers set it;
  - `preset` is the family's mode file the value comes from, without its
    theme mode: `square` for `radius-square.json`, `compact` for
    `spacing-compact.json`, and `quiet` for both `shadow-quiet-light.json` and
    `shadow-quiet-dark.json`. It is `null` when the family has a single file,
    so typography primitives from `typography-default.json` have no preset.

  An authored variant's `source` names its leaf: `file` is a path under
  `packages/core/tokens/`, and `path` is the list of group keys to the leaf.

`group` is the registry category for a runtime colour (`surface`, `text`, …),
the first key of a nested leaf (`green`, `size`, `container`, `duration`, …),
or the family for a token in a flat file (`radius`, `z-index`, …).

## Values

A variant's `declarations` are what the generated `@nexus_ds/tailwind` CSS
declares. A scalar token or a shadow style has one declaration, its own custom
property. A typography style has the declarations of its `@utility` body. The
catalogue formats values and derives utility names with the same modules the
generator uses (`src/token-source/`), so hex colours appear as the pinned
OKLCH the package emits. `authoredValue` keeps the value exactly as authored, and `references`
list each reference with the field it sits in and its canonical target.

## Runtime colours

Runtime colours have no authored `$value`. Each registry colour has a `light`
and a `dark` variant, derived from `DEFAULT_NEXUS_APPEARANCE` with `mode` set
explicitly. The variant's `appearance` records the full config used.
Descriptions of runtime colours are owned by the catalogue
(`src/catalogue/descriptions.ts`), not by `SEMANTIC_TOKEN_REGISTRY`.

## Token file manifest

`src/catalogue/token-files.ts` imports every JSON file under `tokens/`,
including styles and every mode. A unit test compares it with the files on
disk. Adding, renaming, or deleting a token file fails `pnpm test:unit` until
the manifest matches.

## Checks

- `src/lib/token-catalogue.test.ts` reconciles the catalogue with the
  committed `@nexus_ds/tailwind` output:
  - runtime colour fallbacks and `.dark` overrides;
  - every primitive in `variables.css`, in its root preset, and the diverging
    dark shadow overrides;
  - every `[data-density]`, `[data-radius]`, `[data-borderwidth]`, and light
    and dark `[data-shadow]` block, preset by preset;
  - every `@theme` variable, mapped to the token it reads or declares;
  - every data-driven `@utility`, mapped to the token it reads, and the
    typography utilities declaration for declaration.
- `pnpm --filter @nexus_ds/core audit:runtime-exports` checks the entry's
  exports and ESM/CJS parity. It fails if a runtime colour description or
  catalogue code reaches the main bundles.
