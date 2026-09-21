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
Build-default evidence remains stable as playground appearance changes. The docs
playground separately displays values from its accepted appearance result.

## Development, build, and provenance

The docs generation step emits two data-only JSON payloads: the catalog and
theme inspection. The generator, filesystem, git access, and PostCSS are Node-only;
they are not exported by `@nexus_ds/core` or shipped in the browser bundle. Explore
is lazy-loaded inside docs `/create`; trace data is loaded only for runtime detail.

The docs build-generation step writes JSON payloads using the authoritative Core
generator. Filesystem tools stay outside browser bundles. Production errors stop
the build; Core dependency inputs and docs generated outputs participate in Turbo
caching. Metadata records the build revision, input contract, config and hashes.

The docs dev wrapper watches Core token, engine and generator directories. Each
regeneration loads fresh Core source with Jiti caches disabled. Invalid sources
replace the generated payloads with a visible error; correcting them recovers the
catalog. Runtime token details separately show the active playground appearance.

Source paths are repository-relative. A revision link is emitted only after
comparing the current file’s contents with that exact committed revision. Local
changes are labelled and have no misleading source link. Engine and generator
source hashes contribute to the catalog hash as well as token sources and CSS.
No generated catalog JSON is checked in.

## Verification

From the repository root:

```sh
pnpm test:create
pnpm --filter @nexus_ds/docs dev
pnpm --filter @nexus_ds/docs typecheck
pnpm exec vitest run --project=unit packages/core apps/docs
```

Core tests walk JSON leaves, check registry coverage, aliases, composites and mode
selectors, compare exact CSS bytes, and compile representative utilities. Docs
browser tests cover search, logical grouping, deep links, preview isolation and
recovery. A copied token tree tests regeneration after edits, additions, removals,
mode renames and invalid JSON without changing working token sources.
