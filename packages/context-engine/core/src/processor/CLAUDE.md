# Processor Module

## Purpose

Orchestrates the complete component processing pipeline, coordinating HybridExtractor, MetaGenerator, and ManifestBuilder into a unified workflow. The problem: consumers need both all-in-one convenience and step-by-step control for different use cases (CLI tools vs incremental processing). The solution: dual API providing full pipeline processing and atomic operations with optional persistent storage.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ComponentProcessor                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mode 1: Full Pipeline (process)                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ Extract  │ → │ Generate │ → │  Build   │ → Result          │
│  └──────────┘    └──────────┘    └──────────┘                  │
│                                                                  │
│  Mode 2: Atomic Operations                                      │
│  ┌──────────┐                                                   │
│  │ Extract  │ → ExtractResult (use later)                       │
│  └──────────┘                                                   │
│  ┌──────────┐                                                   │
│  │ Generate │ → GenerateResult (use later)                      │
│  └──────────┘                                                   │
│  ┌──────────┐                                                   │
│  │  Build   │ → BuildResult (final)                             │
│  └──────────┘                                                   │
│                                                                  │
│  Optional: Persistent Storage (FileStateStore)                  │
│  - extractAndStore()    → Saves extraction                      │
│  - generateAndStore()   → Saves generation                      │
│  - buildAndStore()      → Saves manifest                        │
│  - processAndStore()    → Full pipeline + saves all phases      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component              | Role                                                 |
| ---------------------- | ---------------------------------------------------- |
| **ComponentProcessor** | Main orchestrator providing dual API                 |
| **FileStateStore**     | Optional persistent storage for intermediate results |
| **process()**          | Full pipeline: extract → generate → build            |
| **extract()**          | Atomic: extraction only                              |
| **generate()**         | Atomic: generation only (requires extraction)        |
| **build()**            | Atomic: manifest build (requires both)               |
| **processAndStore()**  | Full pipeline with persistence at each phase         |

## Design Decisions

| Decision                         | Rationale                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------- |
| **Dual API (full + atomic)**     | CLI tools need all-in-one; incremental pipelines need step-by-step control       |
| **Optional persistent storage**  | Useful for debugging, caching, resume-after-failure; not forced on all consumers |
| **Throw on error**               | Simplifies consumer code — no discriminated unions to check                      |
| **Factory function convenience** | createComponentProcessor() with sensible defaults for simple use cases           |
| **Component name as store key**  | Simple file-based storage using component name; caveat: same name overwrites     |
| **Framework validation**         | Only React supported currently; explicit validation with clear error             |
| **No result caching**            | Each call re-executes; use persistent storage if caching needed                  |

## Two Usage Modes

**Mode 1: Full Pipeline**

- Single call: process(input) → result
- Runs extraction → generation → build in sequence
- Returns combined result with all metadata

**Mode 2: Atomic Operations**

- Separate calls: extract() → generate() → build()
- Fine-grained control over each phase
- Can cache or modify intermediate results
- Must call in order (dependencies)

## Persistent Storage (Optional)

When storeDir is configured:

**Storage operations:**

- extractAndStore() — Extract + save extraction
- generateAndStore() — Load extraction, generate, save generation
- buildAndStore() — Load both, build, save manifest
- processAndStore() — Full pipeline, save all phases

**File structure:**

- extraction-{ComponentName}.json
- generation-{ComponentName}.json
- manifest-{ComponentName}.json

## How It Fits in the Pipeline

**Input:** Component source code, name, framework, optional stories
**Output:** ProcessorResult with manifest, metadata, extraction info
**End consumer:** Database storage, MCP server endpoints

The processor is the top-level orchestrator of the Context Engine pipeline. It coordinates all phases and provides the primary API for CLI tools, scripts, and server endpoints.

## Gotchas

- **Framework validation** — Only React supported; explicit validation throws if framework is not 'react'
- **Persistent operations require storeDir** — Calling extractAndStore() etc without storeDir configured throws
- **Atomic operations don't auto-store** — Even with storeDir, must use \*AndStore variants for persistence
- **Order matters for atomic** — Must call extract → generate → build; dependencies not enforced by types
- **No result caching** — Each call re-executes; persistent storage is the caching mechanism
- **Error throwing vs returning** — All methods throw on error; always use try-catch
- **Store requires write permissions** — storeDir must be writable
- **Component name collision** — Same name overwrites in store; use unique names or separate store directories
- **hints are optional but valuable** — Providing hints significantly improves LLM output quality
- **availableComponents prevents hallucinations** — Passed per-request in process() or build() input, not at construction time; enables dynamic filtering based on the org's actual components at request time. Without it, LLM may generate non-existent related components

## When to Use

**Use process() when:**

- You need the full pipeline in one call
- You don't need intermediate results
- You're building CLI tools or simple scripts

**Use atomic operations when:**

- You need fine-grained control over each phase
- You want to batch extraction before generation
- You're implementing custom caching strategies
- You need to inspect intermediate results

**Use processAndStore() when:**

- You need the full pipeline with persistence
- You're processing many components and want to resume on failure
- You need to debug intermediate results

**Use createComponentProcessor factory when:**

- You want sensible defaults with env-based configuration
- You're building one-off scripts
