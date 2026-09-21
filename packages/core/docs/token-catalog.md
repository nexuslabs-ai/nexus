# Complete token catalog (Unit 4)

Nexus Lab’s `/explore` route inventories authored tokens and runtime semantics.
All controls and presentation use existing Nexus components, semantic utilities,
and typography/spacing/shape tokens. Color specimens use actual token data.

## Source and output boundaries

`collectTokenSources` discovers files using the production primitive/semantic
rules, then walks every JSON file under `tokens/`. Every `$value` leaf has a record,
including inherited `$type`, all modes, and sources the generator does not emit.
Missing types, duplicate identities, unresolved references and cycles fail the
build. The initial catalog has 1,398 leaves across 32 files; these counts are
computed, never used as a manually maintained inventory.

Logical identity is `namespace:family:path`; source records additionally retain
mode and light/dark variant. Renaming a mode preserves the logical token link and
invalidates a link to the removed variant explicitly. The Token group menu organizes the complete inventory into Colors, Typography,
Spacing, Shape, Shadows, Motion, and Layout, with source sets nested within each
group. Value types and modes are derived from matching records. Changing a group
resets its child filters; changing value type resets the mode. Groups with no
search matches are disabled. Search and filters persist
in the URL; token details have stable `token` and optional `variant` parameters.

`resolveTokenReferences` recursively resolves objects, arrays, and multi-hop
aliases while retaining each field’s reference edges. Values keep their authored
types: HEX stays HEX; dimensions stay `{ value, unit }`; typography and shadow
stay composites. Resolution uses the record’s own mode and the other families’
build defaults. This shared validation runs in the production generator too.
It is separate from `resolveReference`, which emits CSS `var()` references.

`generateTailwindArtifacts` is the production generator’s in-memory entry. The
ordinary `generateTailwindPackage` writes those same formatted bytes. The catalog
parses the exact seven artifacts with build-only PostCSS, preserving declarations,
selectors, at-rule context, importance, utility definitions, and CSS locations.
Its emission boundary includes `@theme`, `@theme inline`, runtime rules/aliases,
and `@utility`. It does not describe the usage-dependent compiled app stylesheet.
Utility definitions and theme-derived examples are labelled as capabilities.
Tests compile representative examples with Tailwind and compare all package CSS
byte-for-byte with the committed generated package.

Typography expands into several declarations; authored `auto` remains visible
while the emitted `normal` and added text wrapping are explained. Shadows retain
ordered layers and the `inner` formatter’s `inset` addition. An unsupported leaf
stays in the catalog with an explicit reason for no emission.

Runtime entries come from `SEMANTIC_TOKEN_REGISTRY`, with one record per light/dark
result. They have no fictional authored `$value`. `inspectTheme` receives the
build’s actual appearance contract. Token detail loads Unit 3 evidence separately,
shows token-specific recorded events, and distinguishes final APCA diagnostics
from the solver trace. Authored palette provenance is labelled within the trace.
The surrounding Lab appearance does not change the inspected build-default data.
This unit adds no experiment controls or isolated preview document.

## Development, build, and provenance

The Console Vite plugin exposes two data-only virtual modules: the catalog and
theme inspection. The generator, filesystem, git access, and PostCSS are Node-only;
they are not exported by `@nexus_ds/core` or shipped in the browser bundle. Explore
is lazy-loaded from the learning shell; trace data is loaded only for runtime detail.

Production generation is a build prerequisite and errors stop the build. Console’s
Turbo inputs explicitly cover core token JSON and generator scripts; the existing
core build dependency covers engine source changes. Build dependency caching stays
available. Generated metadata describes the captured build, including its base
revision, content hash, input contract, config, and source hashes.

Development watches token, engine, and generator directories, including additions
and removals. It invalidates the SSR module graph before reloading so changed
palette data or conversion code cannot leave a cached engine behind. A virtual
module serializes a visible error state on invalid data and replaces the catalog;
it never silently keeps the last successful result. Correcting the source recovers
the page. Development uses core source aliases; production uses the built core
from the normal dependency build.

Source paths are repository-relative. A revision link is emitted only after
comparing the current file’s contents with that exact committed revision. Local
changes are labelled and have no misleading source link. Engine and generator
source hashes contribute to the catalog hash as well as token sources and CSS.
No generated catalog JSON is checked in.

## Verification

From the repository root:

```sh
pnpm exec turbo run build --filter=@nexus_ds/console
pnpm --filter @nexus_ds/console dev
pnpm --filter @nexus_ds/console typecheck
pnpm test:console
pnpm exec vitest run --project=unit packages/core
```

The catalog tests independently walk the JSON leaves, compare registry coverage,
check aliases, composites and mode selectors, verify exact generated bytes, and
compile representative utilities. Browser tests cover search/filter/deep links,
keyboard reference navigation, missing tokens/modes, mobile and 200% text, separate
lazy chunks, and the absence of Node/build code from the production bundle.
A copied token tree exercises real Vite refresh on add/edit/delete/mode rename,
invalid JSON, and recovery without mutating the working token sources.
