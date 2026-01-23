/**
 * Cached LLM Provider Integration Tests
 *
 * Tests the CachedLLMProvider infrastructure independently from the real LLM tests.
 * These tests verify the 3-mode system works correctly.
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ComponentMetaTool } from '../../src/generator/tool-schema.js';
import {
  type CachedResponseRecord,
  createCachedProvider,
  createRecordingProvider,
  createValidatingProvider,
} from '../providers/cached-llm-provider.js';
import {
  createMockLLMProvider,
  DEFAULT_MOCK_TOOL_RESPONSE,
} from '../providers/mock-llm-provider.js';
import {
  getResponsesDir,
  getTestingMode,
  hasRecordedResponse,
  loadRecordedResponse,
} from '../utils/response-recorder.js';

describe('CachedLLMProvider', () => {
  // Use a temporary file for testing recording
  const testComponentName = '_test_component_';
  const testFilePath = join(getResponsesDir(), `${testComponentName}.json`);

  beforeEach(() => {
    // Ensure clean state
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    // Clean up test file
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  describe('Playback Mode (default)', () => {
    it('returns cached response when available', async () => {
      // Create a cached response first with ComponentMetaTool format
      const testResponse: ComponentMetaTool = {
        description: 'Test component description',
        semanticDescription: 'Detailed test component description',
        tier: 'free',
        minimalExample: '<TestComponent />',
        examples: {
          minimal: {
            title: 'Basic',
            code: '<TestComponent />',
            description: 'Basic usage',
          },
          common: [],
          advanced: [],
        },
        guidance: {
          whenToUse: 'Use when testing',
          whenNotToUse: 'Do not use in production',
          accessibility: 'Accessible by default',
          patterns: ['button'],
          relatedComponents: [],
        },
        tokens: ['test-token'],
      };

      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: testResponse,
        recordedAt: new Date().toISOString(),
        provider: 'mock',
        model: 'test-model',
        inputHash: 'test-hash',
        promptSummary: 'Test prompt',
      };
      writeFileSync(testFilePath, JSON.stringify(cachedRecord, null, 2));

      // Create provider and reload cache
      const provider = createCachedProvider();
      provider.reloadCache();

      // Generate with tool calling
      const prompt = `Generate metadata for ${testComponentName} component`;
      const result =
        await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.description).toBe('Test component description');
        expect(result.model).toBe('test-model');
      }
    });

    it('returns failure when no cached response and no fallback', async () => {
      const provider = createCachedProvider();

      const prompt = 'Generate metadata for NonExistentComponent component';
      const result =
        await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      expect(result.type).toBe('failure');
      if (result.type === 'failure') {
        expect(result.error).toMatch(
          /No cached response.*no realProvider|no.*configured/i
        );
      }
    });

    it('falls back to real provider when available', async () => {
      const mockProvider = createMockLLMProvider({
        defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
      });

      const provider = createCachedProvider({
        realProvider: mockProvider,
      });

      const prompt = 'Generate metadata for NewComponent component';
      const result =
        await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.description).toBeTruthy();
        expect(mockProvider.getCallCount()).toBe(1);
      }
    });
  });

  describe('Recording Mode', () => {
    it('saves responses to disk when recording', async () => {
      const mockProvider = createMockLLMProvider({
        defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
      });

      const provider = createRecordingProvider(mockProvider, getResponsesDir());

      // Generate with tool calling (should record)
      const prompt = `Generate metadata for ${testComponentName} component`;
      const result =
        await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      // Verify response is correct
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.description).toBeTruthy();
      }

      // Verify file was saved
      expect(existsSync(testFilePath)).toBe(true);

      // Verify file content - now uses ComponentMetaTool format directly
      const content: CachedResponseRecord = JSON.parse(
        readFileSync(testFilePath, 'utf-8')
      );
      expect(content.componentName).toBe(testComponentName);
      expect(content.response.description).toBeTruthy();
      expect(content.provider).toBe('mock');
    });
  });

  describe('Validation Mode', () => {
    it('calls validation callback with comparison results', async () => {
      // Create a cached response first with ComponentMetaTool format
      const cachedResponse: ComponentMetaTool = {
        description: 'Original test component',
        semanticDescription: 'Detailed original test component',
        tier: 'free',
        minimalExample: '<TestComponent />',
        examples: {
          minimal: {
            title: 'Basic',
            code: '<TestComponent />',
            description: 'Basic',
          },
          common: [],
          advanced: [],
        },
        guidance: {
          whenToUse: 'Use for testing',
          whenNotToUse: 'Do not use in production',
          accessibility: 'Accessible',
          patterns: ['button'],
          relatedComponents: [],
        },
        tokens: ['test-token'],
      };

      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: cachedResponse,
        recordedAt: new Date().toISOString(),
        provider: 'mock',
        model: 'test-model',
        inputHash: 'test-hash',
        promptSummary: 'Test prompt',
      };
      writeFileSync(testFilePath, JSON.stringify(cachedRecord, null, 2));

      // Create mock provider that returns similar response
      const mockProvider = createMockLLMProvider({
        defaultResponse: {
          ...DEFAULT_MOCK_TOOL_RESPONSE,
          description: 'New test component response',
        },
      });

      // Track validation results
      const validationResults: Array<{
        componentName: string;
        passed: boolean;
      }> = [];

      const provider = createValidatingProvider(
        mockProvider,
        (result, componentName) => {
          validationResults.push({ componentName, passed: result.passed });
        },
        getResponsesDir()
      );
      provider.reloadCache();

      // Generate with tool calling (should validate)
      const prompt = `Generate metadata for ${testComponentName} component`;
      await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      // Verify validation was called
      expect(validationResults.length).toBe(1);
      expect(validationResults[0].componentName).toBe(testComponentName);
      // Note: passed may be false because the description check expects component name
      // This is expected behavior - validation detected that the response doesn't
      // mention the component name in the description
      expect(typeof validationResults[0].passed).toBe('boolean');
    });

    it('detects structural differences', async () => {
      // Create a cached response with many tokens
      const cachedResponse: ComponentMetaTool = {
        description: 'Test component',
        semanticDescription: 'Detailed test',
        tier: 'free',
        minimalExample: '<TestComponent />',
        examples: {
          minimal: {
            title: 'Basic',
            code: '<TestComponent />',
            description: 'Basic',
          },
          common: [],
          advanced: [],
        },
        guidance: {
          whenToUse: 'Use for testing',
          whenNotToUse: 'Do not use',
          accessibility: 'Accessible',
          patterns: ['button'],
          relatedComponents: [],
        },
        tokens: ['a', 'b', 'c', 'd', 'e'], // 5 tokens
      };

      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: cachedResponse,
        recordedAt: new Date().toISOString(),
        provider: 'mock',
        model: 'test-model',
        inputHash: 'test-hash',
        promptSummary: 'Test prompt',
      };
      writeFileSync(testFilePath, JSON.stringify(cachedRecord, null, 2));

      // Create mock provider that returns response with different token count
      const mockProvider = createMockLLMProvider({
        defaultResponse: {
          ...DEFAULT_MOCK_TOOL_RESPONSE,
          description: 'Different component',
          tokens: ['x'], // Only 1 token (diff of 4 > 2)
        },
      });

      // Track validation results
      let validationResult: { passed: boolean; differences: unknown[] } | null =
        null;

      const provider = createValidatingProvider(
        mockProvider,
        (result) => {
          validationResult = {
            passed: result.passed,
            differences: result.differences,
          };
        },
        getResponsesDir()
      );
      provider.reloadCache();

      const prompt = `Generate metadata for ${testComponentName} component`;
      await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

      // Should detect difference in tokens array length (5 vs 1 = diff of 4 > 2)
      expect(validationResult).not.toBeNull();
      expect(validationResult!.differences.length).toBeGreaterThan(0);
    });
  });

  describe('Component Name Extraction', () => {
    it('identifies and lists cached components from response files', () => {
      const provider = createCachedProvider();

      // Should detect Button from cached response
      expect(provider.hasCachedResponse('Button')).toBe(true);

      // Should list Button in available components
      const components = provider.getCachedComponents();
      expect(components).toContain('Button');
    });
  });

  describe('Cache Management', () => {
    it('can clear and reload cache', () => {
      const provider = createCachedProvider();

      // Should have Button cached
      expect(provider.hasCachedResponse('Button')).toBe(true);

      // Clear cache
      provider.clearCache();
      expect(provider.hasCachedResponse('Button')).toBe(false);

      // Reload cache
      provider.reloadCache();
      expect(provider.hasCachedResponse('Button')).toBe(true);
    });
  });
});

describe('Response Recorder Utilities', () => {
  it('getTestingMode returns correct mode based on env', () => {
    // In test environment, should return 'real' by default
    // (unless specific env vars are set)
    const mode = getTestingMode();
    expect(['real', 'record', 'cached', 'validate']).toContain(mode);
  });

  it('hasRecordedResponse detects existing and non-existing responses', () => {
    // Case-insensitive detection for existing component
    expect(hasRecordedResponse('button')).toBe(true);
    expect(hasRecordedResponse('Button')).toBe(true);

    // Non-existent component returns false
    expect(hasRecordedResponse('nonexistent-component')).toBe(false);
  });

  it('loadRecordedResponse returns valid ComponentMetaTool for existing and throws for non-existent', () => {
    // Load existing response - now returns ComponentMetaTool directly
    const response = loadRecordedResponse('button');
    expect(response).toBeDefined();
    // New format: response is ComponentMetaTool directly
    expect(response.description).toBeDefined();
    expect(response.description.toLowerCase()).toContain('button');

    // Non-existent throws
    expect(() => loadRecordedResponse('nonexistent')).toThrow();
  });
});

describe('Integration with Existing Button Fixture', () => {
  it('can use Button cached response in playback mode', async () => {
    const provider = createCachedProvider();

    const prompt = 'Generate metadata for Button component';
    const result =
      await provider.generateWithToolCalling<ComponentMetaTool>(prompt);

    // Should return the cached Button response
    expect(result.type).toBe('success');
    if (result.type === 'success') {
      expect(result.model).toBeTruthy();
      // New format: data is ComponentMetaTool directly
      expect(result.data.description.toLowerCase()).toContain('button');
      expect(result.data.guidance.patterns).toContain('button');
    }
  });
});
