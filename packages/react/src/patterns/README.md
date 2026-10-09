# Blocks and patterns — handoff checklist

Blocks and patterns are copy-source: blocks (editable compositions that solve
one task, in `blocks/`) and the examples patterns are built from (in
`patterns/`). They are not package exports, so a
developer adopts them by reading their docs page and copying files. Every block
page and pattern page follows this checklist, in this order.

## 1. Purpose

- One or two sentences on what the item does.
- **When to use it**, and when a nearby item fits better. Name the alternative.

## 2. Minimal working composition

- The smallest controlled example a developer can paste: state, the item, and
  the handler that feeds the value back.
- It renders in the docs page canvas from the same source file a developer
  copies. No fixtures, fetching or Storybook helpers inside copyable files.

## 3. Inputs, outputs and state ownership

- The value shape, including what `null` or "absent" means.
- What the item emits and **when**: immediately, on Apply, or never on its own.
- Which state the item owns (drafts, open state) and which the app owns
  (applied values, queries, persistence).

## 4. States and dismissal

- Every supported state: empty, applied, pending, invalid, disabled,
  unavailable values, long content, narrow container.
- How the item is dismissed (Cancel, Escape, clicking outside), what each
  dismissal keeps or discards, and where focus lands afterwards.

## 5. Delivery

- The files to copy, and every component folder they need, including the
  folders those folders import, plus `lib/`.
- npm dependencies, including optional peers.
- What the application is responsible for: data, permissions, query evaluation,
  loading and error handling, URL state.
- Until the generated catalog lands (#798), label this section as manual
  guidance.

## 6. Evidence and support boundary

- Every behaviour stated in sections 3 and 4 is pinned by a story play function
  on the item's own page, not only on an internal page.
- Visual review is recorded against a named revision: layout, spacing, states,
  long labels, narrow containers, errors, disabled states and keyboard focus.
- What is **not** supported is stated plainly, so nobody infers support from a
  working demo.

## Reference implementations

- Filtering (`blocks/filtering/` and `patterns/filtering/`) — the first family
  held to this checklist.
