# Figma-to-Code Parity Rules

> **Scope note (2026-05):** The Figma _authoring_ conventions (token-mapping tables, prop/frame naming, AI-readability, divergence patterns, size reference, checklist) were removed pending design-system solidification — they'll be rebuilt once the component/token APIs settle. This file now covers the code↔Figma **parity audit**, the token-architecture overview, and the MCP read tools.

## Source of Truth

**Always read actual code files** to understand current token structure:

| File                                          | Contains                         |
| --------------------------------------------- | -------------------------------- |
| `packages/tailwind/variables.css`             | Primitive tokens (`--nx-*`)      |
| `packages/tailwind/nexus.css`                 | Semantic tokens (`@theme` block) |
| `packages/react/src/components/ui/button.tsx` | Component patterns               |

When Figma and code disagree on a token value, **code wins**.

## Code-vs-Figma Parity Audit

The `audit:figma-parity` script diffs the JSON primitives in `packages/core/tokens/primitives/` against a checked-in snapshot of Figma's variables at `packages/core/tokens/figma-snapshot.json`. Use it to detect drift between what designers see and what the build emits.

### Canonical rule: code wins

When code and Figma disagree on a primitive token value, the JSON file is canonical. Reason: code changes go through PR review (e.g., PR #55 retuned focus colors to clear APCA Lc ≥ 45), so any value committed represents an intentional, reviewed engineering decision. Figma mirrors code; resolution always pushes code values into Figma, never the other way.

A designer who wants to change a token value opens a PR against the JSON file. Editing Figma directly is fine for exploration but is not authoritative — the next snapshot refresh will surface it as drift.

### Running the audit

```bash
yarn audit:figma-parity --category color
yarn audit:figma-parity --category color --snapshot path/to/alt-snapshot.json
```

Flags:

| Flag                | Required?                                                                        | Default                                    |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| `--category <name>` | Always                                                                           | —                                          |
| `--snapshot <path>` | Optional — testing/alternate snapshots                                           | `packages/core/tokens/figma-snapshot.json` |
| `--mode <name>`     | Rejected today as an unknown flag; wired by #61 alongside multi-mode categories. | —                                          |

Exit codes:

| Code | Meaning                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | No drift                                                                                                                                     |
| 1    | Drift findings reported                                                                                                                      |
| 2    | Configuration error — read stderr for the specific reason (missing/stale snapshot, unknown category, unsupported value type, malformed JSON) |

The audit guards against a stale snapshot by comparing the code file's last git-commit timestamp against the snapshot file's. If the code file was committed more recently, the audit fails — the designer must refresh the snapshot before drift can be assessed. The guard reads committed state via `git log`, so uncommitted local edits to either file are not considered — the guard is a CI/PR bar, not a pre-commit check.

Under CI (`CI=true` or `CI=1`), the guard hard-fails if git timestamps are unavailable. The most common cause is a shallow clone — the audit detects this and points at `actions/checkout` with `fetch-depth: 0` in the error message. Outside CI the same situation just prints a `⚠ skipped` line.

### Categories

| Category      | Status    | Wired by | Notes                                                   |
| ------------- | --------- | -------- | ------------------------------------------------------- |
| `color`       | Supported | #65      | Single-mode (one `color.json`).                         |
| `size`        | Pending   | #61      | Multi-mode (`size-{vega,lyra,maia,mira,nova}.json`).    |
| `radius`      | Pending   | #61      | Multi-mode (`radius-{blunt,sharp,subtle,...}.json`).    |
| `borderwidth` | Pending   | #61      | Multi-mode (`borderwidth-{vega,lyra,...}.json`).        |
| `typography`  | Pending   | #62      | Multi-mode composite tokens.                            |
| `shadow`      | Pending   | #63      | Multi-mode × theme (`shadow-{mode}-{light,dark}.json`). |

This table is the single source of truth for the audit's category coverage. The script no longer carries a parallel `PENDING_CATEGORIES` map — running `--category size` today fails with an unknown-category error pointing readers back here.

### Snapshot shape

The snapshot JSON nests by mode so a single capture covers every mode the designer cares about. Each `--category … --mode <name>` invocation slices into one subtree on the snapshot side and reads one file on the code side:

| Category type | CLI invocation                                | Code file read                             | Snapshot subtree read        |
| ------------- | --------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Single-mode   | `--category color`                            | `primitives/color.json`                    | `snapshot.color`             |
| Multi-mode    | `--category size --mode vega`                 | `primitives/size/size-vega.json`           | `snapshot.size.vega`         |
| Mode × theme  | `--category shadow --mode vega --theme light` | `primitives/shadow/shadow-vega-light.json` | `snapshot.shadow.vega.light` |

Each category subtree carries a `$meta` block — at minimum `capturedAt` (ISO date) and `figmaFileName`. The `$`-prefix is DTCG metadata and is skipped by the token walker, so it never appears as a drift finding. For multi-mode categories the `$meta` lives under the mode (e.g., `snapshot.size.vega.$meta`) so each capture timestamps independently.

This is the intended shape for #61/#62/#63 — only the single-mode (color) row is wired today. Each sub-issue PR adds its category to the registry, wires the path resolver for its row's shape, and (for multi-mode) starts reading `args.mode` (and `args.theme` for shadow). The snapshot/CLI shape itself doesn't change between PRs.

### Refreshing the snapshot

The snapshot is not auto-refreshed. To update it:

1. Open the design-system Figma file in the desktop app.
2. In Claude, invoke `figma:figma-use` (the skill is a mandatory prerequisite for `use_figma`).
3. Use `use_figma` to enumerate the relevant variable collection and read each variable's hex value.
4. Write the result into `packages/core/tokens/figma-snapshot.json` matching the DTCG shape of the corresponding code file (e.g., `snapshot.color` mirrors `primitives/color.json`). Add a per-category `$meta` block — at minimum `capturedAt` (ISO date) and `figmaFileName` — alongside the token tree (`snapshot.color.$meta`). The audit reads it to print the snapshot's capture date so readers can spot stale snapshots.
5. Re-run `yarn audit:figma-parity --category color` to see the new diff.

### Resolving drift

For each finding, take action by kind:

| Finding kind       | Action                                                          |
| ------------------ | --------------------------------------------------------------- |
| `value-mismatch`   | Designer updates Figma variable to match the code value.        |
| `type-mismatch`    | Treat as a structural bug — investigate which side broke shape. |
| `missing-in-figma` | Designer adds the missing variable to Figma.                    |
| `missing-in-code`  | Designer removes the extra variable from Figma.                 |

After the designer syncs, refresh the snapshot and re-run the audit. Zero drift is the merge bar for the issue that prompted the audit.

## Token Architecture

The design system uses a three-layer token architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: PRIMITIVES (variables.css)                            │
│  --nx-size-5: 20px                                              │
│  --nx-radius-md: 4px                                            │
│  --nx-color-slate-500: #64748b                                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: SEMANTIC (nexus.css @theme)                           │
│  --spacing-5: var(--nx-size-5)                                  │
│  --radius-md: var(--nx-radius-md)                               │
│  --color-muted: var(--nx-color-slate-100)                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: TAILWIND UTILITIES (with nx: prefix)                  │
│  nx:p-5  →  padding: var(--spacing-5)                           │
│  nx:rounded-md  →  border-radius: var(--radius-md)              │
│  nx:bg-muted  →  background: var(--color-muted)                 │
└─────────────────────────────────────────────────────────────────┘
```

## MCP Tools Reference

When analyzing Figma with MCP tools:

### get_variable_defs

Returns token values used in the component. Compare each token:

- Does the name match a semantic token in `nexus.css`?
- Does the value match the primitive in `variables.css`?

### get_design_context

Returns generated TypeScript props. Verify:

- Prop names follow conventions (lowercase, abbreviated)
- Boolean props use `has*`/`is*` pattern
- Enum values are lowercase

### get_metadata

Returns component variant structure. Check:

- Frame names use `prop=value` format
- All expected variants are present
