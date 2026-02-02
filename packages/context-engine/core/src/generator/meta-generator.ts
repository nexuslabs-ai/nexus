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
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * Configuration is read from environment variables via the config module:
 * - CONTEXT_ENGINE_GENERATION_MAX_TOKENS: Max tokens for generation
 * - CONTEXT_ENGINE_MIN_SEMANTIC_DESC_LENGTH: Min semantic description length
 * - CONTEXT_ENGINE_MAX_SEMANTIC_DESC_LENGTH: Max semantic description length
 * - CONTEXT_ENGINE_MIN_DESC_LENGTH: Min description length
 * - CONTEXT_ENGINE_MAX_DESC_LENGTH: Max description length
 */

import { getGenerationConfig } from '../config/index.js';
import { MetaGenerationError } from '../types/errors.js';
import type {
  AIContext,
  ComponentMeta,
  ExtractedData,
  StructuredExamples,
} from '../types/index.js';
import { createProviderFromEnv } from '../utils/env-provider.js';
import { createLogger } from '../utils/logger.js';

import { buildToolCallingPrompt, filterValidPatterns } from './prompts.js';
import {
  type ComponentMetaTool,
  ComponentMetaToolSchema,
} from './tool-schema.js';
import type {
  GeneratorInput,
  GeneratorOutput,
  ILLMProvider,
  IMetaGenerator,
} from './types.js';

const logger = createLogger({ name: 'meta-generator' });

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
 * Convert LLM tool examples to StructuredExamples format
 *
 * Preserves the structured format from the LLM (minimal, common, advanced)
 * instead of flattening to a string array.
 *
 * Returns undefined if examples are not provided (when Storybook examples
 * are available, the LLM skips example generation).
 */
function convertToolExamples(
  tool: ComponentMetaTool
): StructuredExamples | undefined {
  if (!tool.examples) {
    return undefined;
  }

  return {
    minimal: {
      title: tool.examples.minimal.title,
      code: tool.examples.minimal.code,
      description: tool.examples.minimal.description,
    },
    common: tool.examples.common.map((ex) => ({
      title: ex.title,
      code: ex.code,
      description: ex.description,
    })),
    advanced: tool.examples.advanced?.map((ex) => ({
      title: ex.title,
      code: ex.code,
      description: ex.description,
    })),
  };
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
  const config = getGenerationConfig();
  const defaultSemanticDescription = buildDefaultSemanticDescription(
    name,
    extracted
  );

  // Get semantic description with fallback (tool.description is now the semantic description)
  // normalizeString already returns defaultSemanticDescription if input is too short
  const semanticDescription = normalizeString(
    tool.description,
    defaultSemanticDescription,
    config.minSemanticDescriptionLength,
    config.maxSemanticDescriptionLength
  );

  // Normalize patterns to only include valid ones
  const patterns = filterValidPatterns(tool.guidance.patterns);

  // Build AIContext directly from tool output
  const ai: AIContext = {
    semanticDescription,
    whenToUse: tool.guidance.whenToUse,
    whenNotToUse: tool.guidance.whenNotToUse,
    patterns,
    examples: convertToolExamples(tool),
    relatedComponents: normalizeArray(tool.guidance.relatedComponents),
    a11yNotes: tool.guidance.accessibility,
    variantDescriptions: tool.variantDescriptions,
    subComponentVariantDescriptions: tool.subComponentVariantDescriptions,
  };

  // Build short description from the first sentence of semanticDescription
  const shortDescription = semanticDescription.split('.')[0] + '.';
  const description = normalizeString(
    shortDescription,
    `A ${name} component`,
    config.minDescriptionLength,
    config.maxDescriptionLength
  );

  return {
    name,
    description,
    ai,
  };
}

/**
 * Validate tool calling output against the schema
 *
 * Even with tool calling, we validate the output as a safety layer.
 * Provider-specific quirks (like Gemini's stringified nested objects)
 * are handled by the providers themselves before returning.
 *
 * @throws MetaGenerationError if validation fails
 */
function validateToolOutput(data: unknown): ComponentMetaTool {
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

  const errorDetails = issues.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));

  logger.warn('Tool output validation failed', { errors: errorDetails });

  throw new MetaGenerationError('Tool output validation failed', {
    validationErrors: errorDetails,
  });
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
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
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
 * // Generate metadata (throws on error)
 * try {
 *   const output = await generator.generate({
 *     orgId: 'org-123',
 *     name: 'Button',
 *     framework: 'react',
 *     extracted: extractedData,
 *   });
 *   console.log(output.meta);
 * } catch (error) {
 *   if (error instanceof MetaGenerationError) {
 *     console.error('Generation failed:', error.message);
 *   }
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
    const envConfig = getGenerationConfig();
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
   * @returns Promise resolving to generation output
   * @throws MetaGenerationError on failure
   */
  async generate({
    orgId,
    name,
    framework,
    extracted,
    hints,
  }: GeneratorInput): Promise<GeneratorOutput> {
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

    // Build prompt for tool calling
    // Skip example generation if Storybook examples are available
    const { system, user } = buildToolCallingPrompt({
      name,
      framework,
      extracted,
      skipExamples: hasStorybookExamples,
      hints,
    });

    // Call provider with tool calling (throws on error)
    const result =
      await this.provider.generateWithToolCalling<ComponentMetaTool>(user, {
        maxTokens: this.maxTokens,
        systemPrompt: system,
      });

    // Validate the tool output (throws on validation failure)
    const validatedTool = validateToolOutput(result.data);

    // Normalize tool output directly to ComponentMeta
    const meta = normalizeToolOutputToMeta(validatedTool, name, extracted);

    logger.info('Meta generation completed', {
      name,
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      patternsCount: meta.ai.patterns.length,
      hasExamples: !!meta.ai.examples,
    });

    return {
      meta,
      provider: this.provider.providerType,
      model: this.provider.modelId,
      usage: result.usage,
    };
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
