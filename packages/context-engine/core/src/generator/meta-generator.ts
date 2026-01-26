/**
 * Meta Generator
 *
 * Orchestrates the generation of component metadata using an LLM provider.
 * Handles prompt construction, response parsing, and validation.
 *
 * ## Architecture
 *
 * This module uses tool calling exclusively for structured output generation.
 * All providers must implement `generateWithToolCalling()`.
 *
 * Flow: ComponentMetaTool Schema -> LLM Tool Calling -> normalizeToolOutputToMeta() -> ComponentMeta
 *
 * Configuration is read from environment variables via the config module:
 * - CONTEXT_ENGINE_GENERATION_MAX_TOKENS: Max tokens for generation
 * - CONTEXT_ENGINE_MIN_SEMANTIC_DESC_LENGTH: Min semantic description length
 * - CONTEXT_ENGINE_MAX_SEMANTIC_DESC_LENGTH: Max semantic description length
 * - CONTEXT_ENGINE_MIN_DESC_LENGTH: Min description length
 * - CONTEXT_ENGINE_MAX_DESC_LENGTH: Max description length
 */

import { getGenerationConfig } from '../config/index.js';
import type {
  AIContext,
  ComponentMeta,
  ExtractedData,
} from '../types/index.js';
import { createProviderFromEnv } from '../utils/env-provider.js';
import { createLogger } from '../utils/logger.js';

import { buildToolCallingPrompt, filterValidPatterns } from './prompts.js';
import {
  type ComponentMetaTool,
  ComponentMetaToolSchema,
} from './tool-schema.js';
import {
  GenerationOutputType,
  type GeneratorFailure,
  type GeneratorInput,
  type GeneratorOutput,
  type GeneratorSuccess,
  type ILLMProvider,
  type IMetaGenerator,
} from './types.js';

const logger = createLogger({ name: 'meta-generator' });

// =============================================================================
// Configuration
// =============================================================================

/**
 * Get generation configuration from environment
 */
function getConfig() {
  return getGenerationConfig();
}

// =============================================================================
// Response Validation & Normalization
// =============================================================================

/**
 * Validate and normalize a string field
 */
function normalizeString(
  value: unknown,
  defaultValue: string,
  minLength?: number,
  maxLength?: number
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return defaultValue;
  }

  let result = value.trim();

  if (minLength !== undefined && result.length < minLength) {
    return defaultValue;
  }

  if (maxLength !== undefined && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/**
 * Validate and normalize an array field
 */
function normalizeArray(value: unknown, defaultValue: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return defaultValue;
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Build default semantic description from component name and extracted data
 */
function buildDefaultSemanticDescription(
  name: string,
  extracted: ExtractedData
): string {
  const variantNames = Object.keys(extracted.variants);

  return [
    `A ${name} component for React applications.`,
    extracted.acceptsChildren && 'Accepts children for content composition.',
    extracted.baseLibrary &&
      `Built on ${extracted.baseLibrary.name} primitives for accessibility.`,
    variantNames.length > 0 && `Supports ${variantNames.join(', ')} variants.`,
  ]
    .filter(Boolean)
    .join(' ');
}

// =============================================================================
// Tool Calling Response Conversion
// =============================================================================

/**
 * Extract examples from ComponentMetaTool structured format
 *
 * Collects unique code examples from minimalExample, examples.minimal,
 * examples.common, and examples.advanced fields.
 */
function extractExamplesFromToolOutput(tool: ComponentMetaTool): string[] {
  const examples: string[] = [];

  // Add minimal example first
  examples.push(tool.minimalExample);

  // Add examples from structured format
  if (
    tool.examples.minimal?.code &&
    !examples.includes(tool.examples.minimal.code)
  ) {
    examples.push(tool.examples.minimal.code);
  }
  if (tool.examples.common) {
    tool.examples.common.forEach((ex) => {
      if (ex.code && !examples.includes(ex.code)) {
        examples.push(ex.code);
      }
    });
  }
  if (tool.examples.advanced) {
    tool.examples.advanced.forEach((ex) => {
      if (ex.code && !examples.includes(ex.code)) {
        examples.push(ex.code);
      }
    });
  }

  return examples;
}

/**
 * Normalize tool calling output directly to ComponentMeta
 *
 * Transforms structured tool output to ComponentMeta.
 *
 * @param tool - Validated tool calling output
 * @param name - Component name
 * @param extracted - Extracted component data
 * @returns Normalized ComponentMeta
 */
function normalizeToolOutputToMeta(
  tool: ComponentMetaTool,
  name: string,
  extracted: ExtractedData
): ComponentMeta {
  const config = getConfig();
  const defaultSemanticDescription = buildDefaultSemanticDescription(
    name,
    extracted
  );

  // Get semantic description with fallback
  let semanticDescription = normalizeString(
    tool.semanticDescription,
    defaultSemanticDescription,
    config.minSemanticDescriptionLength,
    config.maxSemanticDescriptionLength
  );

  // If still too short, use the fallback
  if (semanticDescription.length < config.minSemanticDescriptionLength) {
    semanticDescription = defaultSemanticDescription;
  }

  // Normalize patterns to only include valid ones
  const patterns = filterValidPatterns(tool.guidance.patterns);

  // Build AIContext directly from tool output
  const ai: AIContext = {
    semanticDescription,
    whenToUse: tool.guidance.whenToUse,
    whenNotToUse: tool.guidance.whenNotToUse,
    patterns,
    tokens: normalizeArray(tool.tokens),
    examples: extractExamplesFromToolOutput(tool),
    relatedComponents: normalizeArray(tool.guidance.relatedComponents),
    a11yNotes: tool.guidance.accessibility,
    baseLibrary: extracted.baseLibrary,
  };

  // Build description with validation
  const description = normalizeString(
    tool.description,
    `A ${name} component`,
    config.minDescriptionLength,
    config.maxDescriptionLength
  );

  return {
    name,
    description,
    tier: tool.tier,
    ai,
    variants: extracted.variants,
    defaults: extracted.defaultVariants,
  };
}

/**
 * Validate tool calling output against the schema
 *
 * Even with tool calling, we validate the output as a safety layer.
 */
function validateToolOutput(data: unknown): ComponentMetaTool | null {
  const result = ComponentMetaToolSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  // Zod 4 uses 'issues' instead of 'errors'
  const issues =
    'issues' in result.error
      ? (result.error.issues as Array<{
          path: (string | number)[];
          message: string;
        }>)
      : [];

  logger.warn('Tool output validation failed', {
    errors: issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  });

  return null;
}

// =============================================================================
// MetaGenerator Class
// =============================================================================

/**
 * Configuration options for MetaGenerator
 */
export interface MetaGeneratorConfig {
  /** LLM provider to use (defaults to Anthropic) */
  provider?: ILLMProvider;

  /** Max tokens for generation */
  maxTokens?: number;
}

/**
 * Meta generator that uses LLM to generate semantic metadata
 *
 * Implements the IMetaGenerator interface. Uses dependency injection for the
 * LLM provider, enabling easy testing and provider swapping.
 *
 * @example
 * ```typescript
 * // With default Anthropic provider
 * const generator = new MetaGenerator();
 *
 * // With custom provider
 * const mockProvider = createMockProvider();
 * const generator = new MetaGenerator({ provider: mockProvider });
 *
 * // Generate metadata
 * const output = await generator.generate({
 *   orgId: 'org-123',
 *   name: 'Button',
 *   framework: 'react',
 *   extracted: extractedData,
 * });
 *
 * if (output.type === 'success') {
 *   console.log(output.meta);
 * }
 * ```
 */
export class MetaGenerator implements IMetaGenerator {
  private provider: ILLMProvider;
  private maxTokens: number;

  /**
   * Create a new MetaGenerator instance
   *
   * @param config - Configuration options
   */
  constructor(config: MetaGeneratorConfig = {}) {
    const envConfig = getConfig();
    this.provider = config.provider ?? createProviderFromEnv();
    this.maxTokens = config.maxTokens ?? envConfig.maxTokens;

    logger.debug('MetaGenerator initialized', {
      provider: this.provider.providerType,
      model: this.provider.modelId,
      maxTokens: this.maxTokens,
    });
  }

  /**
   * Generate metadata for a component
   *
   * Uses tool calling for structured output generation.
   * When Storybook examples are available, skips example generation in the prompt.
   *
   * @param input - Generation input with extracted data and context
   * @returns Promise resolving to generation output (success or failure)
   */
  async generate({
    orgId,
    name,
    framework,
    extracted,
    figmaUrl,
    hints,
  }: GeneratorInput): Promise<GeneratorOutput> {
    const startTime = performance.now();

    // Detect if Storybook examples are available
    const hasStorybookExamples = (extracted.stories?.length ?? 0) > 0;

    logger.info('Starting meta generation', {
      orgId,
      name,
      framework,
      propsCount: extracted.props.length,
      variantsCount: Object.keys(extracted.variants).length,
      hasStorybookExamples,
    });

    try {
      // Build prompt for tool calling
      // Skip example generation if Storybook examples are available
      const { system, user } = buildToolCallingPrompt({
        name,
        framework,
        extracted,
        figmaUrl,
        hints,
        skipExamples: hasStorybookExamples,
      });

      // Call provider with tool calling
      const result =
        await this.provider.generateWithToolCalling<ComponentMetaTool>(user, {
          maxTokens: this.maxTokens,
          systemPrompt: system,
        });

      if (result.type === 'failure') {
        const generationTimeMs = Math.round(performance.now() - startTime);

        logger.error('Tool calling failed', undefined, {
          name,
          error: result.error,
          retryable: result.retryable,
          generationTimeMs,
        });

        const failure: GeneratorFailure = {
          type: GenerationOutputType.Failure,
          error: result.error,
          generationTimeMs,
          retryable: result.retryable,
        };

        return failure;
      }

      // Validate the tool output (safety layer)
      const validatedTool = validateToolOutput(result.data);
      if (!validatedTool) {
        const generationTimeMs = Math.round(performance.now() - startTime);

        logger.error('Tool output validation failed', undefined, {
          name,
          generationTimeMs,
        });

        const failure: GeneratorFailure = {
          type: GenerationOutputType.Failure,
          error: 'Tool output validation failed',
          generationTimeMs,
          retryable: false,
        };

        return failure;
      }

      // Normalize tool output directly to ComponentMeta
      const meta = normalizeToolOutputToMeta(validatedTool, name, extracted);

      const generationTimeMs = Math.round(performance.now() - startTime);

      logger.info('Meta generation completed', {
        name,
        generationTimeMs,
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        patternsCount: meta.ai.patterns.length,
        examplesCount: meta.ai.examples.length,
      });

      const success: GeneratorSuccess = {
        type: GenerationOutputType.Success,
        meta,
        generationTimeMs,
        provider: this.provider.providerType,
        model: this.provider.modelId,
        usage: result.usage,
      };

      return success;
    } catch (error) {
      const generationTimeMs = Math.round(performance.now() - startTime);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Meta generation failed', error as Error, {
        name,
        generationTimeMs,
      });

      // Determine if error is retryable
      const retryable = this.isRetryableError(error);

      const failure: GeneratorFailure = {
        type: GenerationOutputType.Failure,
        error: errorMessage,
        generationTimeMs,
        retryable,
      };

      return failure;
    }
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();

    // Rate limit errors are retryable
    if (message.includes('rate limit')) {
      return true;
    }

    // Service unavailable is retryable
    if (
      message.includes('service unavailable') ||
      message.includes('timeout')
    ) {
      return true;
    }

    // Connection errors are retryable
    if (message.includes('connection') || message.includes('network')) {
      return true;
    }

    // JSON parsing errors are not retryable
    if (message.includes('json')) {
      return false;
    }

    return false;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a MetaGenerator with default configuration
 *
 * @param config - Optional configuration overrides
 * @returns Configured MetaGenerator instance
 */
export function createMetaGenerator(
  config?: MetaGeneratorConfig
): MetaGenerator {
  return new MetaGenerator(config);
}
