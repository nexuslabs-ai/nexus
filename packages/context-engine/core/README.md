# @context-engine/core

> Make design system components AI-accessible through automated extraction and semantic metadata generation.

## Overview

Context Engine Core provides a complete pipeline for extracting component metadata from source code and enriching it with AI-generated semantic information. It combines multiple extraction strategies with LLM-based generation to produce comprehensive component manifests optimized for AI consumption.

**The problem it solves:** AI coding assistants (Claude, Cursor, Copilot) don't understand custom design system components — they hallucinate props, miss variants, and can't recommend the right component for a task.

**Core principle:** Code is the source of truth. Automated extraction for accuracy, AI generation for semantic richness.

## Quick Start

```bash
# Install
yarn add @context-engine/core

# Set environment variable
export ANTHROPIC_API_KEY=your-api-key
```

```typescript
import { createComponentProcessor } from '@context-engine/core/processor';

// Create processor
const processor = createComponentProcessor();

// Process a component (extract → generate → build)
const result = await processor.process({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Button',
  sourceCode: buttonCode,
  framework: 'react',
});

console.log('Component:', result.componentName);
console.log('Props:', result.manifest.props);
console.log('Examples:', result.manifest.examples);
console.log('Guidance:', result.manifest.guidance);
```

## Installation & Setup

### Environment Variables

```bash
# Required for generation
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Generation config
CONTEXT_ENGINE_GENERATION_MAX_TOKENS=3000
CONTEXT_ENGINE_MIN_SEMANTIC_DESC_LENGTH=50
CONTEXT_ENGINE_MAX_SEMANTIC_DESC_LENGTH=2000
```

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  }
}
```

## Basic Usage

### Full Pipeline (Recommended)

Use the processor for complete extraction, generation, and manifest building:

```typescript
import { createComponentProcessor } from '@context-engine/core/processor';

const processor = createComponentProcessor({
  // Optional: Configure extractor
  extractorOptions: {
    pathAliases: {
      '@/*': ['./src/*'],
    },
    dependencies: ['react', '@radix-ui/react-slot'],
  },
  // Optional: Filter LLM-generated related components
  availableComponents: ['Button', 'Input', 'Card'],
});

const result = await processor.process({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Button',
  sourceCode: buttonCode,
  framework: 'react',
  // Optional: Storybook stories for examples
  storiesCode: buttonStoriesCode,
  // Optional: Hints to guide LLM generation
  hints: 'Primary action button with loading states',
  // Optional: Semantic version
  version: '1.0.0',
});

// Access results
console.log('Metadata:', result.metadata); // System fields
console.log('Manifest:', result.manifest); // AI-focused fields
console.log('Extraction method:', result.extraction.extractionMethod);
```

### Step-by-Step Processing

For fine-grained control, use atomic operations:

```typescript
// Step 1: Extract component metadata
const extractResult = await processor.extract({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Button',
  sourceCode: buttonCode,
  framework: 'react',
});

// Step 2: Generate semantic metadata
const genResult = await processor.generate({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  identity: extractResult.identity,
  extracted: extractResult.extracted,
  sourceHash: extractResult.sourceHash,
  hints: 'Primary action button',
});

// Step 3: Build complete manifest
const buildResult = processor.build({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  identity: extractResult.identity,
  extracted: extractResult.extracted,
  meta: genResult.meta,
  sourceHash: extractResult.sourceHash,
  version: '1.0.0',
});

console.log('Manifest:', buildResult.manifest);
```

### Using Individual Modules

```typescript
import { HybridExtractor } from '@context-engine/core/extractor';
import {
  createMetaGenerator,
  createAnthropicProvider,
} from '@context-engine/core/generator';
import { ManifestBuilder } from '@context-engine/core/manifest';

// 1. Extract
const extractor = new HybridExtractor();
const extractResult = await extractor.extract({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Button',
  sourceCode: buttonCode,
  framework: 'react',
});

// 2. Generate
const provider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const generator = createMetaGenerator({ provider });
const genResult = await generator.generate({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Button',
  framework: 'react',
  extracted: extractResult.data,
});

// 3. Build
const builder = new ManifestBuilder();
const buildResult = builder.build({
  orgId: '123e4567-e89b-12d3-a456-426614174000',
  identity: extractResult.identity,
  extracted: extractResult.data,
  meta: genResult.meta,
  sourceHash: extractResult.sourceHash,
});

console.log('Manifest:', buildResult.manifest);
```

## Module Documentation

| Module        | Purpose                                           | Documentation                                    |
| ------------- | ------------------------------------------------- | ------------------------------------------------ |
| **extractor** | Extract props, variants, dependencies from code   | [Extractor CLAUDE.md](./src/extractor/CLAUDE.md) |
| **generator** | Generate semantic metadata via LLM                | [Generator CLAUDE.md](./src/generator/CLAUDE.md) |
| **manifest**  | Build component manifests (metadata + AI)         | [Manifest CLAUDE.md](./src/manifest/CLAUDE.md)   |
| **processor** | Orchestrate full pipeline (extract → gen → build) | [Processor CLAUDE.md](./src/processor/CLAUDE.md) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Context Engine Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Extractor   │ → │  Generator   │ → │   Manifest   │       │
│  │              │    │              │    │   Builder    │       │
│  │ react-docgen │    │   Anthropic  │    │              │       │
│  │  + ts-morph  │    │     LLM      │    │  Combines    │       │
│  │              │    │              │    │    both      │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
│                    ┌──────────────────┐                          │
│                    │    Processor     │                          │
│                    │  (Orchestrates)  │                          │
│                    └──────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Extraction

- **Primary:** react-docgen-typescript (battle-tested, full TypeScript support)
- **Fallback:** ts-morph (handles HOCs, forwardRef, complex patterns)
- **Supplementary:** CVA variants, Storybook examples, dependencies, compound components

### Generation

- **Tool calling only** (no text parsing)
- **Provider support:** Anthropic Claude, Google Gemini
- **Output:** Semantic descriptions, usage guidance, code examples, variant descriptions

### Manifest Building

- **Prop categorization:** Variants, behaviors, events, slots, passthrough
- **Variant normalization:** Merges CVA defaults, adds missing variants
- **Example priority:** Storybook stories → LLM-generated → none
- **Import statements:** Auto-detects package name from dependencies

## Common Commands

```bash
# Build
yarn workspace @context-engine/core build

# Development (watch mode)
yarn workspace @context-engine/core dev

# Type check
yarn workspace @context-engine/core typecheck

# Tests
yarn workspace @context-engine/core test
yarn workspace @context-engine/core test:watch

# Clean
yarn workspace @context-engine/core clean
```

## Output Format

### Metadata (System Fields)

```typescript
{
  id: "comp-uuid",
  schemaVersion: "1.0.0",
  version: "1.0.0",
  framework: "react",
  visibility: "public",
  embeddingStatus: "pending",
  embeddingModel: "voyage-3",
  generatedAt: "2025-02-03T10:00:00Z",
  updatedAt: "2025-02-03T10:00:00Z",
  sourceHash: "abc123",
  files: ["button/button.tsx"]
}
```

### Manifest (AI-Focused Fields)

```typescript
{
  name: "Button",
  slug: "button-react-abc123",
  description: "A clickable button for user interactions",
  importStatement: {
    primary: "import { Button } from '@nexus/react'",
    typeOnly: "import type { ButtonProps } from '@nexus/react'"
  },
  props: {
    variants: [
      {
        name: "variant",
        type: "string",
        values: ["default", "primary", "destructive"],
        defaultValue: "default",
        valueDescriptions: {
          default: "Standard button style",
          primary: "Emphasized style for main actions",
          destructive: "Red styling for dangerous actions"
        }
      }
    ],
    behaviors: [
      { name: "disabled", type: "boolean", defaultValue: false }
    ],
    events: [
      { name: "onClick", type: "function" }
    ],
    slots: [
      { name: "children", type: "ReactNode", required: true }
    ]
  },
  examples: {
    minimal: {
      title: "Default",
      code: "<Button>Click me</Button>"
    },
    common: [
      {
        title: "With Icon",
        code: "<Button leftIcon={<Icon />}>Click me</Button>"
      }
    ]
  },
  guidance: {
    whenToUse: "Use for form submissions and primary actions",
    whenNotToUse: "Do not use for navigation. Use Link instead.",
    accessibility: "Ensure proper ARIA labels for icon-only buttons",
    patterns: ["interactive-control"],
    relatedComponents: ["Link", "IconButton"]
  },
  dependencies: {
    npm: { "react": "^18.0.0", "@radix-ui/react-slot": "^1.0.0" },
    internal: []
  }
}
```

## Advanced Configuration

### Custom LLM Provider

```typescript
import {
  createComponentProcessor,
  createGeminiProvider,
} from '@context-engine/core';

const provider = createGeminiProvider({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp',
});

const processor = createComponentProcessor({
  llmProvider: provider,
  maxGenerationTokens: 4000,
});
```

### Path Aliases & Dependencies

```typescript
const processor = createComponentProcessor({
  extractorOptions: {
    pathAliases: {
      '@/*': ['./src/*'],
      '@components/*': ['./src/components/*'],
      '@lib/*': ['./src/lib/*'],
    },
    dependencies: ['react', 'class-variance-authority', '@radix-ui/react-slot'],
  },
});
```

### Persistent Storage

```typescript
const processor = new ComponentProcessor({
  storeDir: './component-state',
});

// Extract and store for later
await processor.extractAndStore({ orgId, name: 'Button', sourceCode });

// Generate from stored extraction
await processor.generateAndStore('Button', { hints: '...' });

// Build from stored extraction + generation
await processor.buildAndStore('Button', { version: '1.0.0' });

// Or process all phases with storage
await processor.processAndStore({ orgId, name: 'Button', sourceCode });
```

## Error Handling

All operations throw on error. Use try-catch for error handling:

```typescript
import {
  ExtractionError,
  MetaGenerationError,
  ManifestBuildError,
} from '@context-engine/core/types';

try {
  const result = await processor.process(input);
  // Use result
} catch (error) {
  if (error instanceof ExtractionError) {
    console.error('Extraction failed:', error.message);
    console.error('Component:', error.componentName);
  } else if (error instanceof MetaGenerationError) {
    console.error('Generation failed:', error.message);
    console.error('Context:', error.context);
  } else if (error instanceof ManifestBuildError) {
    console.error('Build failed:', error.message);
  }
}
```

## Tech Stack

| Technology              | Purpose                     |
| ----------------------- | --------------------------- |
| TypeScript              | Type safety                 |
| tsup                    | Build tool                  |
| react-docgen-typescript | Primary prop extraction     |
| ts-morph                | Fallback AST analysis       |
| @anthropic-ai/sdk       | LLM provider for generation |
| zod                     | Schema validation           |
| vitest                  | Testing                     |

## Related Documentation

- [Context Engine Package CLAUDE.md](../CLAUDE.md) - Package overview
- [Context Engine Rules](../../../.claude/rules/context-engine.md) - Coding conventions
- [Root CLAUDE.md](../../../CLAUDE.md) - Project overview

## License

MIT
