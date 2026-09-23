# @nexus_ds/eslint-plugin

Custom ESLint rules for the Nexus design system. They split into two groups: **token-layer** rules that backfill what the deleted `--nx-size-*` primitive layer used to enforce, and **component-authoring** rules that machine-enforce conventions documented in `.claude/rules/` (so they fail `pnpm lint` and the pre-commit hook for every contributor, not just code review).

## Rules

### `@nexus_ds/canonical-spacing-steps`

Flags any px value in `packages/core/tokens/semantic/spacing-*.json` that is not in the canonical step set. The canonical set is the union of every px value currently shipped across the 7 mode files; see `src/canonical-step-set.json`. Refresh that file when a mode file legitimately introduces a new value.

Requires `jsonc-eslint-parser`. Wired in the root `eslint.config.js` to target spacing mode files only.

### `@nexus_ds/nx-class-conventions`

Enforces the `nx:` Tailwind-class conventions from `.claude/rules/shadcn-divergences.md` on class strings (string + single-quasi template literals): correct prefix order (`nx:` before every modifier, not `hover:nx:…`), no banned `accent` token, complete semantic token paths (`-background` / `-foreground` / `-subtle`), and no raw primitive colors (`nx:bg-blue-500`). Ported from the former `.claude/hooks/lint-nx-prefix.mjs` so the checks run in `pnpm lint` and the pre-commit hook. Wired for `packages/react/src/**` and `apps/**` `.tsx`.

One check reads a whole class-string scope rather than a single literal: `nx:transition-colors` beside a ring-painting `focus-visible:outline-*` class fades the focus ring in, because Tailwind expands `transition-colors` to a list carrying `outline-color`. Only a width or a colour paints a ring, so `outline-none`, `outline-hidden`, `outline-0`, `outline-offset-*` and the style keywords (`outline-solid` / `dashed` / `dotted` / `double`) are exempt. Use `nx:transition-control` / `nx:transition-field` instead — see `/foundations/focus`.

**What counts as one scope.** One class string; one call to `cva`, `cn`, `clsx` or `cx` — base, array elements and `variants` values together; or one `[…].join(' ')`, which collapses an array literal into a single attribute. That **over-approximates**: two sibling `variants` values of the same key are mutually exclusive and never share an element, and the rule reports the pair anyway. Over-reporting is the safe direction here, and the shape every field surface is written in — a base string plus a ring in a later array element — needs the call-wide scope to be caught at all.

Two things fall outside a scope and pass: an array that is never joined, whose elements are per-item class strings; and a string that only meets the rest at a call site — a shared `const`, an argument handed to another function, or a callback body the enclosing call takes with it. The four composer names must be written plainly, and `join` is the one member expression the walk reads, on an array literal receiver — so an aliased or chained composer (`twMerge`, `utils.cn`, a renamed import, `[…].filter(Boolean).join(' ')`) is invisible to it. Specimen surfaces are exempt from this check: the docs pages under `apps/docs/app/_pages`, where a pairing is the subject of the prose. Stories and the rest of the docs app are checked.

### `@nexus_ds/no-render-prop-types`

Enforces `.claude/rules/composition-over-render-props.md`: component props must not be typed as render callbacks (`(...) => ReactNode`) or component references (`ComponentType` / `FC` / `ElementType`). Event-handler-named props (`on*`) are exempt. Use `children` / named `ReactNode` slots or per-mode components instead. Third-party-mandated shapes (e.g. recharts) opt out with a scoped `eslint-disable` + reason.

### `@nexus_ds/no-multi-statement-jsx-handler`

Enforces `.claude/rules/extract-inline-handlers.md`: inline JSX handler props (`onClick`, `onChange`, …) with 3+ statements, or containing a nested callback-object argument, must be extracted to a named function above `return`. One- and two-statement handlers stay inline.

## Source of truth

The token-layer rules are self-contained: the canonical step set is `src/canonical-step-set.json`. The component rules map 1:1 to the `.claude/rules/*.md` cited above — the rule code plus those docs are the spec. Every rule has RuleTester coverage in `__tests__/`.

## Shareable config

`@nexus_ds/eslint-plugin/config` exports small flat-config helpers for consumers
that want the Nexus rules without copying this monorepo's full lint setup:

- `nexusComponentConfig({ files })` wires the component-authoring rules.
- `nexusSpacingTokenConfig({ files, parser })` wires the spacing-token rule; pass
  `jsonc-eslint-parser` when linting JSON token files.
