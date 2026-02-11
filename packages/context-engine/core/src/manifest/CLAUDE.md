# Manifest Module

## Purpose

Combines extracted component data (from HybridExtractor) and generated semantic metadata (from MetaGenerator) into a complete component knowledge representation with two distinct sections: ManifestMetadata (system fields) and AIManifest (AI-focused fields). The problem: extracted props lack semantic richness and CVA variants may be incomplete; generated metadata lacks structure for AI consumption. The solution: merge and enrich into a unified manifest optimized for AI assistants.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Manifest Build Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ExtractedData + ComponentMeta                                  │
│       ↓                                                          │
│  categorizeProps() → Group by semantic purpose                  │
│       ↓                                                          │
│  normalizeVariants() → Add missing CVA variants, merge defaults │
│       ↓                                                          │
│  mergeValueDescriptions() → Add LLM variant descriptions        │
│       ↓                                                          │
│  buildImportStatement() → Package detection + compound names    │
│       ↓                                                          │
│  buildExamples() → Storybook (priority) or LLM-generated        │
│       ↓                                                          │
│  buildGuidance() → Filter related components if configured      │
│       ↓                                                          │
│  buildSubComponents() → Apply same prop pipeline                │
│       ↓                                                          │
│  Build ManifestMetadata (system fields, hashes, timestamps)     │
│  Build AIManifest (conditionally include fields if present)     │
│       ↓                                                          │
│  Return ManifestBuilderResult                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component                  | Role                                                       |
| -------------------------- | ---------------------------------------------------------- |
| **ManifestBuilder**        | Main orchestrator combining extraction + generation        |
| **categorizeProps**        | Group props by semantic purpose (variants, behaviors, etc) |
| **normalizeVariants**      | Add missing CVA variants and merge defaults                |
| **mergeValueDescriptions** | Add LLM-generated descriptions to variant values           |
| **buildImportStatement**   | Generate import statements with package detection          |
| **buildExamples**          | Convert Storybook or LLM examples to StructuredExamples    |
| **buildGuidance**          | Filter related components against available list           |
| **buildSubComponents**     | Process sub-components with same prop pipeline             |

## Design Decisions

| Decision                           | Rationale                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| **Split metadata and manifest**    | Separate system concerns (hashing, versioning) from AI-focused fields — cleaner schema for different consumers |
| **Categorize props by purpose**    | Variants, behaviors, events, slots have different semantics — grouping helps AI understand context             |
| **Normalize CVA variants**         | react-docgen misses CVA variants from VariantProps<typeof> — must add them explicitly with defaults            |
| **Storybook examples prioritized** | Real Storybook examples > LLM-generated synthetic examples — always prefer actual code                         |
| **Variant descriptions optional**  | Only included if LLM generated them — not all components have variants                                         |
| **Related component filtering**    | LLMs hallucinate non-existent components — filter against availableComponents passed per build request         |
| **Package detection heuristic**    | Look for @\*/(react                                                                                            | components | ui) or "design-system" in dependencies — fallback to configured default |

## Prop Processing Pipeline

Props undergo three transformations:

**1. Categorization** — Group by semantic purpose

- Variants: CVA variant props
- Behaviors: Boolean state props
- Events: Event handlers
- Slots: ReactNode/element props
- Passthrough: DOM attributes
- Other: Uncategorized

**2. Normalization** — Merge CVA variants

- Add missing variant props from extracted.variants
- Merge defaultVariants into existing props

**3. Enrichment** — Add LLM descriptions

- Merge variantDescriptions into prop.valueDescriptions

## How It Fits in the Pipeline

**Input:** ExtractedData (from HybridExtractor) + ComponentMeta (from MetaGenerator) + identity + sourceHash
**Output:** ManifestBuilderResult with ManifestMetadata and AIManifest sections
**Next step:** Stored in database, served to AI assistants via MCP

The manifest builder is the final phase of the Context Engine pipeline. It produces the complete component knowledge structure that gets stored and served to AI coding assistants.

## Gotchas

- **Variant normalization is critical** — Without it, CVA variants that don't appear as explicit props would be missing
- **Prop pipeline order matters** — Must run categorize → normalize → enrich; reordering breaks
- **Sub-components use same pipeline** — Same quirks affect sub-component props
- **Related components filtering is optional** — availableComponents is a per-request field on ManifestBuilderInput; without it, hallucinated components pass through unfiltered
- **Example limits are hardcoded** — 1 minimal, 8 common, 3 advanced; change requires code modification
- **Package detection is heuristic** — Non-standard design system naming may not be detected correctly
- **Children detection by name** — Component must have prop named "children" for detection
- **Embedding status always pending** — Actual embedding happens later, not in builder
- **Sub-component variant descriptions** — Must match sub-component name exactly or descriptions won't merge

## When to Use

**Use ManifestBuilder directly when:**

- You've already run extraction and generation separately
- You need fine-grained control over manifest building
- You're implementing custom caching strategies

**Use through ComponentProcessor when:**

- You need the full pipeline (extraction → generation → manifest)
- You want coordinated orchestration
- You don't need to cache intermediate results
