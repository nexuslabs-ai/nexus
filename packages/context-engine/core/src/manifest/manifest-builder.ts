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
  AIManifest,
  CategorizedProps,
  CodeExample,
  ComponentManifest,
  CompoundComponentInfo,
  CvaVariants,
  EmbeddingStatus,
  ExtractedData,
  ExtractedProp,
  ExtractedSubComponent,
  Guidance,
  ImportStatement,
  ManifestMetadata,
  ManifestOutput,
  PropDefinition,
  StructuredExamples,
  SubComponent,
} from '../types/index.js';
import {
  DEFAULT_EMBEDDING_MODEL,
  MANIFEST_SCHEMA_VERSION,
} from '../types/index.js';
import { kebabCase } from '../utils/case.js';
import { generateObjectHash } from '../utils/hash.js';
import { logger } from '../utils/logger.js';
import {
  categorizeProps,
  detectChildrenInfo,
} from '../utils/prop-categorization.js';

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
 * Maximum number of common examples to include in the manifest.
 * Common examples show typical usage patterns for the component.
 */
const MAX_COMMON_EXAMPLES = 8;

/**
 * Maximum number of advanced examples to include in the manifest.
 * Advanced examples show complex integration or edge case patterns.
 */
const MAX_ADVANCED_EXAMPLES = 3;

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
  private readonly config: {
    defaultPackageName: string;
    availableComponents?: string[];
  };

  /**
   * Create a new ManifestBuilder
   *
   * @param config - Optional configuration
   */
  constructor(config: ManifestBuilderConfig = {}) {
    this.config = {
      defaultPackageName: config.defaultPackageName ?? DEFAULT_PACKAGE_NAME,
      availableComponents: config.availableComponents,
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

    // Merge LLM-generated variant descriptions into props.variants
    categorizedProps = this.mergeValueDescriptions(
      categorizedProps,
      meta.ai?.variantDescriptions
    );

    // Generate import statement (include all exports for compound components)
    const importStatement = this.buildImportStatement(
      name,
      extracted.npmDependencies,
      extracted.compoundInfo
    );

    // Build minimal example
    const minimalExample = this.buildMinimalExample(
      name,
      extracted.variants,
      extracted.acceptsChildren
    );

    // Build structured examples from meta (prefer Storybook if available)
    const examples = this.buildStructuredExamples(name, meta, extracted);

    // Build guidance from meta.ai
    const guidance = this.buildGuidance(meta);

    // Get semantic description (top-level field)
    const semanticDescription = this.buildSemanticDescription(meta, name);

    // Build sub-components for compound components
    const subComponents = this.buildSubComponents(extracted.subComponents);

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

      // New v1.0 fields
      importStatement,
      minimalExample,
      props: categorizedProps,
      examples,
      guidance,
      semanticDescription,

      // From extraction
      files: extracted.files,
      dependencies: {
        npm: extracted.npmDependencies,
        internal: extracted.internalDependencies,
      },

      // Base library if detected
      baseLibrary: extracted.baseLibrary,

      // Sub-components for compound components
      subComponents,

      // Radix primitive info for direct re-exports
      radixPrimitive: extracted.radixPrimitive,

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

    // Build the split output structure
    const output: ManifestOutput = {
      componentName: identity.name,
      metadata: this.buildMetadata(manifest),
      manifest: this.buildAIManifest(extracted, manifest),
    };

    return {
      type: ManifestBuildOutputType.Success,
      output,
      manifest, // Keep for internal use
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
   * Solution:
   * 1. MERGE defaultValue into existing variant props that lack it
   * 2. ADD missing variant props for CVA variants not in props.variants
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
    const cvaVariantNames = Object.keys(extractedVariants);

    if (cvaVariantNames.length === 0) {
      return categorizedProps;
    }

    const existingVariants = categorizedProps.variants ?? [];
    const existingVariantPropNames = new Set(
      existingVariants.map((p) => p.name)
    );

    // MERGE defaultValue into existing variant props
    const updatedVariants = existingVariants.map((prop) => {
      const defaultValue = defaultVariants[prop.name];
      if (defaultValue !== undefined && prop.defaultValue === undefined) {
        return { ...prop, defaultValue };
      }
      return prop;
    });

    // ADD missing variant props
    const missingVariantProps: PropDefinition[] = cvaVariantNames
      .filter((name) => !existingVariantPropNames.has(name))
      .map((name) => ({
        name,
        type: 'string',
        description: `Component ${name} variant`,
        defaultValue: defaultVariants[name],
        values: extractedVariants[name] ?? [],
        required: false,
      }));

    return {
      ...categorizedProps,
      variants: [...updatedVariants, ...missingVariantProps],
    };
  }

  /**
   * Merge LLM-generated variant descriptions into props.variants
   *
   * The LLM generates descriptions for each variant value (e.g., what "destructive"
   * means for the variant prop). This method merges those descriptions into the
   * corresponding props so AI assistants understand what each value does.
   *
   * @param categorizedProps - Props already categorized
   * @param variantDescriptions - LLM-generated descriptions keyed by variant name
   * @returns Updated categorized props with valueDescriptions
   */
  private mergeValueDescriptions(
    categorizedProps: CategorizedProps,
    variantDescriptions?: Record<string, Record<string, string>>
  ): CategorizedProps {
    if (!variantDescriptions || !categorizedProps.variants) {
      return categorizedProps;
    }

    const updatedVariants = categorizedProps.variants.map((prop) => {
      const descriptions = variantDescriptions[prop.name];
      if (!descriptions) {
        return prop;
      }

      return {
        ...prop,
        valueDescriptions: descriptions,
      };
    });

    return {
      ...categorizedProps,
      variants: updatedVariants,
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
   *
   * For compound components, includes all exported sub-components in the import.
   */
  private buildImportStatement(
    name: string,
    npmDependencies: Record<string, string>,
    compoundInfo?: CompoundComponentInfo
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

    // Build exports list: root component + sub-components for compound components
    const exports =
      compoundInfo?.isCompound && compoundInfo.subComponents.length > 0
        ? [compoundInfo.rootComponent, ...compoundInfo.subComponents]
        : undefined;

    return generateImportStatement({
      componentName: name,
      packageName,
      hasSubpathExports: false, // Conservative default
      exports,
    });
  }

  /**
   * Build sub-components for compound components
   *
   * Converts extracted sub-component data into manifest SubComponent format
   * with categorized props, Radix primitive info, and CVA variants.
   *
   * @param extractedSubComponents - Sub-components extracted from source
   * @returns Array of SubComponent or undefined if no sub-components
   */
  private buildSubComponents(
    extractedSubComponents?: ExtractedSubComponent[]
  ): SubComponent[] | undefined {
    if (!extractedSubComponents || extractedSubComponents.length === 0) {
      return undefined;
    }

    return extractedSubComponents.map((sub) => {
      // Categorize props with any CVA variants for this subComponent
      const categorizedProps = categorizeProps(sub.props, sub.variants ?? {});

      // Build base subComponent
      const subComponent: SubComponent = {
        name: sub.name,
        description: sub.description,
        props: categorizedProps,
        dataSlot: kebabCase(sub.name),
        requiredInComposition: sub.requiredInComposition,
      };

      // Add Radix primitive info if detected
      if (sub.radixPrimitive) {
        subComponent.radixPrimitive = sub.radixPrimitive;
      }

      // Add CVA variants if any
      if (sub.variants && Object.keys(sub.variants).length > 0) {
        subComponent.variants = this.buildCvaVariants(
          sub.variants,
          sub.defaultVariants ?? {}
        );
      }

      return subComponent;
    });
  }

  /**
   * Build minimal example code
   *
   * @param name - Component name
   * @param variants - CVA variants (used to determine if props exist)
   * @param acceptsChildren - Whether the component accepts children
   */
  private buildMinimalExample(
    name: string,
    variants: Record<string, string[]>,
    acceptsChildren: boolean
  ): string {
    // If component accepts children and has variants, show with content
    // Otherwise use self-closing tag
    if (acceptsChildren && Object.keys(variants).length > 0) {
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
      code: minimalStory?.code ?? `<${componentName} />`,
      isPrimary: true,
    };

    // Common examples - exclude the minimal story
    const common: CodeExample[] = stories
      .filter((s) => s.complexity === 'common' && s !== minimalStory)
      .slice(0, MAX_COMMON_EXAMPLES)
      .map((s) => ({
        title: s.title,
        code: s.code,
      }));

    // Advanced examples
    const advancedStories = stories.filter((s) => s.complexity === 'advanced');
    const advanced: CodeExample[] | undefined =
      advancedStories.length > 0
        ? advancedStories.slice(0, MAX_ADVANCED_EXAMPLES).map((s) => ({
            title: s.title,
            code: s.code,
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

      return {
        title,
        code,
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
   * Build guidance from meta.ai
   *
   * If availableComponents is configured, filters relatedComponents to only
   * include components that actually exist in the design system.
   */
  private buildGuidance(meta: ManifestBuilderInput['meta']): Guidance {
    const ai = meta.ai;
    let relatedComponents = ai?.relatedComponents ?? [];

    // Filter relatedComponents if availableComponents is configured
    if (this.config.availableComponents && relatedComponents.length > 0) {
      const available = new Set(this.config.availableComponents);
      const filtered = relatedComponents.filter((comp) => available.has(comp));

      if (filtered.length !== relatedComponents.length) {
        const removed = relatedComponents.filter(
          (comp) => !available.has(comp)
        );
        logger.debug('Filtered non-existent relatedComponents', {
          original: relatedComponents,
          filtered,
          removed,
        });
      }

      relatedComponents = filtered;
    }

    return {
      whenToUse: ai?.whenToUse ?? `Use ${meta.name} for common use cases.`,
      whenNotToUse: ai?.whenNotToUse ?? 'Consider alternatives when needed.',
      accessibility: ai?.a11yNotes ?? 'Follows WAI-ARIA patterns.',
      patterns: ai?.patterns ?? [],
      relatedComponents,
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
   * Build system metadata (not for AI consumption)
   *
   * Extracts system-level fields from the full manifest that are used
   * for tracking, embeddings, and version management.
   *
   * @param manifest - The full ComponentManifest
   * @returns ManifestMetadata with system fields
   */
  private buildMetadata(manifest: ComponentManifest): ManifestMetadata {
    return {
      id: manifest.id,
      schemaVersion: manifest.schemaVersion,
      version: manifest.version,
      framework: manifest.framework,
      visibility: manifest.visibility,
      embeddingStatus: manifest.embeddingStatus,
      embeddingModel: manifest.embeddingModel,
      embeddingError: manifest.embeddingError,
      generatedAt: manifest.generatedAt,
      updatedAt: manifest.updatedAt,
      sourceHash: manifest.sourceHash,
      metaHash: manifest.metaHash,
      files: manifest.files,
    };
  }

  /**
   * Build AI-focused manifest (optimized for token efficiency)
   *
   * Creates a slim manifest with only the fields AI assistants need
   * to generate correct component code. Props are already clean from
   * extraction (no passthrough props).
   *
   * Note: Top-level variants removed - variant info is in props.variants
   * with values and valueDescriptions for each prop.
   *
   * @param extracted - Extracted data for children detection
   * @param manifest - The full ComponentManifest
   * @returns AIManifest optimized for AI consumption
   */
  private buildAIManifest(
    extracted: ExtractedData,
    manifest: ComponentManifest
  ): AIManifest {
    // Detect children info from extracted props
    const children = detectChildrenInfo(extracted.props);

    // Check if props has any content (any category with items)
    const hasProps =
      manifest.props &&
      Object.values(manifest.props).some(
        (category) => category && category.length > 0
      );

    // Use semanticDescription as the single description (it's richer)
    const description = manifest.semanticDescription || manifest.description;

    // Build dependencies (omit if empty)
    const hasDependencies =
      Object.keys(manifest.dependencies.npm).length > 0 ||
      manifest.dependencies.internal.length > 0;

    return {
      name: manifest.name,
      slug: manifest.slug,
      description,
      importStatement: manifest.importStatement,
      ...(children && { children }),
      ...(hasProps && { props: manifest.props }),
      ...(manifest.examples && { examples: manifest.examples }),
      ...(manifest.guidance && { guidance: manifest.guidance }),
      ...(hasDependencies && { dependencies: manifest.dependencies }),
      ...(manifest.baseLibrary && { baseLibrary: manifest.baseLibrary }),
      ...(manifest.subComponents && { subComponents: manifest.subComponents }),
      ...(manifest.radixPrimitive && {
        radixPrimitive: manifest.radixPrimitive,
      }),
    };
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
        guidance: updatedGuidance!,
        examples: updatedExamples!,
        semanticDescription:
          updates.meta.ai?.semanticDescription ?? updates.meta.description,
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
      ai: {
        semanticDescription:
          extracted.sourceDescription ||
          `A ${name} component for the design system.`,
        patterns: [] as string[],
        examples: [] as string[],
        relatedComponents: extracted.internalDependencies,
      },
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
}
