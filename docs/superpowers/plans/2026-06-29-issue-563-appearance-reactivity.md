# #563 Appearance Reactivity Guardrail

## Summary

#562 fixed the known Appearance disconnects. #563 adds a narrow guardrail so
future changes cannot update provider state / runtime CSS while real Nexus UI
quietly bypasses those runtime tokens.

This is tooling and tests only:

- no public API changes
- no token value retuning
- no visual redesign
- no broad component migration

Branch: `codex/issue-563-appearance-reactivity-audit` from latest `main`.

## Correct Runtime Model

The guardrail must not ban valid Nexus runtime utilities.

- `nx:rounded-*` is runtime-aware through `--radius-* -> --nx-radius-*`, and
  `[data-radius]` changes those variables.
- `nx:shadow-*` is runtime-aware through `--shadow-* -> --nx-shadow-*`; #559
  already calibrated the public shadow modes.
- ordinary semantic text/color utilities such as `nx:text-foreground`,
  `nx:text-muted-foreground`, and `nx:border-border-default` are valid.
- built-in spacing utilities are mostly static; only role utilities such as
  `nx:p-container` / `nx:gap-container` are density-aware today.

Therefore #563 audits only the bypass classes that are both high risk and
actionable now:

- raw border-width utilities after the #562 stroke migration
- arbitrary dimension-like literals that bypass token scales
- `cn()` merge regressions around runtime stroke utilities

## Implementation

Add a React package audit:

- `packages/react/scripts/audit-appearance-reactivity.mjs`
- `packages/react/scripts/appearance-reactivity.config.mjs`

Default scan roots:

- `packages/react/src/components`
- `apps/console/src/modules/design-system/appearance`

Excluded:

- stories and tests
- `packages/react/src/appearance`
- docs fixtures
- showcase/demo surfaces such as ComponentShowcase / IconShowcase

Rules:

- flag raw stroke-width utilities:
  - `nx:border`
  - `nx:border-x/y/t/r/b/l`
  - numeric widths such as `nx:border-2`, `nx:border-b-2`
  - dimension arbitrary widths such as `nx:border-[1.5px]`
- do not flag style/color/table utilities:
  - `nx:border-dashed`
  - `nx:border-transparent`
  - `nx:border-border-default`
  - `nx:border-nav-border`
  - `nx:border-collapse`
- flag dimension-like arbitrary text sizes:
  - `nx:text-[13px]`, `nx:text-[1.25rem]`
- do not flag system color arbitrary text:
  - `nx:text-[CanvasText]`
- flag dimension-like arbitrary spacing/radius:
  - `nx:p-[13px]`
  - `nx:gap-[7px]`
  - `nx:rounded-[2px]`
- do not flag inherited/runtime forms:
  - `nx:rounded-md`
  - `nx:rounded-[inherit]`
  - `nx:shadow-lg`
- flag arbitrary shadow utilities:
  - `nx:shadow-[...]`

Allowlist:

- sidecar config only
- each entry requires `file`, exact `className` or `ruleId`, and `reason`
- no wildcard allowlists
- report line numbers in output, but do not key allowlist stability to line
  numbers

Scripts / CI:

- add `@nexus/react` script: `audit:appearance-reactivity`
- add root script: `audit:appearance-reactivity`
- run it in CI after `audit:package-boundary`

## Tests

Add classifier tests for:

- raw `nx:border` fails
- `nx:border-default` passes
- `nx:border-border-default` passes
- `nx:border-dashed` passes
- `nx:border-[1.5px]` fails
- `nx:text-[13px]` fails
- `nx:text-[CanvasText]` passes
- `nx:rounded-md` passes
- `nx:rounded-[2px]` fails
- `nx:shadow-lg` passes
- `nx:shadow-[...]` fails
- allowlist entries must be narrow and reasoned

Add component consumption tests for:

- Button emits runtime stroke/radius classes.
- Input emits runtime stroke + semantic border color.
- Card emits semantic surface + runtime shadow class.
- Sheet emits runtime side stroke + shadow class.
- Tabs emit runtime trigger/indicator stroke classes.

Extend `cn()` tests for:

- runtime stroke width survives next to semantic border color.
- side-specific runtime stroke width merges correctly.
- native override such as `nx:border-0` still wins intentionally.
- generated borderwidth utilities remain covered by `NEXUS_CLASS_GROUPS`.

## Validation

Run:

```bash
pnpm audit:appearance-reactivity
pnpm test:unit packages/react/scripts/audit-appearance-reactivity.test.js
pnpm test:unit packages/react/src/lib/utils.test.ts
pnpm test:unit packages/react/src/appearance
pnpm test:unit
pnpm --filter @nexus/react build
pnpm typecheck
pnpm lint
pnpm build
```

Acceptance criteria:

- raw border-width regressions fail automatically.
- arbitrary dimension escapes fail automatically.
- valid semantic/runtime utilities are not false-positive noise.
- every allowlist entry is narrow and justified.
- #563 remains a guardrail PR, not a token or UI redesign PR.
