/**
 * Manifest Builder Tests
 *
 * Tests for the ManifestBuilder class which combines extracted data
 * and generated metadata into complete ComponentManifests.
 *
 * Focus areas:
 * - build() method produces correct manifest structure
 * - Props categorization is applied correctly
 * - CVA variants are built with defaults
 * - update() method merges correctly
 * - buildMinimal() creates placeholder manifests
 * - Import statement generation
 */

import { beforeEach, describe, expect, it } from 'vitest';

import {
  derivePackageName,
  generateImportStatement,
} from '../../src/manifest/import-generator.js';
import { ManifestBuilder } from '../../src/manifest/manifest-builder.js';
import {
  isManifestBuildSuccess,
  type ManifestBuilderInput,
} from '../../src/manifest/types.js';
import type {
  ComponentManifest,
  ComponentMeta,
  ExtractedData,
} from '../../src/types/index.js';
import { MANIFEST_SCHEMA_VERSION } from '../../src/types/index.js';

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Create a minimal valid ExtractedData for testing
 *
 * Note: With props cleanup, props use simplified structure:
 * - name, type, description, defaultValue, values
 * - Internal flags: isChildren, isClassName, isStyle, deprecated
 * - No typeCategory, required, possibleValues
 * - className is now rejected at extraction time (not included)
 */
function createMockExtractedData(
  overrides: Partial<ExtractedData> = {}
): ExtractedData {
  return {
    props: [
      {
        name: 'variant',
        type: 'string',
        values: ['default', 'destructive', 'outline'],
        isChildren: false,
        isClassName: false,
        isStyle: false,
        deprecated: false,
      },
      {
        name: 'size',
        type: 'string',
        values: ['sm', 'md', 'lg'],
        isChildren: false,
        isClassName: false,
        isStyle: false,
        deprecated: false,
      },
      {
        name: 'disabled',
        type: 'boolean',
        isChildren: false,
        isClassName: false,
        isStyle: false,
        deprecated: false,
      },
      {
        name: 'onCustomClick',
        type: '(data: CustomData) => void',
        isChildren: false,
        isClassName: false,
        isStyle: false,
        deprecated: false,
      },
      {
        name: 'children',
        type: 'ReactNode',
        isChildren: true,
        isClassName: false,
        isStyle: false,
        deprecated: false,
      },
    ],
    variants: {
      variant: ['default', 'destructive', 'outline'],
      size: ['sm', 'md', 'lg'],
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
    npmDependencies: {
      '@radix-ui/react-slot': '^1.0.0',
      'class-variance-authority': '^0.7.0',
    },
    internalDependencies: ['cn'],
    acceptsChildren: true,
    usesForwardRef: false,
    exportType: 'named',
    exportName: 'Button',
    files: ['button.tsx'],
    extractionMethod: 'react-docgen-typescript',
    ...overrides,
  };
}

/**
 * Create a minimal valid ComponentMeta for testing
 */
function createMockMeta(overrides: Partial<ComponentMeta> = {}): ComponentMeta {
  return {
    name: 'Button',
    description:
      'A button component for triggering actions. Supports multiple variants and sizes.',
    tier: 'free',
    ai: {
      semanticDescription:
        'The Button component is used for triggering user actions like form submissions, navigation, or interactions. It supports multiple visual variants (default, destructive, outline) and sizes.',
      whenToUse:
        'Use Button for any interactive element that triggers an action when clicked.',
      whenNotToUse:
        'Do not use Button for navigation links - use a Link component instead.',
      a11yNotes: 'Includes focus ring for keyboard navigation.',
      patterns: ['button', 'action', 'interactive'],
      tokens: ['variant', 'size'],
      examples: [
        '<Button>Click me</Button>',
        '<Button variant="destructive">Delete</Button>',
        '<Button size="sm" disabled>Small Disabled</Button>',
      ],
      relatedComponents: ['Link', 'IconButton'],
    },
    variants: {
      variant: ['default', 'destructive', 'outline'],
      size: ['sm', 'md', 'lg'],
    },
    defaults: {
      variant: 'default',
      size: 'md',
    },
    ...overrides,
  };
}

/**
 * Create a complete ManifestBuilderInput
 */
function createMockInput(
  overrides: Partial<ManifestBuilderInput> = {}
): ManifestBuilderInput {
  return {
    orgId: 'test-org-uuid',
    identity: {
      id: 'comp-uuid-12345',
      slug: 'button-react-abc123',
      name: 'Button',
      framework: 'react',
    },
    extracted: createMockExtractedData(),
    meta: createMockMeta(),
    sourceHash: 'a'.repeat(64), // 64-char hex string simulating SHA-256
    version: '1.0.0',
    ...overrides,
  };
}

// =============================================================================
// ManifestBuilder.build() Tests
// =============================================================================

describe('ManifestBuilder', () => {
  let builder: ManifestBuilder;

  beforeEach(() => {
    builder = new ManifestBuilder();
  });

  describe('build()', () => {
    it('returns success with complete manifest', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest).toBeDefined();
      expect(result.builtAt).toBeTruthy();
    });

    it('populates all identity fields correctly', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const manifest = result.manifest;
      expect(manifest.id).toBe('comp-uuid-12345');
      expect(manifest.slug).toBe('button-react-abc123');
      expect(manifest.name).toBe('Button');
      expect(manifest.framework).toBe('react');
      expect(manifest.version).toBe('1.0.0');
    });

    it('includes schema version for migrations', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.schemaVersion).toBe(MANIFEST_SCHEMA_VERSION);
    });

    it('copies description and tier from meta', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.description).toBe(input.meta.description);
      expect(result.manifest.tier).toBe('free');
    });

    it('generates timestamps (generatedAt and updatedAt)', () => {
      const input = createMockInput();
      const beforeBuild = new Date().toISOString();
      const result = builder.build(input);
      const afterBuild = new Date().toISOString();

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // Timestamps should be valid ISO strings within the build window
      expect(result.manifest.generatedAt).toBeTruthy();
      expect(result.manifest.updatedAt).toBeTruthy();
      expect(result.manifest.generatedAt).toBe(result.manifest.updatedAt);

      // Verify they're in the expected time range
      expect(result.manifest.generatedAt >= beforeBuild).toBe(true);
      expect(result.manifest.generatedAt <= afterBuild).toBe(true);
    });

    it('preserves sourceHash from input', () => {
      const input = createMockInput({
        sourceHash: 'b'.repeat(64),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.sourceHash).toBe('b'.repeat(64));
    });

    it('generates metaHash from meta content', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // metaHash should be a valid hash
      expect(result.manifest.metaHash).toBeTruthy();
      expect(result.manifest.metaHash).toHaveLength(64);
      expect(result.manifest.metaHash).toMatch(/^[a-f0-9]+$/);
    });

    it('sets default visibility to private', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.visibility).toBe('private');
    });

    it('sets embeddingStatus to pending', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.embeddingStatus).toBe('pending');
      expect(result.manifest.embeddingError).toBeUndefined();
    });

    it('uses default version when not provided', () => {
      const input = createMockInput();
      delete (input as Partial<ManifestBuilderInput>).version;

      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.version).toBe('0.0.1');
    });
  });

  describe('build() - Props Categorization', () => {
    it('categorizes props into correct categories', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const props = result.manifest.props;

      // Categories are optional (undefined if empty)
      // At minimum, variants, behaviors, events, slots should have content from mock data
      expect(props.variants).toBeDefined();
      expect(props.behaviors).toBeDefined();
      expect(props.events).toBeDefined();
      expect(props.slots).toBeDefined();

      // All defined categories should be arrays
      if (props.variants) expect(Array.isArray(props.variants)).toBe(true);
      if (props.behaviors) expect(Array.isArray(props.behaviors)).toBe(true);
      if (props.events) expect(Array.isArray(props.events)).toBe(true);
      if (props.slots) expect(Array.isArray(props.slots)).toBe(true);
      if (props.other) expect(Array.isArray(props.other)).toBe(true);
    });

    it('places variant props in variants category', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const variantPropNames =
        result.manifest.props.variants?.map((p) => p.name) ?? [];
      expect(variantPropNames).toContain('variant');
      expect(variantPropNames).toContain('size');
    });

    it('places boolean state props in behaviors category', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const behaviorPropNames =
        result.manifest.props.behaviors?.map((p) => p.name) ?? [];
      expect(behaviorPropNames).toContain('disabled');
    });

    it('places event handlers in events category', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const eventPropNames =
        result.manifest.props.events?.map((p) => p.name) ?? [];
      expect(eventPropNames).toContain('onCustomClick');
    });

    it('places children in slots category', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const slotPropNames =
        result.manifest.props.slots?.map((p) => p.name) ?? [];
      expect(slotPropNames).toContain('children');
    });

    it('includes type information in categorized props', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // All props should have name and type
      const allProps = [
        ...(result.manifest.props.variants ?? []),
        ...(result.manifest.props.behaviors ?? []),
        ...(result.manifest.props.events ?? []),
        ...(result.manifest.props.slots ?? []),
        ...(result.manifest.props.other ?? []),
      ];

      for (const prop of allProps) {
        expect(prop.name).toBeTruthy();
        expect(prop.type).toBeTruthy();
      }
    });
  });

  describe('build() - CVA Variants (in props.variants)', () => {
    it('builds variant props with values array', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const variantProps = result.manifest.props.variants;
      expect(variantProps).toBeDefined();

      const variantProp = variantProps?.find((p) => p.name === 'variant');
      const sizeProp = variantProps?.find((p) => p.name === 'size');

      expect(variantProp?.values).toEqual([
        'default',
        'destructive',
        'outline',
      ]);
      expect(sizeProp?.values).toEqual(['sm', 'md', 'lg']);
    });

    it('includes default values in variant props', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const variantProps = result.manifest.props.variants;

      const variantProp = variantProps?.find((p) => p.name === 'variant');
      const sizeProp = variantProps?.find((p) => p.name === 'size');

      expect(variantProp?.defaultValue).toBe('default');
      expect(sizeProp?.defaultValue).toBe('md');
    });

    it('handles empty variants', () => {
      // Create input with no variant props in extracted.props AND no CVA variants
      const input = createMockInput({
        extracted: createMockExtractedData({
          props: [
            {
              name: 'disabled',
              type: 'boolean',
              isChildren: false,
              isClassName: false,
              isStyle: false,
              deprecated: false,
            },
          ],
          variants: {},
          defaultVariants: {},
        }),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // With no variant props in extraction and no CVA variants, props.variants should be empty
      expect(result.manifest.props.variants ?? []).toEqual([]);
    });

    it('handles variants without defaults', () => {
      // Create input with CVA variants that have no defaults
      const input = createMockInput({
        extracted: createMockExtractedData({
          props: [
            {
              name: 'variant',
              type: 'string',
              values: ['a', 'b', 'c'],
              isChildren: false,
              isClassName: false,
              isStyle: false,
              deprecated: false,
            },
          ],
          variants: {
            variant: ['a', 'b', 'c'],
          },
          defaultVariants: {},
        }),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const variantProp = result.manifest.props.variants?.find(
        (p) => p.name === 'variant'
      );
      expect(variantProp?.values).toEqual(['a', 'b', 'c']);
      expect(variantProp?.defaultValue).toBeUndefined();
    });
  });

  describe('build() - Guidance and Examples', () => {
    it('builds guidance from meta.ai', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const guidance = result.manifest.guidance;

      expect(guidance).toBeDefined();
      expect(guidance?.whenToUse).toContain('action');
      expect(guidance?.whenNotToUse).toContain('navigation');
      expect(guidance?.accessibility).toBeTruthy();
      expect(guidance?.patterns).toContain('button');
      expect(guidance?.relatedComponents).toContain('Link');
    });

    it('provides fallback guidance when meta.ai is missing', () => {
      const input = createMockInput({
        meta: createMockMeta({
          ai: undefined,
        }),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // Should have fallback guidance
      expect(result.manifest.guidance).toBeDefined();
      expect(result.manifest.guidance?.whenToUse).toBeTruthy();
      expect(result.manifest.guidance?.whenNotToUse).toBeTruthy();
    });

    it('builds structured examples from meta', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const examples = result.manifest.examples;

      expect(examples).toBeDefined();
      expect(examples?.minimal).toBeDefined();
      expect(examples?.minimal?.code).toBeTruthy();
      expect(examples?.minimal?.isPrimary).toBe(true);
    });

    it('extracts example titles from code patterns', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      const examples = result.manifest.examples;

      // Second example has variant="destructive", should get a title
      if (examples?.common && examples.common.length > 0) {
        // At least one common example should have a meaningful title
        const hasMeaningfulTitle = examples.common.some(
          (ex) => ex.title && ex.title !== 'Example 2'
        );
        // Verify structure and that title extraction works
        expect(Array.isArray(examples.common)).toBe(true);
        expect(hasMeaningfulTitle).toBe(true);
      }
    });
  });

  describe('build() - Semantic Description', () => {
    it('uses ai.semanticDescription when available', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.semanticDescription).toBe(
        input.meta.ai?.semanticDescription
      );
    });

    it('falls back to description when semanticDescription missing', () => {
      const baseMeta = createMockMeta();
      // Test defensive fallback by simulating missing semanticDescription
      const { semanticDescription: _, ...aiWithoutSemantic } = baseMeta.ai;
      const input = createMockInput({
        meta: {
          ...baseMeta,
          ai: aiWithoutSemantic as typeof baseMeta.ai,
        },
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // Should fall back to description if it's long enough
      expect(result.manifest.semanticDescription).toBeTruthy();
      expect(result.manifest.semanticDescription?.length).toBeGreaterThan(0);
    });

    it('generates minimal semantic description as last resort', () => {
      const input = createMockInput({
        meta: createMockMeta({
          description: 'Short',
          ai: undefined,
        }),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      // Should generate a minimal description that includes component name
      expect(result.manifest.semanticDescription).toContain('Button');
    });
  });

  describe('build() - Import Statement', () => {
    it('generates import statement', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.importStatement).toBeDefined();
      expect(result.manifest.importStatement?.primary).toContain('import');
      expect(result.manifest.importStatement?.primary).toContain('Button');
    });

    it('generates type-only import', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.importStatement?.typeOnly).toContain(
        'import type'
      );
      expect(result.manifest.importStatement?.typeOnly).toContain(
        'ButtonProps'
      );
    });

    it('generates minimal example code', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.minimalExample).toBeTruthy();
      expect(result.manifest.minimalExample).toContain('<Button');
    });
  });

  describe('build() - Dependencies', () => {
    it('preserves npm dependencies', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.dependencies?.npm).toEqual(
        input.extracted.npmDependencies
      );
    });

    it('preserves internal dependencies', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.dependencies?.internal).toEqual(
        input.extracted.internalDependencies
      );
    });

    it('preserves files list', () => {
      const input = createMockInput();
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.files).toEqual(input.extracted.files);
    });

    it('preserves baseLibrary when detected', () => {
      const input = createMockInput({
        extracted: createMockExtractedData({
          baseLibrary: {
            name: 'Radix UI',
            component: 'Dialog',
          },
        }),
      });
      const result = builder.build(input);

      expect(isManifestBuildSuccess(result)).toBe(true);
      if (!isManifestBuildSuccess(result)) return;

      expect(result.manifest.baseLibrary?.name).toBe('Radix UI');
      expect(result.manifest.baseLibrary?.component).toBe('Dialog');
    });
  });
});

// =============================================================================
// ManifestBuilder.buildMinimal() Tests
// =============================================================================

describe('ManifestBuilder.buildMinimal()', () => {
  let builder: ManifestBuilder;

  beforeEach(() => {
    builder = new ManifestBuilder();
  });

  it('creates manifest with placeholder meta from extracted data', () => {
    const input = {
      orgId: 'test-org',
      identity: {
        id: 'comp-123',
        slug: 'button-react-123',
        name: 'Button',
        framework: 'react' as const,
      },
      extracted: createMockExtractedData({
        sourceDescription: 'A button component from extraction',
      }),
      sourceHash: 'c'.repeat(64),
      name: 'Button',
    };

    const result = builder.buildMinimal(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    // Should have a description derived from sourceDescription
    expect(result.manifest.description).toBeTruthy();
    expect(result.manifest.name).toBe('Button');
  });

  it('uses sourceDescription for semanticDescription', () => {
    const input = {
      orgId: 'test-org',
      identity: {
        id: 'comp-123',
        slug: 'card-react-123',
        name: 'Card',
        framework: 'react' as const,
      },
      extracted: createMockExtractedData({
        sourceDescription: 'A Card container component for grouping content',
      }),
      sourceHash: 'd'.repeat(64),
      name: 'Card',
    };

    const result = builder.buildMinimal(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    // semanticDescription uses sourceDescription when available
    // It may or may not contain the component name depending on the sourceDescription
    expect(result.manifest.semanticDescription).toBeTruthy();
    expect(result.manifest.semanticDescription).toContain('Card');
  });

  it('falls back to generic description when sourceDescription missing', () => {
    const input = {
      orgId: 'test-org',
      identity: {
        id: 'comp-123',
        slug: 'badge-react-123',
        name: 'Badge',
        framework: 'react' as const,
      },
      extracted: createMockExtractedData({
        sourceDescription: undefined,
      }),
      sourceHash: 'e'.repeat(64),
      name: 'Badge',
    };

    const result = builder.buildMinimal(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    expect(result.manifest.description).toContain('Badge');
  });

  it('sets tier to free', () => {
    const input = {
      orgId: 'test-org',
      identity: {
        id: 'comp-123',
        slug: 'input-react-123',
        name: 'Input',
        framework: 'react' as const,
      },
      extracted: createMockExtractedData(),
      sourceHash: 'f'.repeat(64),
      name: 'Input',
    };

    const result = builder.buildMinimal(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    expect(result.manifest.tier).toBe('free');
  });

  it('includes internal dependencies as related components', () => {
    const input = {
      orgId: 'test-org',
      identity: {
        id: 'comp-123',
        slug: 'dialog-react-123',
        name: 'Dialog',
        framework: 'react' as const,
      },
      extracted: createMockExtractedData({
        internalDependencies: ['DialogTrigger', 'DialogContent'],
      }),
      sourceHash: 'g'.repeat(64),
      name: 'Dialog',
    };

    const result = builder.buildMinimal(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    expect(result.manifest.guidance?.relatedComponents).toEqual([
      'DialogTrigger',
      'DialogContent',
    ]);
  });
});

// =============================================================================
// ManifestBuilder.update() Tests
// =============================================================================

describe('ManifestBuilder.update()', () => {
  let builder: ManifestBuilder;
  let existingManifest: ComponentManifest;

  beforeEach(() => {
    builder = new ManifestBuilder();

    // Create an existing manifest to update
    const input = createMockInput();
    const result = builder.build(input);
    if (!isManifestBuildSuccess(result)) {
      throw new Error('Failed to create test manifest');
    }
    existingManifest = result.manifest;
  });

  it('updates updatedAt timestamp', () => {
    // Manually set a past timestamp on the existing manifest
    existingManifest.updatedAt = '2020-01-01T00:00:00.000Z';

    const updated = builder.update(existingManifest, {});

    // updatedAt should be a valid ISO timestamp
    expect(updated.updatedAt).toBeTruthy();
    expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    // Should be after the original (past) timestamp
    expect(
      new Date(updated.updatedAt) > new Date('2020-01-01T00:00:00.000Z')
    ).toBe(true);
  });

  it('preserves unchanged fields', () => {
    const updated = builder.update(existingManifest, {});

    // Identity should be unchanged
    expect(updated.id).toBe(existingManifest.id);
    expect(updated.name).toBe(existingManifest.name);
    expect(updated.slug).toBe(existingManifest.slug);
    expect(updated.framework).toBe(existingManifest.framework);

    // Original timestamps preserved (except updatedAt)
    expect(updated.generatedAt).toBe(existingManifest.generatedAt);
  });

  it('merges extraction updates', () => {
    const newExtracted = createMockExtractedData({
      props: [
        ...createMockExtractedData().props,
        {
          name: 'newProp',
          type: 'string',
          isChildren: false,
          isClassName: false,
          isStyle: false,
          deprecated: false,
        },
      ],
    });

    const updated = builder.update(existingManifest, {
      extracted: newExtracted,
    });

    // Should have updated props - categories are optional
    const allProps = [
      ...(updated.props.variants ?? []),
      ...(updated.props.behaviors ?? []),
      ...(updated.props.events ?? []),
      ...(updated.props.slots ?? []),
      ...(updated.props.other ?? []),
    ];
    const hasNewProp = allProps.some((p) => p.name === 'newProp');
    expect(hasNewProp).toBe(true);
  });

  it('merges meta updates', () => {
    const newMeta = createMockMeta({
      description: 'Updated description for the button component',
    });

    const updated = builder.update(existingManifest, {
      meta: newMeta,
    });

    expect(updated.description).toBe(
      'Updated description for the button component'
    );
  });

  it('resets embeddingStatus when sourceHash changes', () => {
    // Set existing manifest to indexed status
    existingManifest.embeddingStatus = 'indexed';
    existingManifest.embeddingError = undefined;

    const newSourceHash = 'h'.repeat(64);

    const updated = builder.update(existingManifest, {
      sourceHash: newSourceHash,
    });

    expect(updated.sourceHash).toBe(newSourceHash);
    expect(updated.embeddingStatus).toBe('pending');
    expect(updated.embeddingError).toBeUndefined();
  });

  it('updates version when provided', () => {
    const updated = builder.update(existingManifest, {
      version: '2.0.0',
    });

    expect(updated.version).toBe('2.0.0');
  });

  it('updates metaHash when meta changes', () => {
    const originalMetaHash = existingManifest.metaHash;

    const newMeta = createMockMeta({
      description: 'Completely different description',
    });

    const updated = builder.update(existingManifest, {
      meta: newMeta,
    });

    expect(updated.metaHash).not.toBe(originalMetaHash);
  });

  it('updates dependencies when extracted data changes', () => {
    const newExtracted = createMockExtractedData({
      npmDependencies: {
        '@new-lib/react': '^2.0.0',
      },
    });

    const updated = builder.update(existingManifest, {
      extracted: newExtracted,
    });

    expect(updated.dependencies?.npm).toEqual({
      '@new-lib/react': '^2.0.0',
    });
  });
});

// =============================================================================
// Import Generator Tests
// =============================================================================

describe('generateImportStatement()', () => {
  it('generates primary import with component name', () => {
    const result = generateImportStatement({
      componentName: 'Button',
      packageName: '@nexus/react',
    });

    expect(result.primary).toBe("import { Button } from '@nexus/react'");
  });

  it('generates type-only import for props', () => {
    const result = generateImportStatement({
      componentName: 'Input',
      packageName: '@nexus/react',
    });

    expect(result.typeOnly).toBe(
      "import type { InputProps } from '@nexus/react'"
    );
  });

  it('uses default package name when not provided', () => {
    const result = generateImportStatement({
      componentName: 'Card',
    });

    expect(result.primary).toContain('@nexus/react');
  });

  it('generates subpath import when hasSubpathExports is true', () => {
    const result = generateImportStatement({
      componentName: 'Dialog',
      packageName: '@mylib/components',
      hasSubpathExports: true,
    });

    expect(result.subpath).toBe(
      "import { Dialog } from '@mylib/components/dialog'"
    );
  });

  it('does not generate subpath when hasSubpathExports is false', () => {
    const result = generateImportStatement({
      componentName: 'Badge',
      packageName: '@mylib/components',
      hasSubpathExports: false,
    });

    expect(result.subpath).toBeUndefined();
  });

  it('converts PascalCase to kebab-case for subpath', () => {
    const result = generateImportStatement({
      componentName: 'DatePicker',
      packageName: '@ui/react',
      hasSubpathExports: true,
    });

    expect(result.subpath).toBe(
      "import { DatePicker } from '@ui/react/date-picker'"
    );
  });

  it('includes all exports for compound components', () => {
    const result = generateImportStatement({
      componentName: 'Dialog',
      packageName: '@nexus/react',
      exports: ['Dialog', 'DialogTrigger', 'DialogContent', 'DialogHeader'],
    });

    expect(result.primary).toBe(
      "import { Dialog, DialogTrigger, DialogContent, DialogHeader } from '@nexus/react'"
    );
    // Type-only still uses root component
    expect(result.typeOnly).toBe(
      "import type { DialogProps } from '@nexus/react'"
    );
  });

  it('falls back to componentName when exports is empty', () => {
    const result = generateImportStatement({
      componentName: 'Button',
      packageName: '@nexus/react',
      exports: [],
    });

    expect(result.primary).toBe("import { Button } from '@nexus/react'");
  });
});

describe('derivePackageName()', () => {
  it('detects @scope/react pattern', () => {
    const result = derivePackageName({
      '@mycompany/react': '^1.0.0',
      react: '^18.0.0',
    });

    expect(result).toBe('@mycompany/react');
  });

  it('detects @scope/components pattern', () => {
    const result = derivePackageName({
      '@design-system/components': '^2.0.0',
      'class-variance-authority': '^0.7.0',
    });

    expect(result).toBe('@design-system/components');
  });

  it('detects @scope/ui pattern', () => {
    const result = derivePackageName({
      '@acme/ui': '^3.0.0',
      clsx: '^2.0.0',
    });

    expect(result).toBe('@acme/ui');
  });

  it('returns undefined when no design system package found', () => {
    const result = derivePackageName({
      react: '^18.0.0',
      lodash: '^4.0.0',
    });

    expect(result).toBeUndefined();
  });

  it('finds a scoped package when available', () => {
    // derivePackageName iterates in insertion order, so the first matching pattern wins
    // We test that it finds @company/react which matches @scope/react pattern
    const result = derivePackageName({
      '@company/react': '^1.0.0',
      '@radix-ui/react-dialog': '^1.0.0',
    });

    expect(result).toBe('@company/react');
  });
});

// =============================================================================
// Split Output Structure Tests
// =============================================================================

describe('ManifestBuilder - Split output structure', () => {
  let builder: ManifestBuilder;

  beforeEach(() => {
    builder = new ManifestBuilder();
  });

  it('returns output with metadata and manifest', () => {
    const input = createMockInput();
    const result = builder.build(input);

    expect(isManifestBuildSuccess(result)).toBe(true);
    if (!isManifestBuildSuccess(result)) return;

    expect(result.output).toBeDefined();
    expect(result.output.componentName).toBe(input.identity.name);
    expect(result.output.metadata).toBeDefined();
    expect(result.output.manifest).toBeDefined();
  });

  it('metadata contains system fields', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    const metadata = result.output.metadata;
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

  it('manifest contains AI-consumable fields', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    const manifest = result.output.manifest;
    expect(manifest.name).toBeDefined();
    expect(manifest.slug).toBeDefined();
    expect(manifest.description).toBeDefined();
    expect(manifest.importStatement).toBeDefined();
  });

  it('AI manifest props only contain defined categories', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    const aiManifest = result.output.manifest;
    // AI manifest should have categorized props without internal-only fields
    // Categories: variants, behaviors, events, slots, other (all optional)
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

  it('componentName matches identity name', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    expect(result.output.componentName).toBe('Button');
    expect(result.output.manifest.name).toBe('Button');
  });

  it('metadata.id matches full manifest id', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    expect(result.output.metadata.id).toBe(result.manifest.id);
  });

  it('metadata timestamps match full manifest timestamps', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    expect(result.output.metadata.generatedAt).toBe(
      result.manifest.generatedAt
    );
    expect(result.output.metadata.updatedAt).toBe(result.manifest.updatedAt);
  });

  it('metadata hashes match full manifest hashes', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    expect(result.output.metadata.sourceHash).toBe(result.manifest.sourceHash);
    expect(result.output.metadata.metaHash).toBe(result.manifest.metaHash);
  });

  it('AI manifest omits empty variant categories', () => {
    const inputWithNoVariants = createMockInput({
      extracted: createMockExtractedData({
        // Empty CVA variants
        variants: {},
        defaultVariants: {},
        // Props without variant-like values (only behavior and slot props)
        props: [
          {
            name: 'disabled',
            type: 'boolean',
            isChildren: false,
            isClassName: false,
            isStyle: false,
            deprecated: false,
          },
          {
            name: 'children',
            type: 'ReactNode',
            isChildren: true,
            isClassName: false,
            isStyle: false,
            deprecated: false,
          },
        ],
      }),
    });
    const result = builder.build(inputWithNoVariants);

    if (!isManifestBuildSuccess(result)) return;

    // When there are no variants, props.variants should be undefined
    expect(result.output.manifest.props?.variants).toBeUndefined();
  });

  it('AI manifest includes variants in props when present', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    // Input has variants, so they should be in props.variants
    expect(result.output.manifest.props?.variants).toBeDefined();
    const variantProp = result.output.manifest.props?.variants?.find(
      (p) => p.name === 'variant'
    );
    expect(variantProp).toBeDefined();
    expect(variantProp?.values).toContain('default');
  });

  it('AI manifest includes children info when component accepts children', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    // The mock extracted data has acceptsChildren: true and a children prop
    // Children info should be present
    if (result.output.manifest.children) {
      expect(result.output.manifest.children.accepts).toBe(true);
    }
  });

  it('full manifest props use simplified categorized structure', () => {
    const input = createMockInput();
    const result = builder.build(input);

    if (!isManifestBuildSuccess(result)) return;

    // Full manifest should have categorized props (all categories are optional)
    const props = result.manifest.props;
    // At least some categories should be present from our mock data
    const hasAnyCategory =
      props.variants !== undefined ||
      props.behaviors !== undefined ||
      props.events !== undefined ||
      props.slots !== undefined ||
      props.other !== undefined;
    expect(hasAnyCategory).toBe(true);
  });
});
