# Context Engine Core Architecture

## Overview

Context Engine Core provides a three-phase pipeline for transforming component source code into AI-accessible metadata. Each phase is independently usable, enabling both full pipeline processing and fine-grained control.

## High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                      Three-Phase Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   INPUT: Component Source Code                                   │
│      ↓                                                           │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  PHASE 1: EXTRACTION (Fast, No LLM)                      │  │
│   │  - Parse component code                                  │  │
│   │  - Extract props, variants, dependencies                 │  │
│   │  - Detect compound components                            │  │
│   │  - Parse Storybook examples                              │  │
│   │  Output: ExtractedData                                   │  │
│   └──────────────────────────────────────────────────────────┘  │
│      ↓                                                           │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  PHASE 2: GENERATION (Slow, LLM-based)                   │  │
│   │  - Generate semantic descriptions                        │  │
│   │  - Create usage guidance                                 │  │
│   │  - Generate code examples (if no Storybook)              │  │
│   │  - Generate variant descriptions                         │  │
│   │  Output: ComponentMeta                                   │  │
│   └──────────────────────────────────────────────────────────┘  │
│      ↓                                                           │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  PHASE 3: MANIFEST BUILDING (Fast, Pure Transform)       │  │
│   │  - Categorize props by semantic purpose                  │  │
│   │  - Normalize CVA variants                                │  │
│   │  - Enrich props with LLM descriptions                    │  │
│   │  - Build import statements                               │  │
│   │  - Structure examples (Storybook or LLM)                 │  │
│   │  Output: ManifestMetadata + AIManifest                   │  │
│   └──────────────────────────────────────────────────────────┘  │
│      ↓                                                           │
│   OUTPUT: Complete Component Manifest                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Module Dependency Graph

```
┌────────────────────────────────────────────────────────────────┐
│                         Module Dependencies                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   types/                (Shared type definitions)              │
│      ↑                                                         │
│      │                                                         │
│   ┌──┴─────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │  extractor/               generator/                    │  │
│   │  ├── hybrid-extractor     ├── meta-generator            │  │
│   │  ├── react-docgen         ├── anthropic-provider        │  │
│   │  ├── ts-morph             ├── gemini-provider           │  │
│   │  ├── variant-extractor    ├── prompts                   │  │
│   │  ├── dependency           └── tool-schema                │  │
│   │  ├── storybook/                                          │  │
│   │  ├── compound                                            │  │
│   │  ├── composition                                         │  │
│   │  └── radix                                               │  │
│   │     ↓                        ↓                           │  │
│   │  utils/                                                  │  │
│   │  ├── prop-categorization                                 │  │
│   │  ├── temp-manager                                        │  │
│   │  └── hash                                                │  │
│   │     ↓                        ↓                           │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │           manifest/                              │   │  │
│   │  │           └── manifest-builder                   │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │     ↓                        ↓                           │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │           processor/                             │   │  │
│   │  │           ├── component-processor                │   │  │
│   │  │           └── file-state-store                   │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                │
│   constants/            (Base libraries, schemas)              │
│   config/               (Environment config)                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **No circular dependencies** - Enforced via module structure
2. **types/ is foundation** - All modules can import from types/
3. **utils/ is shared** - No dependencies on domain modules
4. **extractor/ and generator/ are parallel** - No cross-dependencies
5. **manifest/ depends on both** - Combines extraction + generation
6. **processor/ is top-level** - Orchestrates all other modules

## Data Flow

### Full Pipeline (process)

```
┌───────────────────────────────────────────────────────────────────┐
│                        Data Flow: process()                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ProcessorInput {                                                 │
│    orgId, name, sourceCode, framework, ...                        │
│  }                                                                │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  EXTRACTOR: HybridExtractor                                 │ │
│  │                                                             │ │
│  │  1. Compute source hash (SHA-256)                           │ │
│  │  2. Extract props (react-docgen-typescript primary)         │ │
│  │  3. Check fallback triggers (explicit conditions)           │ │
│  │  4. Extract props (ts-morph fallback if triggered)          │ │
│  │  5. Extract variants (CVA/tailwind-variants)                │ │
│  │  6. Extract dependencies (npm + internal)                   │ │
│  │  7. Extract Storybook examples (if provided)                │ │
│  │  8. Extract Radix primitive info                            │ │
│  │  9. Extract compound component info                         │ │
│  │ 10. Extract sub-component props                             │ │
│  │ 11. Analyze composition (required vs optional)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  ExtractResult {                                                  │
│    identity: { id, slug, name, framework },                       │
│    extracted: {                                                   │
│      props: [...],                                                │
│      variants: {...},                                             │
│      dependencies: {...},                                         │
│      stories: [...],                                              │
│      compoundInfo: {...},                                         │
│      subComponents: [...]                                         │
│    },                                                             │
│    sourceHash,                                                    │
│    metadata: { extractionMethod, fallbackTriggered, ... }         │
│  }                                                                │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  GENERATOR: MetaGenerator                                   │ │
│  │                                                             │ │
│  │  1. Detect Storybook examples (skip example gen if found)  │ │
│  │  2. Build tool calling prompt (system + user)              │ │
│  │  3. Call LLM provider with tool definition                 │ │
│  │  4. Receive tool call result (structured JSON)             │ │
│  │  5. Validate tool output (Zod schema)                      │ │
│  │  6. Normalize to ComponentMeta                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  GenerateResult {                                                 │
│    meta: {                                                        │
│      name, description,                                           │
│      ai: {                                                        │
│        semanticDescription,                                       │
│        whenToUse, whenNotToUse,                                   │
│        patterns, a11yNotes,                                       │
│        examples, variantDescriptions,                             │
│        relatedComponents                                          │
│      }                                                            │
│    },                                                             │
│    provider, model, usage                                         │
│  }                                                                │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  BUILDER: ManifestBuilder                                   │ │
│  │                                                             │ │
│  │  1. Categorize props (variants, behaviors, events, etc.)   │ │
│  │  2. Normalize variants (add missing CVA variants)          │ │
│  │  3. Enrich props (add LLM variant descriptions)            │ │
│  │  4. Build import statement (package detection)             │ │
│  │  5. Build examples (Storybook or LLM-generated)            │ │
│  │  6. Build guidance (filter related components)             │ │
│  │  7. Build sub-components (apply same pipeline)             │ │
│  │  8. Build metadata (system fields)                         │ │
│  │  9. Build AIManifest (conditionally include fields)        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  ProcessorResult {                                                │
│    componentName,                                                 │
│    metadata: { id, schemaVersion, sourceHash, ... },              │
│    manifest: { name, props, examples, guidance, ... },            │
│    extraction: { extractionMethod, fallbackTriggered, ... }       │
│  }                                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Hybrid Extraction Strategy

**Decision:** Use react-docgen-typescript as primary extractor with ts-morph as explicit fallback.

**Rationale:**

- react-docgen-typescript: Battle-tested (88k+ stars), full TypeScript type resolution, automatic JSDoc extraction
- ts-morph: Handles edge cases (HOCs, forwardRef, non-standard patterns)
- Explicit fallback triggers instead of heuristics for predictability

**Trade-offs:**

- Pro: Accurate props for 95%+ of components
- Pro: Handles edge cases that would fail with single extractor
- Con: More complex implementation than single-extractor approach
- Con: Requires maintaining fallback trigger conditions

### 2. Tool Calling Only (No Text Parsing)

**Decision:** All LLM providers must implement tool calling for structured output. No text parsing fallback.

**Rationale:**

- Tool calling provides guaranteed structure (JSON Schema → LLM → validated output)
- Text parsing is brittle, error-prone, and hard to maintain
- Modern LLMs (Claude Opus 4, Gemini 2.0) have excellent tool calling support

**Trade-offs:**

- Pro: Reliable, structured output
- Pro: Easy validation via Zod schemas
- Pro: No regex-based parsing complexity
- Con: Requires LLM providers to support tool calling
- Con: Cannot use older models without tool calling

### 3. Prop Categorization

**Decision:** Categorize props by semantic purpose (variants, behaviors, events, slots, passthrough, other) instead of flat list.

**Rationale:**

- AI assistants benefit from understanding prop purpose
- Enables smarter code generation (e.g., "add a loading state" → behaviors category)
- Matches how developers think about component APIs

**Trade-offs:**

- Pro: Better AI understanding and code generation
- Pro: Cleaner manifest structure
- Con: Requires categorization logic maintenance
- Con: Edge cases (e.g., is `asChild` a behavior or other?)

### 4. Variant Normalization

**Decision:** Merge CVA variants into props even when react-docgen-typescript doesn't extract them.

**Rationale:**

- CVA variants come from `VariantProps<typeof componentVariants>`, not explicit props
- react-docgen-typescript doesn't see these as props
- But they're essential API surface for AI consumption

**Trade-offs:**

- Pro: Complete variant information in manifest
- Pro: Matches actual component API
- Con: Complex merging logic
- Con: Assumes CVA usage (but that's our design system pattern)

### 5. Storybook Example Priority

**Decision:** Prefer Storybook stories over LLM-generated examples when available.

**Rationale:**

- Storybook stories are maintained by humans, reflect real usage
- LLM examples are generic and may not match design system patterns
- Saves LLM tokens when stories exist

**Trade-offs:**

- Pro: Accurate, real-world examples
- Pro: Reduces LLM costs
- Con: Storybook stories may not be optimized for AI consumption
- Con: Requires Storybook stories to be provided

### 6. Atomic Operations

**Decision:** Expose extract(), generate(), build() as separate methods alongside process().

**Rationale:**

- Extraction is fast and cheap (no LLM)
- Generation is slow and expensive (LLM-based)
- Users may want to extract many components, then generate selectively

**Trade-offs:**

- Pro: Fine-grained control
- Pro: Better for batch operations
- Con: More API surface
- Con: Users must understand pipeline phases

### 7. Error Throwing vs Result Types

**Decision:** Throw errors instead of returning Result<Success, Error> types.

**Rationale:**

- Simplifies consumer code (no result.success checks)
- Aligns with JavaScript/TypeScript conventions
- Error boundaries handle propagation naturally

**Trade-offs:**

- Pro: Cleaner consumer code
- Pro: Standard error handling patterns
- Con: No discriminated union benefits
- Con: Must wrap in try-catch

### 8. Persistent Storage as Optional Feature

**Decision:** File-based storage is opt-in via `storeDir` configuration, not default.

**Rationale:**

- Most use cases process components end-to-end (no intermediate storage needed)
- Persistent storage adds filesystem I/O complexity
- Useful for debugging, CLI tools, multi-step workflows

**Trade-offs:**

- Pro: Simpler default behavior
- Pro: No filesystem side effects by default
- Con: Must configure explicitly when needed
- Con: Storage format is implementation detail (JSON files)

## Extension Points

### Adding New Extractors

To support a new framework or extraction strategy:

1. Implement `IExtractor` interface from types/
2. Add to HybridExtractor's framework detection logic
3. Handle framework-specific patterns (e.g., Vue SFC, Svelte components)

**Example:** Supporting Vue

```typescript
// extractor/vue-extractor.ts
export class VueExtractor implements IExtractor {
  async extract(input: ExtractionInput): Promise<ExtractorResult> {
    // Parse .vue SFC files
    // Extract props from <script setup> or Options API
    // Return ExtractorResult
  }
}

// extractor/hybrid-extractor.ts
private getFrameworkExtractor(framework: Framework): IExtractor {
  switch (framework) {
    case 'react': return new ReactDocgenExtractor();
    case 'vue': return new VueExtractor(); // Add here
    default: throw new Error(`Unsupported framework: ${framework}`);
  }
}
```

### Adding New LLM Providers

To support a new LLM provider:

1. Implement `ILLMProvider` interface from generator/types.ts
2. Add factory function (e.g., `createOpenAIProvider`)
3. Export from generator/index.ts

**Example:** Supporting OpenAI

```typescript
// generator/openai-provider.ts
export class OpenAIProvider implements ILLMProvider {
  async generateWithToolCalling<T>(
    prompt: string,
    options?: ToolCallingOptions
  ): Promise<ToolCallResult<T>> {
    // Call OpenAI with function calling
    // Map response to ToolCallResult
  }

  get providerType(): LLMProviderType {
    return 'openai';
  }

  get modelId(): string {
    return this.config.model;
  }
}

export function createOpenAIProvider(config?: OpenAIProviderConfig) {
  return new OpenAIProvider(config);
}
```

### Adding New Prop Categories

To add a new prop category:

1. Update `PropCategory` type in types/meta.ts
2. Add categorization logic in utils/prop-categorization.ts
3. Update ManifestBuilder to handle new category

**Example:** Adding `animations` category

```typescript
// types/meta.ts
export type PropCategory =
  | 'variants'
  | 'behaviors'
  | 'events'
  | 'slots'
  | 'passthrough'
  | 'animations' // Add here
  | 'other';

// utils/prop-categorization.ts
function categorizeProps(props: ExtractedProp[]): CategorizedProps {
  const animations: ExtractedProp[] = [];

  for (const prop of props) {
    if (ANIMATION_PROP_NAMES.includes(prop.name)) {
      animations.push(prop);
    }
    // ... other categories
  }

  return { variants, behaviors, events, slots, passthrough, animations, other };
}
```

### Adding New Component Patterns

To add a new component pattern for LLM generation:

1. Update `COMPONENT_PATTERNS` in types/meta.ts
2. Update tool schema in generator/tool-schema.ts
3. Document pattern in prompts

**Example:** Adding `animation` pattern

```typescript
// types/meta.ts
export const COMPONENT_PATTERNS = [
  'form-element',
  'interactive-control',
  'display-only',
  'container',
  'navigation',
  'overlay',
  'feedback',
  'data-display',
  'layout',
  'animation', // Add here
] as const;
```

## Testing Strategy

### Unit Tests

- Test individual extractors in isolation
- Test generator with mock LLM providers
- Test builder with minimal fixtures

### Integration Tests

- Test full pipeline with real component code
- Test with real LLM providers (requires API keys)
- Use fixture-based approach for comprehensive coverage

### Fixture Design

- Use real component code from design system
- Include edge cases (HOCs, forwardRef, compound components)
- Document what each fixture tests

## Performance Considerations

### Bottlenecks

1. **LLM generation** - 2-5 seconds per component, network latency, token costs
2. **Storybook parsing** - AST parsing for large story files
3. **Type resolution** - react-docgen-typescript with complex type chains

### Optimization Strategies

1. **Batch extraction** - Extract many components quickly, then generate selectively
2. **Skip generation** - Use Storybook examples when available
3. **Caching** - Use persistent storage for multi-step workflows
4. **Parallel processing** - Process components in parallel (extraction + generation independent)

### Token Cost Management

- Use `maxGenerationTokens` to cap costs
- Prefer Storybook examples over LLM-generated examples
- Use lower-cost models for development (Gemini Flash vs Claude Opus)

## Security Considerations

### Code Execution

- No `eval()` or dynamic code execution
- AST parsing only (ts-morph, react-docgen-typescript)
- Temporary files are cleaned up

### LLM API Keys

- Read from environment variables only
- Never log API keys
- Support multiple providers for redundancy

### Multi-Org Isolation

- `orgId` required for all operations
- Future: Validate orgId at API boundary
- Future: Separate storage per organization

## Related Documentation

- [README.md](./README.md) - Quick start and usage examples
- [Extractor CLAUDE.md](./src/extractor/CLAUDE.md) - Extraction module details
- [Generator CLAUDE.md](./src/generator/CLAUDE.md) - Generation module details
- [Manifest CLAUDE.md](./src/manifest/CLAUDE.md) - Manifest building details
- [Processor CLAUDE.md](./src/processor/CLAUDE.md) - Processor orchestration details
