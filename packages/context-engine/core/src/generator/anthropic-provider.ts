/**
 * Anthropic Provider
 *
 * LLM provider implementation using the Anthropic Claude API.
 * Handles authentication, request construction, and error handling.
 */

import Anthropic from '@anthropic-ai/sdk';

import { createLogger } from '../utils/logger.js';

import type {
  AnthropicProviderConfig,
  ILLMProvider,
  LLMCompletionOptions,
  LLMCompletionResponse,
  LLMProviderType,
} from './types.js';

const logger = createLogger({ name: 'anthropic-provider' });

/**
 * Default model for Anthropic completions
 */
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Default max tokens for completions
 */
const DEFAULT_MAX_TOKENS = 2000;

/**
 * Default timeout in milliseconds (2 minutes)
 */
const DEFAULT_TIMEOUT_MS = 120_000;

/**
 * Anthropic Claude provider implementation
 *
 * Implements the ILLMProvider interface for the Anthropic Claude API.
 * Supports all Claude models and handles authentication via API key.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-sonnet-4-20250514'
 * });
 *
 * const response = await provider.generateCompletion(
 *   'Generate metadata for a Button component...',
 *   { maxTokens: 2000 }
 * );
 * ```
 */
export class AnthropicProvider implements ILLMProvider {
  private client: Anthropic;
  private config: Required<
    Pick<AnthropicProviderConfig, 'model' | 'defaultMaxTokens' | 'timeoutMs'>
  >;

  readonly providerType: LLMProviderType = 'anthropic';

  get modelId(): string {
    return this.config.model;
  }

  constructor(config: AnthropicProviderConfig = {}) {
    const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Anthropic API key is required. Provide via config.apiKey or ANTHROPIC_API_KEY environment variable.'
      );
    }

    this.client = new Anthropic({
      apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    this.config = {
      model: config.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
      defaultMaxTokens: config.defaultMaxTokens ?? DEFAULT_MAX_TOKENS,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };

    logger.debug('Anthropic provider initialized', {
      model: this.config.model,
      hasApiKey: !!apiKey,
    });
  }

  /**
   * Generate a text completion using Claude
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the completion response
   * @throws Error if the API call fails
   */
  async generateCompletion(
    prompt: string,
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResponse> {
    const maxTokens = options.maxTokens ?? this.config.defaultMaxTokens;

    logger.debug('Starting Anthropic completion', {
      model: this.config.model,
      maxTokens,
      promptLength: prompt.length,
    });

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...(options.stopSequences && { stop_sequences: options.stopSequences }),
      });

      // Extract text content from response
      const textContent = response.content.find(
        (block) => block.type === 'text'
      );

      if (!textContent || textContent.type !== 'text') {
        throw new Error(
          'Unexpected response format: no text content in response'
        );
      }

      const result: LLMCompletionResponse = {
        text: textContent.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
        stopReason: response.stop_reason ?? undefined,
      };

      logger.debug('Anthropic completion succeeded', {
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        stopReason: response.stop_reason,
      });

      return result;
    } catch (error) {
      // Handle specific Anthropic errors
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API error', error as Error, {
          status: error.status,
          code: error.error?.type,
        });

        // Translate to more specific error messages
        if (error.status === 401) {
          throw new Error('Anthropic authentication failed: invalid API key');
        }

        if (error.status === 429) {
          throw new Error('Anthropic rate limit exceeded: please retry later');
        }

        if (error.status === 500 || error.status === 503) {
          throw new Error('Anthropic service unavailable: please retry later');
        }

        throw new Error(`Anthropic API error: ${error.message}`);
      }

      // Handle timeout errors
      if (error instanceof Anthropic.APIConnectionTimeoutError) {
        logger.error('Anthropic timeout error', error as Error);
        throw new Error(
          `Anthropic request timed out after ${this.config.timeoutMs}ms`
        );
      }

      // Handle connection errors
      if (error instanceof Anthropic.APIConnectionError) {
        logger.error('Anthropic connection error', error as Error);
        throw new Error('Failed to connect to Anthropic API');
      }

      // Re-throw unknown errors
      logger.error(
        'Unexpected error during Anthropic completion',
        error as Error
      );
      throw error;
    }
  }
}

/**
 * Create an Anthropic provider with default configuration
 *
 * @param config - Optional configuration overrides
 * @returns Configured AnthropicProvider instance
 */
export function createAnthropicProvider(
  config?: AnthropicProviderConfig
): AnthropicProvider {
  return new AnthropicProvider(config);
}
