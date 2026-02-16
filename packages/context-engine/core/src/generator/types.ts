/**
 * Generator Types
 *
 * Types for LLM-based metadata generation. This module provides abstractions
 * for LLM providers and meta generation to enable future multi-provider support.
 *
 * Error Handling:
 * All generator methods throw MetaGenerationError on failure instead of returning
 * failure result objects. This simplifies consumer code and follows the pattern
 * established in the extractor module.
 */

import type {
  ComponentMeta,
  ExtractedData,
  Framework,
} from '../types/index.js';

/**
 * LLM provider discriminant for type narrowing
 */
export const LLMProviderType = {
  Anthropic: 'anthropic',
  Gemini: 'gemini',
  OpenAI: 'openai',
  Mock: 'mock',
} as const;

export type LLMProviderType =
  (typeof LLMProviderType)[keyof typeof LLMProviderType];

/**
 * LLM completion options
 */
export interface LLMCompletionOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Temperature for randomness (0-1) */
  temperature?: number;

  /** Stop sequences to end generation */
  stopSequences?: string[];

  /**
   * System prompt for the LLM.
   * Providers that support native system prompts (like Anthropic) will use
   * their native parameter. Others may prepend to the user message.
   */
  systemPrompt?: string;
}

/**
 * LLM completion response
 */
export interface LLMCompletionResponse {
  /** Generated text content */
  text: string;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };

  /** Model used for generation */
  model: string;

  /** Stop reason (if available) */
  stopReason?: string;
}

/**
 * LLM Provider interface
 *
 * Abstraction for LLM providers to enable swapping between Anthropic, Gemini, OpenAI, etc.
 * Implementations should handle authentication, retries, and error translation.
 *
 * All providers MUST implement tool calling - this is the only supported generation method.
 * Text-based parsing has been removed in favor of structured output via tool calling.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({ apiKey: 'sk-...' });
 * const result = await provider.generateWithToolCalling<ComponentMetaTool>(
 *   'Generate metadata for...',
 *   { maxTokens: 2000 }
 * );
 * console.log(result.data); // Throws on error
 * ```
 */
export interface ILLMProvider {
  /**
   * Generate structured output using tool calling
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the tool call result
   * @throws MetaGenerationError on failure
   */
  generateWithToolCalling<T>(
    prompt: string,
    options?: ToolCallingOptions
  ): Promise<ToolCallResult<T>>;

  /**
   * Provider type for logging and debugging
   */
  readonly providerType: LLMProviderType;

  /**
   * Model identifier being used
   */
  readonly modelId: string;
}

/**
 * Input for meta generation
 */
export interface GeneratorInput {
  /** Organization ID for multi-org isolation */
  orgId: string;

  /** Component name */
  name: string;

  /** Target framework */
  framework: Framework;

  /** Extracted data from code analysis */
  extracted: ExtractedData;

  /**
   * Optional hints to guide LLM generation.
   * Provides additional context about the component beyond what's extracted from code.
   */
  hints?: string;
}

/**
 * Generation output (success only - throws on failure)
 */
export interface GeneratorOutput {
  /** Generated component metadata */
  meta: ComponentMeta;

  /** Provider used for generation */
  provider: LLMProviderType;

  /** Model used for generation */
  model: string;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Meta generator interface
 *
 * Orchestrates the generation of component metadata using an LLM provider.
 * Handles prompt construction, response parsing, and validation.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 */
export interface IMetaGenerator {
  /**
   * Generate metadata for a component
   *
   * @param input - Generation input with extracted data and context
   * @returns Promise resolving to generation output
   * @throws MetaGenerationError on failure
   */
  generate(input: GeneratorInput): Promise<GeneratorOutput>;
}

/**
 * LLM provider configuration
 */
export interface LLMProviderConfig {
  /** API key for authentication */
  apiKey?: string;

  /** Model identifier to use */
  model?: string;

  /** Base URL for API calls (for custom endpoints) */
  baseUrl?: string;

  /** Default max tokens for completions */
  defaultMaxTokens?: number;

  /** Default temperature for completions */
  defaultTemperature?: number;

  /** Request timeout in milliseconds */
  timeoutMs?: number;
}

/**
 * Anthropic-specific configuration
 */
export interface AnthropicProviderConfig extends LLMProviderConfig {
  /** Model to use (defaults to DEFAULT_ANTHROPIC_MODEL constant) */
  model?: string;
}

/**
 * Gemini-specific configuration
 */
export interface GeminiProviderConfig extends LLMProviderConfig {
  /** Model to use (defaults to DEFAULT_GEMINI_MODEL constant) */
  model?: string;
}

// =============================================================================
// Tool Calling Types
// =============================================================================

/**
 * Tool calling options for structured output generation
 */
export interface ToolCallingOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;

  /** System prompt for context */
  systemPrompt?: string;
}

/**
 * Tool calling result (success only - throws on failure)
 */
export interface ToolCallResult<T> {
  /** Tool output data */
  data: T;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };

  /** Model used for generation */
  model: string;
}
