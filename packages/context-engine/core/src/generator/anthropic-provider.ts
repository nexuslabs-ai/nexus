/**
 * Anthropic Provider
 *
 * LLM provider implementation using the Anthropic Claude API.
 * Handles authentication, request construction, and error handling.
 *
 * Uses tool calling for structured output generation.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * Configuration is read from environment variables via the config module:
 * - LLM_API_KEY: API key (required, provider-agnostic)
 * - CONTEXT_ENGINE_MODEL: Model identifier
 * - CONTEXT_ENGINE_MAX_TOKENS: Max tokens for completion
 * - CONTEXT_ENGINE_TIMEOUT_MS: Request timeout
 * - ANTHROPIC_BASE_URL: Base URL override
 */

import Anthropic from '@anthropic-ai/sdk';

import { getAnthropicConfig } from '../config/index.js';
import { MetaGenerationError } from '../types/errors.js';
import { createLogger } from '../utils/logger.js';

import { COMPONENT_META_TOOL, type ComponentMetaTool } from './tool-schema.js';
import type {
  AnthropicProviderConfig,
  ILLMProvider,
  LLMProviderType,
  ToolCallingOptions,
  ToolCallResult,
} from './types.js';

const logger = createLogger({ name: 'anthropic-provider' });

/**
 * Get default configuration from environment
 */
function getDefaults() {
  const config = getAnthropicConfig();
  return {
    model: config.model,
    maxTokens: config.maxTokens,
    timeoutMs: config.timeoutMs,
    baseUrl: config.baseUrl,
  };
}

/**
 * Anthropic Claude provider implementation
 *
 * Implements the ILLMProvider interface for the Anthropic Claude API.
 * Supports all Claude models and handles authentication via API key.
 * Uses tool calling for structured output generation.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.LLM_API_KEY,
 *   // model defaults to DEFAULT_ANTHROPIC_MODEL constant
 * });
 *
 * // Throws MetaGenerationError on failure
 * const result = await provider.generateWithToolCalling<ComponentMetaTool>(
 *   'Generate metadata for a Button component...',
 *   { maxTokens: 2000 }
 * );
 * console.log(result.data);
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
    const defaults = getDefaults();
    const apiKey = config.apiKey ?? process.env.LLM_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Anthropic API key is required. Provide via config.apiKey or LLM_API_KEY environment variable.'
      );
    }

    const timeoutMs = config.timeoutMs ?? defaults.timeoutMs;

    this.client = new Anthropic({
      apiKey,
      baseURL: config.baseUrl ?? defaults.baseUrl,
      timeout: timeoutMs,
    });

    this.config = {
      model: config.model ?? defaults.model,
      defaultMaxTokens: config.defaultMaxTokens ?? defaults.maxTokens,
      timeoutMs,
    };

    logger.debug('Anthropic provider initialized', {
      model: this.config.model,
      hasApiKey: !!apiKey,
    });
  }

  /**
   * Generate structured output using tool calling
   *
   * Uses Anthropic's tool calling feature to guarantee structured JSON output.
   * The tool_choice is set to force the model to use the specific tool.
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the tool call result
   * @throws MetaGenerationError on failure
   */
  async generateWithToolCalling<T = ComponentMetaTool>(
    prompt: string,
    options: ToolCallingOptions = {}
  ): Promise<ToolCallResult<T>> {
    const maxTokens = options.maxTokens ?? this.config.defaultMaxTokens;

    logger.debug('Starting Anthropic tool calling', {
      model: this.config.model,
      maxTokens,
      promptLength: prompt.length,
      toolName: COMPONENT_META_TOOL.name,
    });

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: maxTokens,
        ...(options.systemPrompt && { system: options.systemPrompt }),
        tools: [COMPONENT_META_TOOL as Anthropic.Tool],
        tool_choice: {
          type: 'tool',
          name: COMPONENT_META_TOOL.name,
        },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract tool use block from response
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (!toolUseBlock) {
        logger.error('No tool_use block in response', undefined, {
          contentTypes: response.content.map((b) => b.type),
        });
        throw new MetaGenerationError(
          'Tool calling failed: no tool_use block in response',
          { provider: 'anthropic', model: this.config.model }
        );
      }

      if (toolUseBlock.name !== COMPONENT_META_TOOL.name) {
        logger.error('Unexpected tool name', undefined, {
          expected: COMPONENT_META_TOOL.name,
          received: toolUseBlock.name,
        });
        throw new MetaGenerationError(
          `Tool calling failed: unexpected tool "${toolUseBlock.name}"`,
          { provider: 'anthropic', model: this.config.model }
        );
      }

      logger.debug('Anthropic tool calling succeeded', {
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        toolName: toolUseBlock.name,
      });

      return {
        data: toolUseBlock.input as T,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      // Re-throw MetaGenerationError as-is
      if (error instanceof MetaGenerationError) {
        throw error;
      }

      // Handle specific Anthropic errors
      if (error instanceof Anthropic.APIError) {
        logger.error('Anthropic API error during tool call', error as Error, {
          status: error.status,
          code: error.error?.type,
        });

        if (error.status === 429) {
          throw new MetaGenerationError('Rate limit exceeded', {
            provider: 'anthropic',
            status: error.status,
          });
        }

        if (error.status === 401) {
          throw new MetaGenerationError(
            'Authentication failed: invalid API key',
            { provider: 'anthropic', status: error.status }
          );
        }

        if (error.status === 500 || error.status === 503) {
          throw new MetaGenerationError('Service unavailable', {
            provider: 'anthropic',
            status: error.status,
          });
        }

        throw new MetaGenerationError(`Anthropic API error: ${error.message}`, {
          provider: 'anthropic',
          status: error.status,
        });
      }

      // Handle timeout errors
      if (error instanceof Anthropic.APIConnectionTimeoutError) {
        logger.error('Anthropic timeout during tool call', error as Error);
        throw new MetaGenerationError(
          `Request timed out after ${this.config.timeoutMs}ms`,
          { provider: 'anthropic', timeoutMs: this.config.timeoutMs }
        );
      }

      // Handle connection errors
      if (error instanceof Anthropic.APIConnectionError) {
        logger.error(
          'Anthropic connection error during tool call',
          error as Error
        );
        throw new MetaGenerationError('Failed to connect to Anthropic API', {
          provider: 'anthropic',
        });
      }

      // Unknown errors
      logger.error('Unexpected error during tool call', error as Error);
      throw new MetaGenerationError(
        error instanceof Error ? error.message : 'Unknown error',
        { provider: 'anthropic' }
      );
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
