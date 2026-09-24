# Token catalogue

`@nexus_ds/core/catalogue` describes Nexus tokens for tools and docs. It covers
the colour and typography families: primitive colours, every runtime semantic
colour, typography primitives, and typography styles.

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
  property scheme. Scalar tokens declare it in the generated CSS. A typography
  style does not: its name, such as `--nx-typography-heading-large`, is never
  declared, and the utility it emits is an alias.
- **`aliases`** map other names onto the token:
  - `css-variable`: the Tailwind theme property that reads a runtime colour,
    such as `--color-muted-foreground`;
  - `utility`: the utility a typography style emits, such as
    `nx:typography-heading-large`;
  - `reference`: the DTCG reference paths other token files use, such as
    `size.3xl` and `typography.size.3xl`.
- **`variants`** hold one entry per theme mode and preset. Each variant sets
  two separate axes:
  - `mode` is the theme mode, `light` or `dark`, or `null` when the value
    applies in both;
  - `preset` is the family's mode file the value comes from, such as a spacing
    mode, or `null` when the family has a single file. Typography primitives
    come from `typography-default.json` alone, so their `preset` is `null`.

  An authored variant's `source` names its leaf: `file` is a path under
  `packages/core/tokens/`, and `path` is the list of group keys to the leaf.

`group` is the registry category for a runtime colour (`surface`, `text`, …)
and the top-level group for an authored token (`green`, `size`, `heading`, …).

## Values

A variant's `declarations` are what the generated `@nexus_ds/tailwind` CSS
declares. A scalar token has one declaration, its own custom property. A
typography style has the declarations of its `@utility` body. The catalogue
formats values with the same modules the generator uses
(`src/token-source/`), so hex colours appear as the pinned OKLCH the package
emits. `authoredValue` keeps the value exactly as authored, and `references`
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
  committed `@nexus_ds/tailwind` output: runtime colour fallbacks and `.dark`
  overrides, primitive values in `variables.css`, and the typography
  utilities.
- `pnpm --filter @nexus_ds/core audit:runtime-exports` checks the entry's
  exports and ESM/CJS parity. It fails if a runtime colour description or
  catalogue code reaches the main bundles.
