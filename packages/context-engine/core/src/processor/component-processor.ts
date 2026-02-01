/**
 * Component Processor
 *
 * Orchestrates the full component processing pipeline:
 * 1. Extract (HybridExtractor) -> ExtractorResult
 * 2. Generate (MetaGenerator) -> GeneratorOutput (optional)
 * 3. Build (ManifestBuilder) -> ComponentManifest
 *
 * Supports two API patterns:
 * - Combined: process() for single-call extraction + generation
 * - Two-Phase: extract() + generate() + build() for split operations
 */

import {
  type ExtractionFailure,
  type ExtractionInput,
  type ExtractionOutput,
  type ExtractorResult,
  getExtractor,
  type IExtractor,
  isExtractionFailure,
} from '../extractor/index.js';
import {
  type GeneratorFailure,
  type GeneratorInput,
  type GeneratorOutput,
  isGeneratorFailure,
  isGeneratorSuccess,
  MetaGenerator,
  type MetaGeneratorConfig,
} from '../generator/index.js';
import {
  isManifestBuildFailure,
  ManifestBuilder,
  type ManifestBuilderFailure,
  type ManifestBuilderInput,
  type ManifestBuilderOutput,
  ManifestBuildOutputType,
} from '../manifest/index.js';
import type { Framework } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

import {
  type BuildInput,
  type ExtractFailure,
  type ExtractOutput,
  type ExtractSuccess,
  type GenerateFailure,
  type GenerateInput,
  type GenerateOutput,
  type GenerateSuccess,
  type ProcessorConfig,
  ProcessorErrorCode,
  type ProcessorFailure,
  type ProcessorInput,
  type ProcessorOutput,
  ProcessorOutputType,
  type ProcessorSuccess,
} from './types.js';

const logger = createLogger({ name: 'component-processor' });

// =============================================================================
// Component Processor
// =============================================================================

/**
 * ComponentProcessor orchestrates the full component processing pipeline.
 *
 * The processor combines:
 * - HybridExtractor: Extracts props, variants, and dependencies from source code
 * - MetaGenerator: Generates semantic metadata using LLM
 * - ManifestBuilder: Combines extraction and generation into a complete manifest
 *
 * API Patterns:
 * - Combined: process() for single-call extraction + generation
 * - Two-Phase: extract() + generate() + build() for split operations
 *
 * @example
 * ```typescript
 * // Full pipeline
 * const processor = new ComponentProcessor();
 * const result = await processor.process({
 *   orgId: 'org-uuid',
 *   name: 'Button',
 *   sourceCode: buttonCode,
 * });
 *
 * if (result.type === 'success') {
 *   console.log(result.manifest);
 * }
 *
 * // Two-phase API
 * const extractResult = await processor.extract(input);
 * if (extractResult.type === 'success') {
 *   const genResult = await processor.generate({
 *     orgId: input.orgId,
 *     identity: extractResult.identity,
 *     extracted: extractResult.extracted,
 *     sourceHash: extractResult.sourceHash,
 *   });
 *   if (genResult.type === 'success') {
 *     const buildResult = processor.build({
 *       orgId: input.orgId,
 *       identity: extractResult.identity,
 *       extracted: extractResult.extracted,
 *       meta: genResult.meta,
 *       sourceHash: extractResult.sourceHash,
 *     });
 *   }
 * }
 * ```
 */
export class ComponentProcessor {
  private extractor: IExtractor;
  private metaGenerator: MetaGenerator;
  private manifestBuilder: ManifestBuilder;
  private config: ProcessorConfig;

  /**
   * Create a new ComponentProcessor instance
   *
   * @param config - Optional configuration for the processor
   */
  constructor(config: ProcessorConfig = {}) {
    this.config = config;

    // Initialize extractor with optional custom options
    // Default framework is 'react' - the processor uses this for all extractions
    this.extractor = getExtractor('react', config.extractorOptions);

    // Initialize meta generator with optional custom provider
    const generatorConfig: MetaGeneratorConfig = {
      provider: config.llmProvider,
      maxTokens: config.maxGenerationTokens,
    };
    this.metaGenerator = new MetaGenerator(generatorConfig);

    // Initialize manifest builder with available components for filtering
    this.manifestBuilder = new ManifestBuilder({
      availableComponents: config.availableComponents,
    });

    logger.debug('ComponentProcessor initialized', {
      hasCustomProvider: !!config.llmProvider,
      availableComponentsCount: config.availableComponents?.length,
      hasExtractorOptions: !!config.extractorOptions,
    });
  }

  // ===========================================================================
  // Full Pipeline
  // ===========================================================================

  /**
   * Process a component through the full pipeline: Extract + Generate + Build
   *
   * This is the combined API pattern that performs all steps in a single call.
   *
   * @param input - Processing input with source code and context
   * @returns ProcessorOutput with success or failure result
   */
  async process(input: ProcessorInput): Promise<ProcessorOutput> {
    const startTime = performance.now();
    const framework = input.framework ?? 'react';

    logger.info('Starting component processing', {
      orgId: input.orgId,
      name: input.name,
      framework,
    });

    // Step 1: Extract
    const extractionResult = await this.runExtraction(input, framework);
    if (isExtractionFailure(extractionResult.output)) {
      return this.handleExtractionFailure(
        extractionResult.output,
        extractionResult.timeMs,
        startTime
      );
    }

    const extraction = extractionResult.output;

    // Step 2: Generate
    const generationResult = await this.runGeneration(
      input,
      extraction,
      framework
    );
    if (isGeneratorFailure(generationResult)) {
      return this.handleGenerationFailure(
        generationResult,
        extraction,
        extractionResult.timeMs,
        startTime
      );
    }

    // Step 3: Build Manifest
    const buildResult = this.runManifestBuild(
      input,
      extraction,
      generationResult
    );
    if (isManifestBuildFailure(buildResult)) {
      return this.handleBuildFailure(
        buildResult,
        extraction,
        extractionResult.timeMs,
        generationResult,
        startTime
      );
    }

    // Success
    const totalTimeMs = Math.round(performance.now() - startTime);

    const generationTimeMs = isGeneratorSuccess(generationResult)
      ? generationResult.generationTimeMs
      : undefined;

    logger.info('Component processing completed', {
      id: buildResult.manifest.id,
      name: buildResult.manifest.name,
      totalTimeMs,
      extractionTimeMs: extractionResult.timeMs,
      generationTimeMs,
    });

    const success: ProcessorSuccess = {
      type: ProcessorOutputType.Success,
      output: buildResult.output,
      manifest: buildResult.manifest,
      metrics: {
        extractionTimeMs: extractionResult.timeMs,
        generationTimeMs,
        totalTimeMs,
      },
      extraction: {
        fallbackTriggered: extraction.fallbackTriggered,
        fallbackReason: extraction.fallbackReason,
        extractionMethod: extraction.extractionMethod,
      },
    };

    return success;
  }

  // ===========================================================================
  // Two-Phase API
  // ===========================================================================

  /**
   * Extract component metadata without LLM generation.
   *
   * This is Phase 1 of the two-phase API. Use this when you want to:
   * - Extract metadata quickly without waiting for LLM
   * - Store extraction results for later generation
   * - Batch extractions before running generation
   *
   * @param input - Processing input with source code
   * @returns ExtractOutput with success or failure result
   *
   * @example
   * ```typescript
   * const extractResult = await processor.extract(input);
   * if (extractResult.type === 'success') {
   *   // Later: run generation
   *   const genResult = await processor.generate({
   *     orgId: input.orgId,
   *     identity: extractResult.identity,
   *     extracted: extractResult.extracted,
   *     sourceHash: extractResult.sourceHash,
   *   });
   * }
   * ```
   */
  async extract(input: ProcessorInput): Promise<ExtractOutput> {
    const framework = input.framework ?? 'react';

    logger.info('Starting extraction', {
      orgId: input.orgId,
      name: input.name,
      framework,
    });

    const extractionResult = await this.runExtraction(input, framework);

    if (isExtractionFailure(extractionResult.output)) {
      const failure: ExtractFailure = {
        type: ProcessorOutputType.Failure,
        error: extractionResult.output.error,
        code: ProcessorErrorCode.ExtractionFailed,
        sourceHash: extractionResult.output.sourceHash,
        retryable: true,
      };
      return failure;
    }

    const extraction = extractionResult.output;

    logger.info('Extraction completed', {
      id: extraction.identity.id,
      name: extraction.identity.name,
      extractionTimeMs: extractionResult.timeMs,
      fallbackTriggered: extraction.fallbackTriggered,
    });

    const success: ExtractSuccess = {
      type: ProcessorOutputType.Success,
      id: extraction.identity.id,
      slug: extraction.identity.slug,
      identity: extraction.identity,
      extracted: extraction.data,
      sourceHash: extraction.sourceHash,
      extraction: {
        fallbackTriggered: extraction.fallbackTriggered,
        fallbackReason: extraction.fallbackReason,
        extractionMethod: extraction.extractionMethod,
      },
      extractionTimeMs: extractionResult.timeMs,
    };

    return success;
  }

  /**
   * Generate LLM metadata from extraction results.
   *
   * This is Phase 2 of the two-phase API. Use after extract() to:
   * - Add semantic descriptions and patterns
   * - Generate usage examples
   * - Enrich metadata with AI insights
   *
   * Returns only the generation result (not a manifest). Use build()
   * to combine extraction and generation into a complete manifest.
   *
   * @param input - Generation input with extracted data from extract()
   * @returns GenerateOutput with success or failure result
   *
   * @example
   * ```typescript
   * const genResult = await processor.generate(input);
   * if (genResult.type === 'success') {
   *   // Build the final manifest
   *   const buildResult = processor.build({
   *     orgId: input.orgId,
   *     identity: extractResult.identity,
   *     extracted: extractResult.extracted,
   *     meta: genResult.meta,
   *     sourceHash: extractResult.sourceHash,
   *   });
   * }
   * ```
   */
  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const startTime = performance.now();

    logger.info('Starting generation', {
      orgId: input.orgId,
      name: input.identity.name,
      framework: input.identity.framework,
    });

    // Build generator input
    const generatorInput: GeneratorInput = {
      orgId: input.orgId,
      name: input.identity.name,
      framework: input.identity.framework,
      extracted: input.extracted,
      hints: input.hints,
    };

    // Run generation
    const genResult = await this.metaGenerator.generate(generatorInput);
    const generationTimeMs = Math.round(performance.now() - startTime);

    if (isGeneratorFailure(genResult)) {
      logger.error('Generation failed', new Error(genResult.error), {
        name: input.identity.name,
      });

      const failure: GenerateFailure = {
        type: ProcessorOutputType.Failure,
        error: genResult.error,
        generationTimeMs,
        retryable: genResult.retryable,
      };

      return failure;
    }

    logger.info('Generation completed', {
      name: input.identity.name,
      generationTimeMs,
      provider: genResult.provider,
      model: genResult.model,
    });

    const success: GenerateSuccess = {
      type: ProcessorOutputType.Success,
      meta: genResult.meta,
      generationTimeMs,
      provider: genResult.provider,
      model: genResult.model,
    };

    return success;
  }

  /**
   * Build manifest from extraction and generation results.
   *
   * This is the final phase that combines extracted data with
   * LLM-generated metadata into a complete ComponentManifest.
   *
   * @param input - Build input with extraction and generation results
   * @returns ManifestBuilderOutput with success or failure result
   *
   * @example
   * ```typescript
   * const buildResult = processor.build({
   *   orgId: 'org-123',
   *   identity: extractResult.identity,
   *   extracted: extractResult.extracted,
   *   meta: genResult.meta,
   *   sourceHash: extractResult.sourceHash,
   * });
   *
   * if (buildResult.type === 'success') {
   *   console.log(buildResult.manifest);
   * }
   * ```
   */
  build(input: BuildInput): ManifestBuilderOutput {
    logger.info('Building manifest', {
      orgId: input.orgId,
      name: input.identity.name,
    });

    const builderInput: ManifestBuilderInput = {
      orgId: input.orgId,
      identity: input.identity,
      extracted: input.extracted,
      meta: input.meta,
      sourceHash: input.sourceHash,
      version: input.version,
    };

    const result = this.manifestBuilder.build(builderInput);

    if (isManifestBuildFailure(result)) {
      logger.error('Manifest build failed', new Error(result.error), {
        name: input.identity.name,
        field: result.field,
      });
    } else {
      logger.info('Manifest built successfully', {
        id: result.manifest.id,
        name: result.manifest.name,
      });
    }

    return result;
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  /**
   * Run extraction phase
   *
   * Uses the stored extractor instance initialized in the constructor.
   * The extractor is created once with the configured options, ensuring
   * consistent behavior across all extraction calls.
   *
   * Note: Currently only 'react' framework is supported. The framework
   * parameter is validated at runtime to maintain backward compatibility
   * with the error behavior.
   */
  private async runExtraction(
    input: ProcessorInput,
    framework: Framework
  ): Promise<{ output: ExtractionOutput; timeMs: number }> {
    const startTime = performance.now();

    // Validate framework - currently only React is supported
    // This maintains backward compatibility with the previous error behavior
    const SUPPORTED_FRAMEWORKS = ['react'];
    if (!SUPPORTED_FRAMEWORKS.includes(framework)) {
      const timeMs = Math.round(performance.now() - startTime);
      return {
        output: {
          type: 'failure' as const,
          error: `Unsupported framework: ${framework}. Supported: ${SUPPORTED_FRAMEWORKS.join(', ')}`,
          sourceHash: '',
          extractionTimeMs: timeMs,
        },
        timeMs,
      };
    }

    const extractionInput: ExtractionInput = {
      orgId: input.orgId,
      name: input.name,
      sourceCode: input.sourceCode,
      framework,
      filePath: input.filePath,
      existingId: input.existingId,
      storiesCode: input.storiesCode,
      storiesFilePath: input.storiesFilePath,
    };

    try {
      const output = await this.extractor.extract(extractionInput);
      const timeMs = Math.round(performance.now() - startTime);

      return { output, timeMs };
    } catch (error) {
      const timeMs = Math.round(performance.now() - startTime);

      // Handle unexpected extraction errors
      if (error instanceof Error) {
        return {
          output: {
            type: 'failure' as const,
            error: error.message,
            sourceHash: '',
            extractionTimeMs: timeMs,
          },
          timeMs,
        };
      }

      throw error;
    }
  }

  /**
   * Run generation phase
   */
  private async runGeneration(
    input: ProcessorInput,
    extraction: ExtractorResult,
    framework: Framework
  ): Promise<GeneratorOutput> {
    const generatorInput: GeneratorInput = {
      orgId: input.orgId,
      name: input.name,
      framework,
      extracted: extraction.data,
      hints: input.hints,
    };

    return this.metaGenerator.generate(generatorInput);
  }

  /**
   * Run manifest build phase
   *
   * Requires valid generation result - no silent fallbacks.
   */
  private runManifestBuild(
    input: ProcessorInput,
    extraction: ExtractorResult,
    generationResult: GeneratorOutput
  ): ManifestBuilderOutput {
    // Generation must be successful at this point
    if (isGeneratorFailure(generationResult)) {
      return {
        type: ManifestBuildOutputType.Failure,
        error: `Generation failed: ${generationResult.error}. LLM generation is required for manifest building.`,
      };
    }

    // Build full manifest with generated meta
    const builderInput: ManifestBuilderInput = {
      orgId: input.orgId,
      identity: extraction.identity,
      extracted: extraction.data,
      meta: generationResult.meta,
      sourceHash: extraction.sourceHash,
      version: input.version,
    };

    return this.manifestBuilder.build(builderInput);
  }

  /**
   * Handle extraction failure
   */
  private handleExtractionFailure(
    failure: ExtractionFailure,
    extractionTimeMs: number,
    startTime: number
  ): ProcessorFailure {
    const totalTimeMs = Math.round(performance.now() - startTime);

    logger.error('Extraction failed', new Error(failure.error));

    return {
      type: ProcessorOutputType.Failure,
      error: failure.error,
      code: ProcessorErrorCode.ExtractionFailed,
      metrics: { extractionTimeMs, totalTimeMs },
      retryable: true,
    };
  }

  /**
   * Handle generation failure
   */
  private handleGenerationFailure(
    genResult: GeneratorFailure,
    extraction: ExtractorResult,
    extractionTimeMs: number,
    startTime: number
  ): ProcessorFailure {
    const totalTimeMs = Math.round(performance.now() - startTime);

    logger.error('Generation failed', new Error(genResult.error));

    return {
      type: ProcessorOutputType.Failure,
      error: genResult.error,
      code: ProcessorErrorCode.GenerationFailed,
      metrics: {
        extractionTimeMs,
        generationTimeMs: genResult.generationTimeMs,
        totalTimeMs,
      },
      extraction: {
        fallbackTriggered: extraction.fallbackTriggered,
        fallbackReason: extraction.fallbackReason,
        extractionMethod: extraction.extractionMethod,
      },
      retryable: genResult.retryable,
    };
  }

  /**
   * Handle manifest build failure
   */
  private handleBuildFailure(
    buildResult: ManifestBuilderFailure,
    extraction: ExtractorResult,
    extractionTimeMs: number,
    generationResult: GeneratorOutput | null,
    startTime: number
  ): ProcessorFailure {
    const totalTimeMs = Math.round(performance.now() - startTime);
    const genTimeMs =
      generationResult && isGeneratorSuccess(generationResult)
        ? generationResult.generationTimeMs
        : undefined;

    logger.error('Manifest build failed', new Error(buildResult.error), {
      field: buildResult.field,
    });

    return {
      type: ProcessorOutputType.Failure,
      error: buildResult.error,
      code: ProcessorErrorCode.ManifestBuildFailed,
      metrics: {
        extractionTimeMs,
        generationTimeMs: genTimeMs,
        totalTimeMs,
      },
      extraction: {
        fallbackTriggered: extraction.fallbackTriggered,
        fallbackReason: extraction.fallbackReason,
        extractionMethod: extraction.extractionMethod,
      },
      retryable: false,
    };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a ComponentProcessor with configuration
 *
 * @param config - Optional configuration overrides
 * @returns Configured ComponentProcessor instance
 */
export function createComponentProcessor(
  config?: ProcessorConfig
): ComponentProcessor {
  return new ComponentProcessor(config);
}
