# @nexus_ds/eslint-plugin

Custom ESLint rules for the Nexus design system. They split into two groups: **token-layer** rules that backfill what the deleted `--nx-size-*` primitive layer used to enforce, and **component-authoring** rules that machine-enforce conventions documented in `.claude/rules/` (so they fail `pnpm lint` and the pre-commit hook for every contributor, not just code review).

## Rules

### `@nexus/canonical-spacing-steps`

Flags any px value in `packages/core/tokens/semantic/spacing-*.json` that is not in the canonical step set. The canonical set is the union of every px value currently shipped across the 7 mode files; see `src/canonical-step-set.json`. Refresh that file when a mode file legitimately introduces a new value.

Requires `jsonc-eslint-parser`. Wired in the root `eslint.config.js` to target spacing mode files only.

### `@nexus/nx-class-conventions`

Enforces the `nx:` Tailwind-class conventions from `.claude/rules/components.md` and `.claude/rules/shadcn-divergences.md` on class strings (string + single-quasi template literals): correct prefix order (`nx:` before every modifier, not `hover:nx:…`), no banned `accent` token, complete semantic token paths (`-background` / `-foreground` / `-subtle`), and no raw primitive colors (`nx:bg-blue-500`). Ported from the former `.claude/hooks/lint-nx-prefix.mjs` so the checks run in `pnpm lint` and the pre-commit hook. Wired for `packages/react/src/**` and `apps/**` `.tsx`.

### `@nexus/no-render-prop-types`

Enforces `.claude/rules/composition-over-render-props.md`: component props must not be typed as render callbacks (`(...) => ReactNode`) or component references (`ComponentType` / `FC` / `ElementType`). Event-handler-named props (`on*`) are exempt. Use `children` / named `ReactNode` slots or per-mode components instead. Third-party-mandated shapes (e.g. recharts) opt out with a scoped `eslint-disable` + reason.

### `@nexus/no-multi-statement-jsx-handler`

Enforces `.claude/rules/extract-inline-handlers.md`: inline JSX handler props (`onClick`, `onChange`, …) with 3+ statements, or containing a nested callback-object argument, must be extracted to a named function above `return`. One- and two-statement handlers stay inline.

## Source of truth

The token-layer rules are self-contained: the canonical step set is `src/canonical-step-set.json`. The component rules map 1:1 to the `.claude/rules/*.md` cited above — the rule code plus those docs are the spec. Every rule has RuleTester coverage in `__tests__/`.

## Shareable config

`@nexus_ds/eslint-plugin/config` exports small flat-config helpers for consumers
that want the Nexus rules without copying this monorepo's full lint setup:

- `nexusComponentConfig({ files })` wires the component-authoring rules.
- `nexusSpacingTokenConfig({ files, parser })` wires the spacing-token rule; pass
  `jsonc-eslint-parser` when linting JSON token files.
