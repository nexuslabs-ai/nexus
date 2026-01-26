/**
 * Manifest Builder
 *
 * Combines extracted data from HybridExtractor and generated metadata
 * from MetaGenerator into a complete ComponentManifest.
 *
 * This is the final step in the extraction-generation pipeline that
 * produces the complete component knowledge ready for storage.
 */

import type { ExtractedStory } from '../extractor/storybook/types.js';
import type {
  CategorizedProps,
  CodeExample,
  ComponentManifest,
  CvaVariants,
  EmbeddingStatus,
  ExtractedData,
  ExtractedProp,
  Guidance,
  ImportStatement,
  PropDefinition,
  StructuredExamples,
} from '../types/index.js';
import {
  DEFAULT_EMBEDDING_MODEL,
  MANIFEST_SCHEMA_VERSION,
} from '../types/index.js';
import { generateObjectHash } from '../utils/hash.js';
import { logger } from '../utils/logger.js';
import { categorizeProps } from '../utils/prop-categorization.js';

import { generateImportStatement } from './import-generator.js';
import {
  type ManifestBuilderConfig,
  type ManifestBuilderInput,
  type ManifestBuilderOutput,
  ManifestBuildOutputType,
  type ManifestUpdateInput,
} from './types.js';

/** Default package name when detection fails */
const DEFAULT_PACKAGE_NAME = '@nexus/react';

/**
 * ManifestBuilder combines extracted data and generated metadata
 * into a complete ComponentManifest.
 *
 * @example
 * ```typescript
 * const builder = new ManifestBuilder();
 *
 * const result = builder.build({
 *   orgId: 'org-uuid',
 *   identity: { id: 'comp-uuid', slug: 'button-react-abc123', name: 'Button', framework: 'react' },
 *   extracted: extractionResult.data,
 *   meta: generationResult.meta,
 *   sourceHash: extractionResult.sourceHash,
 *   version: '1.0.0'
 * });
 *
 * if (result.type === 'success') {
 *   console.log(result.manifest);
 * }
 * ```
 */
export class ManifestBuilder {
  private readonly config: Required<ManifestBuilderConfig>;

  /**
   * Create a new ManifestBuilder
   *
   * @param config - Optional configuration
   */
  constructor(config: ManifestBuilderConfig = {}) {
    this.config = {
      defaultPackageName: config.defaultPackageName ?? DEFAULT_PACKAGE_NAME,
    };
  }

  /**
   * Build a complete ComponentManifest from extracted data and generated metadata
   *
   * @param input - Builder input containing identity, extracted data, and meta
   * @returns ManifestBuilderOutput with success or failure result
   */
  build({
    identity,
    extracted,
    meta,
    sourceHash,
    version = '0.0.1',
  }: ManifestBuilderInput): ManifestBuilderOutput {
    const { name } = identity;

    // TypeScript types enforce required fields - no runtime validation needed
    const now = new Date().toISOString();
    const metaHash = generateObjectHash(meta);

    // Categorize props using the dedicated utility
    let categorizedProps = this.buildCategorizedProps(
      extracted.props,
      extracted.variants
    );

    // Normalize variants to ensure consistency between manifest.variants and props.variants
    categorizedProps = this.normalizeVariants(
      extracted.variants,
      extracted.defaultVariants,
      categorizedProps
    );

    // Build CVA variants with defaults
    const cvaVariants = this.buildCvaVariants(
      extracted.variants,
      extracted.defaultVariants
    );

    // Generate import statement
    const importStatement = this.buildImportStatement(
      name,
      extracted.npmDependencies
    );

    // Build minimal example
    const minimalExample = this.buildMinimalExample(name, extracted.variants);

    // Build structured examples from meta (prefer Storybook if available)
    const examples = this.buildStructuredExamples(name, meta, extracted);

    // Build guidance from meta.ai
    const guidance = this.buildGuidance(meta);

    // Get semantic description (top-level field)
    const semanticDescription = this.buildSemanticDescription(meta, name);

    // Get tokens
    const tokens = meta.ai?.tokens ?? [];

    const manifest: ComponentManifest = {
      // Schema version for migrations
      schemaVersion: MANIFEST_SCHEMA_VERSION,

      // Identity
      id: identity.id,
      slug: identity.slug,
      name: identity.name,
      version,
      framework: identity.framework,

      // Visibility (default to private)
      visibility: 'private',

      // From meta (generated)
      description: meta.description,
      tier: meta.tier,

      // New v1.0 fields
      importStatement,
      minimalExample,
      props: categorizedProps,
      variants: cvaVariants,
      examples,
      guidance,
      semanticDescription,
      tokens,

      // From extraction
      files: extracted.files,
      dependencies: {
        npm: extracted.npmDependencies,
        internal: extracted.internalDependencies,
      },

      // Base library if detected
      baseLibrary: extracted.baseLibrary,

      // Embedding status (pending until processed)
      embeddingStatus: 'pending' as EmbeddingStatus,
      embeddingError: undefined,
      embeddingModel: DEFAULT_EMBEDDING_MODEL,

      // Timestamps and hashes
      generatedAt: now,
      updatedAt: now,
      sourceHash,
      metaHash,
    };

    return {
      type: ManifestBuildOutputType.Success,
      manifest,
      builtAt: now,
    };
  }

  /**
   * Build categorized props from extracted props and variants
   */
  private buildCategorizedProps(
    props: ExtractedProp[],
    variants: Record<string, string[]>
  ): CategorizedProps {
    return categorizeProps(props, variants);
  }

  /**
   * Normalize variant storage to ensure consistency.
   *
   * Problem: CVA variants may be extracted but not appear in props.variants
   * because react-docgen-typescript doesn't see them as props (they come from
   * VariantProps<typeof componentVariants>).
   *
   * Solution: For each CVA variant that isn't already in props.variants,
   * create prop metadata so AI assistants have complete variant information
   * in both manifest.variants (values) and props.variants (prop metadata).
   *
   * @param extractedVariants - CVA variant definitions from extraction
   * @param defaultVariants - Default variant values from extraction
   * @param categorizedProps - Props already categorized
   * @returns Updated categorized props with normalized variants
   */
  private normalizeVariants(
    extractedVariants: ExtractedData['variants'],
    defaultVariants: ExtractedData['defaultVariants'],
    categorizedProps: CategorizedProps
  ): CategorizedProps {
    // Get CVA variant names
    const cvaVariantNames = Object.keys(extractedVariants);

    if (cvaVariantNames.length === 0) {
      return categorizedProps;
    }

    // Check which variant props are already in props.variants
    const existingVariantPropNames = new Set(
      categorizedProps.variants.map((p) => p.name)
    );

    // Create prop metadata for CVA variants that aren't already in props.variants
    const missingVariantProps: PropDefinition[] = cvaVariantNames
      .filter((name) => !existingVariantPropNames.has(name))
      .map((name) => {
        const values = extractedVariants[name] ?? [];
        const defaultValue = defaultVariants[name];

        return {
          name,
          type:
            values.length > 0
              ? values.map((v) => `'${v}'`).join(' | ')
              : 'string',
          typeCategory: 'literal' as const,
          required: false,
          description: `Component ${name} variant`,
          defaultValue,
          possibleValues: values,
        };
      });

    // If no missing variants, return as-is
    if (missingVariantProps.length === 0) {
      return categorizedProps;
    }

    // Add missing variant props to the variants category
    return {
      ...categorizedProps,
      variants: [...categorizedProps.variants, ...missingVariantProps],
    };
  }

  /**
   * Build CVA variants with default values
   */
  private buildCvaVariants(
    variants: Record<string, string[]>,
    defaultVariants: Record<string, string>
  ): CvaVariants {
    const result: CvaVariants = {};

    for (const [variantName, values] of Object.entries(variants)) {
      result[variantName] = {
        values,
        default: defaultVariants[variantName],
      };
    }

    return result;
  }

  /**
   * Build import statement for the component
   */
  private buildImportStatement(
    name: string,
    npmDependencies: Record<string, string>
  ): ImportStatement {
    // Start with configurable default package name
    let packageName = this.config.defaultPackageName;

    // Try to derive package name from dependencies
    // Look for design system packages in dependencies
    const designSystemPackages = Object.keys(npmDependencies).filter(
      (dep) =>
        dep.match(/^@[a-z-]+\/(react|components|ui)$/) ||
        dep.includes('design-system')
    );

    if (designSystemPackages.length > 0) {
      packageName = designSystemPackages[0];
    }

    return generateImportStatement({
      componentName: name,
      packageName,
      hasSubpathExports: false, // Conservative default
    });
  }

  /**
   * Build minimal example code
   */
  private buildMinimalExample(
    name: string,
    variants: Record<string, string[]>
  ): string {
    // If component has variants, show a basic variant usage
    // Otherwise just show the component with no props
    if (Object.keys(variants).length > 0) {
      return `<${name}>Content</${name}>`;
    }
    return `<${name} />`;
  }

  /**
   * Build structured examples from meta, preferring Storybook examples if available
   *
   * @param name - Component name
   * @param meta - Generated metadata from LLM
   * @param extracted - Extracted data (may contain Storybook stories)
   */
  private buildStructuredExamples(
    name: string,
    meta: ManifestBuilderInput['meta'],
    extracted: ExtractedData
  ): StructuredExamples {
    // Prefer Storybook examples if available
    if (extracted.stories && extracted.stories.length > 0) {
      return this.buildExamplesFromStorybook(name, extracted.stories);
    }

    // Fall back to AI-generated examples
    return this.buildExamplesFromAI(name, meta);
  }

  /**
   * Build structured examples from Storybook stories
   *
   * Converts extracted Storybook stories into the StructuredExamples format.
   * Stories are already classified by complexity during extraction.
   *
   * @param componentName - Component name for fallback code generation
   * @param stories - Extracted stories from Storybook file
   */
  private buildExamplesFromStorybook(
    componentName: string,
    stories: ExtractedStory[]
  ): StructuredExamples {
    // Find minimal example (first 'minimal' complexity or first story)
    const minimalStory =
      stories.find((s) => s.complexity === 'minimal') ?? stories[0];

    const minimal: CodeExample = {
      title: minimalStory?.title ?? 'Basic',
      code:
        minimalStory?.renderCode ??
        minimalStory?.code ??
        `<${componentName} />`,
      isPrimary: true,
      propsUsed:
        minimalStory?.propsUsed && minimalStory.propsUsed.length > 0
          ? minimalStory.propsUsed
          : undefined,
    };

    // Common examples (max 8) - exclude the minimal story
    const common: CodeExample[] = stories
      .filter((s) => s.complexity === 'common' && s !== minimalStory)
      .slice(0, 8)
      .map((s) => ({
        title: s.title,
        code: s.renderCode ?? s.code ?? `<${componentName} />`,
        propsUsed: s.propsUsed.length > 0 ? s.propsUsed : undefined,
      }));

    // Advanced examples (max 3)
    const advancedStories = stories.filter((s) => s.complexity === 'advanced');
    const advanced: CodeExample[] | undefined =
      advancedStories.length > 0
        ? advancedStories.slice(0, 3).map((s) => ({
            title: s.title,
            code: s.renderCode ?? s.code ?? `<${componentName} />`,
            propsUsed: s.propsUsed.length > 0 ? s.propsUsed : undefined,
          }))
        : undefined;

    return { minimal, common, advanced };
  }

  /**
   * Build structured examples from AI-generated examples
   *
   * Fallback when Storybook stories are not available.
   *
   * @param name - Component name
   * @param meta - Generated metadata from LLM
   */
  private buildExamplesFromAI(
    name: string,
    meta: ManifestBuilderInput['meta']
  ): StructuredExamples {
    const aiExamples = meta.ai?.examples ?? [];

    // Build minimal example
    const minimal: CodeExample = {
      title: 'Basic',
      code: aiExamples[0] ?? `<${name} />`,
      isPrimary: true,
    };

    // Build common examples from remaining AI examples
    const common: CodeExample[] = aiExamples.slice(1).map((code, index) => {
      // Try to extract a meaningful title from the code
      const title = this.extractExampleTitle(code, index);
      const propsUsed = this.extractPropsUsed(code);

      return {
        title,
        code,
        propsUsed: propsUsed.length > 0 ? propsUsed : undefined,
      };
    });

    return {
      minimal,
      common,
      // advanced is optional - could be populated in the future
    };
  }

  /**
   * Extract a title from example code
   */
  private extractExampleTitle(code: string, index: number): string {
    // Try to detect pattern from props used
    if (code.includes('variant=')) {
      const match = code.match(/variant="([^"]+)"/);
      if (match) {
        return `${this.capitalize(match[1])} variant`;
      }
    }

    if (code.includes('size=')) {
      const match = code.match(/size="([^"]+)"/);
      if (match) {
        return `${this.capitalize(match[1])} size`;
      }
    }

    if (code.includes('disabled')) {
      return 'Disabled state';
    }

    if (code.includes('loading')) {
      return 'Loading state';
    }

    if (code.includes('asChild')) {
      return 'Composition pattern';
    }

    if (code.includes('onClick')) {
      return 'With click handler';
    }

    return `Example ${index + 2}`;
  }

  /**
   * Extract props used from example code
   */
  private extractPropsUsed(code: string): string[] {
    const propsUsed: string[] = [];

    // Match prop=value or prop="value" or prop={value} patterns
    const propMatches = code.matchAll(/\s([a-zA-Z]+)(?:=["'{]|[^a-zA-Z>])/g);
    for (const match of propMatches) {
      const propName = match[1];
      // Filter out common non-prop patterns
      if (
        !['div', 'span', 'a', 'p', 'className', 'style', 'key', 'ref'].includes(
          propName
        )
      ) {
        propsUsed.push(propName);
      }
    }

    return [...new Set(propsUsed)]; // Remove duplicates
  }

  /**
   * Build guidance from meta.ai
   */
  private buildGuidance(meta: ManifestBuilderInput['meta']): Guidance {
    const ai = meta.ai;

    return {
      whenToUse: ai?.whenToUse ?? `Use ${meta.name} for common use cases.`,
      whenNotToUse: ai?.whenNotToUse ?? 'Consider alternatives when needed.',
      accessibility: ai?.a11yNotes ?? 'Follows WAI-ARIA patterns.',
      patterns: ai?.patterns ?? [],
      relatedComponents: ai?.relatedComponents ?? [],
    };
  }

  /**
   * Build semantic description for embeddings/search
   */
  private buildSemanticDescription(
    meta: ManifestBuilderInput['meta'],
    name: string
  ): string {
    // Prefer explicit semantic description from AI
    if (meta.ai?.semanticDescription) {
      return meta.ai.semanticDescription;
    }

    // Fall back to regular description
    if (meta.description && meta.description.length >= 50) {
      return meta.description;
    }

    // Generate a minimal semantic description
    return `The ${name} component provides functionality for building user interfaces. ${meta.description}`;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Update an existing manifest with new extraction or generation data
   *
   * Preserves unchanged fields and updates timestamps appropriately.
   * When source code changes, marks embedding status as pending.
   *
   * @param existing - The existing manifest to update
   * @param updates - Partial updates to apply
   * @returns Updated manifest
   */
  update(
    existing: ComponentManifest,
    updates: ManifestUpdateInput
  ): ComponentManifest {
    const now = new Date().toISOString();
    const { name } = existing;

    // Build updated props if extraction changed
    const updatedProps: CategorizedProps | undefined = updates.extracted
      ? this.buildCategorizedProps(
          updates.extracted.props,
          updates.extracted.variants
        )
      : undefined;

    // Build updated variants if extraction changed
    const updatedVariants: CvaVariants | undefined = updates.extracted
      ? this.buildCvaVariants(
          updates.extracted.variants,
          updates.extracted.defaultVariants
        )
      : undefined;

    // Build updated guidance if meta changed
    const updatedGuidance: Guidance | undefined = updates.meta
      ? this.buildGuidance(updates.meta)
      : undefined;

    // Build updated examples based on what's being updated
    // Priority: Storybook stories (if extraction provided) > AI-generated (if meta provided)
    let updatedExamples: StructuredExamples | undefined;
    if (updates.extracted && updates.extracted.stories?.length) {
      // New extraction with Storybook stories - use them
      updatedExamples = this.buildExamplesFromStorybook(
        name,
        updates.extracted.stories
      );
    } else if (updates.meta) {
      // New meta without Storybook - use AI-generated examples
      updatedExamples = this.buildExamplesFromAI(name, updates.meta);
    }

    return {
      ...existing,
      updatedAt: now,

      // Extraction updates
      ...(updates.extracted && {
        props: updatedProps!,
        variants: updatedVariants!,
        files: updates.extracted.files,
        dependencies: {
          npm: updates.extracted.npmDependencies,
          internal: updates.extracted.internalDependencies,
        },
        baseLibrary: updates.extracted.baseLibrary,
      }),

      // Meta updates
      ...(updates.meta && {
        description: updates.meta.description,
        tier: updates.meta.tier,
        guidance: updatedGuidance!,
        examples: updatedExamples!,
        semanticDescription:
          updates.meta.ai?.semanticDescription ?? updates.meta.description,
        tokens: updates.meta.ai?.tokens ?? [],
        metaHash: generateObjectHash(updates.meta),
      }),

      // Source hash update (triggers re-embedding)
      ...(updates.sourceHash && {
        sourceHash: updates.sourceHash,
        embeddingStatus: 'pending' as const,
        embeddingError: undefined,
      }),

      // Version update
      ...(updates.version && { version: updates.version }),
    };
  }

  /**
   * Create a minimal manifest for cases where generation fails
   *
   * Uses extracted data with placeholder meta values.
   * Useful for fallback scenarios where we want to store extraction
   * results even if LLM generation fails.
   *
   * @param input - Partial input with extraction data
   * @returns Minimal manifest or failure
   */
  buildMinimal({
    orgId,
    identity,
    extracted,
    sourceHash,
    version = '0.0.1',
    name,
  }: Omit<ManifestBuilderInput, 'meta'> & {
    name: string;
  }): ManifestBuilderOutput {
    // Create placeholder meta from extracted data
    const placeholderMeta = {
      name,
      description: extracted.sourceDescription || `${name} component`,
      tier: 'free' as const,
      ai: {
        semanticDescription:
          extracted.sourceDescription ||
          `A ${name} component for the design system.`,
        patterns: [] as string[],
        tokens: [] as string[],
        examples: [] as string[],
        relatedComponents: extracted.internalDependencies,
      },
      variants: extracted.variants,
      defaults: extracted.defaultVariants,
    };

    return this.build({
      orgId,
      identity,
      extracted,
      meta: placeholderMeta,
      sourceHash,
      version,
    });
  }

  /**
   * Validate that propsUsed in examples reference actual props
   *
   * Logs warnings for hallucinated prop references.
   */
  validatePropsUsed(
    examples: StructuredExamples,
    props: CategorizedProps
  ): void {
    // Collect all prop names
    const allPropNames = new Set<string>();
    for (const category of Object.values(props)) {
      for (const prop of category) {
        allPropNames.add(prop.name);
      }
    }

    // Check minimal example
    this.validateExamplePropsUsed(examples.minimal, allPropNames, 'minimal');

    // Check common examples
    for (const example of examples.common) {
      this.validateExamplePropsUsed(example, allPropNames, example.title);
    }

    // Check advanced examples
    if (examples.advanced) {
      for (const example of examples.advanced) {
        this.validateExamplePropsUsed(example, allPropNames, example.title);
      }
    }
  }

  /**
   * Validate a single example's propsUsed
   */
  private validateExamplePropsUsed(
    example: CodeExample,
    validProps: Set<string>,
    exampleName: string
  ): void {
    if (!example.propsUsed) return;

    for (const propName of example.propsUsed) {
      if (!validProps.has(propName)) {
        logger.warn(
          `Example "${exampleName}" references unknown prop: ${propName}`
        );
      }
    }
  }
}
