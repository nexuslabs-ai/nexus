/**
 * Manifest Builder
 *
 * Combines extracted data from HybridExtractor and generated metadata
 * from MetaGenerator into metadata (system) and manifest (AI) sections.
 *
 * This is the final step in the extraction-generation pipeline that
 * produces the complete component knowledge ready for storage.
 */

import type { ExtractedStory } from '../extractor/storybook/types.js';
import type {
  AIManifest,
  CategorizedProps,
  CodeExample,
  CompoundComponentInfo,
  Dependencies,
  ExtractedData,
  ExtractedSubComponent,
  Guidance,
  ImportStatement,
  PropDefinition,
  StructuredExamples,
  SubComponent,
} from '../types/index.js';
import { kebabCase } from '../utils/case.js';
import { logger } from '../utils/logger.js';
import {
  categorizeProps,
  detectChildrenInfo,
} from '../utils/prop-categorization.js';

import type {
  ManifestBuilderConfig,
  ManifestBuilderInput,
  ManifestBuilderResult,
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
 * into system metadata and AI-focused manifest sections.
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
 * console.log(result.metadata);  // System fields
 * console.log(result.manifest);  // AI-focused fields
 * ```
 */
export class ManifestBuilder {
  private readonly config: {
    defaultPackageName: string;
  };

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
   * Build manifest from extracted data and generated metadata
   *
   * @param input - Builder input containing identity, extracted data, and meta
   * @returns ManifestBuilderResult with flat structure matching ManifestOutput
   * @throws ManifestBuildError if building fails
   */
  build({
    identity,
    extracted,
    meta,
    sourceHash,
    availableComponents,
  }: ManifestBuilderInput): ManifestBuilderResult {
    const { name } = identity;
    const now = new Date().toISOString();

    // === Build props (shared between metadata check and manifest) ===

    // Step 1: Categorize props by semantic purpose
    const categorizedProps = categorizeProps(
      extracted.props,
      extracted.variants
    );

    // Step 2: Normalize variants (add missing CVA variants, merge defaultValues)
    const normalizedProps = this.normalizeVariants(
      extracted.variants,
      extracted.defaultVariants,
      categorizedProps
    );

    // Step 3: Enrich with LLM-generated variant value descriptions
    const enrichedProps = this.mergeValueDescriptions(
      normalizedProps,
      meta.ai?.variantDescriptions
    );

    // === Build shared computed values ===

    const importStatement = this.buildImportStatement(
      name,
      extracted.npmDependencies,
      extracted.compoundInfo
    );

    const examples = this.buildStructuredExamples(meta, extracted);
    const guidance = this.buildGuidance(meta, availableComponents);
    const semanticDescription = this.buildSemanticDescription(meta, name);

    const subComponents = this.buildSubComponents(
      extracted.subComponents,
      meta.ai?.subComponentVariantDescriptions
    );

    const dependencies: Dependencies = {
      npm: extracted.npmDependencies,
      internal: extracted.internalDependencies,
    };

    // === Build AI manifest ===

    const children = detectChildrenInfo(extracted.props);

    const hasProps = Object.values(enrichedProps).some(
      (category) => Array.isArray(category) && category.length > 0
    );

    const description = semanticDescription || meta.description;

    const hasDependencies =
      Object.keys(dependencies.npm).length > 0 ||
      dependencies.internal.length > 0;

    const manifest: AIManifest = {
      name: identity.name,
      slug: identity.slug,
      description,
      importStatement,
      ...(children && { children }),
      ...(hasProps && { props: enrichedProps }),
      ...(examples && { examples }),
      ...(guidance && { guidance }),
      ...(hasDependencies && { dependencies }),
      ...(extracted.baseLibrary && { baseLibrary: extracted.baseLibrary }),
      ...(subComponents && { subComponents }),
      ...(extracted.radixPrimitive && {
        radixPrimitive: extracted.radixPrimitive,
      }),
    };

    return {
      componentName: identity.name,
      identity,
      manifest,
      sourceHash,
      files: extracted.files,
      builtAt: now,
    };
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
   * @param normalizedProps - Props after normalization (with CVA defaults merged)
   * @param variantDescriptions - LLM-generated descriptions keyed by variant name
   * @returns Enriched props with valueDescriptions added
   */
  private mergeValueDescriptions(
    normalizedProps: CategorizedProps,
    variantDescriptions?: Record<string, Record<string, string>>
  ): CategorizedProps {
    if (!variantDescriptions || !normalizedProps.variants) {
      return normalizedProps;
    }

    const updatedVariants = normalizedProps.variants.map((prop) => {
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
      ...normalizedProps,
      variants: updatedVariants,
    };
  }

  /**
   * Build import statement for the component
   *
   * Generates import statement variants for AI consumption:
   * - primary: Named import from package root
   * - typeOnly: Type-only import for props
   * - subpath: Import from component subpath (if supported)
   *
   * For compound components, includes all exported sub-components in the import.
   */
  private buildImportStatement(
    name: string,
    npmDependencies: Record<string, string>,
    compoundInfo?: CompoundComponentInfo
  ): ImportStatement {
    // Derive package name from dependencies or use configured default
    let packageName = this.config.defaultPackageName;
    const designSystemPackages = Object.keys(npmDependencies).filter(
      (dep) =>
        dep.match(/^@[a-z-]+\/(react|components|ui)$/) ||
        dep.includes('design-system')
    );
    if (designSystemPackages.length > 0) {
      packageName = designSystemPackages[0];
    }

    // Build import list: root component + sub-components for compound components
    const importNames =
      compoundInfo?.isCompound && compoundInfo.subComponents.length > 0
        ? [compoundInfo.rootComponent, ...compoundInfo.subComponents]
        : [name];
    const importList = importNames.join(', ');

    return {
      primary: `import { ${importList} } from '${packageName}'`,
      typeOnly: `import type { ${name}Props } from '${packageName}'`,
      // subpath omitted - not currently supported
    };
  }

  /**
   * Build sub-components for compound components
   *
   * Converts extracted sub-component data into manifest SubComponent format.
   * Applies the same prop processing pipeline as main component:
   * categorize → normalize (add CVA defaults) → enrich (add valueDescriptions)
   *
   * @param extractedSubComponents - Sub-components extracted from source
   * @param subComponentVariantDescriptions - LLM-generated variant descriptions keyed by sub-component name
   * @returns Array of SubComponent or undefined if no sub-components
   */
  private buildSubComponents(
    extractedSubComponents?: ExtractedSubComponent[],
    subComponentVariantDescriptions?: Record<
      string,
      Record<string, Record<string, string>>
    >
  ): SubComponent[] | undefined {
    if (!extractedSubComponents || extractedSubComponents.length === 0) {
      return undefined;
    }

    return extractedSubComponents.map((sub) => {
      // Step 1: Categorize props by semantic purpose
      const categorizedProps = categorizeProps(sub.props, sub.variants ?? {});

      // Step 2: Normalize variants (add missing CVA variants, merge defaultValues)
      const normalizedProps = this.normalizeVariants(
        sub.variants ?? {},
        sub.defaultVariants ?? {},
        categorizedProps
      );

      // Step 3: Enrich with LLM-generated variant value descriptions
      const enrichedProps = this.mergeValueDescriptions(
        normalizedProps,
        subComponentVariantDescriptions?.[sub.name]
      );

      // Build subComponent with enriched props
      const subComponent: SubComponent = {
        name: sub.name,
        description: sub.description,
        props: enrichedProps,
        dataSlot: kebabCase(sub.name),
        requiredInComposition: sub.requiredInComposition,
      };

      // Add Radix primitive info if detected
      if (sub.radixPrimitive) {
        subComponent.radixPrimitive = sub.radixPrimitive;
      }

      return subComponent;
    });
  }

  /**
   * Build structured examples from Storybook or LLM
   *
   * Priority:
   * 1. Storybook stories (if available)
   * 2. LLM-generated examples (if available)
   * 3. undefined (no examples)
   *
   * @param meta - Generated metadata from LLM
   * @param extracted - Extracted data (may contain Storybook stories)
   */
  private buildStructuredExamples(
    meta: ManifestBuilderInput['meta'],
    extracted: ExtractedData
  ): StructuredExamples | undefined {
    // Prefer Storybook examples if available
    if (extracted.stories && extracted.stories.length > 0) {
      return this.buildExamplesFromStorybook(extracted.stories);
    }

    // Use LLM-generated examples if available
    return meta.ai?.examples;
  }

  /**
   * Build structured examples from Storybook stories
   *
   * Converts extracted Storybook stories into the StructuredExamples format.
   * Stories are already classified by complexity during extraction.
   *
   * @param stories - Extracted stories from Storybook file
   */
  private buildExamplesFromStorybook(
    stories: ExtractedStory[]
  ): StructuredExamples {
    // Find minimal example (first 'minimal' complexity or first story)
    const minimalStory =
      stories.find((s) => s.complexity === 'minimal') ?? stories[0];

    const minimal: CodeExample = {
      title: minimalStory.title,
      code: minimalStory.code,
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
   * Build guidance from meta.ai
   *
   * If availableComponents is provided, filters relatedComponents to only
   * include components that actually exist in the design system.
   *
   * @param meta - Generated metadata from LLM
   * @param availableComponents - Optional list of component names to filter against
   */
  private buildGuidance(
    meta: ManifestBuilderInput['meta'],
    availableComponents?: string[]
  ): Guidance {
    const ai = meta.ai;
    let relatedComponents = ai?.relatedComponents ?? [];

    // Filter relatedComponents if availableComponents is provided
    if (availableComponents && relatedComponents.length > 0) {
      const available = new Set(availableComponents);
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
}
