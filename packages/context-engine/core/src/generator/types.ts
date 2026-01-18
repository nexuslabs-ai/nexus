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
 * Abstraction for LLM providers to enable swapping between Anthropic, OpenAI, etc.
 * Implementations should handle authentication, retries, and error translation.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({ apiKey: 'sk-...' });
 * const response = await provider.generateCompletion('Generate metadata for...');
 * console.log(response.text);
 * ```
 */
export interface ILLMProvider {
  /**
   * Generate a text completion from a prompt
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the completion response
   * @throws Error if the API call fails
   */
  generateCompletion(
    prompt: string,
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResponse>;

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
  /** Model to use (defaults to claude-sonnet-4-20250514) */
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

/**
 * Parsed LLM response for component meta
 *
 * This is the raw structure expected from LLM responses before normalization.
 * Fields may be missing or have slightly different names.
 */
export interface ParsedLLMMetaResponse {
  /** Component description (1-2 sentences) */
  description?: string;

  /** Rich semantic description for embeddings */
  semanticDescription?: string;

  /** Tier classification */
  tier?: 'free' | 'pro';

  /** When to use guidance */
  whenToUse?: string;

  /** When not to use guidance */
  whenNotToUse?: string;

  /** Component patterns */
  patterns?: string[];

  /** Design tokens used */
  tokens?: string[];

  /** Usage examples (JSX strings) */
  examples?: string[];

  /** Related component names */
  relatedComponents?: string[];

  /** Accessibility notes */
  a11yNotes?: string;
}
