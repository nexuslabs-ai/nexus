# Generator Module

## Purpose

Generates semantic metadata for extracted component data using LLMs via tool calling. The problem: extracted code gives us the technical API (props, types, variants) but not the semantic meaning (what it does, when to use it, accessibility guidance). The solution: structured LLM generation via tool calling with strict Zod schema validation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tool Calling Generation                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ExtractedData (props, variants, dependencies)                  │
│       ↓                                                          │
│  buildToolCallingPrompt() → { system, user }                    │
│       ↓                                                          │
│  provider.generateWithToolCalling(prompt, COMPONENT_META_TOOL)  │
│       ↓                                                          │
│  LLM returns: ToolCallResult<ComponentMetaTool>                 │
│       ↓                                                          │
│  validateToolOutput() → Zod validation                          │
│       ↓                                                          │
│  normalizeToolOutputToMeta() → ComponentMeta                    │
│       ↓                                                          │
│  Return GeneratorOutput (meta + usage stats)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component                     | Role                                       |
| ----------------------------- | ------------------------------------------ |
| **MetaGenerator**             | Main orchestrator for LLM-based generation |
| **ComponentMetaToolSchema**   | Zod schema defining tool output structure  |
| **COMPONENT_META_TOOL**       | Tool definition (JSON Schema for LLM)      |
| **AnthropicProvider**         | Anthropic Claude implementation            |
| **GeminiProvider**            | Google Gemini implementation               |
| **buildToolCallingPrompt**    | Prompt builder for tool calling            |
| **normalizeToolOutputToMeta** | Transform tool output to ComponentMeta     |

## Design Decisions

| Decision                              | Rationale                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Tool calling only**                 | No text parsing fallback — structured output guaranteed, no regex brittleness                       |
| **Zod schema as single source**       | Schema defines both TypeScript types and JSON Schema for LLM — single source of truth               |
| **Skip examples if Storybook exists** | Storybook examples are real code, LLM examples are synthetic — prefer real over generated           |
| **Standard pattern list**             | Fixed set of component patterns (form-element, interactive-control, etc) prevents LLM hallucination |
| **Variant descriptions optional**     | Only generated if component has variants — saves tokens for simple components                       |
| **Throw on error**                    | MetaGenerationError thrown on failure — simplifies consumer code                                    |

## LLM Provider Interface

All providers implement:

- `generateWithToolCalling<T>(prompt, options)` — Returns ToolCallResult with structured data
- `providerType` property — For logging and debugging
- `modelId` property — Model identifier

**Supported providers:**

- Anthropic Claude (default) — Native tool calling via tools parameter
- Google Gemini — Native tool calling via functionDeclarations

## Tool Schema Structure

The LLM generates ComponentMetaTool with:

**Core fields:**

- Semantic description (50-2000 chars)
- Usage guidance (whenToUse, whenNotToUse, accessibility)
- Standard patterns (from fixed list)
- Related components (filtered by ManifestBuilder if configured)

**Optional fields:**

- Code examples (minimal, common, advanced) — skipped if Storybook exists
- Variant descriptions — for each variant prop and value
- Sub-component variant descriptions — for compound components

## How It Fits in the Pipeline

**Input:** ExtractedData from HybridExtractor, optional hints
**Output:** ComponentMeta (semantic descriptions, guidance, examples)
**Next step:** Passed to ManifestBuilder to merge with extracted data

The generator is the second phase of the Context Engine pipeline. It enriches the technical API surface from extraction with human-readable semantic meaning for AI assistants to understand component purpose and usage.

## Gotchas

- **Environment variables required** — Provider factories read API keys from env; ensure they're set
- **Storybook detection is automatic** — Generator skips example generation if extracted.stories is non-empty
- **Pattern validation is silent** — Invalid patterns generated by LLM are filtered out without error
- **Semantic description fallback** — If LLM generates too-short description, builder generates minimal fallback
- **Token costs are real** — Max tokens, component complexity, and provider choice all affect cost
- **Tool schema changes require regeneration** — Modify ComponentMetaToolSchema, then regenerate COMPONENT_META_TOOL via z.toJSONSchema()
- **Provider quirks exist** — Anthropic uses tools, Gemini uses functionDeclarations; provider implementations handle differences

## When to Use

**Use MetaGenerator directly when:**

- You've already run extraction separately
- You want fine-grained control over generation
- You're implementing custom caching strategies

**Use through ComponentProcessor when:**

- You need the full pipeline (extraction → generation → manifest)
- You want coordinated orchestration
- You don't need to cache intermediate results

**Use createMetaGenerator factory when:**

- You want sensible defaults with env-based configuration
- You're building one-off scripts
