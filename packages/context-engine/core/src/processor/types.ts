/**
 * Processor Types
 *
 * Types for the ComponentProcessor that orchestrates the full pipeline:
 * Extract -> Generate (optional) -> Build Manifest
 *
 * Uses discriminated unions for type-safe success/failure handling.
 */

import type { ILLMProvider } from '../generator/types.js';
import type {
  ComponentManifest,
  ExtractedData,
  Framework,
  ManifestIdentity,
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
   * Skip LLM generation and use minimal/placeholder metadata.
   * Useful for testing or when LLM is unavailable.
   * @default false
   */
  skipGeneration?: boolean;

  /**
   * Maximum tokens for LLM generation.
   * @default 2000
   */
  maxGenerationTokens?: number;
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
   * Optional Figma URL for design context.
   * Passed to LLM for richer metadata generation.
   */
  figmaUrl?: string;

  /**
   * Optional hints for generation.
   * Additional context for the LLM (e.g., design system name).
   */
  hints?: string;

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
}

/**
 * Input for the generate-only phase (Phase 2 of two-phase API)
 *
 * Requires extraction result from a prior extractOnly call.
 */
export interface GenerateOnlyInput {
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

  /** Optional Figma URL for design context */
  figmaUrl?: string;

  /** Optional hints for generation */
  hints?: string;

  /**
   * Extraction metadata from prior extractOnly call.
   * Used to preserve fallback info in the final output.
   */
  extraction?: ExtractionMetadata;
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

  /** Complete component manifest */
  manifest: ComponentManifest;

  /** Processing metrics */
  metrics: ProcessorMetrics;

  /** Extraction metadata */
  extraction: ExtractionMetadata;

  /** Whether generation was skipped (minimal meta used) */
  generationSkipped: boolean;
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
// Extract-Only Output Types
// =============================================================================

/**
 * Successful extract-only output
 */
export interface ExtractOnlySuccess {
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
 * Failed extract-only output
 */
export interface ExtractOnlyFailure {
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
 * Extract-only output union
 */
export type ExtractOnlyOutput = ExtractOnlySuccess | ExtractOnlyFailure;

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

/**
 * Check if extract-only output is successful
 */
export function isExtractOnlySuccess(
  output: ExtractOnlyOutput
): output is ExtractOnlySuccess {
  return output.type === ProcessorOutputType.Success;
}

/**
 * Check if extract-only output is a failure
 */
export function isExtractOnlyFailure(
  output: ExtractOnlyOutput
): output is ExtractOnlyFailure {
  return output.type === ProcessorOutputType.Failure;
}
