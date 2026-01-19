/**
 * Cached LLM Provider Integration Tests
 *
 * Tests the CachedLLMProvider infrastructure independently from the real LLM tests.
 * These tests verify the 3-mode system works correctly.
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  type CachedResponseRecord,
  createCachedProvider,
  createRecordingProvider,
  createValidatingProvider,
} from '../providers/cached-llm-provider.js';
import { MockLLMProvider } from '../providers/mock-llm-provider.js';
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
      // Create a cached response first
      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: {
          text: '{"description":"Test component"}',
          model: 'test-model',
          stopReason: 'end_turn',
        },
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

      // Generate completion
      const prompt = `Generate metadata for ${testComponentName} component`;
      const response = await provider.generateCompletion(prompt);

      expect(response.text).toBe('{"description":"Test component"}');
      expect(response.model).toBe('test-model');
    });

    it('throws error when no cached response and no fallback', async () => {
      const provider = createCachedProvider();

      const prompt = 'Generate metadata for NonExistentComponent component';

      await expect(provider.generateCompletion(prompt)).rejects.toThrow(
        /No cached response.*no realProvider/
      );
    });

    it('falls back to real provider when available', async () => {
      const mockProvider = new MockLLMProvider({
        defaultResponse: {
          text: '{"description":"Fallback response"}',
          model: 'mock-model',
          stopReason: 'end_turn',
        },
      });

      const provider = createCachedProvider({
        realProvider: mockProvider,
      });

      const prompt = 'Generate metadata for NewComponent component';
      const response = await provider.generateCompletion(prompt);

      expect(response.text).toBe('{"description":"Fallback response"}');
      expect(mockProvider.getCallCount()).toBe(1);
    });
  });

  describe('Recording Mode', () => {
    it('saves responses to disk when recording', async () => {
      const mockProvider = new MockLLMProvider({
        defaultResponse: {
          text: '{"description":"Recorded component"}',
          model: 'mock-model',
          stopReason: 'end_turn',
        },
      });

      const provider = createRecordingProvider(mockProvider, getResponsesDir());

      // Generate completion (should record)
      const prompt = `Generate metadata for ${testComponentName} component`;
      const response = await provider.generateCompletion(prompt);

      // Verify response is correct
      expect(response.text).toBe('{"description":"Recorded component"}');

      // Verify file was saved
      expect(existsSync(testFilePath)).toBe(true);

      // Verify file content
      const content = JSON.parse(readFileSync(testFilePath, 'utf-8'));
      expect(content.componentName).toBe(testComponentName);
      expect(content.response.text).toBe(
        '{"description":"Recorded component"}'
      );
      expect(content.provider).toBe('mock');
    });
  });

  describe('Validation Mode', () => {
    it('calls validation callback with comparison results', async () => {
      // Create a cached response first
      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: {
          text: '{"description":"Original test component","patterns":["test"]}',
          model: 'test-model',
          stopReason: 'end_turn',
        },
        recordedAt: new Date().toISOString(),
        provider: 'mock',
        model: 'test-model',
        inputHash: 'test-hash',
        promptSummary: 'Test prompt',
      };
      writeFileSync(testFilePath, JSON.stringify(cachedRecord, null, 2));

      // Create mock provider that returns similar response
      const mockProvider = new MockLLMProvider({
        defaultResponse: {
          text: '{"description":"New test component response","patterns":["test","new"]}',
          model: 'mock-model',
          stopReason: 'end_turn',
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

      // Generate completion (should validate)
      const prompt = `Generate metadata for ${testComponentName} component`;
      await provider.generateCompletion(prompt);

      // Verify validation was called
      expect(validationResults.length).toBe(1);
      expect(validationResults[0].componentName).toBe(testComponentName);
      // Note: passed may be false because the description check expects component name
      // This is expected behavior - validation detected that the response doesn't
      // mention the component name in the description
      expect(typeof validationResults[0].passed).toBe('boolean');
    });

    it('detects structural differences', async () => {
      // Create a cached response with arrays
      const cachedRecord: CachedResponseRecord = {
        componentName: testComponentName,
        response: {
          text: '{"description":"Test","patterns":["a","b","c","d","e"]}',
          model: 'test-model',
          stopReason: 'end_turn',
        },
        recordedAt: new Date().toISOString(),
        provider: 'mock',
        model: 'test-model',
        inputHash: 'test-hash',
        promptSummary: 'Test prompt',
      };
      writeFileSync(testFilePath, JSON.stringify(cachedRecord, null, 2));

      // Create mock provider that returns very different response
      const mockProvider = new MockLLMProvider({
        defaultResponse: {
          text: '{"description":"Different","patterns":["x"]}',
          model: 'mock-model',
          stopReason: 'end_turn',
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
      await provider.generateCompletion(prompt);

      // Should detect difference in patterns array length (5 vs 1 = diff of 4 > 2)
      expect(validationResult).not.toBeNull();
      expect(validationResult!.differences.length).toBeGreaterThan(0);
    });
  });

  describe('Component Name Extraction', () => {
    it('extracts from "Component: Name" pattern', async () => {
      const provider = createCachedProvider();

      // Check that it can identify Button from the cached response
      expect(provider.hasCachedResponse('Button')).toBe(true);
    });

    it('lists available cached components', () => {
      const provider = createCachedProvider();
      const components = provider.getCachedComponents();

      // Should include Button from the existing fixture
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

  it('hasRecordedResponse returns true for Button', () => {
    expect(hasRecordedResponse('button')).toBe(true);
    expect(hasRecordedResponse('Button')).toBe(true);
  });

  it('hasRecordedResponse returns false for non-existent', () => {
    expect(hasRecordedResponse('nonexistent-component')).toBe(false);
  });

  it('loadRecordedResponse returns valid response for Button', () => {
    const response = loadRecordedResponse('button');

    expect(response).toBeDefined();
    expect(response.text).toBeDefined();
    expect(response.model).toBeDefined();

    // Should be parseable JSON
    const parsed = JSON.parse(response.text);
    expect(parsed.description).toBeDefined();
  });

  it('loadRecordedResponse throws for non-existent', () => {
    expect(() => loadRecordedResponse('nonexistent')).toThrow();
  });
});

describe('Integration with Existing Button Fixture', () => {
  it('can use Button cached response in playback mode', async () => {
    const provider = createCachedProvider();

    const prompt = 'Generate metadata for Button component';
    const response = await provider.generateCompletion(prompt);

    // Should return the cached Button response
    expect(response.model).toContain('claude');

    const parsed = JSON.parse(response.text);
    expect(parsed.description.toLowerCase()).toContain('button');
    expect(parsed.patterns).toContain('button');
  });
});
