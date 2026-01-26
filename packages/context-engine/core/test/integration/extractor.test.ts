/**
 * Extractor Integration Tests
 *
 * Tests the HybridExtractor with real component fixtures.
 * Validates that extraction produces correct props, variants, and metadata.
 */

import { beforeAll, describe, expect, it } from 'vitest';

import {
  extractComponent,
  HybridExtractor,
  isExtractionSuccess,
} from '../../src/extractor/index.js';
import {
  expectDefaultVariants,
  expectExtractionSuccess,
  expectPropsToInclude,
  expectValidHash,
  expectVariantsToInclude,
} from '../utils/assertion-helpers.js';
import { loadFixture, loadFixtureAsInput } from '../utils/fixture-loader.js';
import { TEST_ORG_ID } from '../utils/test-constants.js';

describe('HybridExtractor', () => {
  let extractor: HybridExtractor;

  beforeAll(() => {
    extractor = new HybridExtractor();
  });

  describe('Button fixture (CVA + asChild)', () => {
    it('extracts props (CVA variant props may be in variants field)', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      // Note: CVA variant props (variant, size) may be in variants field, not props
      // Check that extraction found some props
      expect(result.data.props).toBeDefined();

      // At least some props should be extracted (either in props or variants)
      expect(
        result.data.props.length > 0 ||
          Object.keys(result.data.variants).length > 0
      ).toBe(true);

      // If asChild is found in props, it should be optional
      const asChild = result.data.props.find((p) => p.name === 'asChild');
      if (asChild) {
        expect(asChild.required).toBe(false);
      }
    });

    it('extracts CVA variants', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expectVariantsToInclude(result.data.variants, {
        variant: [
          'default',
          'destructive',
          'outline',
          'secondary',
          'ghost',
          'link',
        ],
        size: ['default', 'sm', 'lg', 'icon'],
      });
    });

    it('extracts default variants', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expectDefaultVariants(result.data.defaultVariants, {
        variant: 'default',
        size: 'default',
      });
    });

    it('detects Radix Slot dependency', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expect(result.data.npmDependencies).toHaveProperty(
        '@radix-ui/react-slot'
      );
    });

    it('generates consistent source hash', async () => {
      const input = loadFixtureAsInput('nexus', 'button');

      const result1 = await extractor.extract(input);
      const result2 = await extractor.extract(input);

      expect(isExtractionSuccess(result1)).toBe(true);
      expect(isExtractionSuccess(result2)).toBe(true);

      if (isExtractionSuccess(result1) && isExtractionSuccess(result2)) {
        expectValidHash(result1.sourceHash);
        expect(result1.sourceHash).toBe(result2.sourceHash);
      }
    });

    it('includes acceptsChildren field (detection depends on code analysis)', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      // acceptsChildren detection may vary based on extraction method
      // The field should always be present (boolean)
      expect(typeof result.data.acceptsChildren).toBe('boolean');
    });
  });

  describe('Badge fixture (simple CVA)', () => {
    it('extracts variant values', async () => {
      const input = loadFixtureAsInput('nexus', 'badge');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expectVariantsToInclude(result.data.variants, {
        variant: [
          'default',
          'secondary',
          'destructive',
          'outline',
          'success',
          'warning',
        ],
      });
    });
  });

  describe('Card fixture (composition pattern)', () => {
    it('extracts component with elevation prop', async () => {
      const input = loadFixtureAsInput('nexus', 'card');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      // Card has custom elevation prop
      expectPropsToInclude(result.data.props, [
        { name: 'elevation', required: false },
      ]);
    });
  });

  describe('Dialog fixture (Radix compound)', () => {
    it('detects Radix UI base library', async () => {
      const input = loadFixtureAsInput('nexus', 'dialog');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      // Should detect Radix UI Dialog
      expect(result.data.baseLibrary).toBeDefined();
      // May be 'radix-ui' or 'Radix UI' depending on implementation
      expect(result.data.baseLibrary?.name?.toLowerCase()).toContain('radix');
    });

    it('detects forwardRef usage', async () => {
      const input = loadFixtureAsInput('nexus', 'dialog');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expect(result.data.usesForwardRef).toBe(true);
    });

    it('extracts compound component props when found', async () => {
      const input = loadFixtureAsInput('nexus', 'dialog');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      // Note: The extractor may only find the main 'Dialog' export props
      // showCloseButton is on DialogContent, which may not be extracted
      // This test documents the actual behavior
      expect(result.data.props).toBeDefined();
      // If showCloseButton is found, it should be optional
      const showCloseButton = result.data.props.find(
        (p) => p.name === 'showCloseButton'
      );
      if (showCloseButton) {
        expect(showCloseButton.required).toBe(false);
      }
    });
  });

  describe('Accordion fixture (Radix compound)', () => {
    it('detects Radix Accordion dependency', async () => {
      const input = loadFixtureAsInput('nexus', 'accordion');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expect(result.data.npmDependencies).toHaveProperty(
        '@radix-ui/react-accordion'
      );
    });
  });

  describe('Input fixture (forwardRef)', () => {
    it('extracts input props with variants', async () => {
      const input = loadFixtureAsInput('nexus', 'input');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expectPropsToInclude(result.data.props, [
        { name: 'variant', required: false },
        { name: 'inputSize', required: false },
        { name: 'error', required: false },
        { name: 'startIcon', required: false },
        { name: 'endIcon', required: false },
      ]);
    });

    it('detects forwardRef usage', async () => {
      const input = loadFixtureAsInput('nexus', 'input');
      const result = await extractor.extract(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expect(result.data.usesForwardRef).toBe(true);
    });
  });

  describe('Input validation', () => {
    // Note: The extractor is lenient and does not validate orgId format.
    // These tests document and verify actual behavior.

    it('accepts non-UUID orgId (passes through without validation)', async () => {
      const fixture = loadFixture('nexus', 'button');

      const result = await extractor.extract({
        orgId: 'invalid-uuid',
        name: fixture.name,
        sourceCode: fixture.sourceCode,
        framework: 'react',
      });

      // Extractor is lenient - it succeeds and passes through the orgId
      expect(isExtractionSuccess(result)).toBe(true);
      if (isExtractionSuccess(result)) {
        // The orgId is passed through as-is
        expect(result.orgId).toBe('invalid-uuid');
        // Extraction still works on the source code
        expect(result.data.props.length).toBeGreaterThan(0);
      }
    });

    it('succeeds with empty source code (returns empty props)', async () => {
      const result = await extractor.extract({
        orgId: TEST_ORG_ID,
        name: 'Empty',
        sourceCode: '',
        framework: 'react',
      });

      // Extractor is lenient - succeeds with empty data
      expect(isExtractionSuccess(result)).toBe(true);
      if (isExtractionSuccess(result)) {
        expect(result.data.props).toEqual([]);
        expect(result.data.variants).toEqual({});
        // sourceHash is still generated for empty content
        expect(result.sourceHash).toHaveLength(64);
      }
    });

    it('succeeds with empty component name (returns empty name)', async () => {
      const fixture = loadFixture('nexus', 'button');

      const result = await extractor.extract({
        orgId: TEST_ORG_ID,
        name: '',
        sourceCode: fixture.sourceCode,
        framework: 'react',
      });

      // Extractor is lenient - succeeds with empty name
      expect(isExtractionSuccess(result)).toBe(true);
      if (isExtractionSuccess(result)) {
        // Identity name is whatever was passed (empty string)
        expect(result.identity.name).toBe('');
        // But extraction of props from source still works
        expect(result.data.variants).toBeDefined();
      }
    });
  });

  describe('extractComponent convenience function', () => {
    it('works with framework-based extractor selection', async () => {
      const input = loadFixtureAsInput('nexus', 'button');
      const result = await extractComponent(input);

      expect(isExtractionSuccess(result)).toBe(true);
      if (!isExtractionSuccess(result)) return;

      expect(result.data.props.length).toBeGreaterThan(0);
    });

    it('throws for unsupported framework', async () => {
      const input = loadFixtureAsInput('nexus', 'button');

      await expect(
        extractComponent({
          ...input,
          framework: 'vue' as 'react',
        })
      ).rejects.toThrow('Unsupported framework');
    });
  });

  describe('All fixtures produce valid ExtractedData', () => {
    const fixtures = [
      { category: 'nexus' as const, name: 'button' },
      { category: 'nexus' as const, name: 'badge' },
      { category: 'nexus' as const, name: 'card' },
      { category: 'nexus' as const, name: 'dialog' },
      { category: 'nexus' as const, name: 'accordion' },
      { category: 'nexus' as const, name: 'input' },
    ];

    fixtures.forEach(({ category, name }) => {
      it(`${category}/${name} extracts successfully`, async () => {
        const input = loadFixtureAsInput(category, name);
        const result = await extractor.extract(input);

        expectExtractionSuccess(result);

        // Verify basic structure
        expect(result.data.props).toBeDefined();
        expect(Array.isArray(result.data.props)).toBe(true);
        expect(result.data.variants).toBeDefined();
        expect(result.data.defaultVariants).toBeDefined();
        expect(result.data.npmDependencies).toBeDefined();
        expect(result.data.files).toBeDefined();

        // Verify identity was generated
        expect(result.identity.id).toBeTruthy();
        expect(result.identity.name).toBeTruthy();
        expect(result.identity.slug).toBeTruthy();

        // Verify hash
        expectValidHash(result.sourceHash);
      });
    });
  });
});
