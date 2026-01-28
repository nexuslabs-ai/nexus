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
 * - Two-Phase: extractOnly() + generateOnly() for split operations
 */

import {
  type ExtractionFailure,
  type ExtractionInput,
  type ExtractionOutput,
  type ExtractorResult,
  getExtractor,
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
} from '../manifest/index.js';
import type { Framework } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

import {
  type ExtractOnlyFailure,
  type ExtractOnlyOutput,
  type ExtractOnlySuccess,
  type GenerateOnlyInput,
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
 * const extractResult = await processor.extractOnly(input);
 * if (extractResult.type === 'success') {
 *   const generateResult = await processor.generateOnly({
 *     ...extractResult,
 *     orgId: 'org-uuid',
 *   });
 * }
 * ```
 */
export class ComponentProcessor {
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
      skipGeneration: config.skipGeneration ?? false,
      hasCustomProvider: !!config.llmProvider,
      availableComponentsCount: config.availableComponents?.length,
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
      skipGeneration: this.config.skipGeneration ?? false,
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

    // Step 2: Generate (or skip)
    let generationResult: GeneratorOutput | null = null;
    let generationSkipped = false;

    if (this.config.skipGeneration) {
      generationSkipped = true;
      logger.debug('Skipping meta generation (configured to skip)');
    } else {
      generationResult = await this.runGeneration(input, extraction, framework);
      if (isGeneratorFailure(generationResult)) {
        return this.handleGenerationFailure(
          generationResult,
          extraction,
          extractionResult.timeMs,
          startTime
        );
      }
    }

    // Step 3: Build Manifest
    const buildResult = this.runManifestBuild(
      input,
      extraction,
      generationResult,
      generationSkipped
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

    const generationTimeMs =
      generationResult && isGeneratorSuccess(generationResult)
        ? generationResult.generationTimeMs
        : undefined;

    logger.info('Component processing completed', {
      id: buildResult.manifest.id,
      name: buildResult.manifest.name,
      totalTimeMs,
      extractionTimeMs: extractionResult.timeMs,
      generationTimeMs,
      generationSkipped,
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
      generationSkipped,
    };

    return success;
  }

  // ===========================================================================
  // Two-Phase API
  // ===========================================================================

  /**
   * Extract only (Phase 1 of two-phase API)
   *
   * Performs fast code extraction without LLM generation.
   * Returns extraction result that can be passed to generateOnly().
   *
   * @param input - Processing input with source code
   * @returns ExtractOnlyOutput with success or failure result
   */
  async extractOnly(input: ProcessorInput): Promise<ExtractOnlyOutput> {
    const framework = input.framework ?? 'react';

    logger.info('Starting extract-only', {
      orgId: input.orgId,
      name: input.name,
      framework,
    });

    const extractionResult = await this.runExtraction(input, framework);

    if (isExtractionFailure(extractionResult.output)) {
      const failure: ExtractOnlyFailure = {
        type: ProcessorOutputType.Failure,
        error: extractionResult.output.error,
        code: ProcessorErrorCode.ExtractionFailed,
        sourceHash: extractionResult.output.sourceHash,
        retryable: true,
      };
      return failure;
    }

    const extraction = extractionResult.output;

    logger.info('Extract-only completed', {
      id: extraction.identity.id,
      name: extraction.identity.name,
      extractionTimeMs: extractionResult.timeMs,
      fallbackTriggered: extraction.fallbackTriggered,
    });

    const success: ExtractOnlySuccess = {
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
   * Generate only (Phase 2 of two-phase API)
   *
   * Performs LLM generation and manifest building using prior extraction result.
   * Requires output from extractOnly().
   *
   * @param input - Generation input with extracted data
   * @returns ProcessorOutput with success or failure result
   */
  async generateOnly(input: GenerateOnlyInput): Promise<ProcessorOutput> {
    const startTime = performance.now();

    logger.info('Starting generate-only', {
      orgId: input.orgId,
      name: input.identity.name,
      framework: input.identity.framework,
    });

    // Run generation
    const generatorInput: GeneratorInput = {
      orgId: input.orgId,
      name: input.identity.name,
      framework: input.identity.framework,
      extracted: input.extracted,
      figmaUrl: input.figmaUrl,
      hints: input.hints,
    };

    const genResult = await this.metaGenerator.generate(generatorInput);

    if (isGeneratorFailure(genResult)) {
      const totalTimeMs = Math.round(performance.now() - startTime);

      logger.error('Generate-only failed', new Error(genResult.error), {
        name: input.identity.name,
      });

      const failure: ProcessorFailure = {
        type: ProcessorOutputType.Failure,
        error: genResult.error,
        code: ProcessorErrorCode.GenerationFailed,
        metrics: {
          generationTimeMs: genResult.generationTimeMs,
          totalTimeMs,
        },
        retryable: genResult.retryable,
      };

      return failure;
    }

    // Build manifest
    const builderInput: ManifestBuilderInput = {
      orgId: input.orgId,
      identity: input.identity,
      extracted: input.extracted,
      meta: genResult.meta,
      sourceHash: input.sourceHash,
      version: input.version,
    };

    const buildResult = this.manifestBuilder.build(builderInput);

    if (isManifestBuildFailure(buildResult)) {
      const totalTimeMs = Math.round(performance.now() - startTime);

      logger.error(
        'Generate-only manifest build failed',
        new Error(buildResult.error),
        {
          name: input.identity.name,
          field: buildResult.field,
        }
      );

      const failure: ProcessorFailure = {
        type: ProcessorOutputType.Failure,
        error: buildResult.error,
        code: ProcessorErrorCode.ManifestBuildFailed,
        metrics: {
          generationTimeMs: genResult.generationTimeMs,
          totalTimeMs,
        },
        retryable: false,
      };

      return failure;
    }

    const totalTimeMs = Math.round(performance.now() - startTime);

    logger.info('Generate-only completed', {
      id: buildResult.manifest.id,
      name: buildResult.manifest.name,
      generationTimeMs: genResult.generationTimeMs,
      totalTimeMs,
    });

    const success: ProcessorSuccess = {
      type: ProcessorOutputType.Success,
      output: buildResult.output,
      manifest: buildResult.manifest,
      metrics: {
        generationTimeMs: genResult.generationTimeMs,
        totalTimeMs,
      },
      extraction: input.extraction ?? {
        fallbackTriggered: false,
        fallbackReason: undefined,
        extractionMethod: 'unknown',
      },
      generationSkipped: false,
    };

    return success;
  }

  /**
   * Process without LLM generation (extraction + minimal manifest)
   *
   * Convenience method that extracts and builds a minimal manifest
   * without calling the LLM. Useful for testing or fallback scenarios.
   *
   * @param input - Processing input with source code
   * @returns ProcessorOutput with minimal manifest
   */
  async processWithoutGeneration(
    input: ProcessorInput
  ): Promise<ProcessorOutput> {
    const startTime = performance.now();
    const framework = input.framework ?? 'react';

    logger.info('Starting processing without generation', {
      orgId: input.orgId,
      name: input.name,
      framework,
    });

    // Extract
    const extractionResult = await this.runExtraction(input, framework);
    if (isExtractionFailure(extractionResult.output)) {
      return this.handleExtractionFailure(
        extractionResult.output,
        extractionResult.timeMs,
        startTime
      );
    }

    const extraction = extractionResult.output;

    // Build minimal manifest (no generation)
    const buildResult = this.manifestBuilder.buildMinimal({
      orgId: input.orgId,
      identity: extraction.identity,
      extracted: extraction.data,
      sourceHash: extraction.sourceHash,
      version: input.version,
      name: input.name,
    });

    if (isManifestBuildFailure(buildResult)) {
      const totalTimeMs = Math.round(performance.now() - startTime);

      const failure: ProcessorFailure = {
        type: ProcessorOutputType.Failure,
        error: buildResult.error,
        code: ProcessorErrorCode.ManifestBuildFailed,
        metrics: {
          extractionTimeMs: extractionResult.timeMs,
          totalTimeMs,
        },
        extraction: {
          fallbackTriggered: extraction.fallbackTriggered,
          fallbackReason: extraction.fallbackReason,
          extractionMethod: extraction.extractionMethod,
        },
        retryable: false,
      };

      return failure;
    }

    const totalTimeMs = Math.round(performance.now() - startTime);

    logger.info('Processing without generation completed', {
      id: buildResult.manifest.id,
      name: buildResult.manifest.name,
      totalTimeMs,
    });

    const success: ProcessorSuccess = {
      type: ProcessorOutputType.Success,
      output: buildResult.output,
      manifest: buildResult.manifest,
      metrics: {
        extractionTimeMs: extractionResult.timeMs,
        totalTimeMs,
      },
      extraction: {
        fallbackTriggered: extraction.fallbackTriggered,
        fallbackReason: extraction.fallbackReason,
        extractionMethod: extraction.extractionMethod,
      },
      generationSkipped: true,
    };

    return success;
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  /**
   * Run extraction phase
   */
  private async runExtraction(
    input: ProcessorInput,
    framework: Framework
  ): Promise<{ output: ExtractionOutput; timeMs: number }> {
    const startTime = performance.now();

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
      const extractor = getExtractor(framework);
      const output = await extractor.extract(extractionInput);
      const timeMs = Math.round(performance.now() - startTime);

      return { output, timeMs };
    } catch (error) {
      const timeMs = Math.round(performance.now() - startTime);

      // Handle unsupported framework error
      if (
        error instanceof Error &&
        error.message.includes('Unsupported framework')
      ) {
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
      figmaUrl: input.figmaUrl,
      hints: input.hints,
    };

    return this.metaGenerator.generate(generatorInput);
  }

  /**
   * Run manifest build phase
   */
  private runManifestBuild(
    input: ProcessorInput,
    extraction: ExtractorResult,
    generationResult: GeneratorOutput | null,
    generationSkipped: boolean
  ): ManifestBuilderOutput {
    // If generation was skipped, build minimal manifest
    if (
      generationSkipped ||
      !generationResult ||
      isGeneratorFailure(generationResult)
    ) {
      return this.manifestBuilder.buildMinimal({
        orgId: input.orgId,
        identity: extraction.identity,
        extracted: extraction.data,
        sourceHash: extraction.sourceHash,
        version: input.version,
        name: input.name,
      });
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
