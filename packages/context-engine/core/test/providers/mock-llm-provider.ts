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

import type {
  ILLMProvider,
  LLMCompletionOptions,
  LLMCompletionResponse,
} from '../../src/generator/types.js';
import { LLMProviderType } from '../../src/generator/types.js';

/**
 * Configuration for MockLLMProvider
 */
export interface MockLLMProviderConfig {
  /** Model identifier to report */
  modelId?: string;

  /** Map of prompt patterns to responses (string or RegExp keys) */
  responses?: Map<string | RegExp, LLMCompletionResponse>;

  /** Default response when no pattern matches */
  defaultResponse?: LLMCompletionResponse;

  /** Error after N calls (simulates rate limiting) */
  errorAfterCalls?: number;

  /** Simulated latency in milliseconds */
  simulateLatencyMs?: number;

  /** Error to throw (if set, all calls will throw) */
  error?: Error;
}

/**
 * Call record for tracking interactions
 */
export interface CallRecord {
  prompt: string;
  options?: LLMCompletionOptions;
  timestamp: Date;
}

/**
 * Default mock response that produces valid JSON for meta generation
 */
export const DEFAULT_MOCK_RESPONSE: LLMCompletionResponse = {
  text: JSON.stringify({
    description: 'A reusable UI component for building interfaces.',
    semanticDescription:
      'This component provides a flexible and accessible way to build user interfaces. It supports multiple variants and sizes, making it suitable for various use cases in modern web applications.',
    tier: 'free',
    whenToUse: 'Use this component when you need a standard UI element.',
    whenNotToUse: 'Avoid using this component for complex custom layouts.',
    patterns: ['container', 'composition'],
    tokens: ['color', 'spacing', 'typography'],
    examples: ['<Component variant="default">Content</Component>'],
    relatedComponents: ['Button', 'Card'],
    a11yNotes: 'Ensure proper ARIA labels are provided for accessibility.',
  }),
  model: 'mock-model',
  stopReason: 'end_turn',
  usage: {
    inputTokens: 500,
    outputTokens: 200,
  },
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
 *     text: '{"description": "A button"}',
 *     model: 'mock',
 *     stopReason: 'end_turn',
 *   },
 * });
 *
 * const response = await provider.generateCompletion('Generate for Button');
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
   * Generate a completion from a prompt
   */
  async generateCompletion(
    prompt: string,
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResponse> {
    // Record the call
    this.callHistory.push({
      prompt,
      options,
      timestamp: new Date(),
    });

    // Check for configured error
    if (this.config.error) {
      throw this.config.error;
    }

    // Check for rate limit simulation
    if (
      this.config.errorAfterCalls !== undefined &&
      this.callHistory.length > this.config.errorAfterCalls
    ) {
      const error = new Error('429 Rate limit exceeded');
      (error as Error & { status: number }).status = 429;
      throw error;
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
          return { ...response };
        }
        if (pattern instanceof RegExp && pattern.test(prompt)) {
          return { ...response };
        }
      }
    }

    // Return default response or the global default
    return { ...(this.config.defaultResponse ?? DEFAULT_MOCK_RESPONSE) };
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
  setResponse(pattern: string | RegExp, response: LLMCompletionResponse): void {
    if (!this.config.responses) {
      this.config.responses = new Map();
    }
    this.config.responses.set(pattern, response);
  }

  /**
   * Set the default response
   */
  setDefaultResponse(response: LLMCompletionResponse): void {
    this.config.defaultResponse = response;
  }

  /**
   * Set an error to throw on all calls
   */
  setError(error: Error): void {
    this.config.error = error;
  }

  /**
   * Clear any configured error
   */
  clearError(): void {
    this.config.error = undefined;
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
 * Create a mock provider that always throws an error
 */
export function createErrorProvider(error: Error): MockLLMProvider {
  return new MockLLMProvider({ error });
}

/**
 * Create a mock provider that simulates rate limiting after N calls
 */
export function createRateLimitedProvider(afterCalls: number): MockLLMProvider {
  return new MockLLMProvider({
    errorAfterCalls: afterCalls,
    defaultResponse: DEFAULT_MOCK_RESPONSE,
  });
}

/**
 * Create a mock response for a specific component
 */
export function createMockResponse(
  componentName: string,
  overrides?: Partial<{
    description: string;
    patterns: string[];
    tier: 'free' | 'pro';
  }>
): LLMCompletionResponse {
  const baseResponse = {
    description: `A ${componentName} component for building user interfaces.`,
    semanticDescription: `The ${componentName} component provides a flexible and accessible building block for web applications. It follows accessibility best practices and integrates well with other components in the design system.`,
    tier: 'free' as const,
    whenToUse: `Use ${componentName} when you need this specific UI pattern.`,
    whenNotToUse: `Avoid ${componentName} when a simpler alternative exists.`,
    patterns: ['container'],
    tokens: ['color', 'spacing'],
    examples: [`<${componentName}>Content</${componentName}>`],
    relatedComponents: [],
    a11yNotes: 'Follow WCAG guidelines for proper accessibility.',
    ...overrides,
  };

  return {
    text: JSON.stringify(baseResponse),
    model: 'mock-model',
    stopReason: 'end_turn',
    usage: {
      inputTokens: 500,
      outputTokens: 200,
    },
  };
}
