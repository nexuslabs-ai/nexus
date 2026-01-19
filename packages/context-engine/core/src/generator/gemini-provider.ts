/**
 * Gemini Provider
 *
 * LLM provider implementation using the Google Gemini API.
 * Handles authentication, request construction, and error handling.
 *
 * Configuration is read from environment variables via the config module:
 * - GOOGLE_API_KEY: API key (required)
 * - GEMINI_MODEL: Model identifier (provider-specific, preferred)
 * - CONTEXT_ENGINE_MODEL: Model identifier (generic fallback)
 * - CONTEXT_ENGINE_MAX_TOKENS: Max tokens for completion
 * - CONTEXT_ENGINE_TIMEOUT_MS: Request timeout
 */

import {
  type GenerationConfig,
  type GenerativeModel,
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  GoogleGenerativeAIFetchError,
} from '@google/generative-ai';

import { getGeminiConfig } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

import type {
  GeminiProviderConfig,
  ILLMProvider,
  LLMCompletionOptions,
  LLMCompletionResponse,
  LLMProviderType,
} from './types.js';

const logger = createLogger({ name: 'gemini-provider' });

/**
 * Get default configuration from environment
 */
function getDefaults() {
  const config = getGeminiConfig();
  return {
    model: config.model,
    maxTokens: config.maxTokens,
    timeoutMs: config.timeoutMs,
  };
}

/**
 * Google Gemini provider implementation
 *
 * Implements the ILLMProvider interface for the Google Gemini API.
 * Supports Gemini models and handles authentication via API key.
 *
 * @example
 * ```typescript
 * const provider = new GeminiProvider({
 *   apiKey: process.env.GOOGLE_API_KEY,
 *   model: 'gemini-2.5-flash'
 * });
 *
 * const response = await provider.generateCompletion(
 *   'Generate metadata for a Button component...',
 *   { maxTokens: 2000 }
 * );
 * ```
 */
export class GeminiProvider implements ILLMProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: Required<
    Pick<GeminiProviderConfig, 'model' | 'defaultMaxTokens' | 'timeoutMs'>
  >;

  readonly providerType: LLMProviderType = 'gemini';

  get modelId(): string {
    return this.config.model;
  }

  constructor(config: GeminiProviderConfig = {}) {
    const defaults = getDefaults();
    const apiKey = config.apiKey ?? process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Google API key is required. Provide via config.apiKey or GOOGLE_API_KEY environment variable.'
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);

    this.config = {
      model: config.model ?? defaults.model,
      defaultMaxTokens: config.defaultMaxTokens ?? defaults.maxTokens,
      timeoutMs: config.timeoutMs ?? defaults.timeoutMs,
    };

    this.model = this.client.getGenerativeModel({
      model: this.config.model,
    });

    logger.debug('Gemini provider initialized', {
      model: this.config.model,
      hasApiKey: !!apiKey,
    });
  }

  /**
   * Generate a text completion using Gemini
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

    logger.debug('Starting Gemini completion', {
      model: this.config.model,
      maxTokens,
      promptLength: prompt.length,
      hasSystemPrompt: !!options.systemPrompt,
    });

    try {
      // Build generation config
      const generationConfig: GenerationConfig = {
        maxOutputTokens: maxTokens,
        ...(options.temperature !== undefined && {
          temperature: options.temperature,
        }),
        ...(options.stopSequences && { stopSequences: options.stopSequences }),
      };

      // Create a model instance with system instruction if provided
      const modelWithConfig = options.systemPrompt
        ? this.client.getGenerativeModel({
            model: this.config.model,
            systemInstruction: options.systemPrompt,
            generationConfig,
          })
        : this.client.getGenerativeModel({
            model: this.config.model,
            generationConfig,
          });

      // Generate content with timeout
      //
      // NOTE: This Promise.race timeout does NOT abort the underlying API request.
      // The Google Generative AI SDK does not currently support AbortController/signal.
      // See: https://github.com/googleapis/nodejs-vertexai/issues/143
      // This means the request continues in the background after timeout rejection.
      // Impact is minimal for typical usage - the request will eventually complete.
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Gemini request timed out after ${this.config.timeoutMs}ms`
            )
          );
        }, this.config.timeoutMs);
      });

      const response = await Promise.race([
        modelWithConfig.generateContent(prompt),
        timeoutPromise,
      ]);

      const textContent = response.response.text();

      if (!textContent) {
        throw new Error(
          'Unexpected response format: no text content in response'
        );
      }

      // Extract token usage from usageMetadata
      const usageMetadata = response.response.usageMetadata;

      const result: LLMCompletionResponse = {
        text: textContent,
        usage: usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount ?? 0,
              outputTokens: usageMetadata.candidatesTokenCount ?? 0,
            }
          : undefined,
        model: this.config.model,
        stopReason:
          response.response.candidates?.[0]?.finishReason ?? undefined,
      };

      logger.debug('Gemini completion succeeded', {
        model: this.config.model,
        inputTokens: result.usage?.inputTokens,
        outputTokens: result.usage?.outputTokens,
        stopReason: result.stopReason,
      });

      return result;
    } catch (error) {
      // Handle specific Gemini errors
      if (error instanceof GoogleGenerativeAIFetchError) {
        logger.error('Gemini API fetch error', error as Error, {
          status: error.status,
          statusText: error.statusText,
        });

        // Translate to more specific error messages
        if (error.status === 401 || error.status === 403) {
          throw new Error('Gemini authentication failed: invalid API key');
        }

        if (error.status === 429) {
          throw new Error('Gemini rate limit exceeded: please retry later');
        }

        if (error.status === 500 || error.status === 503) {
          throw new Error('Gemini service unavailable: please retry later');
        }

        throw new Error(`Gemini API error: ${error.message}`);
      }

      if (error instanceof GoogleGenerativeAIError) {
        logger.error('Gemini API error', error as Error);
        throw new Error(`Gemini API error: ${error.message}`);
      }

      // Handle timeout errors (from our Promise.race)
      if (error instanceof Error && error.message.includes('timed out')) {
        logger.error('Gemini timeout error', error as Error);
        throw error;
      }

      // Re-throw unknown errors
      logger.error('Unexpected error during Gemini completion', error as Error);
      throw error;
    }
  }
}

/**
 * Create a Gemini provider with default configuration
 *
 * @param config - Optional configuration overrides
 * @returns Configured GeminiProvider instance
 */
export function createGeminiProvider(
  config?: GeminiProviderConfig
): GeminiProvider {
  return new GeminiProvider(config);
}
