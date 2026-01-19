/**
 * Generator Error Handling Tests
 *
 * Tests error scenarios in the MetaGenerator that are difficult or expensive
 * to reproduce with real LLM calls. These include:
 * - Rate limiting (429 errors)
 * - Authentication failures (401 errors)
 * - Malformed JSON responses
 * - Empty responses
 * - Partial JSON responses
 *
 * IMPORTANT: For testing actual LLM output quality, see real-llm.test.ts
 * which uses the real AnthropicProvider.
 *
 * Philosophy: Mock tests are valuable ONLY for testing boundaries/error cases.
 * The LLM is the core value, so real LLM tests validate actual quality.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  extractComponent,
  isExtractionSuccess,
} from '../../src/extractor/index.js';
import {
  createMetaGenerator,
  type GeneratorInput,
  isGeneratorFailure,
  isGeneratorSuccess,
  type MetaGenerator,
} from '../../src/generator/index.js';
import {
  createMockLLMProvider,
  createRateLimitedProvider,
  DEFAULT_MOCK_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import {
  expectGeneratorFailure,
  expectGeneratorSuccess,
} from '../utils/assertion-helpers.js';
import { loadFixtureAsInput } from '../utils/fixture-loader.js';

describe('MetaGenerator - Error Handling', () => {
  let mockProvider: MockLLMProvider;
  let generator: MetaGenerator;

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_RESPONSE,
    });
    generator = createMetaGenerator({ provider: mockProvider });
  });

  /**
   * Helper to get a valid extraction result for testing
   */
  async function getExtractionForTests(): Promise<GeneratorInput> {
    const extractionInput = loadFixtureAsInput('shadcn', 'button');
    const extractionResult = await extractComponent(extractionInput);

    expect(isExtractionSuccess(extractionResult)).toBe(true);
    if (!isExtractionSuccess(extractionResult)) {
      throw new Error('Extraction failed');
    }

    return {
      orgId: extractionInput.orgId,
      name: 'Button',
      framework: 'react',
      extracted: extractionResult.data,
    };
  }

  describe('authentication errors (non-retryable)', () => {
    it('returns failure with retryable=false for 401 errors', async () => {
      const error = new Error('401 Unauthorized');
      (error as Error & { status: number }).status = 401;
      mockProvider.setError(error);

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
      if (isGeneratorFailure(result)) {
        expect(result.error).toContain('401');
        expect(result.retryable).toBe(false);
      }
    });
  });

  describe('rate limit errors (retryable)', () => {
    it('returns failure with retryable=true for 429 errors', async () => {
      const rateLimitedProvider = createRateLimitedProvider(0); // Fail on first call
      generator = createMetaGenerator({ provider: rateLimitedProvider });

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
      if (isGeneratorFailure(result)) {
        expect(result.error).toContain('429');
        expect(result.retryable).toBe(true);
      }
    });
  });

  describe('malformed response handling', () => {
    it('handles completely invalid JSON gracefully', async () => {
      mockProvider.setDefaultResponse({
        text: 'This is not valid JSON {{{',
        model: 'mock',
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
      if (isGeneratorFailure(result)) {
        expect(result.error).toContain('JSON');
        expect(result.retryable).toBe(false); // JSON parse errors are not retryable
      }
    });

    it('handles empty response gracefully', async () => {
      mockProvider.setDefaultResponse({
        text: '',
        model: 'mock',
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 0 },
      });

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
    });

    it('handles partial JSON response', async () => {
      mockProvider.setDefaultResponse({
        text: '{"description": "A button", "tier": "free"', // Missing closing brace
        model: 'mock',
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
    });

    it('handles JSON with wrong structure', async () => {
      mockProvider.setDefaultResponse({
        text: JSON.stringify({ foo: 'bar', baz: 123 }), // Valid JSON, wrong structure
        model: 'mock',
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 50 },
      });

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      // May succeed with defaults or fail validation - either is acceptable
      // The key is it doesn't crash
      expect(result.type).toBeDefined();
    });
  });

  describe('service errors', () => {
    it('handles generic LLM service error', async () => {
      mockProvider.setError(new Error('LLM service unavailable'));

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
      if (isGeneratorFailure(result)) {
        expect(result.error).toContain('LLM');
      }
    });

    it('handles timeout errors', async () => {
      mockProvider.setError(new Error('Request timed out'));

      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorFailure(result);
      if (isGeneratorFailure(result)) {
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('basic functionality (sanity checks)', () => {
    // These tests verify the generator works at all - the real quality
    // testing is in real-llm.test.ts

    it('produces output with required structure', async () => {
      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorSuccess(result);
      if (isGeneratorSuccess(result)) {
        // Structural checks only - content quality is tested with real LLM
        expect(result.meta.name).toBeTruthy();
        expect(result.meta.description).toBeTruthy();
        expect(result.meta.tier).toBeDefined();
        expect(result.generationTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.provider).toBe('mock');
      }
    });

    it('includes token usage when available', async () => {
      const input = await getExtractionForTests();
      const result = await generator.generate(input);

      expectGeneratorSuccess(result);
      if (isGeneratorSuccess(result)) {
        expect(result.usage).toBeDefined();
        expect(result.usage?.inputTokens).toBeGreaterThan(0);
        expect(result.usage?.outputTokens).toBeGreaterThan(0);
      }
    });

    it('passes hints and figmaUrl to the prompt', async () => {
      const input = await getExtractionForTests();
      const inputWithHints = {
        ...input,
        hints: 'This is from the Nexus Design System',
        figmaUrl: 'https://figma.com/file/xxx',
      };

      await generator.generate(inputWithHints);

      expect(mockProvider.wasCalledWith('Nexus Design System')).toBe(true);
      expect(mockProvider.wasCalledWith('figma.com')).toBe(true);
    });
  });
});
