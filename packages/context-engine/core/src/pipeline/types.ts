/**
 * Pipeline Types
 *
 * Type definitions for the Pipeline facade that orchestrates
 * extraction, generation, and manifest building with optional
 * persistent state storage.
 */

import type { HybridExtractorOptions } from '../extractor/index.js';
import type { ILLMProvider } from '../generator/types.js';
import type {
  ComponentManifest,
  ComponentMeta,
  ExtractedData,
  ManifestIdentity,
  ManifestOutput,
} from '../types/index.js';

// =============================================================================
// Pipeline Configuration
// =============================================================================

/**
 * Pipeline configuration options
 *
 * Configures the underlying ComponentProcessor and extraction/generation
 * behavior.
 */
export interface PipelineConfig {
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
   * Format: PascalCase component names (e.g., ['Button', 'Card', 'Input'])
   */
  availableComponents?: string[];

  /**
   * Options for the HybridExtractor.
   * Used to configure path aliases and dependencies for accurate
   * internal vs external import detection.
   */
  extractorOptions?: HybridExtractorOptions;
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

  /** Time spent on extraction (ms) */
  extractionTimeMs: number;

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

  /** Time spent on generation (ms) */
  generationTimeMs: number;

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
 * of the extraction-generation-build pipeline.
 */
export interface StoredManifest {
  /** Component name (PascalCase) */
  componentName: string;

  /** Complete component manifest */
  manifest: ComponentManifest;

  /** Split manifest output structure */
  output: ManifestOutput;

  /** ISO timestamp when manifest was stored */
  storedAt: string;
}
