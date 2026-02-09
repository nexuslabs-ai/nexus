/**
 * Gemini Provider
 *
 * LLM provider implementation using the Google GenAI SDK (@google/genai).
 * Handles authentication, request construction, and error handling.
 *
 * Uses tool calling (function calling) for structured output generation.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * Configuration is read from environment variables via the config module:
 * - LLM_API_KEY: API key (required, provider-agnostic)
 * - GEMINI_MODEL: Model identifier (provider-specific, preferred)
 * - CONTEXT_ENGINE_MODEL: Model identifier (generic fallback)
 * - CONTEXT_ENGINE_MAX_TOKENS: Max tokens for completion
 * - CONTEXT_ENGINE_TIMEOUT_MS: Request timeout
 */

import { FunctionCallingConfigMode, GoogleGenAI, Type } from '@google/genai';

import { getGeminiConfig } from '../config/index.js';
import { MetaGenerationError } from '../types/errors.js';
import { createLogger } from '../utils/logger.js';

import {
  COMPONENT_META_TOOL,
  COMPONENT_META_TOOL_JSON_SCHEMA,
} from './tool-schema.js';
import type {
  GeminiProviderConfig,
  ILLMProvider,
  LLMProviderType,
  ToolCallingOptions,
  ToolCallResult,
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
 * Convert JSON Schema to Gemini function declaration schema format
 *
 * Gemini's function calling uses a specific schema format that differs from
 * standard JSON Schema. This function converts our JSON Schema to Gemini's format.
 */
function convertToGeminiSchema(
  jsonSchema: Record<string, unknown>
): Record<string, unknown> {
  // Note: We use 'any' here because we're bridging between JSON Schema (our source)
  // and Gemini's proprietary schema format. The types are inherently incompatible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definitions = (jsonSchema as any).definitions ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function resolveRef(schema: any): any {
    if (schema.$ref) {
      const refName = schema.$ref.replace('#/definitions/', '');
      return resolveRef(definitions[refName] ?? {});
    }
    return schema;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function convertSchema(schema: any): any {
    const resolved = resolveRef(schema);

    if (resolved.type === 'object' && resolved.properties) {
      const properties: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(resolved.properties)) {
        properties[key] = convertSchema(value);
      }
      return {
        type: Type.OBJECT,
        properties,
        required: resolved.required ?? [],
        description: resolved.description,
      };
    }

    if (resolved.type === 'array' && resolved.items) {
      return {
        type: Type.ARRAY,
        items: convertSchema(resolved.items),
        description: resolved.description,
      };
    }

    if (resolved.type === 'string') {
      const result: Record<string, unknown> = {
        type: Type.STRING,
        description: resolved.description,
      };
      if (resolved.enum) {
        result.enum = resolved.enum;
      }
      return result;
    }

    if (resolved.type === 'number' || resolved.type === 'integer') {
      return {
        type: Type.NUMBER,
        description: resolved.description,
      };
    }

    if (resolved.type === 'boolean') {
      return {
        type: Type.BOOLEAN,
        description: resolved.description,
      };
    }

    // Fallback
    return {
      type: Type.STRING,
      description: resolved.description,
    };
  }

  return convertSchema(jsonSchema);
}

/**
 * Google Gemini provider implementation
 *
 * Implements the ILLMProvider interface for the Google Gemini API.
 * Supports Gemini models and handles authentication via API key.
 * Uses tool calling (function calling) for structured output.
 *
 * Error Handling:
 * Throws MetaGenerationError on failure instead of returning failure objects.
 *
 * @example
 * ```typescript
 * const provider = new GeminiProvider({
 *   apiKey: process.env.LLM_API_KEY,
 *   // model defaults to DEFAULT_GEMINI_MODEL constant
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
export class GeminiProvider implements ILLMProvider {
  private client: GoogleGenAI;
  private config: Required<
    Pick<GeminiProviderConfig, 'model' | 'defaultMaxTokens' | 'timeoutMs'>
  >;

  readonly providerType: LLMProviderType = 'gemini';

  get modelId(): string {
    return this.config.model;
  }

  constructor(config: GeminiProviderConfig = {}) {
    const defaults = getDefaults();
    const apiKey = config.apiKey ?? process.env.LLM_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Gemini API key is required. Provide via config.apiKey or LLM_API_KEY environment variable.'
      );
    }

    this.client = new GoogleGenAI({ apiKey });

    this.config = {
      model: config.model ?? defaults.model,
      defaultMaxTokens: config.defaultMaxTokens ?? defaults.maxTokens,
      timeoutMs: config.timeoutMs ?? defaults.timeoutMs,
    };

    logger.debug('Gemini provider initialized', {
      model: this.config.model,
      hasApiKey: !!apiKey,
    });
  }

  /**
   * Generate structured output using tool calling (function calling)
   *
   * Uses Gemini's function calling feature to guarantee structured JSON output.
   * The tool_config is set to force the model to use the specific function.
   *
   * @param prompt - The input prompt for generation
   * @param options - Optional generation parameters
   * @returns Promise resolving to the tool call result
   * @throws MetaGenerationError on failure
   */
  async generateWithToolCalling<T>(
    prompt: string,
    options: ToolCallingOptions = {}
  ): Promise<ToolCallResult<T>> {
    const maxTokens = options.maxTokens ?? this.config.defaultMaxTokens;

    logger.debug('Starting Gemini tool calling', {
      model: this.config.model,
      maxTokens,
      promptLength: prompt.length,
      toolName: COMPONENT_META_TOOL.name,
    });

    try {
      // Convert JSON Schema to Gemini format
      const geminiSchema = convertToGeminiSchema(
        COMPONENT_META_TOOL_JSON_SCHEMA as Record<string, unknown>
      );

      // Build the function declaration for Gemini
      const functionDeclaration = {
        name: COMPONENT_META_TOOL.name,
        description: COMPONENT_META_TOOL.description,
        parameters: geminiSchema,
      };

      // Build contents with optional system instruction
      const contents = options.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      // Generate content with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new MetaGenerationError(
              `Gemini request timed out after ${this.config.timeoutMs}ms`,
              { provider: 'gemini', timeoutMs: this.config.timeoutMs }
            )
          );
        }, this.config.timeoutMs);
      });

      const generatePromise = this.client.models.generateContent({
        model: this.config.model,
        contents,
        config: {
          maxOutputTokens: maxTokens,
          tools: [{ functionDeclarations: [functionDeclaration] }],
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.ANY,
              allowedFunctionNames: [COMPONENT_META_TOOL.name],
            },
          },
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      // Extract function call from response
      const candidate = response.candidates?.[0];
      const functionCall = candidate?.content?.parts?.[0]?.functionCall;

      if (!functionCall) {
        logger.error('No function call in Gemini response', undefined, {
          candidateCount: response.candidates?.length ?? 0,
          finishReason: candidate?.finishReason,
        });

        throw new MetaGenerationError(
          'Tool calling failed: no function call in response',
          { provider: 'gemini', model: this.config.model }
        );
      }

      if (functionCall.name !== COMPONENT_META_TOOL.name) {
        logger.error('Unexpected function name', undefined, {
          expected: COMPONENT_META_TOOL.name,
          received: functionCall.name,
        });

        throw new MetaGenerationError(
          `Tool calling failed: unexpected function "${functionCall.name}"`,
          { provider: 'gemini', model: this.config.model }
        );
      }

      // Extract usage metadata
      const usageMetadata = response.usageMetadata;

      logger.debug('Gemini tool calling succeeded', {
        model: this.config.model,
        inputTokens: usageMetadata?.promptTokenCount,
        outputTokens: usageMetadata?.candidatesTokenCount,
        functionName: functionCall.name,
      });

      // Normalize the output to handle Gemini-specific quirks before returning
      const normalizedData = this.normalizeToolOutput(functionCall.args);

      return {
        data: normalizedData as T,
        usage: usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount ?? 0,
              outputTokens: usageMetadata.candidatesTokenCount ?? 0,
            }
          : undefined,
        model: this.config.model,
      };
    } catch (error) {
      // Re-throw MetaGenerationError as-is
      if (error instanceof MetaGenerationError) {
        throw error;
      }

      // Handle API errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        logger.error('Gemini API error', error);

        // Auth errors
        if (
          message.includes('401') ||
          message.includes('403') ||
          message.includes('api key')
        ) {
          throw new MetaGenerationError(
            'Gemini authentication failed: invalid API key',
            { provider: 'gemini' }
          );
        }

        // Rate limit
        if (
          message.includes('429') ||
          message.includes('rate limit') ||
          message.includes('quota')
        ) {
          throw new MetaGenerationError(
            'Gemini rate limit exceeded: please retry later',
            { provider: 'gemini' }
          );
        }

        // Service errors
        if (
          message.includes('500') ||
          message.includes('503') ||
          message.includes('unavailable')
        ) {
          throw new MetaGenerationError(
            'Gemini service unavailable: please retry later',
            { provider: 'gemini' }
          );
        }

        throw new MetaGenerationError(`Gemini API error: ${error.message}`, {
          provider: 'gemini',
        });
      }

      // Unknown errors
      logger.error('Unexpected error during Gemini call', error as Error);
      throw new MetaGenerationError('Unknown error', { provider: 'gemini' });
    }
  }

  /**
   * Normalize tool output to handle Gemini-specific quirks
   *
   * Gemini sometimes returns complex nested objects (like variantDescriptions)
   * as stringified JSON. This method detects and parses such cases.
   *
   * @param data - Raw tool output from Gemini
   * @returns Normalized data with parsed nested objects
   */
  private normalizeToolOutput(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // Create a shallow copy to avoid mutating the original
    const obj = { ...(data as Record<string, unknown>) };

    // Handle variantDescriptions being returned as stringified JSON
    if (
      typeof obj.variantDescriptions === 'string' &&
      obj.variantDescriptions.trim().startsWith('{')
    ) {
      try {
        obj.variantDescriptions = JSON.parse(obj.variantDescriptions);
        logger.debug('Parsed stringified variantDescriptions from Gemini');
      } catch {
        // If parsing fails, remove the field to avoid validation errors
        // The field is optional, so this is safe
        logger.warn(
          'Failed to parse stringified variantDescriptions from Gemini, removing field'
        );
        delete obj.variantDescriptions;
      }
    }

    // Handle subComponentVariantDescriptions being returned as stringified JSON
    if (
      typeof obj.subComponentVariantDescriptions === 'string' &&
      obj.subComponentVariantDescriptions.trim().startsWith('{')
    ) {
      try {
        obj.subComponentVariantDescriptions = JSON.parse(
          obj.subComponentVariantDescriptions
        );
        logger.debug(
          'Parsed stringified subComponentVariantDescriptions from Gemini'
        );
      } catch {
        // If parsing fails, remove the field to avoid validation errors
        // The field is optional, so this is safe
        logger.warn(
          'Failed to parse stringified subComponentVariantDescriptions from Gemini, removing field'
        );
        delete obj.subComponentVariantDescriptions;
      }
    }

    return obj;
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
