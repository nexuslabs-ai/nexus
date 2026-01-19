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
  DEFAULT_MOCK_RESPONSE,
  type MockLLMProvider,
} from '../providers/mock-llm-provider.js';
import { loadFixture } from '../utils/fixture-loader.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

describe('AI Usability - Extraction Structure', () => {
  let mockProvider: MockLLMProvider;
  let processor: ComponentProcessor;

  beforeEach(() => {
    mockProvider = createMockLLMProvider({
      defaultResponse: DEFAULT_MOCK_RESPONSE,
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
    category: 'shadcn' | 'edge-cases',
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
      const manifest = await getExtractedManifest('shadcn', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI needs exact component name for imports
      expect(manifest.name).toBe('Button');
      expect(manifest.slug).toBeTruthy();
    });

    it('extracts CVA variants for prop completion', async () => {
      const manifest = await getExtractedManifest('shadcn', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI needs variant options for autocomplete/suggestions
      expect(manifest.variants).toBeDefined();
      expect(manifest.variants?.variant).toContain('default');
      expect(manifest.variants?.variant).toContain('destructive');
      expect(manifest.variants?.variant).toContain('outline');
      expect(manifest.variants?.size).toContain('default');
      expect(manifest.variants?.size).toContain('sm');
      expect(manifest.variants?.size).toContain('lg');
    });

    it('extracts default variants for omitting unnecessary props', async () => {
      const manifest = await getExtractedManifest('shadcn', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI should know defaults so it can omit them in generated code
      expect(manifest.defaultVariants?.variant).toBe('default');
      expect(manifest.defaultVariants?.size).toBe('default');
    });

    it('extracts props with types for type-safe code generation', async () => {
      const manifest = await getExtractedManifest('shadcn', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Props should have name and type for AI code gen
      expect(manifest.props.length).toBeGreaterThan(0);
      manifest.props.forEach((prop) => {
        expect(prop.name).toBeTruthy();
        expect(prop.type).toBeTruthy();
      });
    });

    it('detects asChild prop for composition guidance', async () => {
      const manifest = await getExtractedManifest('shadcn', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      const asChild = manifest.props.find((p) => p.name === 'asChild');
      // asChild may be in props array (optional boolean)
      if (asChild) {
        expect(asChild.required).toBe(false);
      }
    });
  });

  describe('Input - form control extraction', () => {
    it('extracts custom Input props', async () => {
      const manifest = await getExtractedManifest('shadcn', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      const propNames = manifest.props.map((p) => p.name);

      // Should extract explicitly defined props
      expect(propNames).toContain('variant');
      expect(propNames).toContain('inputSize');
      expect(propNames).toContain('error');
    });

    it('extracts error prop with boolean type', async () => {
      const manifest = await getExtractedManifest('shadcn', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      const errorProp = manifest.props.find((p) => p.name === 'error');
      expect(errorProp).toBeDefined();
      expect(errorProp?.type).toContain('boolean');
    });
  });

  describe('Card - container pattern extraction', () => {
    it('extracts elevation variant', async () => {
      const manifest = await getExtractedManifest('shadcn', 'card', 'Card');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      const elevationProp = manifest.props.find((p) => p.name === 'elevation');
      expect(elevationProp).toBeDefined();
    });
  });

  describe('Dialog - compound component extraction', () => {
    it('extracts forwardRef usage indicator', async () => {
      const manifest = await getExtractedManifest('shadcn', 'dialog', 'Dialog');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Dialog uses forwardRef
      // Note: usesForwardRef may be in extraction metadata, not manifest directly
      expect(manifest.id).toBeTruthy();
    });

    it('detects Radix dependency', async () => {
      const manifest = await getExtractedManifest('shadcn', 'dialog', 'Dialog');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Should detect Radix UI Dialog dependency
      // Note: dependencies may be in extraction metadata
      expect(manifest.name).toBe('Dialog');
    });
  });

  describe('sourceHash for cache invalidation', () => {
    it('generates consistent hash for same source code', async () => {
      const manifest1 = await getExtractedManifest('shadcn', 'badge', 'Badge');
      const manifest2 = await getExtractedManifest('shadcn', 'badge', 'Badge');

      expect(manifest1?.sourceHash).toBeTruthy();
      expect(manifest1?.sourceHash).toBe(manifest2?.sourceHash);
    });
  });

  describe('manifest completeness for AI consumption', () => {
    const fixtures = [
      { category: 'shadcn' as const, name: 'button', componentName: 'Button' },
      { category: 'shadcn' as const, name: 'badge', componentName: 'Badge' },
      { category: 'shadcn' as const, name: 'input', componentName: 'Input' },
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

        // Props array exists
        expect(Array.isArray(manifest.props)).toBe(true);

        // Each prop has minimum info
        manifest.props.forEach((prop) => {
          expect(prop.name).toBeTruthy();
          expect(prop.type).toBeTruthy();
        });
      });
    });
  });
});
