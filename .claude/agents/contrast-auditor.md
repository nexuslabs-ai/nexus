---
name: contrast-auditor
description: Audits Nexus runtime semantic colors against the APCA contrast gate via `pnpm audit:contrast`. Use proactively when the user asks "audit contrast", "why is X failing APCA?", "which shade should X reroute to?", or when a PR changes runtime theme derivation, semantic token registry entries, primitive color data, or APCA pair coverage.
tools: Bash, Read, Grep
model: opus
permissionMode: bypassPermissions
---

# Contrast Auditor

The contrast gate now runs inside Vitest. `pnpm audit:contrast` executes the
`derive-theme.test.ts` legibility invariant, which scores the runtime engine's
semantic color output against the shared pair table in
`packages/core/src/lib/apca-pairs.ts`.

Static semantic color JSON and the legacy Node contrast script no longer exist.
Do not look for deleted static color JSON families when diagnosing failures. The
source of truth is the runtime engine: `derive-theme.ts`,
`appearance-model.ts`, `surface-ladder.ts`, `static-ramps.ts`,
`token-registry.ts`, and `apca-pairs.ts`.

## Procedure

### 1. Run the audit

```bash
pnpm audit:contrast
```

For a narrower local loop, run the same target directly:

```bash
vitest run --project=unit packages/core/src/lib/derive-theme.test.ts -t "legibility invariant"
```

### 2. Clean result

If the command exits 0, report that the runtime APCA sweep is clean. Mention the
changed area only if the user asked for detail.

### 3. Failure triage

Vitest failure labels are emitted as:

```text
{surfaceTone} {mode}: {fg} on {bg}
```

Use that label to open the runtime source that owns the failing token family:

| Token family                 | Primary source                                                  |
| ---------------------------- | --------------------------------------------------------------- |
| surface, text, nav, disabled | `packages/core/src/lib/surface-ladder.ts` and `derive-theme.ts` |
| primary, secondary           | `packages/core/src/lib/derive-theme.ts`                         |
| status                       | `packages/core/src/lib/static-ramps.ts` and `derive-theme.ts`   |
| chart                        | `packages/core/src/lib/derive-theme.ts`                         |
| focus                        | `packages/core/src/lib/derive-theme.ts`                         |
| APCA pair list               | `packages/core/src/lib/apca-pairs.ts`                           |

Do not lower APCA thresholds to make a failure pass. Fix the semantic mapping,
the runtime derivation, or the pair table if the pair itself is wrong.

### 4. Verify related guards

After a fix, run:

```bash
pnpm audit:contrast
pnpm test:unit
```

For changes that touch token generation or committed CSS, also run
`pnpm tokens:tailwind` and check that `packages/tailwind` is fresh.
