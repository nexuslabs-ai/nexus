/**
 * Mock LLM Provider
 *
 * Implements ILLMProvider interface for deterministic testing.
 * Supports pattern-based responses, call tracking, and simulated errors.
 *
 * WHEN TO USE:
 * - Error handling tests (rate limits, auth failures, malformed JSON)
 * - Testing pipeline mechanics (skipGeneration, two-phase API)
 * - Multi-org isolation tests (where LLM output doesn't matter)
 *
 * WHEN NOT TO USE:
 * - Testing LLM output quality (use real-llm.test.ts instead)
 * - Validating prompt effectiveness (use real AnthropicProvider)
 *
 * Philosophy: The LLM is the CORE of the generator's value.
 * Mock tests are valuable ONLY for testing boundaries/error cases.
 */

import type { ComponentMetaTool } from '../../src/generator/tool-schema.js';
import type {
  ILLMProvider,
  ToolCallingOptions,
  ToolCallResult,
} from '../../src/generator/types.js';
import { LLMProviderType } from '../../src/generator/types.js';

/**
 * Configuration for MockLLMProvider
 */
export interface MockLLMProviderConfig {
  /** Model identifier to report */
  modelId?: string;

  /** Map of prompt patterns to responses (string or RegExp keys) */
  responses?: Map<string | RegExp, ComponentMetaTool>;

  /** Default response when no pattern matches */
  defaultResponse?: ComponentMetaTool;

  /** Error after N calls (simulates rate limiting) */
  errorAfterCalls?: number;

  /** Simulated latency in milliseconds */
  simulateLatencyMs?: number;

  /** Error to return (if set, all calls will return failure) */
  error?: string;

  /** Whether the error is retryable */
  errorRetryable?: boolean;
}

/**
 * Call record for tracking interactions
 */
export interface CallRecord {
  prompt: string;
  options?: ToolCallingOptions;
  timestamp: Date;
}

/**
 * Default mock response that produces valid tool output for meta generation
 */
export const DEFAULT_MOCK_TOOL_RESPONSE: ComponentMetaTool = {
  description: 'A reusable UI component for building interfaces.',
  semanticDescription:
    'This component provides a flexible and accessible way to build user interfaces. It supports multiple variants and sizes, making it suitable for various use cases in modern web applications.',
  tier: 'free',
  minimalExample: '<Component variant="default">Content</Component>',
  examples: {
    minimal: {
      title: 'Basic Usage',
      code: '<Component>Content</Component>',
      description: 'Basic usage of the component',
    },
    common: [
      {
        title: 'With Variant',
        code: '<Component variant="primary">Content</Component>',
        description: 'Using a variant',
      },
    ],
    advanced: [],
  },
  guidance: {
    whenToUse: 'Use this component when you need a standard UI element.',
    whenNotToUse: 'Avoid using this component for complex custom layouts.',
    accessibility: 'Ensure proper ARIA labels are provided for accessibility.',
    patterns: ['container', 'composition'],
    relatedComponents: ['Button', 'Card'],
  },
  tokens: ['color', 'spacing', 'typography'],
};

/**
 * MockLLMProvider implements ILLMProvider for testing
 *
 * Features:
 * - Pattern matching for prompt-specific responses
 * - Call history tracking for assertions
 * - Simulated rate limiting via errorAfterCalls
 * - Configurable latency for timing tests
 *
 * @example
 * ```typescript
 * const provider = new MockLLMProvider({
 *   defaultResponse: {
 *     description: 'A button',
 *     // ... other fields
 *   },
 * });
 *
 * const result = await provider.generateWithToolCalling('Generate for Button');
 * expect(provider.getCallCount()).toBe(1);
 * ```
 */
export class MockLLMProvider implements ILLMProvider {
  readonly providerType = LLMProviderType.Mock;
  readonly modelId: string;

  private config: MockLLMProviderConfig;
  private callHistory: CallRecord[] = [];

  constructor(config: MockLLMProviderConfig = {}) {
    this.config = config;
    this.modelId = config.modelId ?? 'mock-model-v1';
  }

  /**
   * Generate structured output using tool calling
   */
  async generateWithToolCalling<T = ComponentMetaTool>(
    prompt: string,
    options?: ToolCallingOptions
  ): Promise<ToolCallResult<T>> {
    // Record the call
    this.callHistory.push({
      prompt,
      options,
      timestamp: new Date(),
    });

    // Check for configured error
    if (this.config.error) {
      return {
        type: 'failure',
        error: this.config.error,
        retryable: this.config.errorRetryable ?? false,
      };
    }

    // Check for rate limit simulation
    if (
      this.config.errorAfterCalls !== undefined &&
      this.callHistory.length > this.config.errorAfterCalls
    ) {
      return {
        type: 'failure',
        error: 'Rate limit exceeded',
        retryable: true,
      };
    }

    // Simulate latency if configured
    if (this.config.simulateLatencyMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.simulateLatencyMs)
      );
    }

    // Try to match a response pattern
    if (this.config.responses) {
      for (const [pattern, response] of this.config.responses) {
        if (typeof pattern === 'string' && prompt.includes(pattern)) {
          return {
            type: 'success',
            data: { ...response } as T,
            model: this.modelId,
            usage: {
              inputTokens: 500,
              outputTokens: 200,
            },
          };
        }
        if (pattern instanceof RegExp && pattern.test(prompt)) {
          return {
            type: 'success',
            data: { ...response } as T,
            model: this.modelId,
            usage: {
              inputTokens: 500,
              outputTokens: 200,
            },
          };
        }
      }
    }

    // Return default response or the global default
    const response = this.config.defaultResponse ?? DEFAULT_MOCK_TOOL_RESPONSE;
    return {
      type: 'success',
      data: { ...response } as T,
      model: this.modelId,
      usage: {
        inputTokens: 500,
        outputTokens: 200,
      },
    };
  }

  /**
   * Get the full call history
   */
  getCallHistory(): CallRecord[] {
    return [...this.callHistory];
  }

  /**
   * Get the number of calls made
   */
  getCallCount(): number {
    return this.callHistory.length;
  }

  /**
   * Get the last call made
   */
  getLastCall(): CallRecord | undefined {
    return this.callHistory[this.callHistory.length - 1];
  }

  /**
   * Check if a prompt was called (exact or partial match)
   */
  wasCalledWith(promptSubstring: string): boolean {
    return this.callHistory.some((call) =>
      call.prompt.includes(promptSubstring)
    );
  }

  /**
   * Reset the provider state
   */
  reset(): void {
    this.callHistory = [];
  }

  /**
   * Update the configuration
   */
  configure(config: Partial<MockLLMProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set a specific response for a pattern
   */
  setResponse(pattern: string | RegExp, response: ComponentMetaTool): void {
    if (!this.config.responses) {
      this.config.responses = new Map();
    }
    this.config.responses.set(pattern, response);
  }

  /**
   * Set the default response
   */
  setDefaultResponse(response: ComponentMetaTool): void {
    this.config.defaultResponse = response;
  }

  /**
   * Set an error to return on all calls
   */
  setError(error: string, retryable = false): void {
    this.config.error = error;
    this.config.errorRetryable = retryable;
  }

  /**
   * Clear any configured error
   */
  clearError(): void {
    this.config.error = undefined;
    this.config.errorRetryable = undefined;
  }
}

/**
 * Create a mock provider with default configuration
 */
export function createMockLLMProvider(
  config?: MockLLMProviderConfig
): MockLLMProvider {
  return new MockLLMProvider(config);
}

/**
 * Create a mock provider that always returns an error
 */
export function createErrorProvider(
  error: string,
  retryable = false
): MockLLMProvider {
  return new MockLLMProvider({ error, errorRetryable: retryable });
}

/**
 * Create a mock provider that simulates rate limiting after N calls
 */
export function createRateLimitedProvider(afterCalls: number): MockLLMProvider {
  return new MockLLMProvider({
    errorAfterCalls: afterCalls,
    defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
  });
}

/**
 * Create a mock tool response for a specific component
 */
export function createMockToolResponse(
  componentName: string,
  overrides?: Partial<ComponentMetaTool>
): ComponentMetaTool {
  return {
    description: `A ${componentName} component for building user interfaces.`,
    semanticDescription: `The ${componentName} component provides a flexible and accessible building block for web applications. It follows accessibility best practices and integrates well with other components in the design system.`,
    tier: 'free',
    minimalExample: `<${componentName}>Content</${componentName}>`,
    examples: {
      minimal: {
        title: 'Basic Usage',
        code: `<${componentName}>Content</${componentName}>`,
        description: `Basic usage of ${componentName}`,
      },
      common: [
        {
          title: 'With Variant',
          code: `<${componentName} variant="primary">Content</${componentName}>`,
          description: 'Using a variant',
        },
      ],
      advanced: [],
    },
    guidance: {
      whenToUse: `Use ${componentName} when you need this specific UI pattern.`,
      whenNotToUse: `Avoid ${componentName} when a simpler alternative exists.`,
      accessibility: 'Follow WCAG guidelines for proper accessibility.',
      patterns: ['container'],
      relatedComponents: [],
    },
    tokens: ['color', 'spacing'],
    ...overrides,
  };
}
