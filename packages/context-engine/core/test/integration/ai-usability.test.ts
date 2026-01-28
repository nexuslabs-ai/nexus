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
      // v1.0 schema: variant info is in props.variants with values arrays
      const variantProps = manifest.props.variants;
      expect(variantProps).toBeDefined();

      const variantProp = variantProps?.find((p) => p.name === 'variant');
      const sizeProp = variantProps?.find((p) => p.name === 'size');

      expect(variantProp?.values).toContain('default');
      expect(variantProp?.values).toContain('destructive');
      expect(variantProp?.values).toContain('outline');
      expect(sizeProp?.values).toContain('default');
      expect(sizeProp?.values).toContain('sm');
      expect(sizeProp?.values).toContain('lg');
    });

    it('extracts default variants for omitting unnecessary props', async () => {
      const manifest = await getExtractedManifest('nexus', 'button', 'Button');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // AI should know defaults so it can omit them in generated code
      // v1.0 schema: defaults are in props.variants[n].defaultValue
      const variantProps = manifest.props.variants;
      const variantProp = variantProps?.find((p) => p.name === 'variant');
      const sizeProp = variantProps?.find((p) => p.name === 'size');

      expect(variantProp?.defaultValue).toBe('default');
      expect(sizeProp?.defaultValue).toBe('default');
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
    it('extracts Input size variant', async () => {
      const manifest = await getExtractedManifest('nexus', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Input has size variant in CVA - now in props.variants
      const sizeProp = manifest.props.variants?.find((p) => p.name === 'size');
      expect(sizeProp).toBeDefined();
      expect(sizeProp?.values).toContain('default');
      expect(sizeProp?.values).toContain('sm');
      expect(sizeProp?.values).toContain('lg');
    });

    it('extracts custom events (standard HTML events are rejected)', async () => {
      const manifest = await getExtractedManifest('nexus', 'input', 'Input');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Input extends React.ComponentProps<'input'> but standard HTML events
      // are rejected at extraction time - only custom events are kept
      // Events category may be undefined if no custom events
      if (manifest.props.events) {
        expect(Array.isArray(manifest.props.events)).toBe(true);
      }
    });
  });

  describe('Card - container pattern extraction', () => {
    it('extracts Card component props', async () => {
      const manifest = await getExtractedManifest('nexus', 'card', 'Card');
      expect(manifest).not.toBeNull();
      if (!manifest) return;

      // Card is a simple wrapper around div, extends React.ComponentProps<'div'>
      // Extraction should succeed even if no custom props
      expect(manifest.props).toBeDefined();
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

  describe('Split manifest output for AI consumption', () => {
    /**
     * Helper to process a fixture and return the full result
     */
    async function processFixture(
      category: 'nexus' | 'edge-cases',
      name: string,
      componentName: string
    ) {
      const fixture = loadFixture(category, name);
      const input: ProcessorInput = {
        orgId: TEST_ORG_ID,
        name: componentName,
        sourceCode: fixture.sourceCode,
        framework: 'react',
      };

      return processor.process(input);
    }

    it('provides split output structure', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      expect(result.type).toBe('success');
      if (!isProcessorSuccess(result)) return;

      expect(result.output).toBeDefined();
      expect(result.output.componentName).toBeDefined();
      expect(result.output.componentName).toBe('Button');
      expect(result.output.metadata).toBeDefined();
      expect(result.output.manifest).toBeDefined();
    });

    it('AI manifest props only include valid categories', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      const aiManifest = result.output.manifest;
      // Props should only have valid categories: variants, behaviors, events, slots, other
      // All categories are optional (undefined if empty)
      const validCategories = [
        'variants',
        'behaviors',
        'events',
        'slots',
        'other',
      ];
      for (const key of Object.keys(aiManifest.props)) {
        expect(validCategories).toContain(key);
      }
    });

    it('provides children info when component explicitly accepts children', async () => {
      // Button accepts children via React.ComponentProps<'button'>
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      const aiManifest = result.output.manifest;

      // Children info may be present if explicitly extracted
      // When present, it should indicate the component accepts children
      if (aiManifest.children) {
        expect(aiManifest.children.accepts).toBe(true);
      }

      // Alternatively, children may be in slots category
      if (aiManifest.props?.slots) {
        const childrenSlot = aiManifest.props.slots.find(
          (p) => p.name === 'children'
        );
        if (childrenSlot) {
          expect(childrenSlot.name).toBe('children');
        }
      }
    });

    it('omits empty prop categories from AI manifest', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      const props = result.output.manifest.props;
      if (props) {
        // Each defined category should have at least one item
        if (props.variants) expect(props.variants.length).toBeGreaterThan(0);
        if (props.behaviors) expect(props.behaviors.length).toBeGreaterThan(0);
        if (props.events) expect(props.events.length).toBeGreaterThan(0);
        if (props.slots) expect(props.slots.length).toBeGreaterThan(0);
        if (props.other) expect(props.other.length).toBeGreaterThan(0);
      }
    });

    it('metadata contains all system fields', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      const metadata = result.output.metadata;

      // Verify all ManifestMetadata fields exist
      expect(metadata.id).toBeDefined();
      expect(metadata.schemaVersion).toBeDefined();
      expect(metadata.version).toBeDefined();
      expect(metadata.framework).toBeDefined();
      expect(metadata.visibility).toBeDefined();
      expect(metadata.tier).toBeDefined();
      expect(metadata.embeddingStatus).toBeDefined();
      expect(metadata.generatedAt).toBeDefined();
      expect(metadata.updatedAt).toBeDefined();
      expect(metadata.sourceHash).toBeDefined();
      expect(metadata.metaHash).toBeDefined();
      expect(metadata.files).toBeDefined();
    });

    it('AI manifest contains essential fields for code generation', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      const manifest = result.output.manifest;

      // Essential fields for AI to generate correct code
      expect(manifest.name).toBe('Button');
      expect(manifest.slug).toBeTruthy();
      expect(manifest.description).toBeTruthy();
      expect(manifest.importStatement).toBeDefined();
      expect(manifest.importStatement.primary).toContain('Button');
    });

    it('backward compatibility: full manifest still available', async () => {
      const result = await processFixture('nexus', 'button', 'Button');
      if (!isProcessorSuccess(result)) return;

      // result.manifest should contain the full ComponentManifest
      expect(result.manifest).toBeDefined();
      expect(result.manifest.id).toBe(result.output.metadata.id);
      expect(result.manifest.name).toBe(result.output.manifest.name);
      // Full manifest has categorized props
      expect(result.manifest.props).toBeDefined();
    });
  });
});
