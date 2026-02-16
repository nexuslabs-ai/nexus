# Extractor Module

## Purpose

Extracts component metadata (props, variants, dependencies, examples) from React component source code for Context Engine's AI-accessible component knowledge system. The problem: react-docgen-typescript alone misses CVA variants and fails on complex patterns (HOCs, forwardRef, compound components). The solution: hybrid extraction combining multiple strategies with explicit fallback triggers.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hybrid Extraction Pipeline                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Primary Path (react-docgen-typescript)                         │
│       ↓                                                          │
│  Explicit Fallback Decision (fallback-triggers.ts)              │
│       ↓                                                          │
│  Fallback Path (ts-morph AST analysis)                          │
│       ↓                                                          │
│  Parallel: VariantExtractor (always runs)                       │
│  Parallel: DependencyExtractor (always runs)                    │
│  Parallel: StorybookExtractor (if stories provided)             │
│       ↓                                                          │
│  Compound Component Analysis                                    │
│  ├─ CompoundExtractor (detect root + sub-components)            │
│  ├─ Extract sub-component props (ts-morph)                      │
│  └─ CompositionExtractor (required vs optional)                 │
│       ↓                                                          │
│  Build ExtractedData                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component                | Role                                             |
| ------------------------ | ------------------------------------------------ |
| **HybridExtractor**      | Main orchestrator combining all strategies       |
| **ReactDocgenExtractor** | Primary extraction using react-docgen-typescript |
| **TsMorphExtractor**     | Fallback using ts-morph AST analysis             |
| **VariantExtractor**     | CVA/tailwind-variants extraction (AST-based)     |
| **DependencyExtractor**  | Import statement parser                          |
| **StorybookExtractor**   | Storybook CSF3 example parser                    |
| **CompoundExtractor**    | Detect compound components                       |
| **CompositionExtractor** | Determine required vs optional sub-components    |
| **RadixExtractor**       | Radix UI primitive detection                     |

## Design Decisions

| Decision                          | Rationale                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **react-docgen as primary**       | Battle-tested (88k+ stars), full TypeScript resolution, automatic JSDoc extraction                         |
| **Explicit fallback triggers**    | Deterministic fallback logic (not heuristic) — documented conditions for when ts-morph is needed           |
| **Always run variant extraction** | react-docgen doesn't see CVA variants — they need separate AST extraction                                  |
| **Two-phase variant matching**    | Extract all variants first, then match to component — handles multiple components per file                 |
| **Filter props at source**        | Reject standard HTML events and passthrough props during extraction — AI doesn't need inherited attributes |
| **Throw on error**                | Simplifies consumer code — no need to check success/failure discriminated unions                           |

## Fallback Triggers (Explicit)

Fallback to ts-morph is triggered by specific patterns in code, not quality heuristics:

| Trigger                  | Why it forces fallback                             |
| ------------------------ | -------------------------------------------------- |
| No props extracted       | react-docgen returned empty props                  |
| No component name        | react-docgen couldn't identify component           |
| `forwardRef` in code     | react-docgen struggles with forwardRef patterns    |
| `styled()` in code       | Styled-components HOC pattern                      |
| `withComponents` in code | Higher-order component pattern                     |
| `.extend()` in code      | Component extension pattern                        |
| Radix imports detected   | Compound components with external types often fail |

## How It Fits in the Pipeline

**Input:** Source code string, component name, framework, optional stories code
**Output:** ExtractedData (props, variants, dependencies, examples, compound info)
**Next step:** Passed to Generator for semantic metadata enrichment

The extractor is the first phase of the Context Engine pipeline. It produces structured data about the component's API surface (what the code says), which the generator enriches with semantic meaning (what the component does).

## Gotchas

- **Path aliases require configuration** — Without configured path aliases, internal imports are treated as external npm packages
- **Variant extraction is two-phase** — Must call extractAll() before matchForComponent(), or it throws
- **Storybook filtering** — Interaction-only stories and showcase grids are filtered out automatically
- **Prop filtering is aggressive** — Standard HTML events (onClick) and passthrough props (className) are rejected to reduce noise for AI
- **Sub-component detection relies on naming** — DialogTrigger, DialogContent patterns expected; custom patterns may not be detected
- **Source hash instability** — Any whitespace change results in different hash, even if logic is identical

## When to Use

**Use HybridExtractor directly when:**

- You need fine-grained control over extraction
- You're building custom pipelines
- You need to cache extraction results separately

**Use extractComponent convenience function when:**

- You want the simplest API
- Framework auto-detection is acceptable
- You don't need extractor reuse

**Use through ComponentProcessor when:**

- You need the full pipeline (extraction → generation → manifest)
- You want coordinated orchestration
