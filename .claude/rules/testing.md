# Testing Rules - Core Philosophy

> This file sets what nxds tests and the principles every test follows.
> For story patterns, see [testing-react.md](testing-react.md).

## Scope

A test earns its place only when it pins behaviour a consumer of the design system would see. nxds has exactly six kinds:

| Kind                  | Lives in                                         | Pins                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component stories** | `packages/{react,vue}/src/**/*.stories.{tsx,ts}` | Component behaviour and accessibility, via `play` functions and the axe check on every story                                                                                                                                                                                     |
| **Core engine**       | `packages/core/src/lib/*.test.ts`                | Derived-theme contrast and legibility, colour-blind separation, registry/engine agreement, first-paint script, perceptual-ramp shade grid, token catalogue agreement with the generated CSS, compiled CSS scope (only `nx:` classes and `--nx-*` variables), token-file manifest |
| **`cn` merge**        | `packages/react/src/lib/utils.test.ts`           | `cn` resolving conflicts between nxds `nx:` utilities                                                                                                                                                                                                                            |
| **ESLint rules**      | `packages/eslint-plugin/__tests__/*.test.js`     | Each published rule reports what it should, and nothing else                                                                                                                                                                                                                     |
| **Parity**            | `parity/**/*.test.ts`                            | Each `@nxds/vue` component matching its `@nxds/react` reference, and the files Vue copies from React staying identical. A check compares the two packages with each other, never with a frozen copy                                                                              |
| **CLI**               | `packages/cli/__tests__/*.test.ts`               | `nxds-cli` run against a throwaway app and a local registry built from a committed release: files written, kept and merged, conflict markers, exit codes, `--json` output. Assert on file contents and results, never a frozen tree                                              |

Components are tested through stories — see [testing-react.md](testing-react.md) — and the parity tests hold each Vue component to its React reference. The same React stories also run on React 18 against the generated `packages/react-18` — see [react-18.md](react-18.md). The other five run under Vitest's `unit` project and import from `vitest` directly, except the rendered parity check in `parity/browser/`, which runs in the `parity` browser project.

## What We Don't Test

- **No snapshot tests.** No `toMatchSnapshot` / `toMatchInlineSnapshot`, and no frozen output fixtures compared with `toEqual`. Assert the property that matters — a contrast floor, a merge result, a reported lint error — not the exact output.
- **No app tests.** `apps/docs` is a demo surface, not the design system.
- **No tests for repo scripts.** Audits and generators in `scripts/` and `packages/*/scripts/` get no tests of their own: the ones CI runs prove themselves by running, and a freshness check covers generated output. The rest are reviewed, not gated.
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
5. **Stub the browser, not nxds** — Replace a browser API the environment lacks (e.g. `matchMedia`); never mock nxds's own functions
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
pnpm test               # Run all tests (unit + storybook)
pnpm test:unit          # Core engine, cn merge, ESLint rules, parity, CLI
pnpm test:storybook     # Every story's play function, and rendered parity, in a real browser
```

The parity prop contract reads `@nxds/core`'s built types. Run `pnpm --filter @nxds/core build` before `pnpm test:unit` on a fresh checkout.

## Do Not

- Add a test outside the six kinds in [Scope](#scope)
- Take snapshots
- Focus on line coverage over result correctness
- Use synthetic `foo`/`bar` test data
- Mock internal functions
- Write flaky tests and add retries
- Commit `skip` or `only`
- Assert on unstable values (timestamps, random IDs)
