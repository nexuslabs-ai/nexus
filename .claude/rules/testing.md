# Testing Rules - Core Philosophy

> This file sets what Nexus tests and the principles every test follows.
> For story patterns, see [testing-react.md](testing-react.md).

## Scope

A test earns its place only when it pins behaviour a consumer of the design system would see. Nexus has exactly five kinds:

| Kind                      | Lives in                                                                                        | Pins                                                                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component stories**     | `packages/react/src/**/*.stories.tsx`                                                           | Component behaviour and accessibility, via `play` functions and the axe check on every story                                                                                                                     |
| **Core engine**           | `packages/core/src/lib/*.test.ts`                                                               | Derived-theme contrast and legibility, colour-blind separation, registry/engine agreement, first-paint script, perceptual-ramp shade grid, token catalogue agreement with the generated CSS, token-file manifest |
| **`cn` merge**            | `packages/react/src/lib/utils.test.ts`                                                          | `cn` resolving conflicts between Nexus `nx:` utilities                                                                                                                                                           |
| **ESLint rules**          | `packages/eslint-plugin-nexus/__tests__/*.test.js`                                              | Each published rule reports what it should, and nothing else                                                                                                                                                     |
| **Distribution fixtures** | Consumer apps under repo-root `examples/` — see [Distribution fixtures](#distribution-fixtures) | Nexus delivered by copy or registry compiles, builds and keeps the host app's own styles and theme intact                                                                                                        |

Components are tested only through stories — see [testing-react.md](testing-react.md). Core engine, `cn` merge and ESLint rule tests run under Vitest's `unit` project and import from `vitest` directly. Distribution fixtures run outside Vitest.

### Distribution fixtures

A fixture is defined by what it is, not by its path:

- A standalone consumer app directly under repo-root `examples/`, with its own `package.json` and a committed npm lockfile (`package-lock.json`).
- Nexus arrives only through a delivery route: a manual copy, or the shadcn registry.

`examples/scripts/` and `examples/registry/` are repo scripts, and `examples/nextjs-consumer/` is the export route, which #798 retires. None of them is a fixture.

**Isolation.** The root `.npmrc` sets `node-linker=hoisted`, so an app inside the repository silently resolves any package it forgot to declare from the repo-root `node_modules`. A fixture is therefore verified from a copy outside the repository, and nothing in it resolves back into the repository: no `workspace:` or `link:` specifier, no `file:` specifier that names a directory, and no import that reaches repo source. A `file:` specifier may name a packed tarball of a workspace package, provided the tarball is copied out alongside the fixture; the copy then installs it like any published package.

**Checks.** Each fixture must pass `npm run typecheck` and `npm run build`. A computed-style probe loads the host alone and the host with Nexus in the same run, and compares the two. It never compares against a recorded baseline. Probes check that Nexus coexists with the host; component behaviour stays in stories.

## What We Don't Test

- **No snapshot tests.** No `toMatchSnapshot` / `toMatchInlineSnapshot`, and no frozen output fixtures compared with `toEqual`. Assert the property that matters — a contrast floor, a merge result, a reported lint error — not the exact output.
- **No app tests.** `apps/docs` is a demo surface, not the design system. Distribution fixtures are not app tests: they check that Nexus arrives and coexists, not that an app's features work.
- **No tests for repo scripts.** Audits and generators in `scripts/` and `packages/*/scripts/` get no tests of their own: the ones CI runs prove themselves by running, and a freshness check covers generated output. The rest — `scripts/export.mjs` among them — are reviewed, not gated.
- **No hook tests.** A hook is covered by the stories of the components that use it.

## Core Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT (real data)  →  SYSTEM UNDER TEST  →  OUTPUT (expected)  │
│                                                                 │
│  Tests validate: "Does the output match what we expect?"        │
│  Tests DO NOT focus on: internal method calls, line coverage    │
└─────────────────────────────────────────────────────────────────┘
```

**Given input X, expect output Y** — a seed colour in, a legible theme out; source code in, a lint report out; a user action in a story, a visible result out.

## Principles

1. **Result validation over code coverage** — 90% coverage with bad assertions is worse than 60% coverage with good assertions
2. **Real inputs over synthetic data** — Use real seed colours, real component code, genuine user flows
3. **Partial matching over exact equality** — Assert on the fields you care about, not every byte
4. **Determinism is non-negotiable** — If a test can fail randomly, it's broken
5. **Stub the browser, not Nexus** — Replace a browser API the environment lacks (e.g. `matchMedia`); never mock Nexus's own functions
6. **Test behavior, not implementation** — Tests shouldn't break when you refactor internals
7. **One reason to fail** — Each test should fail for exactly one reason

## Assertion Patterns

### Partial Matching (Preferred)

```typescript
// Good - assert on what matters
expect(result).toMatchObject({
  success: true,
  data: { name: 'Button' },
});

// Bad - exact matching breaks on irrelevant changes
expect(result).toEqual(fullExpectedObject);
```

### Thresholds Over Exact Values

```typescript
// Good - pins the behaviour: text clears its contrast floor
expect(apcaLcForPair(map, pair)).toBeGreaterThanOrEqual(
  TIER_THRESHOLDS[pair.tier]
);

// Bad - pins today's output: any intended colour change fails the test
expect(map['--nx-color-foreground']).toBe('oklch(0.2 0 0)');
```

### Error Assertions

```typescript
// Good - checks the diagnostic, not just that something threw
expect(() => adjustContrast('not-a-color')).toThrow(
  /cannot parse input 'not-a-color'/
);
```

## Anti-Patterns to Avoid

- Tests that pass but don't actually verify behavior
- Snapshots, or frozen fixtures that stand in for one
- Mocking internal implementation details
- Exact equality when partial matching or a threshold would suffice
- Tests that depend on execution order
- Flaky tests with `retry` or `timeout` workarounds
- `skip` or `only` committed to codebase
- Magic numbers in assertions without explanation

## Running Tests

```bash
pnpm test               # Unit + storybook (not distribution fixtures)
pnpm test:unit          # Core engine, cn merge, ESLint rules
pnpm test:storybook     # Every story's play function in a real browser
```

`pnpm test` does not run distribution fixtures. Run each one from a copy outside the repository, delivering Nexus through the fixture's own route before checking it:

```bash
npm ci
npm run nexus:add   # the fixture's delivery step; see its README
npm run typecheck
npm run build
```

#798 wires the fixtures into CI.

## Do Not

- Add a test outside the five kinds in [Scope](#scope)
- Take snapshots
- Focus on line coverage over result correctness
- Use synthetic `foo`/`bar` test data
- Mock internal functions
- Write flaky tests and add retries
- Commit `skip` or `only`
- Assert on unstable values (timestamps, random IDs)
