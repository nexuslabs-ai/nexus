# Context Engine Rules

## Overview

**What it is:** A SaaS platform that makes design system components AI-accessible through semantic search and intelligent code assistance.

**The problem it solves:** AI coding assistants (Claude, Cursor, Copilot) don't understand custom design system components — they hallucinate props, miss variants, and can't recommend the right component for a task.

**Core principle:** Code is the source of truth. Automated extraction for accuracy, AI generation for semantic richness.

## How It Works

```
1. CLI extracts component code (props, variants, dependencies) from customer repos
2. Server generates semantic metadata (descriptions, usage guidance) via LLM
3. Components become searchable via natural language
4. AI assistants query via MCP to get accurate component context
```

## Key Outputs

| Output           | Purpose                                      |
| ---------------- | -------------------------------------------- |
| **MCP Gateway**  | AI assistants query components in real-time  |
| **A2UI Catalog** | Runtime generative UI for the GenUI Platform |

## Architecture

**Model:** Server-owns-data SaaS with multi-org isolation

**Flow:**

```
Customer runs CLI → Server stores manifests → AI assistants connect via WebSocket MCP
```

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Server     | Node.js + Hono          |
| Database   | PostgreSQL + pgvector   |
| Embeddings | Voyage AI               |
| Parsing    | react-docgen-typescript |

## Package Location

All Context Engine code lives in `packages/context-engine/`

## Core Modules

The `@context-engine/core` package (`packages/context-engine/core/`) provides the extraction-generation pipeline:

| Module        | Purpose                                          | Key Exports                                           |
| ------------- | ------------------------------------------------ | ----------------------------------------------------- |
| **extractor** | Hybrid extraction using react-docgen + ts-morph  | `HybridExtractor`, `extractComponent`, `getExtractor` |
| **generator** | LLM-based metadata generation                    | `MetaGenerator`, `AnthropicProvider`, `buildPrompt`   |
| **manifest**  | Combines extraction + generation into manifests  | `ManifestBuilder`                                     |
| **processor** | Orchestrates full extraction-generation pipeline | `ComponentProcessor`, `createComponentProcessor`      |

### Extractor Module

Extracts component metadata (props, variants, dependencies) from source code:

```typescript
import {
  extractComponent,
  HybridExtractor,
} from '@context-engine/core/extractor';

// Convenience function (auto-selects extractor by framework)
const result = await extractComponent({
  filePath: './Button.tsx',
  componentName: 'Button',
  framework: 'react',
});

// Or use extractor directly
const extractor = new HybridExtractor();
const result = await extractor.extract(input);
```

**Extractors:**

- `ReactDocgenExtractor` - Primary extraction via react-docgen-typescript
- `TsMorphExtractor` - Fallback using ts-morph AST analysis
- `VariantExtractor` - CVA variant extraction
- `DependencyExtractor` - Import/dependency analysis
- `HybridExtractor` - Combines all extractors with fallback logic

### Generator Module

Generates semantic metadata (descriptions, usage patterns) via LLM:

```typescript
import {
  createMetaGenerator,
  createAnthropicProvider,
} from '@context-engine/core/generator';

const provider = createAnthropicProvider({
  apiKey: process.env.LLM_API_KEY,
});
const generator = createMetaGenerator({ provider });

const result = await generator.generate({
  componentName: 'Button',
  props: extractedProps,
  variants: extractedVariants,
});
```

### Manifest Module

Builds complete component manifests combining extraction and generation:

```typescript
import { ManifestBuilder } from '@context-engine/core/manifest';

const builder = new ManifestBuilder();
const manifest = await builder.build({
  extraction: extractionResult,
  generation: generationResult,
  identity: { orgId, libraryId, componentId },
});
```

### Processor Module

Orchestrates the full pipeline:

```typescript
import { createComponentProcessor } from '@context-engine/core/processor';

const processor = createComponentProcessor({
  extractor: new HybridExtractor(),
  generator: createMetaGenerator({ provider }),
});

// Full pipeline: extract → generate → build manifest
const result = await processor.process({
  filePath: './Button.tsx',
  componentName: 'Button',
  framework: 'react',
});
```

## File Structure

| Directory             | Purpose                        | Key Files                                          |
| --------------------- | ------------------------------ | -------------------------------------------------- |
| `core/src/extractor/` | Component extraction           | `hybrid-extractor.ts`, `react-docgen-extractor.ts` |
| `core/src/generator/` | LLM metadata generation        | `meta-generator.ts`, `anthropic-provider.ts`       |
| `core/src/manifest/`  | Manifest building              | `manifest-builder.ts`                              |
| `core/src/processor/` | Pipeline orchestration         | `component-processor.ts`                           |
| `core/src/types/`     | Shared type definitions        | `output.ts`, `identity.ts`                         |
| `core/src/utils/`     | Utility functions              | `temp-manager.ts`                                  |
| `core/src/constants/` | Constants and base configs     | `base-libraries.ts`                                |
| `db/`                 | Database schema and migrations | `schema.ts`, `migrations/**`                       |

## Code Conventions

### API Design

- Use Hono for HTTP routing
- Return consistent response shapes
- Include pagination for list endpoints
- Use proper HTTP status codes

### Database

- Use Drizzle ORM for queries
- Migrations in `migrations/` directory
- Use pgvector for embedding storage

### Multi-Tenancy

- All queries must be scoped to organization
- Never leak data between orgs
- Use `orgId` in all relevant tables

### Error Handling

- Return structured error responses
- Include error codes for programmatic handling
- Provide helpful error messages for AI consumers

## AI Consumer Focus

Context Engine's end users are AI coding assistants. When implementing or reviewing:

### Response Design

| Aspect                   | What to Check                                            |
| ------------------------ | -------------------------------------------------------- |
| **Response Structure**   | Is data easy for an AI to parse? Not overly nested?      |
| **Context Completeness** | Does the AI have enough info to generate correct code?   |
| **Error Clarity**        | Do errors explain what went wrong AND how to fix it?     |
| **Search Relevance**     | Will natural language queries find the right components? |

### Questions to Ask

For each API response or data structure:

- "If an AI assistant received this response, could it generate correct component code?"
- "Does this error message help the AI recover or retry appropriately?"
- "Would natural language queries like 'button with loading state' find the right components?"
- "Is the component metadata rich enough for the AI to suggest correct props/variants?"

### AI Consumer Assessment Output

```markdown
**🤖 AI Consumer Assessment**

| Aspect                | Rating   | Notes   |
| --------------------- | -------- | ------- |
| Response Parseability | ✅/⚠️/❌ | {notes} |
| Context Completeness  | ✅/⚠️/❌ | {notes} |
| Error Guidance        | ✅/⚠️/❌ | {notes} |
| Search Quality        | ✅/⚠️/❌ | {notes} |

**Recommendation:** {Any improvements for AI consumption}
```

## Review Checklist

When reviewing Context Engine code:

### Architecture

- [ ] Multi-org isolation maintained
- [ ] Database queries scoped to org
- [ ] API follows RESTful conventions
- [ ] Proper separation of concerns (routes, services, db)

### Code Quality

- [ ] TypeScript strict mode compliance
- [ ] Proper error handling (not swallowing)
- [ ] No hardcoded configuration
- [ ] Consistent naming conventions

### AI Consumer

- [ ] Responses are AI-parseable
- [ ] Error messages are actionable
- [ ] Metadata is complete for code generation
- [ ] Search would return relevant results

### Security

- [ ] No data leakage between orgs
- [ ] Input validation on all endpoints
- [ ] Authentication/authorization enforced
- [ ] No secrets in code

## Do Not

- Leak data between organizations
- Return overly nested or complex response structures
- Swallow errors silently
- Hardcode configuration values
- Skip org scoping in database queries
- Return vague error messages that don't help AI recover
