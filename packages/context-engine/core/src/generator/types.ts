/**
 * Generator Types
 *
 * Types for LLM-based metadata generation. This module provides abstractions
 * for LLM providers and meta generation to enable future multi-provider support.
 */

import type {
  ComponentMeta,
  ExtractedData,
  Framework,
} from '../types/index.js';
import { OutputType } from '../types/output.js';

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
 * Generation output type discriminant
 *
 * Uses shared OutputType for consistency across modules.
 */
export const GenerationOutputType = OutputType;

export type GenerationOutputType =
  (typeof GenerationOutputType)[keyof typeof GenerationOutputType];

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
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({ apiKey: 'sk-...' });
 * const result = await provider.generateWithToolCalling<ComponentMetaTool>(
 *   'Generate metadata for...',
 *   { maxTokens: 2000 }
 * );
 * if (result.type === 'success') {
 *   console.log(result.data);
 * }
 * ```
 */
export interface ILLMProvider {
  /**
   * Generate structured output using tool calling
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the tool call result
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

  /** Optional Figma design URL for additional context */
  figmaUrl?: string;

  /** Optional hints for generation (e.g., design system context) */
  hints?: string;
}

/**
 * Successful generation output
 */
export interface GeneratorSuccess {
  /** Discriminant for type narrowing */
  type: typeof GenerationOutputType.Success;

  /** Generated component metadata */
  meta: ComponentMeta;

  /** Generation timing in milliseconds */
  generationTimeMs: number;

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
 * Failed generation output
 */
export interface GeneratorFailure {
  /** Discriminant for type narrowing */
  type: typeof GenerationOutputType.Failure;

  /** Error message */
  error: string;

  /** Generation timing in milliseconds */
  generationTimeMs: number;

  /** Whether the error is retryable */
  retryable: boolean;
}

/**
 * Generator output union
 */
export type GeneratorOutput = GeneratorSuccess | GeneratorFailure;

/**
 * Meta generator interface
 *
 * Orchestrates the generation of component metadata using an LLM provider.
 * Handles prompt construction, response parsing, and validation.
 */
export interface IMetaGenerator {
  /**
   * Generate metadata for a component
   *
   * @param input - Generation input with extracted data and context
   * @returns Promise resolving to generation output (success or failure)
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

/**
 * Type guard for successful generation output
 */
export function isGeneratorSuccess(
  output: GeneratorOutput
): output is GeneratorSuccess {
  return output.type === GenerationOutputType.Success;
}

/**
 * Type guard for failed generation output
 */
export function isGeneratorFailure(
  output: GeneratorOutput
): output is GeneratorFailure {
  return output.type === GenerationOutputType.Failure;
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
 * Successful tool calling result
 */
export interface ToolCallSuccess<T> {
  type: 'success';
  data: T;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

/**
 * Failed tool calling result
 */
export interface ToolCallFailure {
  type: 'failure';
  error: string;
  retryable: boolean;
}

/**
 * Tool calling result union
 */
export type ToolCallResult<T> = ToolCallSuccess<T> | ToolCallFailure;

/**
 * Type guard for successful tool call
 */
export function isToolCallSuccess<T>(
  result: ToolCallResult<T>
): result is ToolCallSuccess<T> {
  return result.type === 'success';
}

/**
 * Type guard for failed tool call
 */
export function isToolCallFailure<T>(
  result: ToolCallResult<T>
): result is ToolCallFailure {
  return result.type === 'failure';
}
