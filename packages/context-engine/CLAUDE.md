# Context Engine

> Make design system components AI-accessible through semantic search and intelligent code assistance.

## Overview

Context Engine solves the problem of AI coding assistants (Claude, Cursor, Copilot) not understanding custom design system components — they hallucinate props, miss variants, and can't recommend the right component for a task.

**Core principle:** Code is the source of truth. Automated extraction for accuracy, AI generation for semantic richness.

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

## Package Structure

```
packages/context-engine/
├── core/                    # @context-engine/core - Extraction & generation pipeline
│   ├── src/
│   │   ├── extractor/       # Component metadata extraction
│   │   ├── generator/       # LLM-based metadata generation
│   │   ├── manifest/        # Manifest building
│   │   ├── processor/       # Pipeline orchestration
│   │   ├── types/           # Shared types
│   │   ├── utils/           # Utilities
│   │   └── constants/       # Constants and configs
│   └── package.json
├── db/                      # Database package (Drizzle + PostgreSQL)
├── docker-compose.yml       # Local dev environment
└── env.example              # Environment template
```

## Core Package (`@context-engine/core`)

### Installation

```bash
# From monorepo
yarn workspace @context-engine/core build
```

### Subpath Exports

```typescript
// Main exports
import { ComponentManifest, Framework } from '@context-engine/core';

// Subpath imports
import {
  HybridExtractor,
  extractComponent,
} from '@context-engine/core/extractor';
import {
  MetaGenerator,
  createMetaGenerator,
} from '@context-engine/core/generator';
import { ManifestBuilder } from '@context-engine/core/manifest';
import { ComponentProcessor } from '@context-engine/core/processor';
import { generateComponentId, generateHash } from '@context-engine/core/utils';
```

### Modules

| Module      | Purpose                                         | Key Exports                                      |
| ----------- | ----------------------------------------------- | ------------------------------------------------ |
| `extractor` | Extract props, variants, dependencies from code | `HybridExtractor`, `extractComponent`            |
| `generator` | Generate semantic metadata via LLM              | `MetaGenerator`, `AnthropicProvider`             |
| `manifest`  | Build complete component manifests              | `ManifestBuilder`                                |
| `processor` | Orchestrate full pipeline                       | `ComponentProcessor`, `createComponentProcessor` |
| `types`     | Shared type definitions                         | `ComponentManifest`, `ExtractionResult`          |
| `utils`     | Utility functions                               | `generateComponentId`, `generateHash`            |

### Quick Start

```typescript
import { createComponentProcessor } from '@context-engine/core/processor';
import { HybridExtractor } from '@context-engine/core/extractor';
import {
  createMetaGenerator,
  createAnthropicProvider,
} from '@context-engine/core/generator';

// Create processor with extractor and generator
const processor = createComponentProcessor({
  extractor: new HybridExtractor(),
  generator: createMetaGenerator({
    provider: createAnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }),
  }),
});

// Process a component
const result = await processor.process({
  filePath: './Button.tsx',
  componentName: 'Button',
  framework: 'react',
});

if (result.success) {
  console.log(result.manifest); // Complete component manifest
}
```

## Commands

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

## Conventions

### Result Types

All async operations return discriminated union result types:

```typescript
// Success/failure pattern
type ProcessorOutput = ProcessorSuccess | ProcessorFailure;

// Type guards
if (isProcessorSuccess(result)) {
  // result.manifest is available
}
```

### Error Codes

Use specific error codes for programmatic handling:

```typescript
enum ProcessorErrorCode {
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  MANIFEST_BUILD_FAILED = 'MANIFEST_BUILD_FAILED',
}
```

### Factory Functions

Prefer factory functions for complex object creation:

```typescript
// Good - factory function
const provider = createAnthropicProvider({ apiKey });
const generator = createMetaGenerator({ provider });
const processor = createComponentProcessor({ extractor, generator });

// Avoid - direct instantiation with complex setup
const processor = new ComponentProcessor(/* many params */);
```

## Related Documentation

- [Context Engine Rules](../../.claude/rules/context-engine.md) - Coding conventions and review guidelines
- [Root CLAUDE.md](../../CLAUDE.md) - Project overview

## Environment Variables

See `env.example` for required variables:

```bash
# LLM Provider
ANTHROPIC_API_KEY=           # Required for generation

# Database (for db package)
DATABASE_URL=                # PostgreSQL connection string
```
