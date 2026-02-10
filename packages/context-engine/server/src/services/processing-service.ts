/**
 * Processing Service
 *
 * Orchestrates component processing using @context-engine/core.
 * Provides both full pipeline and atomic operations for server routes.
 *
 * Uses ComponentProcessor from core, which internally coordinates:
 * - HybridExtractor for props, variants, and dependency extraction
 * - MetaGenerator for LLM-based semantic metadata generation
 * - ManifestBuilder for combining extraction and generation into manifests
 *
 * All methods return core types directly. Route handlers are responsible
 * for wrapping results in HTTP response shapes and persisting to the database.
 */

import {
  type BuildInput,
  type BuildResult,
  ComponentProcessor,
  type ExtractResult,
  type GenerateInput,
  type GenerateResult,
  type ProcessorConfig,
  type ProcessorInput,
  type ProcessorResult,
} from '@context-engine/core/processor';
import { createProviderFromEnv } from '@context-engine/core/utils';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration for ProcessingService.
 *
 * Separates processor-level config (available components, extractor options)
 * from per-request input. This is passed once at construction time.
 */
export interface ProcessingServiceConfig {
  /**
   * List of component names that exist in the design system.
   * Used to filter LLM-generated relatedComponents and prevent hallucinations.
   *
   * Format: PascalCase component names (e.g., ['Button', 'Card', 'Input'])
   */
  availableComponents?: string[];
}

// =============================================================================
// Service
// =============================================================================

/**
 * Service for processing components through the extraction-generation pipeline.
 *
 * Wraps @context-engine/core's ComponentProcessor with atomic methods
 * for server routes. Provides both full pipeline and step-by-step operations:
 *
 * - **process()** — Full pipeline: extract -> generate -> build
 * - **extract()** — Extract props, variants, dependencies from source code
 * - **generate()** — Generate semantic metadata using LLM
 * - **build()** — Combine extraction and generation into a manifest
 *
 * Lazily initializes the processor to avoid startup failures
 * when LLM_API_KEY is not yet configured.
 *
 * @example
 * ```typescript
 * // Full pipeline
 * const result = await processingService.process(input);
 *
 * // Step-by-step for more control
 * const extractResult = await processingService.extract(input);
 * const genResult = await processingService.generate({
 *   orgId: input.orgId,
 *   identity: extractResult.identity,
 *   extracted: extractResult.extracted,
 *   sourceHash: extractResult.sourceHash,
 * });
 * const buildResult = processingService.build({
 *   orgId: input.orgId,
 *   identity: extractResult.identity,
 *   extracted: extractResult.extracted,
 *   meta: genResult.meta,
 *   sourceHash: extractResult.sourceHash,
 * });
 * ```
 */
export class ProcessingService {
  private processor: ComponentProcessor | null = null;
  private readonly config: ProcessingServiceConfig;

  constructor(config: ProcessingServiceConfig = {}) {
    this.config = config;
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Process a component through the full pipeline.
   *
   * Runs extraction (props, variants, dependencies), LLM generation
   * (semantic descriptions, usage patterns), and manifest building
   * in sequence.
   *
   * @param input - Processing input with source code and context
   * @returns ProcessorResult with manifest, identity, and extraction metadata
   * @throws Error if LLM_API_KEY is not configured
   * @throws ExtractionError if extraction fails
   * @throws MetaGenerationError if LLM generation fails
   * @throws ManifestBuildError if manifest building fails
   */
  async process(input: ProcessorInput): Promise<ProcessorResult> {
    const processor = this.getProcessor();
    return processor.process(input);
  }

  /**
   * Extract component metadata without LLM generation.
   *
   * Phase 1 of atomic operations. Extracts props, variants, and
   * dependencies from component source code.
   *
   * @param input - Processing input with source code
   * @returns ExtractResult with identity, extracted data, and metadata
   * @throws ExtractionError if extraction fails
   */
  async extract(input: ProcessorInput): Promise<ExtractResult> {
    const processor = this.getProcessor();
    return processor.extract(input);
  }

  /**
   * Generate LLM metadata from extraction results.
   *
   * Phase 2 of atomic operations. Generates semantic descriptions,
   * usage patterns, and examples using LLM.
   *
   * @param input - Generation input with extracted data from extract()
   * @returns GenerateResult with meta, provider, and model info
   * @throws Error if LLM_API_KEY is not configured
   * @throws MetaGenerationError if generation fails
   */
  async generate(input: GenerateInput): Promise<GenerateResult> {
    const processor = this.getProcessor();
    return processor.generate(input);
  }

  /**
   * Build manifest from extraction and generation results.
   *
   * Phase 3 of atomic operations. Combines extracted data with
   * LLM-generated metadata into a complete manifest.
   *
   * @param input - Build input with extraction and generation results
   * @returns BuildResult with manifest, identity, and files
   * @throws ManifestBuildError if building fails
   */
  build(input: BuildInput): BuildResult {
    const processor = this.getProcessor();
    return processor.build(input);
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Get or create the processor instance.
   *
   * Lazily initialized so the server can start without LLM_API_KEY.
   * The error surfaces at request time when processing is actually needed.
   *
   * @returns ComponentProcessor instance
   * @throws Error if LLM_API_KEY is not configured
   */
  private getProcessor(): ComponentProcessor {
    if (!this.processor) {
      const provider = createProviderFromEnv();

      const config: ProcessorConfig = {
        llmProvider: provider,
        availableComponents: this.config.availableComponents,
      };

      this.processor = new ComponentProcessor(config);
    }

    return this.processor;
  }
}

/**
 * Singleton instance for use across the application.
 *
 * Import this directly for convenience in route handlers:
 * ```typescript
 * import { processingService } from './services/index.js';
 *
 * // Full pipeline
 * const result = await processingService.process(input);
 *
 * // Or atomic operations
 * const extractResult = await processingService.extract(input);
 * ```
 */
export const processingService = new ProcessingService();
