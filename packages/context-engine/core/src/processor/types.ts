/**
 * Processor Types
 *
 * Types for the ComponentProcessor that orchestrates the full pipeline:
 * Extract -> Generate -> Build Manifest
 *
 * Uses discriminated unions for type-safe success/failure handling.
 */

import type { HybridExtractorOptions } from '../extractor/index.js';
import type { ILLMProvider } from '../generator/types.js';
import type {
  ComponentManifest,
  ComponentMeta,
  ExtractedData,
  Framework,
  ManifestIdentity,
  ManifestOutput,
} from '../types/index.js';
import { OutputType } from '../types/output.js';

// =============================================================================
// Discriminant Constants
// =============================================================================

/**
 * Processor output type discriminant
 *
 * Uses shared OutputType for consistency across modules.
 */
export const ProcessorOutputType = OutputType;

export type ProcessorOutputType =
  (typeof ProcessorOutputType)[keyof typeof ProcessorOutputType];

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
   * List of component names that exist in the design system.
   * Used to filter LLM-generated relatedComponents to prevent
   * hallucinated component names.
   *
   * If not provided, all relatedComponents from the LLM are kept.
   * Format: PascalCase component names (e.g., ['Button', 'Card', 'Input'])
   */
  availableComponents?: string[];

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
}

// =============================================================================
// Output Types (Discriminated Unions)
// =============================================================================

/**
 * Timing metrics for the processing pipeline
 */
export interface ProcessorMetrics {
  /** Time spent on extraction (ms) */
  extractionTimeMs?: number;

  /** Time spent on generation (ms) */
  generationTimeMs?: number;

  /** Total processing time (ms) */
  totalTimeMs: number;
}

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
 * Successful processor output
 */
export interface ProcessorSuccess {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Success;

  /** Split manifest output (componentName, metadata, manifest) */
  output: ManifestOutput;

  /** Complete component manifest (legacy, for internal use) */
  manifest: ComponentManifest;

  /** Processing metrics */
  metrics: ProcessorMetrics;

  /** Extraction metadata */
  extraction: ExtractionMetadata;
}

/**
 * Failed processor output
 */
export interface ProcessorFailure {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Failure;

  /** Error message */
  error: string;

  /**
   * Error code for programmatic handling
   */
  code: ProcessorErrorCode;

  /** Processing metrics (may be partial) */
  metrics: Partial<ProcessorMetrics>;

  /** Extraction metadata (if extraction completed) */
  extraction?: ExtractionMetadata;

  /** Whether the error is retryable */
  retryable: boolean;
}

/**
 * Processor output union
 */
export type ProcessorOutput = ProcessorSuccess | ProcessorFailure;

// =============================================================================
// Error Codes
// =============================================================================

/**
 * Processor error codes for programmatic handling
 */
export const ProcessorErrorCode = {
  /** Extraction failed */
  ExtractionFailed: 'EXTRACTION_FAILED',

  /** Meta generation failed */
  GenerationFailed: 'GENERATION_FAILED',

  /** Manifest building failed */
  ManifestBuildFailed: 'MANIFEST_BUILD_FAILED',

  /** Unsupported framework */
  UnsupportedFramework: 'UNSUPPORTED_FRAMEWORK',

  /** Invalid input */
  InvalidInput: 'INVALID_INPUT',
} as const;

export type ProcessorErrorCode =
  (typeof ProcessorErrorCode)[keyof typeof ProcessorErrorCode];

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if processor output is successful
 */
export function isProcessorSuccess(
  output: ProcessorOutput
): output is ProcessorSuccess {
  return output.type === ProcessorOutputType.Success;
}

/**
 * Check if processor output is a failure
 */
export function isProcessorFailure(
  output: ProcessorOutput
): output is ProcessorFailure {
  return output.type === ProcessorOutputType.Failure;
}

// =============================================================================
// Extraction Phase Types
// =============================================================================

/**
 * Successful extraction output
 */
export interface ExtractSuccess {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Success;

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
  extraction: ExtractionMetadata;

  /** Extraction timing */
  extractionTimeMs: number;
}

/**
 * Failed extraction output
 */
export interface ExtractFailure {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Failure;

  /** Error message */
  error: string;

  /** Error code */
  code: ProcessorErrorCode;

  /** Source hash (for conflict errors) */
  sourceHash?: string;

  /** Whether the error is retryable */
  retryable: boolean;
}

/**
 * Extraction output union
 */
export type ExtractOutput = ExtractSuccess | ExtractFailure;

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

// =============================================================================
// Build Phase Types
// =============================================================================

/**
 * Input for build phase.
 *
 * Combines extraction and generation results with identity
 * to produce a complete ComponentManifest.
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

  /** Component version */
  version?: string;
}

/**
 * Build phase output.
 *
 * Result of combining extraction and generation into a manifest.
 */
export type { ManifestBuilderOutput as BuildOutput } from '../manifest/index.js';

/**
 * Generation phase success output.
 *
 * Simplified output containing only the LLM-generated metadata,
 * without manifest building (which happens in the build phase).
 */
export interface GenerateSuccess {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Success;

  /** Generated component metadata */
  meta: ComponentMeta;

  /** Generation timing in milliseconds */
  generationTimeMs: number;

  /** Provider used for generation */
  provider: string;

  /** Model used for generation */
  model: string;
}

/**
 * Generation phase failure output.
 *
 * Represents a failed LLM generation attempt.
 */
export interface GenerateFailure {
  /** Discriminant for type narrowing */
  type: typeof ProcessorOutputType.Failure;

  /** Error message */
  error: string;

  /** Generation timing in milliseconds */
  generationTimeMs: number;

  /** Whether the error is retryable */
  retryable: boolean;
}

/**
 * Generation phase output.
 *
 * Discriminated union of generation success or failure.
 */
export type GenerateOutput = GenerateSuccess | GenerateFailure;

// =============================================================================
// Type Guards for Extraction and Generation
// =============================================================================

/**
 * Check if extraction output is successful
 */
export function isExtractSuccess(
  output: ExtractOutput
): output is ExtractSuccess {
  return output.type === ProcessorOutputType.Success;
}

/**
 * Check if extraction output is a failure
 */
export function isExtractFailure(
  output: ExtractOutput
): output is ExtractFailure {
  return output.type === ProcessorOutputType.Failure;
}

/**
 * Check if generation output is successful
 */
export function isGenerateSuccess(
  result: GenerateOutput
): result is GenerateSuccess {
  return result.type === ProcessorOutputType.Success;
}

/**
 * Check if generation output is a failure
 */
export function isGenerateFailure(
  result: GenerateOutput
): result is GenerateFailure {
  return result.type === ProcessorOutputType.Failure;
}
