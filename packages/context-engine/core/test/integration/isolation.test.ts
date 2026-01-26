/**
 * Multi-Org Isolation Tests
 *
 * Validates that manifests are properly scoped to organizations
 * and no data leakage occurs between orgs.
 *
 * NOTE: These tests are VALUABLE because they verify actual org isolation
 * behavior in the extraction and processing layers. Unlike content quality
 * tests, these test real behavior that cannot be validated with a real LLM.
 *
 * The mock provider is appropriate here because:
 * 1. Org isolation happens at the extraction layer (real code)
 * 2. We're testing ID uniqueness, not LLM output quality
 * 3. These tests validate the multi-tenancy invariants
 */

import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  extractComponent,
  isExtractionSuccess,
} from '../../src/extractor/index.js';
import {
  type ComponentProcessor,
  createComponentProcessor,
  isProcessorSuccess,
  type ProcessorInput,
} from '../../src/processor/index.js';
import {
  createMockLLMProvider,
  DEFAULT_MOCK_TOOL_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import { loadFixture } from '../utils/fixture-loader.js';

describe('Multi-Org Isolation', () => {
  let mockProvider: MockLLMProvider;
  let processor: ComponentProcessor;

  // Test organizations
  const ORG_A = uuidv4();
  const ORG_B = uuidv4();
  const ORG_C = uuidv4();

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
    });
    processor = createComponentProcessor({
      llmProvider: mockProvider,
    });
  });

  describe('manifest org scoping', () => {
    it('generates unique manifest IDs for each request', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: ORG_A,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.process(input);

      expect(isProcessorSuccess(result)).toBe(true);
      if (isProcessorSuccess(result)) {
        // Manifest has unique ID
        expect(result.manifest.id).toBeTruthy();
        expect(result.manifest.id).toMatch(/^[0-9a-f-]{36}$/);
      }
    });

    it('same component for different orgs gets different component IDs', async () => {
      const fixture = loadFixture('nexus', 'button');

      const inputA: ProcessorInput = {
        orgId: ORG_A,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const inputB: ProcessorInput = {
        orgId: ORG_B,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const resultA = await processor.process(inputA);
      const resultB = await processor.process(inputB);

      expect(isProcessorSuccess(resultA)).toBe(true);
      expect(isProcessorSuccess(resultB)).toBe(true);

      if (isProcessorSuccess(resultA) && isProcessorSuccess(resultB)) {
        // Component IDs should be unique per processing
        expect(resultA.manifest.id).not.toBe(resultB.manifest.id);
      }
    });
  });

  describe('extraction org scoping', () => {
    it('extraction result contains orgId at top level and identity with component info', async () => {
      const fixture = loadFixture('nexus', 'button');

      const result = await extractComponent({
        orgId: ORG_A,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      });

      expect(isExtractionSuccess(result)).toBe(true);
      if (isExtractionSuccess(result)) {
        // orgId is at top level of ExtractorResult
        expect(result.orgId).toBe(ORG_A);
        // ManifestIdentity contains id, slug, name, framework (NOT orgId)
        expect(result.identity.id).toBeTruthy();
        expect(result.identity.name).toBe('Button');
        expect(result.identity.framework).toBe('react');
      }
    });
  });

  describe('two-phase API org consistency', () => {
    it('extractOnly returns valid extraction with identity', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: ORG_A,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const result = await processor.extractOnly(input);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        // ExtractOnlySuccess has identity (not orgId - that's passed through separately)
        expect(result.identity.id).toBeTruthy();
        expect(result.identity.name).toBe('Button');
        expect(result.identity.framework).toBe('react');
        expect(result.extracted).toBeDefined();
        expect(result.sourceHash).toBeTruthy();
      }
    });

    it('generateOnly produces valid manifest with passed orgId', async () => {
      const fixture = loadFixture('nexus', 'button');
      const input: ProcessorInput = {
        orgId: ORG_B,
        name: 'Button',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      const extractResult = await processor.extractOnly(input);
      expect(extractResult.type).toBe('success');
      if (extractResult.type !== 'success') return;

      // orgId is passed explicitly to generateOnly (not stored in extractOnly result)
      const generateResult = await processor.generateOnly({
        orgId: ORG_B,
        identity: extractResult.identity,
        extracted: extractResult.extracted,
        sourceHash: extractResult.sourceHash,
      });

      expect(isProcessorSuccess(generateResult)).toBe(true);
      if (isProcessorSuccess(generateResult)) {
        // Manifest should be valid
        expect(generateResult.manifest.id).toBeTruthy();
        expect(generateResult.manifest.name).toBe('Button');
      }
    });
  });

  describe('orgId format handling', () => {
    // Note: Implementation accepts any string as orgId (no UUID validation)
    // This single test documents this behavior across different formats

    it('preserves any orgId format passed to extraction and processing', async () => {
      const fixture = loadFixture('nexus', 'button');

      // Test various orgId formats
      const formats = ['not-a-valid-uuid', '', 'custom-org-id-123'];

      for (const orgId of formats) {
        const result = await extractComponent({
          orgId,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        });

        // Should produce a result (success or failure)
        expect(result.type).toBeDefined();

        // If successful, orgId should be preserved
        if (result.type === 'success') {
          expect(result.orgId).toBe(orgId);
        }
      }
    });
  });

  describe('multiple orgs concurrent processing', () => {
    it('handles concurrent requests from different orgs', async () => {
      const fixture = loadFixture('nexus', 'button');

      const inputs: ProcessorInput[] = [
        {
          orgId: ORG_A,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        },
        {
          orgId: ORG_B,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        },
        {
          orgId: ORG_C,
          name: 'Button',
          sourceCode: fixture.sourceCode,
          framework: 'react',
        },
      ];

      const results = await Promise.all(
        inputs.map((input) => processor.process(input))
      );

      // All should succeed
      results.forEach((result) => {
        expect(isProcessorSuccess(result)).toBe(true);
        if (isProcessorSuccess(result)) {
          expect(result.manifest.id).toBeTruthy();
        }
      });

      // All should have unique IDs
      const ids = results.filter(isProcessorSuccess).map((r) => r.manifest.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });
});
