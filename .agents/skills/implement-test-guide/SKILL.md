---
name: implement-test-guide
description: Implement tests with production-quality coverage. Use when implementing test suites, adding test coverage, or building testing infrastructure.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
user-invocable: false
---

# Implement Test

## Purpose

Implement tests with a focus on result validation over code coverage. Works with any codebase, any testing framework, using the "given input → expect output" philosophy.

## When to Use

- Implementing tests for new or existing code
- Building testing infrastructure (fixtures, mocks, utilities)
- Adding coverage to untested modules
- Creating integration test suites

## Context Sources

This skill works with multiple input types:

| Source           | Detection                 | How to Extract                                                |
| ---------------- | ------------------------- | ------------------------------------------------------------- |
| **Testing plan** | `.md` file with test plan | Read the file content                                         |
| **GitHub issue** | `#123` pattern in input   | `gh issue view 123 --json number,title,body,labels,state,url` |
| **Source code**  | File path to code to test | Read the source file                                          |
| **Conversation** | Requirements in chat      | Parse from conversation history                               |

## Package-Specific Testing Patterns

Based on what you're testing, different patterns apply:

| Package            | Detect By              | Testing Approach                                   |
| ------------------ | ---------------------- | -------------------------------------------------- |
| Core               | `packages/core/`       | Unit tests for token generation scripts (Vitest)   |
| React              | `packages/react/`      | Story-first: play functions in `*.stories.tsx`     |
| Test utils         | `packages/test-utils/` | Unit tests for shared helpers                      |
| Tailwind           | `packages/tailwind/`   | Generated CSS — verify via consuming-package tests |
| General TypeScript | Any `.ts`              | Vitest unit/integration tests                      |

## Base Rules

Always load and follow:

| Rule                                                                            | Purpose                                                                              |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [code-quality.md](../../../.claude/rules/code-quality.md)                       | Governing principle: favor simplicity over cleverness; index to per-rule files       |
| [ripple-effect.md](../../../.claude/rules/ripple-effect.md)                     | Test additions must leave helpers, fixtures, and adjacent tests consistently updated |
| [guard-clauses.md](../../../.claude/rules/guard-clauses.md)                     | Keep the assertion path at column 0; exit early on setup failures                    |
| [logging-proportionality.md](../../../.claude/rules/logging-proportionality.md) | One dense canonical log line beats ten incremental ones                              |
| [code-comments.md](../../../.claude/rules/code-comments.md)                     | Comment only non-obvious logic; no rationale blocks; TODOs require tracked issues    |
| [project-stage.md](../../../.claude/rules/project-stage.md)                     | Pre-production: no backcompat, no shims, no feature flags — change code in place     |
| [docs-mcp.md](../../../.claude/rules/docs-mcp.md)                               | MANDATORY: query nexus-docs-mcp for any third-party API; do not guess from memory    |
| [github.md](../../../.claude/rules/github.md)                                   | PR title/body templates, branch naming, commit format, `Closes #N`                   |

## Implementation Process

### Phase 1: Understand What to Test

1. **Identify the target:**

   ```
   If testing plan provided → Read and understand requirements
   If source file provided → Read and understand the code
   If GitHub issue (#123) → Fetch issue via gh issue view
   Otherwise → Clarify with user what needs tests
   ```

2. **Understand the code behavior:**
   - What are the inputs?
   - What are the expected outputs?
   - What are the error cases?
   - What are the edge cases?

3. **Identify existing test patterns:**
   - How does this codebase test similar code?
   - What test utilities exist?
   - What's the test file naming convention?

### Phase 2: Design Test Strategy

1. **Choose test type:**

   | Code Type               | Test Type          | Why                     |
   | ----------------------- | ------------------ | ----------------------- |
   | Pure function           | Unit test          | No dependencies to mock |
   | Class with dependencies | Unit + mocks       | Isolate the unit        |
   | Data pipeline           | Integration        | Test real flow          |
   | Component with UI       | Story with play fn | Visual + interaction    |
   | External API consumer   | Integration + mock | Mock the API            |

2. **Design fixtures:**
   - Use real data patterns from the codebase
   - Cover happy path, errors, edge cases
   - Document what each fixture tests

3. **Plan mock strategy:**
   - Mock external services (APIs, DBs, LLMs)
   - Don't mock internal functions
   - Mocks must implement real interfaces

### Phase 3: Implement Tests

1. **Work through systematically:**
   - Set up test file and imports
   - Create fixtures/mocks needed
   - Implement happy path tests
   - Implement error case tests
   - Implement edge case tests

2. **Follow testing principles:**
   - Assert on results, not implementation
   - Use partial matching for complex objects
   - One assertion focus per test
   - Descriptive test names

3. **Test file structure:**

   ```typescript
   import { describe, it, expect } from 'vitest'; // or appropriate framework

   describe('ModuleName', () => {
     describe('functionName', () => {
       it('returns expected output for valid input', () => {
         // Arrange
         const input = createFixture();

         // Act
         const result = functionName(input);

         // Assert
         expect(result.success).toBe(true);
         expect(result.data).toMatchObject({
           expectedField: 'value',
         });
       });

       it('returns error for invalid input', () => {
         // Error case test
       });
     });
   });
   ```

### Phase 4: Verify Tests

1. **Run tests:**

   ```bash
   pnpm test                    # All tests
   pnpm test path/to/test.ts   # Specific file
   ```

2. **Verify quality:**
   - [ ] Tests actually fail when code is broken
   - [ ] Tests are deterministic (run multiple times)
   - [ ] No flaky behavior
   - [ ] Error cases covered

3. **Check test output:**
   - Clear failure messages
   - Easy to understand what failed and why

## Output Format

After test implementation is complete:

````markdown
## Tests Implemented

### Target

{What was tested - module/component/feature}

### Test Files

| File                          | Tests | Description                    |
| ----------------------------- | ----- | ------------------------------ |
| `path/to/module.test.ts`      | 5     | Unit tests for core functions  |
| `path/to/integration.test.ts` | 3     | Integration tests for pipeline |

### Coverage

| Scenario    | Tests | Status |
| ----------- | ----- | ------ |
| Happy path  | 3     | ✅     |
| Error cases | 2     | ✅     |
| Edge cases  | 2     | ✅     |

### Key Test Patterns

{Notable patterns used - fixtures, mocks, assertions}

### Verification

```bash
pnpm test path/to/tests
```

- [ ] All tests passing
- [ ] Tests are deterministic
- [ ] Error cases covered

### Next Steps

{Any follow-up items or notes}
````

## Assertion Patterns Reference

### Partial Object Matching

```typescript
// Good - checks relevant fields
expect(result).toMatchObject({
  success: true,
  data: { name: 'Button' },
});

// Good - custom helper for domain objects
expectPropsToInclude(result.props, [{ name: 'variant', type: 'string' }]);
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

// Good - checks error shape
const result = await doThing();
expect(result.success).toBe(false);
expect(result.error.code).toBe('VALIDATION_ERROR');
```

## Common Testing Frameworks

| Framework | Use Case               | Import Pattern                                                   |
| --------- | ---------------------- | ---------------------------------------------------------------- |
| Vitest    | Unit/integration tests | `import { describe, it, expect } from 'vitest'`                  |
| Storybook | Component tests        | `import { expect, fn, userEvent, within } from 'storybook/test'` |
| Jest      | Legacy/specific needs  | `import { describe, it, expect } from '@jest/globals'`           |

## Principles to Follow

1. **Result validation over coverage** — Good assertions matter more than line count
2. **Real fixtures** — Use actual data patterns from the system
3. **Partial matching** — Assert on what matters, not everything
4. **Mock boundaries** — Mock external services, not internal logic
5. **Determinism** — Tests must produce same result every time
6. **One focus per test** — Each test should have one reason to fail
7. **Readable tests** — Test code is documentation
