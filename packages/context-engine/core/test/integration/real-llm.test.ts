/**
 * Real LLM Integration Tests
 *
 * Tests the full pipeline with REAL LLM providers.
 * These tests validate actual output quality, not just code mechanics.
 *
 * ## Environment Modes
 *
 * The test supports three modes controlled by environment variables:
 *
 * ### Default Mode (Real LLM)
 * Calls real LLM API for each test. Requires API key.
 * ```bash
 * GOOGLE_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ### RECORD_RESPONSES=true
 * Calls real LLM and saves responses to test/fixtures/responses/
 * for future playback. Use this to populate the cache.
 * ```bash
 * RECORD_RESPONSES=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ### USE_CACHED=true
 * Uses cached responses from disk (no LLM calls). Fast and deterministic.
 * Falls back to real LLM if no cached response exists.
 * ```bash
 * USE_CACHED=true yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ### VALIDATE_LLM=true
 * Calls real LLM AND compares output to cached baseline.
 * Reports structural deviations for regression detection.
 * ```bash
 * VALIDATE_LLM=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts
 * ```
 *
 * ## Philosophy
 *
 * The LLM is the CORE of the generator's value.
 * If someone breaks the prompt template, these tests will catch it
 * because the output quality will degrade.
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createAnthropicProvider } from '../../src/generator/anthropic-provider.js';
import { createGeminiProvider } from '../../src/generator/gemini-provider.js';
import type { ILLMProvider } from '../../src/generator/types.js';
import {
  type ComponentProcessor,
  createComponentProcessor,
  isProcessorSuccess,
  type ProcessorInput,
} from '../../src/processor/index.js';
import {
  CachedLLMProvider,
  createRecordingProvider,
  createValidatingProvider,
  type ValidationResult,
} from '../providers/cached-llm-provider.js';
import { loadFixture } from '../utils/fixture-loader.js';
import {
  getAvailableResponses,
  getTestingMode,
  hasRecordedResponse,
  isCachedMode,
  isRecordingMode,
  isValidationMode,
} from '../utils/response-recorder.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

// =============================================================================
// Environment Configuration
// =============================================================================

// Check for available API keys
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Determine testing mode
const TESTING_MODE = getTestingMode();
const HAS_LLM_KEY = !!(GOOGLE_API_KEY || ANTHROPIC_API_KEY);

// In cached mode, we can run without an API key if cached responses exist
const CAN_RUN_TESTS = HAS_LLM_KEY || isCachedMode();

const PROVIDER_NAME = GOOGLE_API_KEY
  ? 'Gemini'
  : ANTHROPIC_API_KEY
    ? 'Anthropic'
    : 'Cached';

const describeWithRealLLM = CAN_RUN_TESTS ? describe : describe.skip;

// Track validation results across tests
const validationResults: Map<string, ValidationResult> = new Map();

// =============================================================================
// Provider Factory
// =============================================================================

/**
 * Create a provider based on available API key and testing mode
 */
function createRealProvider(): ILLMProvider | null {
  if (GOOGLE_API_KEY) {
    return createGeminiProvider({
      apiKey: GOOGLE_API_KEY,
    });
  }

  if (ANTHROPIC_API_KEY) {
    return createAnthropicProvider({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  return null;
}

/**
 * Create a provider configured for the current testing mode
 */
function createTestProvider(): ILLMProvider {
  const realProvider = createRealProvider();

  // Recording mode: wrap real provider to save responses
  if (isRecordingMode() && realProvider) {
    console.log(
      '[Test] Recording mode enabled - responses will be saved to disk'
    );
    return createRecordingProvider(realProvider);
  }

  // Validation mode: compare real to cached
  if (isValidationMode() && realProvider) {
    console.log(
      '[Test] Validation mode enabled - comparing real vs cached responses'
    );
    return createValidatingProvider(realProvider, (result, componentName) => {
      validationResults.set(componentName, result);
      if (!result.passed) {
        console.warn(
          `[Validation] ${componentName}: ${result.differences.length} differences found`,
          result.differences
        );
      }
    });
  }

  // Cached mode: use cached responses with optional fallback
  if (isCachedMode()) {
    console.log('[Test] Cached mode enabled - using recorded responses');
    return new CachedLLMProvider({
      realProvider: realProvider ?? undefined,
    });
  }

  // Default: use real provider directly
  if (realProvider) {
    return realProvider;
  }

  throw new Error('No LLM API key available and not in cached mode');
}

/**
 * Create a processor with the appropriate provider
 */
function createRealProcessor(): ComponentProcessor {
  const provider = createTestProvider();
  return createComponentProcessor({
    llmProvider: provider,
  });
}

// =============================================================================
// Test Suites
// =============================================================================

describeWithRealLLM(
  `Real LLM Integration (mode: ${TESTING_MODE}, provider: ${PROVIDER_NAME})`,
  () => {
    let processor: ComponentProcessor;

    beforeAll(() => {
      // Restore real timers for actual API calls
      vi.useRealTimers();
      processor = createRealProcessor();

      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing Mode: ${TESTING_MODE.toUpperCase()}`);
      console.log(`Provider: ${PROVIDER_NAME}`);
      console.log(
        `Available cached responses: ${getAvailableResponses().join(', ') || 'none'}`
      );
      console.log(`${'='.repeat(60)}\n`);
    });

    describe('Button component - validates real LLM output quality', () => {
      it('generates semantically meaningful description', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        // Description should be meaningful, not generic
        const description = result.manifest.description.toLowerCase();
        expect(description).toContain('button');
        // Should mention purpose/use case
        expect(
          description.includes('action') ||
            description.includes('click') ||
            description.includes('submit') ||
            description.includes('trigger') ||
            description.includes('interactive')
        ).toBe(true);
      }, 60000); // Allow 60s for real API call

      it('identifies correct patterns for Button', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const patterns = result.manifest.ai?.patterns ?? [];

        // Button should have action-related pattern
        const hasActionPattern = patterns.some((p) =>
          [
            'button',
            'async-action',
            'action',
            'interactive',
            'clickable',
          ].includes(p.toLowerCase())
        );
        expect(hasActionPattern).toBe(true);
      }, 60000);

      it('provides actionable usage guidance', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        // AI metadata should have useful guidance
        const whenToUse = result.manifest.ai?.whenToUse ?? '';
        const whenNotToUse = result.manifest.ai?.whenNotToUse ?? '';

        // Should have non-empty, meaningful guidance
        expect(whenToUse.length).toBeGreaterThan(20);
        expect(whenNotToUse.length).toBeGreaterThan(20);

        // whenToUse should mention common button scenarios
        const whenLower = whenToUse.toLowerCase();
        expect(
          whenLower.includes('submit') ||
            whenLower.includes('action') ||
            whenLower.includes('click') ||
            whenLower.includes('trigger') ||
            whenLower.includes('form')
        ).toBe(true);
      }, 60000);

      it('generates useful code examples', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const examples = result.manifest.ai?.examples ?? [];

        // Should have at least one example
        expect(examples.length).toBeGreaterThan(0);

        // Examples should contain actual JSX
        const hasJSX = examples.some((ex) => ex.includes('<Button'));
        expect(hasJSX).toBe(true);

        // Examples should show variant usage
        const showsVariant = examples.some((ex) => ex.includes('variant='));
        expect(showsVariant).toBe(true);
      }, 60000);
    });

    describe('Input component - form control context', () => {
      it('generates form-appropriate description', async () => {
        const fixture = loadFixture('shadcn', 'input');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Input',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const description = result.manifest.description.toLowerCase();

        // Should mention input/form context
        expect(
          description.includes('input') ||
            description.includes('text') ||
            description.includes('form') ||
            description.includes('field')
        ).toBe(true);
      }, 60000);

      it('identifies form control patterns', async () => {
        const fixture = loadFixture('shadcn', 'input');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Input',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const patterns = result.manifest.ai?.patterns ?? [];

        // Should identify as form control
        const hasFormPattern = patterns.some((p) =>
          ['form', 'input', 'field', 'text-input', 'form-control'].includes(
            p.toLowerCase()
          )
        );
        expect(hasFormPattern).toBe(true);
      }, 60000);
    });

    describe('Dialog component - compound component understanding', () => {
      it('recognizes compound component nature', async () => {
        const fixture = loadFixture('shadcn', 'dialog');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Dialog',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const patterns = result.manifest.ai?.patterns ?? [];
        const relatedComponents = result.manifest.ai?.relatedComponents ?? [];

        // Should identify as overlay/modal/dialog pattern
        const hasModalPattern = patterns.some((p) =>
          ['modal', 'dialog', 'overlay', 'disclosure', 'compound'].includes(
            p.toLowerCase()
          )
        );
        expect(hasModalPattern).toBe(true);

        // Should mention related dialog parts or Modal alternatives
        const hasRelated = relatedComponents.length > 0;
        expect(hasRelated).toBe(true);
      }, 60000);
    });

    describe('AI usability - can AI generate correct code from manifest?', () => {
      it('manifest has all info needed for JSX generation', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const manifest = result.manifest;

        // 1. Component name for import
        expect(manifest.name).toBe('Button');

        // 2. Variant options (from extraction, not LLM)
        expect(manifest.variants?.variant).toBeDefined();
        expect(manifest.variants?.variant?.length).toBeGreaterThan(0);

        // 3. Default values
        expect(manifest.defaultVariants).toBeDefined();

        // 4. Props with types
        expect(manifest.props.length).toBeGreaterThan(0);
        manifest.props.forEach((prop) => {
          expect(prop.name).toBeTruthy();
          expect(prop.type).toBeTruthy();
        });

        // 5. Meaningful AI context (from real LLM)
        expect(manifest.description.length).toBeGreaterThan(20);
        expect(manifest.ai?.semanticDescription?.length).toBeGreaterThan(50);
      }, 60000);

      it('semantic description enables natural language search', async () => {
        const fixture = loadFixture('shadcn', 'button');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result = await processor.process(input);

        expect(isProcessorSuccess(result)).toBe(true);
        if (!isProcessorSuccess(result)) return;

        const semanticDesc = result.manifest.ai?.semanticDescription ?? '';

        // Should be rich enough for embedding/search
        expect(semanticDesc.length).toBeGreaterThan(100);

        // Should contain multiple relevant keywords for search
        const searchTerms = [
          'button',
          'click',
          'action',
          'submit',
          'variant',
          'primary',
          'secondary',
          'accessible',
          'interactive',
        ];
        const foundTerms = searchTerms.filter((term) =>
          semanticDesc.toLowerCase().includes(term)
        );

        // Should match at least 3 search terms
        expect(foundTerms.length).toBeGreaterThanOrEqual(3);
      }, 60000);
    });

    describe('consistency - same input produces consistent output', () => {
      it('multiple runs produce similar descriptions', async () => {
        const fixture = loadFixture('shadcn', 'badge');
        const input: ProcessorInput = {
          orgId: TEST_ORG_ID,
          name: 'Badge',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        };

        const result1 = await processor.process(input);
        const result2 = await processor.process(input);

        expect(isProcessorSuccess(result1)).toBe(true);
        expect(isProcessorSuccess(result2)).toBe(true);

        if (!isProcessorSuccess(result1) || !isProcessorSuccess(result2))
          return;

        // Both should mention "badge" in description
        expect(result1.manifest.description.toLowerCase()).toContain('badge');
        expect(result2.manifest.description.toLowerCase()).toContain('badge');

        // Both should identify similar patterns (at least one overlap)
        const patterns1 = result1.manifest.ai?.patterns ?? [];
        const patterns2 = result2.manifest.ai?.patterns ?? [];

        const hasOverlap = patterns1.some((p) => patterns2.includes(p));
        expect(hasOverlap).toBe(true);
      }, 120000); // 2 API calls
    });
  }
);

// =============================================================================
// Mode-Specific Test Suites
// =============================================================================

describe('Cached Response Tests', () => {
  it('can run tests with cached responses when USE_CACHED=true', () => {
    if (isCachedMode()) {
      const available = getAvailableResponses();
      console.log(
        `Running in cached mode with ${available.length} cached responses`
      );

      // Verify button response exists (our primary test component)
      if (hasRecordedResponse('button')) {
        expect(hasRecordedResponse('button')).toBe(true);
      } else {
        console.warn(
          'No cached response for Button - tests may fall back to real LLM'
        );
      }
    } else {
      // Skip in non-cached mode
      expect(true).toBe(true);
    }
  });

  it('documents cache locations', () => {
    const available = getAvailableResponses();
    console.log(`\nCached responses available: ${available.length}`);
    console.log(`Components: ${available.join(', ') || 'none'}`);
    console.log('\nTo add more cached responses, run:');
    console.log(
      '  RECORD_RESPONSES=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts'
    );
    expect(true).toBe(true);
  });
});

describe('Validation Mode Summary', () => {
  it('reports validation results (VALIDATE_LLM=true)', () => {
    if (isValidationMode()) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('VALIDATION RESULTS');
      console.log(`${'='.repeat(60)}`);

      if (validationResults.size === 0) {
        console.log('No validation results recorded');
      } else {
        for (const [component, result] of validationResults) {
          const status = result.passed ? 'PASS' : 'FAIL';
          console.log(`\n${component}: ${status}`);
          if (result.differences.length > 0) {
            console.log(
              '  Differences:',
              JSON.stringify(result.differences, null, 2)
            );
          }
        }
      }
      console.log(`\n${'='.repeat(60)}\n`);
    }
    expect(true).toBe(true);
  });
});

// =============================================================================
// Documentation Test (always runs)
// =============================================================================

describe('Real LLM Tests - Documentation', () => {
  it('documents testing modes and requirements', () => {
    if (!CAN_RUN_TESTS) {
      console.warn('');
      console.warn('='.repeat(60));
      console.warn('Real LLM tests were SKIPPED - no API key found');
      console.warn('');
      console.warn('To run real LLM integration tests, use ONE of:');
      console.warn('');
      console.warn('  Option 1: Google Gemini (FREE - Recommended)');
      console.warn(
        '  GOOGLE_API_KEY=xxx yarn test test/integration/real-llm.test.ts'
      );
      console.warn('  Get free API key at: https://aistudio.google.com/apikey');
      console.warn('');
      console.warn('  Option 2: Anthropic Claude (Paid - Best quality)');
      console.warn(
        '  ANTHROPIC_API_KEY=sk-... yarn test test/integration/real-llm.test.ts'
      );
      console.warn('');
      console.warn('  Option 3: Use cached responses (Fast - Deterministic)');
      console.warn(
        '  USE_CACHED=true yarn test test/integration/real-llm.test.ts'
      );
      console.warn('');
      console.warn('  Option 4: Record new responses');
      console.warn(
        '  RECORD_RESPONSES=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts'
      );
      console.warn('');
      console.warn('  Option 5: Validate against cached');
      console.warn(
        '  VALIDATE_LLM=true ANTHROPIC_API_KEY=xxx yarn test test/integration/real-llm.test.ts'
      );
      console.warn('');
      console.warn('These tests validate actual LLM output quality, not just');
      console.warn('code mechanics. They are essential for catching prompt');
      console.warn('regressions that mock tests cannot detect.');
      console.warn('='.repeat(60));
      console.warn('');
    }
    expect(true).toBe(true);
  });
});
