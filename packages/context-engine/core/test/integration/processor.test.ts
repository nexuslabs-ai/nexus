/**
 * Processor Integration Tests
 *
 * Tests the ComponentProcessor pipeline mechanics:
 * - Two-phase API (extractOnly + generateOnly)
 * - skipGeneration mode
 * - Error handling
 * - Framework validation
 *
 * IMPORTANT: For testing actual LLM output quality, see real-llm.test.ts.
 * These tests use MockLLMProvider for testing mechanics, not content quality.
 *
 * Philosophy: Processor tests validate the pipeline MECHANICS.
 * Real LLM tests validate the output QUALITY.
 *
 * ## Manifest Recording
 *
 * To record complete manifests for documentation/examples, use the standalone script:
 *
 * ```bash
 * yarn record:manifests
 * ```
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  type ComponentProcessor,
  createComponentProcessor,
  isProcessorFailure,
  isProcessorSuccess,
  ProcessorErrorCode,
  type ProcessorInput,
} from '../../src/processor/index.js';
import {
  createMockLLMProvider,
  DEFAULT_MOCK_TOOL_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import {
  countAllProps,
  expectManifestAIReady,
  expectProcessorFailure,
  expectProcessorSuccess,
  expectValidHash,
} from '../utils/assertion-helpers.js';
import { loadFixture } from '../utils/fixture-loader.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

describe('ComponentProcessor', () => {
  let mockProvider: MockLLMProvider;
  let processor: ComponentProcessor;

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
    });
    processor = createComponentProcessor({
      llmProvider: mockProvider,
    });
  });

  describe('skipGeneration mode (valuable - no LLM required)', () => {
    it('produces manifest without LLM call', async () => {
      const skipProcessor = createComponentProcessor({
        llmProvider: mockProvider,
        skipGeneration: true,
      });

      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await skipProcessor.process(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        expect(result.generationSkipped).toBe(true);
        expect(mockProvider.getCallCount()).toBe(0); // No LLM calls
        expect(result.manifest.name).toBe('Button');
        // Props is now CategorizedProps object, not array
        expect(countAllProps(result.manifest.props)).toBeGreaterThan(0);
      }
    });

    it('still extracts variants correctly without LLM', async () => {
      const skipProcessor = createComponentProcessor({
        llmProvider: mockProvider,
        skipGeneration: true,
      });

      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await skipProcessor.process(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        // Variants come from extraction, not generation
        // v1.0 schema: variant info is in props.variants
        const variantProps = result.manifest.props.variants;
        expect(variantProps).toBeDefined();

        const variantProp = variantProps?.find((p) => p.name === 'variant');
        expect(variantProp?.values).toContain('default');
        expect(variantProp?.defaultValue).toBe('default');
      }
    });
  });

  describe('processWithoutGeneration method', () => {
    it('produces manifest without LLM call', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.processWithoutGeneration(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        expect(result.generationSkipped).toBe(true);
        expect(mockProvider.getCallCount()).toBe(0);
      }
    });
  });

  describe('two-phase API (valuable for queue-based processing)', () => {
    it('extractOnly returns extraction result without LLM', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.extractOnly(input);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.id).toBeTruthy();
        expect(result.slug).toBeTruthy();
        expect(result.extracted).toBeDefined();
        expect(result.sourceHash).toBeTruthy();
        expect(mockProvider.getCallCount()).toBe(0); // No LLM call yet
      }
    });

    it('generateOnly produces manifest from extraction result', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      // Phase 1: Extract
      const extractResult = await processor.extractOnly(input);
      expect(extractResult.type).toBe('success');
      if (extractResult.type !== 'success') return;

      // Phase 2: Generate
      const generateResult = await processor.generateOnly({
        orgId: input.orgId,
        identity: extractResult.identity,
        extracted: extractResult.extracted,
        sourceHash: extractResult.sourceHash,
        extraction: extractResult.extraction,
      });

      expect(isProcessorSuccess(generateResult)).toBe(true);
      if (isProcessorSuccess(generateResult)) {
        expect(generateResult.manifest.name).toBe('Button');
        expect(mockProvider.getCallCount()).toBe(1); // One LLM call
      }
    });
  });

  describe('error handling', () => {
    it('returns failure for unsupported framework', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'vue' as 'react', // Unsupported
      };

      const result = await processor.process(input);

      expectProcessorFailure(result);
      if (isProcessorFailure(result)) {
        expect(result.error).toContain('Unsupported framework');
      }
    });

    it('handles empty source code', async () => {
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: '',
        framework: 'react',
      };

      const result = await processor.process(input);

      // Empty source should either fail extraction or produce minimal manifest
      if (isProcessorFailure(result)) {
        expect(result.error).toBeTruthy();
      } else {
        // May succeed with empty component
        expect(result.manifest).toBeDefined();
      }
    });

    it('handles LLM failure gracefully', async () => {
      mockProvider.setError('LLM service unavailable', false);

      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expectProcessorFailure(result);
      if (isProcessorFailure(result)) {
        expect(result.code).toBe(ProcessorErrorCode.GenerationFailed);
        expect(result.error.toLowerCase()).toContain('llm');
      }
    });

    it('handles invalid source code gracefully', async () => {
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: 'this is not valid typescript',
        framework: 'react',
      };

      const result = await processor.process(input);

      // May succeed with minimal extraction or fail
      if (isProcessorFailure(result)) {
        expect(result.code).toBe(ProcessorErrorCode.ExtractionFailed);
      } else {
        expect(result.manifest).toBeDefined();
      }
    });
  });

  describe('metrics and hashing', () => {
    it('produces consistent sourceHash for same input', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result1 = await processor.process(input);
      const result2 = await processor.process(input);

      expect(isProcessorSuccess(result1)).toBe(true);
      expect(isProcessorSuccess(result2)).toBe(true);

      if (isProcessorSuccess(result1) && isProcessorSuccess(result2)) {
        expectValidHash(result1.manifest.sourceHash);
        expect(result1.manifest.sourceHash).toBe(result2.manifest.sourceHash);
      }
    });

    it('includes processing metrics', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        expect(result.metrics.totalTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.metrics.extractionTimeMs).toBeDefined();
        expect(result.metrics.generationTimeMs).toBeDefined();
      }
    });

    it('includes extraction metadata', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        expect(result.extraction).toBeDefined();
        expect(result.extraction.extractionMethod).toBeTruthy();
        expect(typeof result.extraction.fallbackTriggered).toBe('boolean');
      }
    });
  });

  describe('manifest structure validation (sanity checks)', () => {
    // These validate structure, not content quality.
    // Content quality is tested in real-llm.test.ts

    it('produces valid manifest from Button fixture', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expectProcessorSuccess(result);
      if (isProcessorSuccess(result)) {
        expectManifestAIReady(result.manifest);
      }
    });

    it('produces valid manifest from Input fixture', async () => {
      const fixture = loadFixture('nexus', 'input');
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: 'Input',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expectProcessorSuccess(result);
      if (isProcessorSuccess(result)) {
        expectManifestAIReady(result.manifest);
      }
    });
  });
});
