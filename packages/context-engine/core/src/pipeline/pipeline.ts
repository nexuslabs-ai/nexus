/**
 * Pipeline Facade
 *
 * High-level API for the extraction-generation-build pipeline.
 * Wraps ComponentProcessor with optional persistent state storage.
 *
 * Two modes of operation:
 * 1. In-memory: Standard processing without persistence
 * 2. Persistent: Saves state after each phase for resumable workflows
 *
 * @example
 * ```typescript
 * // In-memory mode
 * const pipeline = Pipeline.create({ llmProvider: myProvider });
 * const result = await pipeline.process(input);
 *
 * // Persistent mode with checkpoints
 * const store = new FileStateStore('./state');
 * const pipeline = Pipeline.createWithStore({ llmProvider: myProvider }, store);
 *
 * // Extract and save (can resume later)
 * await pipeline.extractAndSave(input);
 *
 * // Later: generate from stored extraction
 * const result = await pipeline.generateFromStored('Button');
 * ```
 */

import {
  isManifestBuildFailure,
  ManifestBuilder,
  type ManifestBuilderInput,
  type ManifestBuilderOutput,
} from '../manifest/index.js';
import {
  ComponentProcessor,
  type ExtractOutput,
  type GenerateInput,
  isExtractSuccess,
  isGenerateSuccess,
  isProcessorSuccess,
  type ProcessorConfig,
  type ProcessorInput,
  type ProcessorOutput,
} from '../processor/index.js';

import type { IPipelineStateStore } from './state-store.js';
import type {
  PipelineConfig,
  StoredExtraction,
  StoredGeneration,
  StoredManifest,
} from './types.js';

// =============================================================================
// Pipeline Class
// =============================================================================

/**
 * Pipeline facade for the extraction-generation-build workflow
 *
 * Provides both in-memory and persistent operation modes.
 * In persistent mode, state is saved after each phase, enabling
 * resumable workflows and checkpoint-based processing.
 */
export class Pipeline {
  private readonly processor: ComponentProcessor;
  private readonly manifestBuilder: ManifestBuilder;
  private readonly store?: IPipelineStateStore;
  private readonly config: PipelineConfig;

  /**
   * Private constructor - use static factory methods
   */
  private constructor(config: PipelineConfig, store?: IPipelineStateStore) {
    this.config = config;
    this.store = store;

    // Map PipelineConfig to ProcessorConfig
    const processorConfig: ProcessorConfig = {
      llmProvider: config.llmProvider,
      maxGenerationTokens: config.maxGenerationTokens,
      availableComponents: config.availableComponents,
      extractorOptions: config.extractorOptions,
    };

    this.processor = new ComponentProcessor(processorConfig);
    this.manifestBuilder = new ManifestBuilder({
      availableComponents: config.availableComponents,
    });
  }

  // ===========================================================================
  // Static Factory Methods
  // ===========================================================================

  /**
   * Create a Pipeline in in-memory mode (no persistence)
   *
   * @param config - Optional pipeline configuration
   * @returns Pipeline instance
   *
   * @example
   * ```typescript
   * const pipeline = Pipeline.create({
   *   llmProvider: createAnthropicProvider({ apiKey }),
   *   availableComponents: ['Button', 'Card', 'Input'],
   * });
   *
   * const result = await pipeline.process(input);
   * ```
   */
  static create(config: PipelineConfig = {}): Pipeline {
    return new Pipeline(config);
  }

  /**
   * Create a Pipeline with persistent state storage
   *
   * @param config - Pipeline configuration
   * @param store - State store implementation
   * @returns Pipeline instance with persistence enabled
   *
   * @example
   * ```typescript
   * const store = new FileStateStore('./state');
   * const pipeline = Pipeline.createWithStore(
   *   { llmProvider: createAnthropicProvider({ apiKey }) },
   *   store
   * );
   *
   * // Extract and save checkpoint
   * await pipeline.extractAndSave(input);
   *
   * // Later: resume from checkpoint
   * const result = await pipeline.generateFromStored('Button');
   * ```
   */
  static createWithStore(
    config: PipelineConfig,
    store: IPipelineStateStore
  ): Pipeline {
    return new Pipeline(config, store);
  }

  // ===========================================================================
  // In-Memory Operations (Delegated to ComponentProcessor)
  // ===========================================================================

  /**
   * Process a component through the full pipeline
   *
   * Runs extraction, generation, and manifest building in sequence.
   * This is the standard in-memory operation.
   *
   * @param input - Processing input
   * @returns Processing result
   */
  async process(input: ProcessorInput): Promise<ProcessorOutput> {
    return this.processor.process(input);
  }

  /**
   * Extract component data without generation
   *
   * Fast operation that analyzes source code to extract props,
   * variants, dependencies, and other metadata.
   *
   * @param input - Processing input
   * @returns Extraction result
   */
  async extract(input: ProcessorInput): Promise<ExtractOutput> {
    return this.processor.extract(input);
  }

  /**
   * Generate metadata from prior extraction result and build manifest
   *
   * Uses LLM to generate semantic descriptions, examples, and
   * usage guidance from extracted component data, then builds
   * the complete manifest.
   *
   * @param input - Generation input with extracted data
   * @returns Processing result with manifest
   */
  async generate(input: GenerateInput): Promise<ProcessorOutput> {
    const startTime = performance.now();

    // Step 1: Run generation
    const genResult = await this.processor.generate(input);

    if (!isGenerateSuccess(genResult)) {
      const totalTimeMs = Math.round(performance.now() - startTime);
      return {
        type: genResult.type,
        error: genResult.error,
        code: 'GENERATION_FAILED',
        metrics: {
          generationTimeMs: genResult.generationTimeMs,
          totalTimeMs,
        },
        retryable: genResult.retryable,
      };
    }

    // Step 2: Build manifest
    const buildResult = this.processor.build({
      orgId: input.orgId,
      identity: input.identity,
      extracted: input.extracted,
      meta: genResult.meta,
      sourceHash: input.sourceHash,
      version: input.version,
    });

    if (isManifestBuildFailure(buildResult)) {
      const totalTimeMs = Math.round(performance.now() - startTime);
      return {
        type: 'failure',
        error: buildResult.error,
        code: 'MANIFEST_BUILD_FAILED',
        metrics: {
          generationTimeMs: genResult.generationTimeMs,
          totalTimeMs,
        },
        retryable: false,
      };
    }

    const totalTimeMs = Math.round(performance.now() - startTime);

    return {
      type: 'success',
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
    };
  }

  /**
   * Build a manifest from extraction and generation data
   *
   * Combines extracted data and generated metadata into a complete
   * component manifest. Does not call LLM.
   *
   * @param input - Manifest builder input
   * @returns Manifest build result
   */
  build(input: ManifestBuilderInput): ManifestBuilderOutput {
    return this.manifestBuilder.build(input);
  }

  // ===========================================================================
  // Persistent Operations (Require Store)
  // ===========================================================================

  /**
   * Extract and save extraction state
   *
   * Performs extraction and persists the result for later use.
   * Useful for splitting long-running pipelines across multiple calls.
   *
   * @param input - Processing input
   * @returns Extraction result
   * @throws Error if store is not configured
   */
  async extractAndSave(input: ProcessorInput): Promise<ExtractOutput> {
    const store = this.requireStore('extractAndSave');

    const result = await this.processor.extract(input);

    if (isExtractSuccess(result)) {
      const storedExtraction: StoredExtraction = {
        componentName: input.name,
        orgId: input.orgId,
        identity: result.identity,
        extracted: result.extracted,
        sourceHash: result.sourceHash,
        extractionTimeMs: result.extractionTimeMs,
        storedAt: new Date().toISOString(),
      };

      await store.saveExtraction(input.name, storedExtraction);
    }

    return result;
  }

  /**
   * Generate metadata from stored extraction
   *
   * Loads prior extraction result from storage and runs generation.
   * Returns full processing result with manifest.
   *
   * @param componentName - Component name to load extraction for
   * @param options - Optional overrides for generation
   * @returns Processing result with manifest
   * @throws Error if store is not configured or extraction not found
   */
  async generateFromStored(
    componentName: string,
    options?: { orgId?: string; version?: string; hints?: string }
  ): Promise<ProcessorOutput> {
    const store = this.requireStore('generateFromStored');

    const storedExtraction = await store.getExtraction(componentName);
    if (!storedExtraction) {
      throw new Error(
        `No stored extraction found for component: ${componentName}`
      );
    }

    const input: GenerateInput = {
      orgId: options?.orgId ?? storedExtraction.orgId,
      identity: storedExtraction.identity,
      extracted: storedExtraction.extracted,
      sourceHash: storedExtraction.sourceHash,
      version: options?.version,
      hints: options?.hints,
      extraction: {
        fallbackTriggered: false,
        fallbackReason: undefined,
        extractionMethod: 'stored',
      },
    };

    // Use generate() which calls processor.generate() + build()
    const result = await this.generate(input);

    // Save generation result if successful
    if (isProcessorSuccess(result)) {
      // Extract generation metadata from result for storage
      // Build AIContext from manifest fields
      const guidance = result.manifest.guidance;
      const examples = result.manifest.examples;

      const storedGeneration: StoredGeneration = {
        componentName,
        meta: {
          name: result.manifest.name,
          description: result.manifest.description,
          ai: {
            semanticDescription:
              result.manifest.semanticDescription ||
              result.manifest.description,
            patterns: guidance?.patterns ?? [],
            examples: examples?.common?.map((e) => e.code) ?? [],
            relatedComponents: guidance?.relatedComponents ?? [],
            whenToUse: guidance?.whenToUse,
            whenNotToUse: guidance?.whenNotToUse,
            a11yNotes: guidance?.accessibility,
          },
        },
        generationTimeMs: result.metrics.generationTimeMs ?? 0,
        provider: 'stored', // Could extract from result if available
        model: 'stored',
        storedAt: new Date().toISOString(),
      };

      await store.saveGeneration(componentName, storedGeneration);

      // Also save the manifest
      const storedManifest: StoredManifest = {
        componentName,
        manifest: result.manifest,
        output: result.output,
        storedAt: new Date().toISOString(),
      };

      await store.saveManifest(componentName, storedManifest);
    }

    return result;
  }

  /**
   * Build manifest from stored extraction and generation
   *
   * Loads prior extraction and generation results and builds a manifest.
   * Does not call LLM - uses previously generated metadata.
   *
   * @param componentName - Component name to load data for
   * @param options - Optional overrides
   * @returns Manifest build result
   * @throws Error if store is not configured or data not found
   */
  async buildFromStored(
    componentName: string,
    options?: { orgId?: string; version?: string }
  ): Promise<ManifestBuilderOutput> {
    const store = this.requireStore('buildFromStored');

    const storedExtraction = await store.getExtraction(componentName);
    if (!storedExtraction) {
      throw new Error(
        `No stored extraction found for component: ${componentName}`
      );
    }

    const storedGeneration = await store.getGeneration(componentName);
    if (!storedGeneration) {
      throw new Error(
        `No stored generation found for component: ${componentName}`
      );
    }

    const input: ManifestBuilderInput = {
      orgId: options?.orgId ?? storedExtraction.orgId,
      identity: storedExtraction.identity,
      extracted: storedExtraction.extracted,
      meta: storedGeneration.meta,
      sourceHash: storedExtraction.sourceHash,
      version: options?.version,
    };

    const result = this.manifestBuilder.build(input);

    // Save manifest if successful
    if (!isManifestBuildFailure(result)) {
      const storedManifest: StoredManifest = {
        componentName,
        manifest: result.manifest,
        output: result.output,
        storedAt: new Date().toISOString(),
      };

      await store.saveManifest(componentName, storedManifest);
    }

    return result;
  }

  /**
   * Process with checkpoints at each phase
   *
   * Runs the full pipeline but saves state after each phase.
   * Enables inspection and resumption of any phase.
   *
   * @param input - Processing input
   * @returns Processing result
   * @throws Error if store is not configured
   */
  async processWithCheckpoints(
    input: ProcessorInput
  ): Promise<ProcessorOutput> {
    // Validate store is configured upfront (before any async operations)
    this.requireStore('processWithCheckpoints');

    // Phase 1: Extract and save
    const extractResult = await this.extractAndSave(input);

    if (!isExtractSuccess(extractResult)) {
      // Return failure wrapped as ProcessorOutput
      return {
        type: extractResult.type,
        error: extractResult.error,
        code: extractResult.code,
        metrics: {},
        retryable: extractResult.retryable,
      };
    }

    // Phase 2: Generate and save (uses stored extraction)
    return this.generateFromStored(input.name, {
      orgId: input.orgId,
      version: input.version,
      hints: input.hints,
    });
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Require store to be configured
   *
   * @param methodName - Method name for error message
   * @returns Store instance
   * @throws Error if store is not configured
   */
  private requireStore(methodName: string): IPipelineStateStore {
    if (!this.store) {
      throw new Error(
        `Pipeline.${methodName}() requires a store. ` +
          `Use Pipeline.createWithStore() to create a pipeline with persistence.`
      );
    }
    return this.store;
  }
}
