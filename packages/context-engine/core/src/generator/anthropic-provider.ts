/**
 * Anthropic Provider
 *
 * LLM provider implementation using the Anthropic Claude API.
 * Handles authentication, request construction, and error handling.
 *
 * Uses tool calling for structured output generation.
 *
 * Configuration is read from environment variables via the config module:
 * - ANTHROPIC_API_KEY: API key (required)
 * - CONTEXT_ENGINE_MODEL: Model identifier
 * - CONTEXT_ENGINE_MAX_TOKENS: Max tokens for completion
 * - CONTEXT_ENGINE_TIMEOUT_MS: Request timeout
 * - ANTHROPIC_BASE_URL: Base URL override
 */

import Anthropic from '@anthropic-ai/sdk';

import { getLLMConfig } from '../config/index.js';
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
  const config = getLLMConfig();
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
 * @example
 * ```typescript
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   // model defaults to DEFAULT_ANTHROPIC_MODEL constant
 * });
 *
 * const result = await provider.generateWithToolCalling<ComponentMetaTool>(
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
    const defaults = getDefaults();
    const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Anthropic API key is required. Provide via config.apiKey or ANTHROPIC_API_KEY environment variable.'
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
        return {
          type: 'failure',
          error: 'Tool calling failed: no tool_use block in response',
          retryable: true,
        };
      }

      if (toolUseBlock.name !== COMPONENT_META_TOOL.name) {
        logger.error('Unexpected tool name', undefined, {
          expected: COMPONENT_META_TOOL.name,
          received: toolUseBlock.name,
        });
        return {
          type: 'failure',
          error: `Tool calling failed: unexpected tool "${toolUseBlock.name}"`,
          retryable: true,
        };
      }

      logger.debug('Anthropic tool calling succeeded', {
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        toolName: toolUseBlock.name,
      });

      return {
        type: 'success',
        data: toolUseBlock.input as T,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors from tool calling, translating to ToolCallResult
   */
  private handleError<T>(error: unknown): ToolCallResult<T> {
    // Handle specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      logger.error('Anthropic API error during tool call', error as Error, {
        status: error.status,
        code: error.error?.type,
      });

      // Rate limit is retryable
      if (error.status === 429) {
        return {
          type: 'failure',
          error: 'Rate limit exceeded',
          retryable: true,
        };
      }

      // Auth errors are not retryable
      if (error.status === 401) {
        return {
          type: 'failure',
          error: 'Authentication failed: invalid API key',
          retryable: false,
        };
      }

      // Service errors are retryable
      if (error.status === 500 || error.status === 503) {
        return {
          type: 'failure',
          error: 'Service unavailable',
          retryable: true,
        };
      }

      return {
        type: 'failure',
        error: `Anthropic API error: ${error.message}`,
        retryable: false,
      };
    }

    // Handle timeout errors - retryable
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      logger.error('Anthropic timeout during tool call', error as Error);
      return {
        type: 'failure',
        error: `Request timed out after ${this.config.timeoutMs}ms`,
        retryable: true,
      };
    }

    // Handle connection errors - retryable
    if (error instanceof Anthropic.APIConnectionError) {
      logger.error(
        'Anthropic connection error during tool call',
        error as Error
      );
      return {
        type: 'failure',
        error: 'Failed to connect to Anthropic API',
        retryable: true,
      };
    }

    // Unknown errors
    logger.error('Unexpected error during tool call', error as Error);
    return {
      type: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      retryable: false,
    };
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
