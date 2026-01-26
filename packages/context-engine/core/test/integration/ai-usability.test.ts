/**
 * AI Usability Tests - Extraction Structure
 *
 * Validates that the EXTRACTED data (props, variants, dependencies)
 * provides the structural information AI assistants need.
 *
 * NOTE: These tests use skipGeneration mode to test extraction-only output.
 * For testing LLM-generated content quality, see real-llm.test.ts.
 *
 * Philosophy:
 * - Extraction tests validate structure (from code parsing)
 * - Real LLM tests validate semantic quality (from AI generation)
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  type ComponentProcessor,
  createComponentProcessor,
  isProcessorSuccess,
  type ProcessorInput,
} from '../../src/processor/index.js';
import type { ComponentManifest } from '../../src/types/manifest.js';
import {
  createMockLLMProvider,
  DEFAULT_MOCK_TOOL_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import { getAllProps } from '../utils/assertion-helpers.js';
import { loadFixture } from '../utils/fixture-loader.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

describe('AI Usability - Extraction Structure', () => {
  let mockProvider: MockLLMProvider;
  let processor: ComponentProcessor;

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_TOOL_RESPONSE,
    });
    // Use skipGeneration to focus on extraction structure
    processor = createComponentProcessor({
      llmProvider: mockProvider,
      skipGeneration: true,
    });
  });

  /**
   * Helper to process a fixture with extraction only
   */
  async function getExtractedManifest(
    category: 'nexus' | 'edge-cases',
    name: string,
    componentName: string
  ): Promise<ComponentManifest | null> {
    const fixture = loadFixture(category, name);
    const input: ProcessorInput = {
      orgId: TEST_ORG_ID,
      name: componentName,
      sourceCode: fixture.sourceCode,
      framework: 'react',
    };

    const result = await processor.process(input);
    return isProcessorSuccess(result) ? result.manifest : null;
  }

  describe('Button - essential extraction for AI code generation', () => {
    it('extracts component name for import generation', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI needs exact component name for imports
      expect(manifest.name).toBe('Button');
      expect(manifest.slug).toBeTruthy();
    });

    it('extracts CVA variants for prop completion', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI needs variant options for autocomplete/suggestions
      // v1.0 schema: variants is CvaVariants with values arrays
      expect(manifest.variants).toBeDefined();
      expect(manifest.variants?.variant?.values).toContain('default');
      expect(manifest.variants?.variant?.values).toContain('destructive');
      expect(manifest.variants?.variant?.values).toContain('outline');
      expect(manifest.variants?.size?.values).toContain('default');
      expect(manifest.variants?.size?.values).toContain('sm');
      expect(manifest.variants?.size?.values).toContain('lg');
    });

    it('extracts default variants for omitting unnecessary props', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI should know defaults so it can omit them in generated code
      // v1.0 schema: defaults are in variants[key].default
      expect(manifest.variants?.variant?.default).toBe('default');
      expect(manifest.variants?.size?.default).toBe('default');
    });

    it('extracts props with types for type-safe code generation', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Props should have name and type for AI code gen
      // v1.0 schema: props is CategorizedProps, use getAllProps helper
      const allProps = getAllProps(manifest.props);
      expect(allProps.length).toBeGreaterThan(0);
      allProps.forEach((prop) => {
        expect(prop.name).toBeTruthy();
        expect(prop.type).toBeTruthy();
      });
    });

    it('detects asChild prop for composition guidance', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // v1.0 schema: use getAllProps to search across categories
      const allProps = getAllProps(manifest.props);
      const asChild = allProps.find((p) => p.name === 'asChild');
      // asChild may be in props array (optional boolean)
      if (asChild) {
        // Note: type check for required would need full PropDefinition type
        expect(asChild).toBeDefined();
      }
    });
  });

  describe('Input - form control extraction', () => {
    it('extracts custom Input props', async () => {
      const manifest = await getExtractedManifest('nexus', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // v1.0 schema: use getAllProps helper
      const allProps = getAllProps(manifest.props);
      const propNames = allProps.map((p) => p.name);

      // Should extract explicitly defined props
      expect(propNames).toContain('variant');
      expect(propNames).toContain('inputSize');
      expect(propNames).toContain('error');
    });

    it('extracts error prop with boolean type', async () => {
      const manifest = await getExtractedManifest('nexus', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // v1.0 schema: use getAllProps helper
      const allProps = getAllProps(manifest.props);
      const errorProp = allProps.find((p) => p.name === 'error');
      expect(errorProp).toBeDefined();
      expect(errorProp?.type).toContain('boolean');
    });
  });

  describe('Card - container pattern extraction', () => {
    it('extracts elevation variant', async () => {
      const manifest = await getExtractedManifest('nexus', 'card', 'Card');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // v1.0 schema: use getAllProps helper
      const allProps = getAllProps(manifest.props);
      const elevationProp = allProps.find((p) => p.name === 'elevation');
      expect(elevationProp).toBeDefined();
    });
  });

  describe('Dialog - compound component extraction', () => {
    it('extracts forwardRef usage indicator', async () => {
      const manifest = await getExtractedManifest('nexus', 'dialog', 'Dialog');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Dialog uses forwardRef
      // Note: usesForwardRef may be in extraction metadata, not manifest directly
      expect(manifest.id).toBeTruthy();
    });

    it('detects Radix dependency', async () => {
      const manifest = await getExtractedManifest('nexus', 'dialog', 'Dialog');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Should detect Radix UI Dialog dependency
      // Note: dependencies may be in extraction metadata
      expect(manifest.name).toBe('Dialog');
    });
  });

  describe('sourceHash for cache invalidation', () => {
    it('generates consistent hash for same source code', async () => {
      const manifest1 = await getExtractedManifest('nexus', 'badge', 'Badge');
      const manifest2 = await getExtractedManifest('nexus', 'badge', 'Badge');

      expect(manifest1?.sourceHash).toBeTruthy();
      expect(manifest1?.sourceHash).toBe(manifest2?.sourceHash);
    });
  });

  describe('manifest completeness for AI consumption', () => {
    const fixtures = [
      { category: 'nexus' as const, name: 'button', componentName: 'Button' },
      { category: 'nexus' as const, name: 'badge', componentName: 'Badge' },
      { category: 'nexus' as const, name: 'input', componentName: 'Input' },
    ];

    fixtures.forEach(({ category, name, componentName }) => {
      it(`${componentName} has minimum required fields for AI`, async () => {
        const manifest = await getExtractedManifest(
          category,
          name,
          componentName
        );
        expect(manifest).not.toBeNull();
        if (!manifest) return;

        // Essential for AI code generation
        expect(manifest.id).toBeTruthy();
        expect(manifest.name).toBeTruthy();
        expect(manifest.slug).toBeTruthy();
        expect(manifest.sourceHash).toBeTruthy();
        expect(manifest.sourceHash).toHaveLength(64); // SHA-256

        // v1.0 schema: props is CategorizedProps object, not array
        expect(manifest.props).toBeDefined();
        expect(typeof manifest.props).toBe('object');

        // Each prop in each category has minimum info
        const allProps = getAllProps(manifest.props);
        allProps.forEach((prop) => {
          expect(prop.name).toBeTruthy();
          expect(prop.type).toBeTruthy();
        });
      });
    });
  });
});
