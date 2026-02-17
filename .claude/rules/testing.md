# Testing Rules - Core Philosophy

> This file contains testing principles that apply to ALL packages.
> For package-specific patterns, see:
>
> - [testing-react.md](testing-react.md) — React components, Storybook

## Core Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT (real data)  →  SYSTEM UNDER TEST  →  OUTPUT (expected)  │
│                                                                 │
│  Tests validate: "Does the output match what we expect?"        │
│  Tests DO NOT focus on: internal method calls, line coverage    │
└─────────────────────────────────────────────────────────────────┘
```

**Given input X, expect output Y.** This applies at every level:

- Unit tests: function input → function output
- Integration tests: component input → component output
- E2E tests: user action → visible result

## Principles

1. **Result validation over code coverage** — 90% coverage with bad assertions is worse than 60% coverage with good assertions
2. **Real fixtures over synthetic data** — Use actual component code, real API responses, genuine user flows
3. **Partial matching over exact equality** — Assert on fields you care about, not every byte
4. **Determinism is non-negotiable** — If a test can fail randomly, it's broken
5. **Mock boundaries, not internals** — Mock the database, not the repository methods
6. **Test behavior, not implementation** — Tests shouldn't break when you refactor internals
7. **One reason to fail** — Each test should fail for exactly one reason

## Test Type Selection

| Test Type         | When to Use                               | Mock Strategy              |
| ----------------- | ----------------------------------------- | -------------------------- |
| **Unit**          | Pure functions, utilities, isolated logic | None or minimal            |
| **Integration**   | Component interactions, pipelines         | External services only     |
| **E2E**           | User flows, critical paths                | Nothing (or test database) |
| **Fixture-based** | Data transformation pipelines, parsers    | Input files as fixtures    |

## Fixture Design

### Good Fixtures

| Pattern            | Description                                 |
| ------------------ | ------------------------------------------- |
| **Real data**      | Actual component code, real API responses   |
| **Edge cases**     | Empty arrays, null values, maximum lengths  |
| **Representative** | Covers common patterns in actual usage      |
| **Documented**     | Comments explaining what each fixture tests |

### Bad Fixtures

| Anti-pattern        | Why It's Bad                                       |
| ------------------- | -------------------------------------------------- |
| `foo`, `bar`, `baz` | Meaningless data that doesn't represent real usage |
| Generated data      | Random data makes tests non-deterministic          |
| Minimal fixtures    | Misses edge cases that exist in production         |
| Outdated fixtures   | Fixtures that don't match current system behavior  |

## Assertion Patterns

### Partial Matching (Preferred)

```typescript
// Good - assert on what matters
expect(result).toMatchObject({
  success: true,
  data: { name: 'Button' },
});

// Good - custom helper for domain objects
expectPropsToInclude(result.props, [{ name: 'variant', type: 'string' }]);

// Bad - exact matching breaks on irrelevant changes
expect(result).toEqual(fullExpectedObject);
```

### Structural Validation

```typescript
// Good - validates structure without brittle values
expect(result.success).toBe(true);
expect(result.data.name).toBeTruthy();
expect(result.data.items.length).toBeGreaterThan(0);

// Bad - asserts on unstable values
expect(result.data.timestamp).toBe('2025-01-15T10:00:00Z');
```

### Array Assertions

```typescript
// Good - checks contents without order dependency
expect(result.items).toContain('expected-item');
expect(result.items).toHaveLength(3);

// Good - checks structure
expect(result.items).toEqual(
  expect.arrayContaining([expect.objectContaining({ id: 'item-1' })])
);
```

### Error Assertions

```typescript
// Good - checks error type and message
await expect(doThing()).rejects.toThrow('specific error');

// Good - checks error shape for discriminated unions
const result = await doThing();
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error.code).toBe('VALIDATION_ERROR');
}
```

## Mock Strategy

### When to Mock

| Mock This               | Don't Mock This      |
| ----------------------- | -------------------- |
| External APIs           | Internal functions   |
| Databases               | Business logic       |
| File system (sometimes) | Data transformations |
| Time/dates              | Validation logic     |
| LLM/AI providers        | Internal state       |
| Network requests        | Utility functions    |

### Mock Design Principles

1. **Implement real interfaces** — Mocks should satisfy the same contract as real implementations
2. **Track call history** — For verifying interactions when needed
3. **Configurable responses** — Support happy path, errors, edge cases
4. **Fail explicitly** — Unconfigured mocks should throw, not return undefined

## Anti-Patterns to Avoid

- Tests that pass but don't actually verify behavior
- Mocking internal implementation details
- Exact JSON equality when partial matching would suffice
- Missing error case coverage
- Tests that depend on execution order
- Flaky tests with `retry` or `timeout` workarounds
- `skip` or `only` committed to codebase
- Magic numbers in assertions without explanation

## Running Tests

```bash
yarn test               # Run all tests
yarn test:coverage      # With coverage report (informational)
```

## Do Not

- Focus on line coverage over result correctness
- Use synthetic `foo`/`bar` test data
- Mock internal functions
- Write flaky tests and add retries
- Commit `skip` or `only`
- Assert on unstable values (timestamps, random IDs)
