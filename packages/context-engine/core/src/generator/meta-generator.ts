/**
 * Meta Generator
 *
 * Orchestrates the generation of component metadata using an LLM provider.
 * Handles prompt construction, response parsing, and validation.
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
  Tier,
} from '../types/index.js';
import { createLogger } from '../utils/logger.js';

import { AnthropicProvider } from './anthropic-provider.js';
import { buildPrompt, filterValidPatterns } from './prompts.js';
import {
  GenerationOutputType,
  type GeneratorFailure,
  type GeneratorInput,
  type GeneratorOutput,
  type GeneratorSuccess,
  type ILLMProvider,
  type IMetaGenerator,
  type ParsedLLMMetaResponse,
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
// Response Parsing
// =============================================================================

/**
 * Extract JSON from LLM response text
 *
 * Handles responses that may be wrapped in markdown code blocks.
 *
 * @param text - Raw LLM response text
 * @returns Extracted JSON string
 * @throws Error if no JSON found
 */
function extractJsonFromResponse(text: string): string {
  // Try to extract from markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch?.[0]) {
    return jsonMatch[0].trim();
  }

  throw new Error('Could not extract JSON from LLM response');
}

/**
 * Parse LLM response into structured data
 *
 * @param text - Raw LLM response text
 * @returns Parsed response object
 * @throws Error if parsing fails
 */
function parseLLMResponse(text: string): ParsedLLMMetaResponse {
  const jsonStr = extractJsonFromResponse(text);

  try {
    const parsed = JSON.parse(jsonStr) as unknown;

    // Basic object validation only - normalize functions handle bad values with defaults
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Response is not a valid object');
    }

    return parsed as ParsedLLMMetaResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in LLM response: ${error.message}`);
    }
    throw error;
  }
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
 * Validate and normalize tier field
 */
function normalizeTier(value: unknown): Tier {
  if (value === 'pro') {
    return 'pro';
  }
  return 'free';
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

/**
 * Normalize parsed LLM response into AIContext
 */
function normalizeToAIContext(
  parsed: ParsedLLMMetaResponse,
  name: string,
  extracted: ExtractedData
): AIContext {
  const config = getConfig();
  const defaultSemanticDescription = buildDefaultSemanticDescription(
    name,
    extracted
  );

  // Get semantic description with fallback
  let semanticDescription = normalizeString(
    parsed.semanticDescription,
    defaultSemanticDescription,
    config.minSemanticDescriptionLength,
    config.maxSemanticDescriptionLength
  );

  // If still too short, use the fallback
  if (semanticDescription.length < config.minSemanticDescriptionLength) {
    semanticDescription = defaultSemanticDescription;
  }

  // Normalize patterns to only include valid ones
  const rawPatterns = normalizeArray(parsed.patterns);
  const patterns = filterValidPatterns(rawPatterns);

  return {
    semanticDescription,
    whenToUse: parsed.whenToUse,
    whenNotToUse: parsed.whenNotToUse,
    patterns,
    tokens: normalizeArray(parsed.tokens),
    examples: normalizeArray(parsed.examples),
    relatedComponents: normalizeArray(parsed.relatedComponents),
    a11yNotes: parsed.a11yNotes,
    baseLibrary: extracted.baseLibrary,
  };
}

/**
 * Normalize parsed LLM response into ComponentMeta
 */
function normalizeToComponentMeta(
  parsed: ParsedLLMMetaResponse,
  name: string,
  extracted: ExtractedData
): ComponentMeta {
  const config = getConfig();
  const description = normalizeString(
    parsed.description,
    `A ${name} component`,
    config.minDescriptionLength,
    config.maxDescriptionLength
  );

  const tier = normalizeTier(parsed.tier);
  const ai = normalizeToAIContext(parsed, name, extracted);

  return {
    name,
    description,
    tier,
    ai,
    variants: extracted.variants,
    defaults: extracted.defaultVariants,
  };
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
    this.provider = config.provider ?? new AnthropicProvider();
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
   * @param input - Generation input with extracted data and context
   * @returns Promise resolving to generation output (success or failure)
   */
  async generate(input: GeneratorInput): Promise<GeneratorOutput> {
    const startTime = performance.now();

    const { orgId, name, framework, extracted, figmaUrl, hints } = input;

    logger.info('Starting meta generation', {
      orgId,
      name,
      framework,
      propsCount: extracted.props.length,
      variantsCount: Object.keys(extracted.variants).length,
    });

    try {
      // Build prompt
      const { system, user } = buildPrompt({
        name,
        framework,
        extracted,
        figmaUrl,
        hints,
      });

      // Call LLM provider with separate system prompt
      const response = await this.provider.generateCompletion(user, {
        maxTokens: this.maxTokens,
        systemPrompt: system,
      });

      // Parse and validate response
      const parsed = parseLLMResponse(response.text);
      const meta = normalizeToComponentMeta(parsed, name, extracted);

      const generationTimeMs = Math.round(performance.now() - startTime);

      logger.info('Meta generation completed', {
        name,
        generationTimeMs,
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
        patternsCount: meta.ai.patterns.length,
        examplesCount: meta.ai.examples.length,
      });

      const success: GeneratorSuccess = {
        type: GenerationOutputType.Success,
        meta,
        generationTimeMs,
        provider: this.provider.providerType,
        model: this.provider.modelId,
        usage: response.usage,
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
