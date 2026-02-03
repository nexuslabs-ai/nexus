/**
 * Hybrid Extractor
 *
 * Designed for Radix-based design systems (shadcn/ui pattern).
 *
 * Orchestrates the full extraction pipeline by combining multiple
 * extraction strategies:
 *
 * **Props Extraction (Primary/Fallback):**
 * 1. ReactDocgenExtractor (PRIMARY) - For standard React components
 * 2. TsMorphExtractor (FALLBACK) - When primary fails or returns incomplete data
 *
 * **Supplementary Extractors (always run):**
 * 3. VariantExtractor - For CVA/tailwind-variants (ts-morph based)
 * 4. DependencyExtractor - For import analysis (npm and internal deps)
 * 5. StorybookExtractor - For examples from .stories.tsx files (if provided)
 *
 * **Compound Component Extractors:**
 * 6. CompoundExtractor - Detects compound components (Dialog, Accordion, etc.)
 * 7. CompositionExtractor - Determines required vs optional sub-components
 *
 * **Radix Integration:**
 * 8. RadixExtractor - Extracts Radix primitive information (AST-based)
 *
 * Uses explicit fallback triggers from fallback-triggers.ts for predictable behavior.
 */

import {
  extractRadixComponentName,
  isRadixPackage,
} from '../constants/index.js';
import { ExtractionError } from '../types/errors.js';
import type { ExtractedData, ExtractedSubComponent } from '../types/index.js';
import { generateSourceHash } from '../utils/hash.js';
import { generateComponentId, generateSlug } from '../utils/id.js';
import { createLogger } from '../utils/logger.js';

import { CompositionExtractor } from './composition-extractor.js';
import { CompoundExtractor } from './compound-extractor.js';
import {
  DependencyExtractor,
  type DependencyExtractorOptions,
} from './dependency-extractor.js';
import {
  FALLBACK_REASON_DESCRIPTIONS,
  type FallbackReason,
  shouldFallback,
} from './fallback-triggers.js';
import { RadixExtractor } from './radix-extractor.js';
import { ReactDocgenExtractor } from './react-docgen-extractor.js';
import { StorybookExtractor } from './storybook/storybook-extractor.js';
import { TsMorphExtractor } from './ts-morph-extractor.js';
import {
  type ExtractionInput,
  ExtractorMethod,
  type ExtractorResult,
  type IExtractor,
} from './types.js';
import { VariantExtractor } from './variant-extractor.js';

const logger = createLogger({ name: 'hybrid-extractor' });

/**
 * Options for configuring the HybridExtractor
 */
export interface HybridExtractorOptions {
  /**
   * Path aliases from tsconfig.json paths configuration.
   * Used to identify internal imports that use path aliases.
   *
   * @example
   * ```typescript
   * {
   *   "@/*": ["./src/*"],
   *   "@components/*": ["./src/components/*"]
   * }
   * ```
   */
  pathAliases?: Record<string, string[]>;

  /**
   * List of dependency names from package.json.
   * Used to identify external package imports.
   *
   * @example ["react", "class-variance-authority", "@radix-ui/react-slot"]
   */
  dependencies?: string[];
}

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
  private radixExtractor: RadixExtractor;
  private compoundExtractor: CompoundExtractor;
  private compositionExtractor: CompositionExtractor;

  constructor(options: HybridExtractorOptions = {}) {
    this.reactDocgen = new ReactDocgenExtractor();
    this.tsMorph = new TsMorphExtractor();
    this.variantExtractor = new VariantExtractor();

    // Pass path aliases and dependencies to dependency extractor
    const dependencyOptions: DependencyExtractorOptions = {
      pathAliases: options.pathAliases,
      dependencies: options.dependencies,
    };
    this.dependencyExtractor = new DependencyExtractor(dependencyOptions);

    this.storybookExtractor = new StorybookExtractor();
    this.radixExtractor = new RadixExtractor();
    this.compoundExtractor = new CompoundExtractor();
    this.compositionExtractor = new CompositionExtractor();
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
   *
   * @throws ExtractionError if extraction fails
   */
  async extract(input: ExtractionInput): Promise<ExtractorResult> {
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
            ? FALLBACK_REASON_DESCRIPTIONS[fallbackReason]
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
      // First, extract ALL variants from the file
      this.variantExtractor.extractAll(input.sourceCode, input.filePath);
      // Then, match variants for the main component
      const { variants, defaultVariants } =
        this.variantExtractor.matchForComponent(input.name);

      // Step 5: Extract dependencies (always ts-morph, operates independently)
      const { npmDependencies, internalDependencies, baseLibrary } =
        this.dependencyExtractor.extract(input.sourceCode, input.filePath);

      // Step 6: Extract Storybook stories (if provided)
      const { stories } = this.storybookExtractor.extract(
        input.storiesCode,
        input.storiesFilePath
      );

      if (stories.length) {
        logger.debug('Storybook extraction complete', {
          storyCount: stories.length,
        });
      }

      // Step 7: Extract Radix primitive information
      const radixPrimitive = this.radixExtractor.extract(
        input.name,
        input.sourceCode
      );
      if (radixPrimitive) {
        logger.debug('Radix primitive extracted', {
          name: input.name,
          primitive: radixPrimitive.primitive,
          docsUrl: radixPrimitive.docsUrl,
        });
      }

      // Step 8: Extract compound component information and sub-component data
      const compoundInfo = this.compoundExtractor.extract(input.sourceCode);
      let subComponents: ExtractedSubComponent[] | undefined;

      if (compoundInfo.isCompound && compoundInfo.subComponents.length > 0) {
        logger.debug('Compound component extracted', {
          root: compoundInfo.rootComponent,
          subComponents: compoundInfo.subComponents,
        });

        // Extract props for each sub-component using ts-morph
        // (react-docgen fails on files with external package types)
        const subComponentResults =
          await this.tsMorph.extractMultipleComponents(
            input.sourceCode,
            compoundInfo.subComponents,
            input.filePath
          );

        // Build sub-component info with Radix primitives for composition analysis
        const subComponentsWithRadix = compoundInfo.subComponents.map(
          (subName) => ({
            name: subName,
            radixPrimitive: this.radixExtractor.extract(
              subName,
              input.sourceCode
            ),
          })
        );

        // Analyze all sub-components for requiredInComposition in a single call
        const compositionResults = this.compositionExtractor.analyzeAll(
          input.sourceCode,
          compoundInfo.rootComponent,
          subComponentsWithRadix
        );

        // ALWAYS include ALL subComponents, even if props extraction fails
        // For each subComponent:
        // 1. Use extracted props if available (may be empty)
        // 2. Use pre-extracted Radix primitive (for doc lookup)
        // 3. Extract CVA variants if defined
        // 4. Use pre-computed requiredInComposition from analyzeAll
        subComponents = subComponentsWithRadix.map(
          ({ name: subName, radixPrimitive: subRadixPrimitive }) => {
            // Get props result (may be undefined or have empty props)
            const propsResult = subComponentResults.get(subName);

            // Match variants for this specific subComponent (extractAll already called above)
            const subVariantResult =
              this.variantExtractor.matchForComponent(subName);

            // Get requiredInComposition from pre-computed results
            const requiredInComposition =
              compositionResults.get(subName) ?? false;

            const subComponent: ExtractedSubComponent = {
              name: subName,
              props: propsResult?.props ?? [],
              description: propsResult?.description,
              requiredInComposition,
            };

            // Only add radixPrimitive if detected
            if (subRadixPrimitive) {
              subComponent.radixPrimitive = subRadixPrimitive;
            }

            // Only add variants if there are any
            if (Object.keys(subVariantResult.variants).length > 0) {
              subComponent.variants = subVariantResult.variants;
              subComponent.defaultVariants = subVariantResult.defaultVariants;
            }

            return subComponent;
          }
        );

        logger.debug('Sub-component data extracted', {
          count: subComponents.length,
          names: subComponents.map((s) => s.name),
          withRadixPrimitive: subComponents.filter((s) => s.radixPrimitive)
            .length,
          withVariants: subComponents.filter(
            (s) => s.variants && Object.keys(s.variants).length > 0
          ).length,
        });
      }

      // Step 9: Build extracted data
      const data: ExtractedData = {
        props: propsResult?.props ?? [],
        variants,
        defaultVariants,
        npmDependencies,
        internalDependencies,
        acceptsChildren: (propsResult?.props ?? []).some((p) => p.isChildren),
        baseLibrary: baseLibrary
          ? {
              name: baseLibrary,
              component: this.getRadixComponent(npmDependencies),
            }
          : undefined,
        sourceDescription: propsResult?.description,
        files: [input.filePath ?? `${input.name}.tsx`],
        stories,
        compoundInfo: compoundInfo.isCompound ? compoundInfo : undefined,
        subComponents,
        radixPrimitive,
      };

      // Step 10: Generate identity
      const id = input.existingId ?? generateComponentId();
      const slug = generateSlug(input.name, input.framework, id);

      logger.debug('Extraction completed', {
        name: input.name,
        extractionMethod,
        fallbackTriggered,
        propsCount: data.props.length,
        variantsCount: Object.keys(variants).length,
      });

      return {
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
          ? FALLBACK_REASON_DESCRIPTIONS[fallbackReason]
          : undefined,
      };
    } catch (error) {
      logger.error('Extraction failed', error as Error, { name: input.name });

      throw new ExtractionError(
        error instanceof Error ? error.message : 'Extraction failed',
        {
          componentName: input.name,
          sourceHash,
        }
      );
    }
  }

  /**
   * Get Radix UI component name from npm dependencies
   *
   * Finds the Radix package and extracts the component name.
   * Example: @radix-ui/react-dialog -> "Dialog"
   */
  private getRadixComponent(
    npmDeps: Record<string, string>
  ): string | undefined {
    // Find Radix packages in dependencies
    const radixPackages = Object.keys(npmDeps).filter(isRadixPackage);

    // If exactly one Radix package, extract the component name
    if (radixPackages.length === 1) {
      return extractRadixComponentName(radixPackages[0]);
    }

    return undefined;
  }
}
