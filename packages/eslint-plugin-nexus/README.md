# @nexus/eslint-plugin

Custom ESLint rules that backfill what the deleted `--nx-size-*` primitive layer used to enforce.

## Rules

### `@nexus/canonical-spacing-steps`

Flags any px value in `packages/core/tokens/semantic/spacing-*.json` that is not in the canonical step set. The canonical set is the union of every px value currently shipped across the 7 mode files; see `src/canonical-step-set.json`. Refresh that file when a mode file legitimately introduces a new value.

Requires `jsonc-eslint-parser`. Wired in the root `eslint.config.js` to target spacing mode files only.

### `@nexus/prefer-role-utilities`

Flags raw numeric padding / gap utilities (`nx:p-N`, `nx:px-N`, `nx:py-N`, `nx:gap-N`) in `packages/react/src/components/ui/*.tsx` (excluding `*.stories.tsx`) where a role-named utility would apply per the coupling table in `.claude/rules/spacing-tokens.md`.

`nx:(p|px|py|gap)-0` is not flagged — there is no role for "no padding".

#### Allowlist

When a raw numeric is intentional (chip rhythm, sub-element offset, item-tier menu rows, etc.), annotate the line **immediately above** with:

```tsx
// nexus-allow-numeric: chip rhythm — Badge note in spacing-tokens.md
className: 'nx:px-2 nx:py-0.5',
```

The comment text after the colon is free-form; keep it terse and cite the rule note that justifies the deviation.

## Source of truth

The role-to-component coupling table and the canonical step set live in `.claude/rules/spacing-tokens.md`. This plugin enforces what that document specifies.
