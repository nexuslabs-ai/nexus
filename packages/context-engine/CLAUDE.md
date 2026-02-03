# Context Engine

## Purpose

Makes design system components AI-accessible through automated extraction and semantic enrichment. The problem: AI coding assistants don't understand custom component libraries — they hallucinate props, miss variants, and can't recommend the right component for a task. The solution: extract component metadata from code (automated for accuracy) and enrich with semantic meaning via LLM (for natural language understanding).

## What It Produces

**Two key outputs:**

1. **MCP Gateway** — AI assistants query components in real-time via WebSocket
2. **A2UI Catalog** — Runtime generative UI for GenUI Platform

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Context Engine Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Customer Component Code                                         │
│       ↓                                                          │
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
│  Result: Component Knowledge Structure                           │
│       ↓                                                          │
│  MCP Server → AI Assistants (Claude, Cursor, etc)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Modules

The Context Engine pipeline consists of four modules, each with a single clear responsibility:

| Module        | Purpose                                         | Documentation                                                  |
| ------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| **Extractor** | Extract props, variants, dependencies from code | [core/src/extractor/CLAUDE.md](./core/src/extractor/CLAUDE.md) |
| **Generator** | Generate semantic metadata via LLM              | [core/src/generator/CLAUDE.md](./core/src/generator/CLAUDE.md) |
| **Manifest**  | Combine extraction + generation into manifest   | [core/src/manifest/CLAUDE.md](./core/src/manifest/CLAUDE.md)   |
| **Processor** | Orchestrate full pipeline                       | [core/src/processor/CLAUDE.md](./core/src/processor/CLAUDE.md) |

## Package Structure

```
packages/context-engine/
├── core/                    # @context-engine/core - Main extraction/generation package
│   ├── src/
│   │   ├── extractor/       # Module 1: Extraction strategies
│   │   ├── generator/       # Module 2: LLM-based generation
│   │   ├── manifest/        # Module 3: Manifest building
│   │   ├── processor/       # Module 4: Pipeline orchestration
│   │   ├── types/           # Shared type definitions
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Constants and configs
│   └── package.json
├── db/                      # Database package (Drizzle + PostgreSQL)
├── docker-compose.yml       # Local dev environment
└── env.example              # Environment template
```

## Design Decisions

| Decision                           | Rationale                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| **Code as source of truth**        | Automated extraction from actual code guarantees accuracy — no manual maintenance           |
| **LLM for semantic enrichment**    | Humans understand "primary action button" better than `variant="primary"` — LLM bridges gap |
| **Tool calling only**              | Structured output guaranteed, no regex brittleness — LLM returns valid JSON                 |
| **Hybrid extraction**              | react-docgen for props, ts-morph for patterns it misses — combine strengths                 |
| **Storybook examples prioritized** | Real code > LLM-generated synthetic examples — prefer actual usage                          |
| **Server-owns-data SaaS**          | Multi-org isolation with centralized knowledge store — not client-side libraries            |

## How AI Assistants Use It

**Flow:**

1. Developer asks AI: "Add a button with loading state"
2. AI queries MCP server: "components matching 'button loading'"
3. Context Engine returns: Button manifest with props, variants, examples
4. AI generates correct code using actual component API

**Without Context Engine:** AI hallucinates props, generates invalid code
**With Context Engine:** AI has accurate component knowledge, generates working code

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
| PostgreSQL + pgvector   | Storage and semantic search |
| Drizzle ORM             | Database queries            |
| Hono                    | HTTP routing for MCP server |

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

## Key Conventions

**Result Types:**

- All async operations return discriminated unions or throw
- Pattern: `{ success: true, data }` or `{ success: false, error }`

**Error Codes:**

- Specific error codes for programmatic handling
- Example: `EXTRACTION_FAILED`, `GENERATION_FAILED`

**Factory Functions:**

- Prefer factory functions over direct instantiation
- Example: `createComponentProcessor({ extractor, generator })`

**Multi-Tenancy:**

- All queries scoped to organization
- Never leak data between orgs

## Subpath Exports

```typescript
// Main exports (types, constants)
import { AIManifest, ManifestMetadata, Framework } from '@context-engine/core';

// Module-specific imports
import {
  HybridExtractor,
  extractComponent,
} from '@context-engine/core/extractor';
import {
  MetaGenerator,
  createMetaGenerator,
} from '@context-engine/core/generator';
import { ManifestBuilder } from '@context-engine/core/manifest';
import {
  ComponentProcessor,
  createComponentProcessor,
} from '@context-engine/core/processor';
import {
  generateComponentId,
  categorizeProps,
} from '@context-engine/core/utils';
```

## Environment Variables

See `env.example` for configuration:

```bash
# LLM Provider
ANTHROPIC_API_KEY=           # Required for generation

# Database (for db package)
DATABASE_URL=                # PostgreSQL connection string
```

## Related Documentation

- [Context Engine Rules](../../.claude/rules/context-engine.md) - Coding conventions and review guidelines
- [Root CLAUDE.md](../../CLAUDE.md) - Project overview
