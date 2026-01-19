# Testing Rules - Context Engine

> This file contains testing patterns for `@context-engine/*` packages.
> For core testing philosophy, see: [testing.md](testing.md)

## Core Principle

**The LLM is the CORE of the generator's value.** Real LLM tests validate actual output quality, mock tests are only for error handling and pipeline mechanics.

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT (component source)  →  SYSTEM  →  OUTPUT (manifest)      │
│                                                                 │
│  Extraction tests: Real code → Real parsed data (VALUABLE)      │
│  Real LLM tests: Real prompts → Real AI output (VALUABLE)       │
│  Mock tests: Error handling only (LIMITED USE)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Philosophy

**Key insight:** If someone breaks the prompt template, will tests catch it?

- With mocks: NO (tests still pass with hardcoded responses)
- With real LLM: YES (output quality degrades)

**What to test with mocks:**

- Error handling (rate limits, auth failures, malformed JSON)
- Pipeline mechanics (skipGeneration, two-phase API)
- Multi-org isolation (where LLM output doesn't matter)

**What to test with real LLM:**

- Output quality (descriptions, patterns, examples)
- Prompt effectiveness (does the prompt produce useful metadata?)
- AI usability (can an AI assistant use this manifest to generate code?)

## Testing Split

| What                | Where                           | Provider          | Key Pattern                          |
| ------------------- | ------------------------------- | ----------------- | ------------------------------------ |
| Extraction          | `test/integration/extractor.ts` | None (real code)  | Real fixtures → ExtractedData        |
| LLM Output Quality  | `test/integration/real-llm.ts`  | AnthropicProvider | Real prompts → Real AI output        |
| Error Handling      | `test/integration/generator.ts` | MockLLMProvider   | Simulated errors → Graceful handling |
| Pipeline Mechanics  | `test/integration/processor.ts` | MockLLMProvider   | skipGeneration, two-phase API        |
| Multi-org Isolation | `test/integration/isolation.ts` | MockLLMProvider   | orgId scoping                        |
| Edge Cases          | `test/edge-cases/*.test.ts`     | MockLLMProvider   | Unusual patterns                     |

## File Structure

```
packages/context-engine/core/
├── src/                           # Production code
├── test/
│   ├── fixtures/
│   │   └── components/
│   │       ├── shadcn/            # Real shadcn-style components
│   │       └── edge-cases/        # Unusual patterns
│   ├── providers/
│   │   └── mock-llm-provider.ts   # For error handling tests ONLY
│   ├── utils/
│   │   ├── fixture-loader.ts      # Load component files
│   │   └── assertion-helpers.ts   # Partial matching utilities
│   ├── integration/
│   │   ├── extractor.test.ts      # VALUABLE - real extraction
│   │   ├── real-llm.test.ts       # VALUABLE - real LLM quality
│   │   ├── generator.test.ts      # Error handling only
│   │   ├── processor.test.ts      # Mechanics only
│   │   ├── ai-usability.test.ts   # Extraction structure
│   │   └── isolation.test.ts      # Multi-org isolation
│   ├── edge-cases/
│   │   └── edge-cases.test.ts
│   └── setup.ts
└── vitest.config.ts
```

## Real LLM Tests (MOST VALUABLE)

Located in `test/integration/real-llm.test.ts`. Requires `ANTHROPIC_API_KEY`.

```bash
# Run real LLM tests
ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
```

**When API key is not available, tests are automatically skipped.**

### What Real LLM Tests Validate

```typescript
// Tests that mock tests CANNOT catch:

it('generates semantically meaningful description', async () => {
  const result = await processor.process(buttonInput);

  // Description should mention purpose, not just be generic
  expect(result.manifest.description.toLowerCase()).toContain('button');
  expect(
    description.includes('action') ||
      description.includes('click') ||
      description.includes('trigger')
  ).toBe(true);
});

it('identifies correct patterns for component type', async () => {
  const result = await processor.process(buttonInput);
  const patterns = result.manifest.ai?.patterns ?? [];

  // Button should have action-related pattern
  const hasActionPattern = patterns.some((p) =>
    ['button', 'async-action', 'action'].includes(p.toLowerCase())
  );
  expect(hasActionPattern).toBe(true);
});
```

## Mock Provider Usage

**Only use MockLLMProvider for:**

- Error handling tests (rate limits, auth failures)
- Malformed response handling
- Pipeline mechanics (skipGeneration)
- Tests where LLM output quality doesn't matter

```typescript
// APPROPRIATE: Testing error handling
describe('error handling', () => {
  it('returns failure with retryable=true for 429 errors', async () => {
    const rateLimitedProvider = createRateLimitedProvider(0);
    generator = createMetaGenerator({ provider: rateLimitedProvider });

    const result = await generator.generate(input);

    expect(result.type).toBe('failure');
    expect(result.retryable).toBe(true);
  });
});

// INAPPROPRIATE: Testing output quality
describe('output quality', () => {
  it('generates good descriptions', async () => {
    // DON'T DO THIS - mock responses make this test useless
    const mockProvider = createMockLLMProvider({ defaultResponse: MOCK });
    // The test will always pass with hardcoded responses
  });
});
```

## Extraction Tests (VALUABLE)

Extraction tests use real component fixtures and test real parsing logic:

```typescript
describe('HybridExtractor', () => {
  it('extracts CVA variants', async () => {
    const fixture = loadFixture('shadcn', 'button');
    const result = await extractComponent({
      orgId: 'test-org',
      name: 'Button',
      sourceCode: fixture.sourceCode,
      framework: 'react',
    });

    expect(result.type).toBe('success');
    if (result.type !== 'success') return;

    // Real extraction from real code
    expect(result.data.variants?.variant).toContain('default');
    expect(result.data.variants?.variant).toContain('destructive');
  });
});
```

## Multi-Org Isolation Tests (VALUABLE)

Tests actual isolation behavior, not LLM output:

```typescript
describe('Multi-Org Isolation', () => {
  it('same component for different orgs gets different IDs', async () => {
    const resultA = await processor.process({ ...input, orgId: 'org-a' });
    const resultB = await processor.process({ ...input, orgId: 'org-b' });

    // IDs should be unique per processing
    expect(resultA.manifest.id).not.toBe(resultB.manifest.id);
  });
});
```

## Assertion Helpers

### Partial Matching for Props

```typescript
expectPropsToInclude(result.data.props, [
  { name: 'variant', type: 'string', required: false },
  { name: 'size', type: 'string', required: false },
]);
```

### AI-Ready Validation

```typescript
expectManifestAIReady(manifest);
// Checks: id exists, name exists, props have types, sourceHash valid
```

## Running Tests

```bash
# Run all tests (mocked LLM tests + extraction)
yarn test

# Run real LLM tests (requires API key)
ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts

# Run specific test file
yarn test test/integration/extractor.test.ts

# Watch mode
yarn test --watch
```

## When to Mock vs Real LLM

| Scenario                        | Use Mock | Use Real LLM |
| ------------------------------- | -------- | ------------ |
| Testing error handling          | Yes      | No           |
| Testing pipeline mechanics      | Yes      | No           |
| Testing extraction              | N/A      | N/A          |
| Testing output quality          | No       | Yes          |
| Testing prompt effectiveness    | No       | Yes          |
| Testing AI usability            | No       | Yes          |
| Testing org isolation           | Yes      | No           |
| CI pipeline (no API key)        | Yes      | Skip         |
| Local development (has API key) | Both     | Both         |

## Do Not

- Use mock tests to validate LLM output quality (they can't)
- Skip real LLM tests because "they cost money" (they provide real value)
- Mock internal extraction/generation logic
- Use synthetic `foo`/`bar` test data
- Focus on line coverage over result correctness
- Commit `.skip` or `.only`
