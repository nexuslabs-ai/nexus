/**
 * Processor Types
 *
 * Types for the ComponentProcessor that orchestrates the full pipeline:
 * Extract -> Generate -> Build Manifest
 *
 * All methods throw on error - no discriminated unions.
 * Includes stored state types for optional persistent state storage.
 */

import type { HybridExtractorOptions } from '../extractor/index.js';
import type { ILLMProvider } from '../generator/types.js';
import type {
  AIManifest,
  ComponentMeta,
  ExtractedData,
  Framework,
  ManifestIdentity,
} from '../types/index.js';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration options for ComponentProcessor
 */
export interface ProcessorConfig {
  /**
   * Custom LLM provider for meta generation.
   * If not provided, defaults to AnthropicProvider.
   */
  llmProvider?: ILLMProvider;

  /**
   * Maximum tokens for LLM generation.
   * @default 2000
   */
  maxGenerationTokens?: number;

  /**
   * Options for the HybridExtractor.
   * Used to configure path aliases and dependencies for accurate
   * internal vs external import detection.
   *
   * @example
   * ```typescript
   * {
   *   pathAliases: { "@/*": ["./src/*"] },
   *   dependencies: ["react", "@radix-ui/react-slot"]
   * }
   * ```
   */
  extractorOptions?: HybridExtractorOptions;

  /**
   * Optional directory path for persistent state storage.
   * When provided, enables checkpoint-based processing where state
   * can be saved after each phase (extraction, generation, build).
   *
   * The processor will create a FileStateStore internally using this directory.
   * Use with `extractAndStore`, `generateAndStore`, and `buildAndStore` methods.
   *
   * @example
   * ```typescript
   * const processor = new ComponentProcessor({ storeDir: './state' });
   *
   * // Extract and save checkpoint
   * await processor.extractAndStore(input);
   *
   * // Later: resume from checkpoint
   * await processor.generateAndStore('Button');
   * ```
   */
  storeDir?: string;
}

// =============================================================================
// Stored State Types
// =============================================================================

/**
 * Stored extraction state
 *
 * Persisted result from the extraction phase, containing all data
 * needed to resume with generation or rebuild manifests.
 */
export interface StoredExtraction {
  /** Component name (PascalCase) */
  componentName: string;

  /** Organization ID for multi-org isolation */
  orgId: string;

  /** Component identity (id, slug, name, framework) */
  identity: ManifestIdentity;

  /** Extracted data from source code analysis */
  extracted: ExtractedData;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** ISO timestamp when extraction was stored */
  storedAt: string;
}

/**
 * Stored generation state
 *
 * Persisted result from the generation phase, containing LLM-generated
 * metadata that can be combined with extraction to build manifests.
 */
export interface StoredGeneration {
  /** Component name (PascalCase) */
  componentName: string;

  /** Generated component metadata */
  meta: ComponentMeta;

  /** LLM provider type used */
  provider: string;

  /** Model identifier used for generation */
  model: string;

  /** ISO timestamp when generation was stored */
  storedAt: string;
}

/**
 * Stored manifest
 *
 * Persisted complete manifest, representing the final output
 * of the extraction-generation-build pipeline. Flat structure
 * matching ManifestOutput.
 */
export interface StoredManifest {
  /** Component name (PascalCase) */
  componentName: string;

  /** Component identity (id, slug, name, framework) */
  identity: ManifestIdentity;

  /** AI-focused manifest (optimized for consumption) */
  manifest: AIManifest;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** Source files used for extraction */
  files: string[];

  /** ISO timestamp when manifest was stored */
  storedAt: string;
}

/**
 * Stored component state
 *
 * Combined state for a component, including extraction, generation,
 * and manifest data. Used for querying complete component state.
 */
export interface StoredComponentState {
  /** Component name (PascalCase) */
  componentName: string;

  /** Stored extraction (if available) */
  extraction?: StoredExtraction;

  /** Stored generation (if available) */
  generation?: StoredGeneration;

  /** Stored manifest (if available) */
  manifest?: StoredManifest;
}

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for the full processing pipeline
 *
 * Contains source code and organizational context for component extraction
 * and metadata generation.
 */
export interface ProcessorInput {
  /**
   * Organization ID for multi-org isolation.
   * All components are scoped to an organization.
   */
  orgId: string;

  /**
   * Component name (human-readable).
   * Example: "Button", "DatePicker", "Navigation Menu"
   */
  name: string;

  /**
   * Source code content to extract from.
   */
  sourceCode: string;

  /**
   * Target framework for extraction.
   * @default 'react'
   */
  framework?: Framework;

  /**
   * File path for context (e.g., "button/button.tsx").
   * Used for error messages and dependency resolution.
   */
  filePath?: string;

  /**
   * Component version (semver).
   * @default '0.0.1'
   */
  version?: string;

  /**
   * Existing component ID for updates.
   * If provided, the component will be updated rather than created.
   */
  existingId?: string;

  /**
   * Optional Storybook stories source code.
   * Used to extract real examples from stories.
   */
  storiesCode?: string;

  /**
   * Optional path to the stories file.
   * Used for context in extraction.
   */
  storiesFilePath?: string;

  /**
   * Optional hints to guide LLM generation.
   * Provides additional context about the component beyond what's extracted from code.
   */
  hints?: string;

  /** Component names in the design system for filtering relatedComponents */
  availableComponents?: string[];
}

// =============================================================================
// Output Types (Success only - methods throw on error)
// =============================================================================

/**
 * Extraction metadata from the pipeline
 */
export interface ExtractionMetadata {
  /** Whether fallback extractor was triggered */
  fallbackTriggered: boolean;

  /** Reason for fallback (if triggered) */
  fallbackReason?: string;

  /** Extraction method used */
  extractionMethod: string;
}

/**
 * Processor result (success only - throws on error)
 *
 * Flat structure matching ManifestOutput with additional extraction metadata.
 */
export interface ProcessorResult {
  /** Component name (PascalCase) */
  componentName: string;

  /** Component identity (id, slug, name, framework) */
  identity: ManifestIdentity;

  /** AI-focused manifest (optimized for consumption) */
  manifest: AIManifest;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** Source files used for extraction */
  files: string[];

  /** Extraction metadata */
  extraction: ExtractionMetadata;
}

// =============================================================================
// Extraction Phase Types
// =============================================================================

/**
 * Extraction result (success only - extractor throws on error)
 */
export interface ExtractResult {
  /** Component ID (generated or existing) */
  id: string;

  /** Component slug */
  slug: string;

  /** Component identity for generate phase */
  identity: ManifestIdentity;

  /** Extracted data */
  extracted: ExtractedData;

  /** Source hash for change detection */
  sourceHash: string;

  /** Extraction metadata */
  metadata: ExtractionMetadata;
}

// =============================================================================
// Generation Phase Types
// =============================================================================

/**
 * Input for the generate phase (Phase 2 of two-phase API)
 *
 * Requires extraction result from a prior extract call.
 */
export interface GenerateInput {
  /** Organization ID */
  orgId: string;

  /** Component identity from extraction */
  identity: ManifestIdentity;

  /** Extracted data from extraction phase */
  extracted: ExtractedData;

  /** Source hash from extraction phase */
  sourceHash: string;

  /** Component version */
  version?: string;

  /**
   * Extraction metadata from prior extract call.
   * Used to preserve fallback info in the final output.
   */
  extraction?: ExtractionMetadata;

  /**
   * Optional hints to guide LLM generation.
   * Provides additional context about the component beyond what's extracted from code.
   */
  hints?: string;
}

/**
 * Generation result (success only - generator throws on error)
 */
export interface GenerateResult {
  /** Generated component metadata */
  meta: ComponentMeta;

  /** Provider used for generation */
  provider: string;

  /** Model used for generation */
  model: string;
}

// =============================================================================
// Build Phase Types
// =============================================================================

/**
 * Input for build phase.
 *
 * Combines extraction and generation results with identity
 * to produce a complete manifest.
 */
export interface BuildInput {
  /** Organization ID for multi-org isolation */
  orgId: string;

  /** Component identity */
  identity: ManifestIdentity;

  /** Extracted data from extraction phase */
  extracted: ExtractedData;

  /** Generated metadata from generation phase */
  meta: ComponentMeta;

  /** Source hash for change detection */
  sourceHash: string;

  /** Component names in the design system for filtering relatedComponents */
  availableComponents?: string[];
}

/**
 * Build result (success only - throws ManifestBuildError on failure)
 *
 * Flat structure matching ManifestOutput with build timestamp.
 */
export interface BuildResult {
  /** Component name (PascalCase) */
  componentName: string;

  /** Component identity (id, slug, name, framework) */
  identity: ManifestIdentity;

  /** AI-focused manifest (optimized for consumption) */
  manifest: AIManifest;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** Source files used for extraction */
  files: string[];

  /** Build timestamp */
  builtAt: string;
}
