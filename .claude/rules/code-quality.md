# Code Quality: Favor Simplicity Over Cleverness

The goal is code that is easy to read, easy to change, and easy to delete. Prefer the shape with the fewest moving parts, the shortest reader path, and the least indirection. A clever solution that saves three lines but costs a reader five minutes is a net loss.

**The governing question:** if someone unfamiliar with this change opens the file six months from now, will they understand what it does without opening three other files first?

- **Flat over nested.** Fewer levels of indentation, fewer layers of wrapping.
- **Explicit over implicit.** Visible wiring beats magic. A call you can grep for beats a dispatcher you have to trace.
- **Fewer moving parts over more.** One value beats one config key. One function beats one class with one method. One call site beats an event bus.
- **Boring over interesting.** If the standard language feature already does it, use that. Novelty carries a maintenance cost the reader pays, not you.

Every rule below is a concrete application of this principle. When they conflict with each other in a specific case, pick whichever keeps the simpler reading.

## Rules in this set

- `ripple-effect.md` — a change isn't done until callers, callees, and adjacent code are as clean as a fresh write
- `guard-clauses.md` — keep the happy path at column 0; exit early
- `composition-over-render-props.md` — `children` or per-mode components; never `renderItem` / `mode` discriminators
- `extract-inline-handlers.md` — multi-line / branching JSX handlers get a named function above `return`; one-liners stay inline
- `useeffect-escape-hatch.md` — effects sync with external systems, not React state
- `responsive.md` — `@container` for component-internal, viewport prefixes for page-shell; decision tree for which mechanism
- `logging-proportionality.md` — one dense canonical log line beats ten incremental ones
- `code-comments.md` — comment non-obvious logic only; TODOs must cite a tracked issue
- `no-follow-up-deferral.md` — every issue flagged by a PR review is fixed in the same PR
- `project-stage.md` — pre-production: no backcompat, no shims, no feature flags — change code in place
- [`polish.md`](polish.md) — Tier-A component polish is a checkable completion bar, not vibes
