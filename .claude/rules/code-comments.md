# Code Comment Rules

## When to Add Comments in Code

Only comment when the **logic itself** is non-obvious — not to explain design decisions, tradeoffs, or rationale.

| Situation                                                      | Where it goes          |
| -------------------------------------------------------------- | ---------------------- |
| Non-obvious logic (e.g. a cancellation guard, a bitwise trick) | Code comment           |
| Forward-looking placeholder for tracked follow-up work         | `// TODO(#N):` in code |
| Tradeoff explanation ("why not X")                             | PR comment             |
| Known limitation or architectural gap                          | PR comment             |
| Design rationale or "why we chose this approach"               | PR comment             |

## Comments Are Prose, Never Data

Tools read data from code. A comment may explain the code to a reader, and the docs show JSDoc descriptions as prose, but no tool derives a value from a comment.

- **No `@default`.** The Props table reads defaults from code: destructuring defaults, `withDefaults`, cva `defaultVariants`. If a dependency sets the default, say so in the description.
- **No `@example`.** Show usage in a `docs` story, which is compiled and tested.

Enforced by `@nexus_ds/no-jsdoc-data-tags` in `packages/react/src`.

## TODO Comments

Only add a TODO when it points at a **tracked issue or milestone** — `// TODO(#295):` or `// TODO(M11.6):`. A TODO without an issue number is not permitted: if the follow-up work isn't tracked, the work belongs in this PR (see `no-follow-up-deferral.md`).

Do not use TODOs to annotate known limitations, missing features with no scheduled work, or architectural gaps.

## Anti-Patterns

- Do not add multi-line comments explaining why a dev-only pattern is acceptable
- Do not document tradeoffs inline (e.g. "we use X not Y because...")
- Do not add "keep in sync" comments — if sync is required, enforce it at compile time instead
