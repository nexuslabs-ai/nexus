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

## File Structure

| Category      | Files                                        |
| ------------- | -------------------------------------------- |
| Types/Schemas | `types/*.ts`, `schemas/*.ts`                 |
| Utilities     | `utils/*.ts`, `lib/*.ts`                     |
| Database      | `db/**/*.ts`, `migrations/**`                |
| API/Routes    | `api/**/*.ts`, `routes/**/*.ts`              |
| Config        | `*.config.*`, `*.json`, `docker-compose.yml` |
| Tests         | `*.test.ts`, `*.spec.ts`                     |

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
