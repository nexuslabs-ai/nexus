/**
 * Hybrid Extractor
 *
 * Orchestrates the full extraction pipeline by combining multiple
 * extraction strategies:
 *
 * 1. ReactDocgenExtractor (PRIMARY) - For standard React components
 * 2. TsMorphExtractor (FALLBACK) - When primary fails or returns incomplete data
 * 3. VariantExtractor - For CVA/tailwind-variants (always ts-morph)
 * 4. DependencyExtractor - For import analysis (always ts-morph)
 * 5. StorybookExtractor - For examples from .stories.tsx files (if provided)
 * 6. CompoundDetector - For compound component detection (Dialog, Accordion, etc.)
 *
 * Uses explicit fallback triggers from fallback-triggers.ts for predictable behavior.
 */

import {
  BASE_LIBRARIES,
  type BaseLibraryName,
  isBaseLibraryPackage,
} from '../constants/index.js';
import type { CompoundComponentInfo, ExtractedData } from '../types/index.js';
import { pascalCase } from '../utils/case.js';
import { generateSourceHash } from '../utils/hash.js';
import { generateComponentId, generateSlug } from '../utils/id.js';
import { createLogger } from '../utils/logger.js';

import { detectCompoundComponent } from './compound-detector.js';
import { DependencyExtractor } from './dependency-extractor.js';
import {
  type FallbackReason,
  getFallbackReasonDescription,
  shouldFallback,
} from './fallback-triggers.js';
import { ReactDocgenExtractor } from './react-docgen-extractor.js';
import { StorybookExtractor } from './storybook/storybook-extractor.js';
import type { ArgTypeInfo, ExtractedStory } from './storybook/types.js';
import { TsMorphExtractor } from './ts-morph-extractor.js';
import {
  type ExtractionInput,
  type ExtractionOutput,
  ExtractionOutputType,
  ExtractorMethod,
  type IExtractor,
} from './types.js';
import { VariantExtractor } from './variant-extractor.js';

const logger = createLogger({ name: 'hybrid-extractor' });

/**
 * Hybrid extractor that combines multiple extraction strategies
 *
 * Strategy:
 * 1. Try react-docgen-typescript first (best for standard React components)
 * 2. Fall back to ts-morph based on EXPLICIT triggers (see fallback-triggers.ts)
 * 3. Always use ts-morph for variants (CVA) and dependencies (imports)
 */
export class HybridExtractor implements IExtractor {
  private reactDocgen: ReactDocgenExtractor;
  private tsMorph: TsMorphExtractor;
  private variantExtractor: VariantExtractor;
  private dependencyExtractor: DependencyExtractor;
  private storybookExtractor: StorybookExtractor;

  constructor() {
    this.reactDocgen = new ReactDocgenExtractor();
    this.tsMorph = new TsMorphExtractor();
    this.variantExtractor = new VariantExtractor();
    this.dependencyExtractor = new DependencyExtractor();
    this.storybookExtractor = new StorybookExtractor();
  }

  /**
   * Extract component data from source code
   *
   * Flow:
   * 1. Compute source hash for tracking
   * 2. Extract props (primary, fallback if needed)
   * 3. Extract variants
   * 4. Extract dependencies
   * 5. Build and return ExtractedData
   */
  async extract(input: ExtractionInput): Promise<ExtractionOutput> {
    const startTime = performance.now();

    // Step 1: Compute source hash for change detection
    const sourceHash = generateSourceHash(input.sourceCode);

    try {
      // Step 2: Extract props using primary extractor
      let propsResult = await this.reactDocgen.extractProps(
        input.sourceCode,
        input.name,
        input.filePath
      );

      let extractionMethod: ExtractorMethod = ExtractorMethod.ReactDocgen;
      let fallbackTriggered = false;
      let fallbackReason: FallbackReason | undefined;

      // Step 3: Check explicit fallback triggers
      const fallbackCheck = shouldFallback(propsResult, input.sourceCode);

      if (fallbackCheck.shouldFallback) {
        fallbackTriggered = true;
        fallbackReason = fallbackCheck.reason;

        logger.info('Fallback to ts-morph triggered', {
          name: input.name,
          reason: fallbackReason,
          description: fallbackReason
            ? getFallbackReasonDescription(fallbackReason)
            : undefined,
        });

        // Try fallback extractor
        propsResult = await this.tsMorph.extractProps(
          input.sourceCode,
          input.name,
          input.filePath
        );

        // Update extraction method based on fallback result
        extractionMethod = propsResult
          ? ExtractorMethod.TsMorph
          : ExtractorMethod.Hybrid;
      }

      // Step 4: Extract variants (always ts-morph, operates independently)
      const { variants, defaultVariants } = this.variantExtractor.extract(
        input.sourceCode,
        input.filePath
      );

      // Step 5: Extract dependencies (always ts-morph, operates independently)
      const { npmDependencies, internalDependencies, baseLibrary } =
        this.dependencyExtractor.extract(input.sourceCode, input.filePath);

      // Step 6: Extract Storybook stories (if provided)
      let stories: ExtractedStory[] | undefined;
      let storybookArgTypes: Record<string, ArgTypeInfo> | undefined;

      if (input.storiesCode) {
        const storybookResult = this.storybookExtractor.extract(
          input.storiesCode,
          input.storiesFilePath
        );

        // Filter out interaction-only and showcase stories
        stories = storybookResult.stories.filter(
          (s) => !s.isInteractionOnly && !s.isShowcase
        );
        storybookArgTypes = storybookResult.argTypes;

        logger.debug('Storybook extraction complete', {
          totalStories: storybookResult.stories.length,
          includedStories: stories.length,
        });
      }

      // Step 7: Detect compound components
      const compoundInfo = detectCompoundComponent(input.sourceCode);

      if (compoundInfo.isCompound) {
        logger.debug('Compound component detected', {
          root: compoundInfo.rootComponent,
          subComponents: compoundInfo.subComponents,
        });
      }

      // Step 8: Build extracted data
      const data = this.buildExtractedData({
        propsResult,
        variants,
        defaultVariants,
        npmDependencies,
        internalDependencies,
        baseLibrary,
        sourceCode: input.sourceCode,
        name: input.name,
        filePath: input.filePath,
        extractionMethod,
        stories,
        storybookArgTypes,
        compoundInfo: compoundInfo.isCompound ? compoundInfo : undefined,
      });

      // Step 9: Generate identity
      const id = input.existingId ?? generateComponentId();
      const slug = generateSlug(input.name, input.framework, id);

      const extractionTimeMs = Math.round(performance.now() - startTime);

      logger.debug('Extraction completed', {
        name: input.name,
        extractionMethod,
        fallbackTriggered,
        propsCount: data.props.length,
        variantsCount: Object.keys(variants).length,
        durationMs: extractionTimeMs,
      });

      return {
        type: ExtractionOutputType.Success,
        orgId: input.orgId,
        identity: {
          id,
          name: input.name,
          slug,
          framework: input.framework,
        },
        data,
        sourceHash,
        extractionMethod,
        fallbackTriggered,
        fallbackReason: fallbackReason
          ? getFallbackReasonDescription(fallbackReason)
          : undefined,
        extractionTimeMs,
      };
    } catch (error) {
      logger.error('Extraction failed', error as Error, { name: input.name });

      return {
        type: ExtractionOutputType.Failure,
        error: error instanceof Error ? error.message : 'Extraction failed',
        sourceHash,
        extractionTimeMs: Math.round(performance.now() - startTime),
      };
    }
  }

  /**
   * Build ExtractedData from all extraction results
   *
   * Combines props, variants, dependencies, Storybook stories, compound info,
   * and detected patterns into the final ExtractedData structure.
   */
  private buildExtractedData({
    propsResult,
    variants,
    defaultVariants,
    npmDependencies,
    internalDependencies,
    baseLibrary,
    sourceCode,
    name,
    filePath,
    extractionMethod,
    stories,
    storybookArgTypes,
    compoundInfo,
  }: {
    propsResult: Awaited<
      ReturnType<ReactDocgenExtractor['extractProps']>
    > | null;
    variants: Record<string, string[]>;
    defaultVariants: Record<string, string>;
    npmDependencies: Record<string, string>;
    internalDependencies: string[];
    baseLibrary?: string;
    sourceCode: string;
    name: string;
    filePath?: string;
    extractionMethod: ExtractorMethod;
    stories?: ExtractedStory[];
    storybookArgTypes?: Record<string, ArgTypeInfo>;
    compoundInfo?: CompoundComponentInfo;
  }): ExtractedData {
    const props = propsResult?.props ?? [];

    return {
      props,
      variants,
      defaultVariants,
      npmDependencies,
      internalDependencies,
      acceptsChildren: props.some((p) => p.isChildren),
      usesForwardRef: this.detectForwardRef(sourceCode),
      exportType: this.detectExportType(sourceCode, name),
      exportName: pascalCase(name),
      baseLibrary: baseLibrary
        ? {
            name: baseLibrary,
            component: this.detectBaseComponent(baseLibrary, npmDependencies),
          }
        : undefined,
      sourceDescription: propsResult?.description,
      files: [filePath ?? `${name}.tsx`],
      extractionMethod,
      stories,
      storybookArgTypes,
      compoundInfo,
    };
  }

  /**
   * Detect export type (default vs named) from source code
   */
  private detectExportType(
    sourceCode: string,
    componentName: string
  ): 'default' | 'named' {
    const pascalName = pascalCase(componentName);

    // Check for default export patterns
    if (
      sourceCode.includes(`export default ${pascalName}`) ||
      sourceCode.includes('export default function') ||
      sourceCode.includes('export default forwardRef') ||
      sourceCode.includes('export default memo')
    ) {
      return 'default';
    }

    return 'named';
  }

  /**
   * Detect if component uses forwardRef
   */
  private detectForwardRef(sourceCode: string): boolean {
    return sourceCode.includes('forwardRef');
  }

  /**
   * Detect base UI library component name from package
   *
   * Example: @radix-ui/react-dialog -> "Dialog"
   */
  private detectBaseComponent(
    baseLibrary: string,
    npmDeps: Record<string, string>
  ): string | undefined {
    // Find packages matching the base library using centralized detection
    const matchingPackages = Object.keys(npmDeps).filter((pkg) =>
      isBaseLibraryPackage(baseLibrary as BaseLibraryName, pkg)
    );

    // If only one matching package, extract the component name
    if (matchingPackages.length === 1) {
      const pkg = matchingPackages[0];
      return this.extractComponentNameFromPackage(baseLibrary, pkg);
    }

    return undefined;
  }

  /**
   * Extract component name from a base library package
   *
   * Each library has different package naming conventions:
   * - @radix-ui/react-dialog -> Dialog
   * - @ark-ui/react/dialog -> Dialog
   * - @react-aria/button -> Button
   */
  private extractComponentNameFromPackage(
    baseLibrary: string,
    pkg: string
  ): string | undefined {
    // Package prefix patterns for component name extraction
    const prefixPatterns: Record<BaseLibraryName, RegExp[]> = {
      [BASE_LIBRARIES.RadixUI]: [/^@radix-ui\/react-/],
      [BASE_LIBRARIES.ArkUI]: [/^@ark-ui\/react\/?/],
      [BASE_LIBRARIES.BaseUI]: [/^@base-ui-components\/react\/?/],
      [BASE_LIBRARIES.HeadlessUI]: [/^@headlessui\/react\/?/],
      [BASE_LIBRARIES.ReactAria]: [/^@react-aria\//],
    };

    const patterns = prefixPatterns[baseLibrary as BaseLibraryName];
    if (!patterns) {
      return undefined;
    }

    for (const pattern of patterns) {
      if (pattern.test(pkg)) {
        const componentSegment = pkg.replace(pattern, '');
        if (componentSegment) {
          return pascalCase(componentSegment);
        }
      }
    }

    return undefined;
  }
}
