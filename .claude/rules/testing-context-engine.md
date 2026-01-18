# Testing Rules - Context Engine

> This file contains testing patterns for `@context-engine/*` packages.
> For core testing philosophy, see: [testing.md](testing.md)

## Core Principle

**Fixture-based integration testing with MockLLMProvider.** Test the full pipeline with real component fixtures and mock LLM responses for deterministic, cost-free tests.

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT (component source)  →  SYSTEM  →  OUTPUT (manifest)      │
│                                                                 │
│  Tests validate: "Does the output match what we expect?"        │
│  Tests DO NOT focus on: internal method calls, line coverage    │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Split

| What                | Where                        | Key Pattern                          |
| ------------------- | ---------------------------- | ------------------------------------ |
| Extraction          | `test/integration/*.test.ts` | Real fixtures → ExtractedData        |
| Generation          | `test/integration/*.test.ts` | MockLLMProvider + recorded responses |
| Full Pipeline       | `test/integration/*.test.ts` | Component → ComponentManifest        |
| AI Usability        | `test/integration/*.test.ts` | Manifest → AI-ready validation       |
| Multi-org Isolation | `test/integration/*.test.ts` | orgId scoping                        |
| Edge Cases          | `test/edge-cases/*.test.ts`  | Unusual patterns                     |

## File Structure

```
packages/context-engine/core/
├── src/                           # Production code
├── test/
│   ├── fixtures/
│   │   ├── components/
│   │   │   ├── shadcn/            # Real shadcn-style components
│   │   │   └── edge-cases/        # Unusual patterns
│   │   └── responses/             # Recorded LLM responses
│   ├── providers/
│   │   └── mock-llm-provider.ts   # Implements ILLMProvider
│   ├── utils/
│   │   ├── fixture-loader.ts      # Load component files
│   │   ├── response-recorder.ts   # Record real LLM responses
│   │   └── assertion-helpers.ts   # Partial matching utilities
│   ├── integration/
│   │   ├── extractor.test.ts
│   │   ├── generator.test.ts
│   │   ├── processor.test.ts
│   │   ├── ai-usability.test.ts
│   │   └── isolation.test.ts
│   ├── edge-cases/
│   │   └── edge-cases.test.ts
│   └── setup.ts
└── vitest.config.ts
```

## MockLLMProvider

The mock provider implements `ILLMProvider` interface exactly:

```typescript
import type {
  ILLMProvider,
  LLMCompletionResponse,
} from '@context-engine/core/generator';

interface MockLLMProviderConfig {
  modelId?: string;
  responses?: Map<string | RegExp, LLMCompletionResponse>;
  defaultResponse?: LLMCompletionResponse;
  errorAfterCalls?: number;
  simulateLatencyMs?: number;
}

class MockLLMProvider implements ILLMProvider {
  readonly providerType = LLMProviderType.Mock;

  // Test utilities
  getCallHistory(): Array<{ prompt: string; options?: LLMCompletionOptions }>;
  getCallCount(): number;
  reset(): void;
}
```

**Key features:**

- Pattern matching for prompt-specific responses
- Simulated rate limiting (`errorAfterCalls`)
- Call history tracking for assertions
- Configurable latency for timing tests

## Fixture Types

### Component Fixtures

| Fixture                            | Pattern        | What It Tests                        |
| ---------------------------------- | -------------- | ------------------------------------ |
| `shadcn/button.tsx`                | CVA variants   | Variant extraction, defaults         |
| `shadcn/dialog.tsx`                | Radix compound | Multi-export, base library detection |
| `shadcn/input.tsx`                 | forwardRef     | Ref forwarding, HTML props           |
| `edge-cases/no-props.tsx`          | No interface   | Empty props handling                 |
| `edge-cases/generic-component.tsx` | `<T>` generics | Generic constraints                  |

### Response Fixtures

Recorded LLM responses in `test/fixtures/responses/`:

```json
{
  "text": "{\"description\":\"An interactive button...\"}",
  "model": "claude-sonnet-4-20250514",
  "stopReason": "end_turn",
  "usage": { "inputTokens": 1200, "outputTokens": 450 }
}
```

**Recording new responses:**

```bash
ANTHROPIC_API_KEY=xxx npx tsx test/utils/response-recorder.ts button
```

## Assertion Helpers

### Partial Matching for Props

```typescript
// Assert on key fields we care about, not everything
expectPropsToInclude(result.data, [
  { name: 'variant', type: 'string', required: false },
  { name: 'size', type: 'string', required: false },
]);
```

### Variant Assertions

```typescript
expectVariantsToInclude(result.data, {
  variant: ['default', 'destructive', 'outline'],
  size: ['default', 'sm', 'lg'],
});
```

### Base Library Detection

```typescript
expectBaseLibrary(result.data, {
  name: 'Radix UI',
  component: 'Dialog',
});
```

### AI-Ready Validation

```typescript
expectManifestAIReady(manifest);
// Checks: description exists, props documented, types present
```

## Test Patterns

### Extraction Tests

```typescript
describe('HybridExtractor', () => {
  it('extracts props with correct types', async () => {
    const fixture = await loadFixture('shadcn', 'button');
    const result = await extractComponent({
      name: fixture.name,
      sourceCode: fixture.sourceCode,
      filePath: fixture.filePath,
      framework: 'react',
      orgId: 'test-org',
      libraryId: 'test-lib',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expectPropsToInclude(result.data, [
      { name: 'variant', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ]);
  });
});
```

### Generation Tests with Mock

```typescript
describe('MetaGenerator', () => {
  it('produces metadata with all required fields', async () => {
    const recordedResponse = await loadRecordedResponse('button');
    const mockProvider = new MockLLMProvider({
      defaultResponse: recordedResponse,
    });
    const generator = createMetaGenerator({ provider: mockProvider });

    const extraction = await extractComponent({
      /* ... */
    });
    const result = await generator.generate(extraction.data);

    expect(result.success).toBe(true);
    expect(result.data.description).toBeTruthy();
    expect(Array.isArray(result.data.useCases)).toBe(true);
  });
});
```

### Full Pipeline Tests

```typescript
describe('ComponentProcessor', () => {
  it('produces valid ComponentManifest from source code', async () => {
    const recordedResponse = await loadRecordedResponse('button');
    const processor = createComponentProcessor({
      extractor: new HybridExtractor(),
      generator: createMetaGenerator({
        provider: new MockLLMProvider({ defaultResponse: recordedResponse }),
      }),
    });

    const fixture = await loadFixture('shadcn', 'button');
    const result = await processor.process({
      /* ... */
    });

    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Button');
    expect(result.data.description).toBeTruthy();
  });
});
```

### AI Usability Tests

```typescript
describe('AI Usability', () => {
  it('Button manifest enables correct JSX generation', async () => {
    const result = await processor.process({
      /* ... */
    });

    // AI needs these to generate correct code:
    expect(result.data.name).toBe('Button'); // For import
    expect(result.data.props.find((p) => p.name === 'variant')).toBeDefined();
    expect(result.data.defaultVariants).toBeDefined(); // For defaults
  });
});
```

### Multi-Org Isolation Tests

```typescript
describe('Multi-Org Isolation', () => {
  it('manifests include orgId in identity', async () => {
    const result = await processor.process({
      /* ... */
      orgId: 'org-123',
      libraryId: 'lib-456',
    });

    expect(result.data.identity.orgId).toBe('org-123');
  });

  it('rejects invalid orgId format', async () => {
    await expect(
      processor.process({
        /* ... */
        orgId: '', // Invalid
      })
    ).rejects.toThrow();
  });
});
```

## Error Testing

### Auth Errors (Non-Retryable)

```typescript
it('returns failure with retryable=false for auth errors', async () => {
  vi.spyOn(mockProvider, 'generateCompletion').mockRejectedValue(
    new Error('401 Unauthorized')
  );

  const result = await generator.generate(extraction.data);

  expect(result.success).toBe(false);
  expect(result.error.retryable).toBe(false);
});
```

### Rate Limit Errors (Retryable)

```typescript
it('returns failure with retryable=true for rate limit errors', async () => {
  vi.spyOn(mockProvider, 'generateCompletion').mockRejectedValue(
    new Error('429 Rate limit exceeded')
  );

  const result = await generator.generate(extraction.data);

  expect(result.success).toBe(false);
  expect(result.error.retryable).toBe(true);
});
```

### Malformed JSON Response

```typescript
it('handles malformed JSON response gracefully', async () => {
  mockProvider = new MockLLMProvider({
    defaultResponse: {
      text: 'This is not valid JSON {{{',
      model: 'mock',
      stopReason: 'end_turn',
      usage: { inputTokens: 100, outputTokens: 50 },
    },
  });

  const result = await generator.generate(extraction.data);
  expect(result.success).toBe(false);
});
```

## Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/integration/extractor.test.ts

# Watch mode
yarn test --watch

# Coverage (informational, not the goal)
yarn test --coverage

# Record new LLM responses
ANTHROPIC_API_KEY=xxx npx tsx test/utils/response-recorder.ts button
```

## What to Mock

| Mock This        | Don't Mock This     |
| ---------------- | ------------------- |
| LLM providers    | Extractor internals |
| File system I/O  | Parser logic        |
| Database queries | Business rules      |
| Network requests | Validation logic    |

## Do Not

- Mock internal extraction/generation logic
- Use synthetic `foo`/`bar` test data
- Skip org isolation tests
- Use exact JSON equality for manifests (use partial matching)
- Make tests depend on real LLM API calls
- Focus on line coverage over result correctness
- Commit `.skip` or `.only`
