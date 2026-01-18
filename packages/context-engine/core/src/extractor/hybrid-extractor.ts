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
 *
 * Uses explicit fallback triggers from fallback-triggers.ts for predictable behavior.
 */

import {
  BASE_LIBRARIES,
  type BaseLibraryName,
  isBaseLibraryPackage,
} from '../constants/index.js';
import type { ExtractedData } from '../types/index.js';
import { generateSourceHash, hashesMatch } from '../utils/hash.js';
import { generateComponentId, generateSlug } from '../utils/id.js';
import { createLogger } from '../utils/logger.js';

import { DependencyExtractor } from './dependency-extractor.js';
import {
  type FallbackReason,
  getFallbackReasonDescription,
  shouldFallback,
} from './fallback-triggers.js';
import { ReactDocgenExtractor } from './react-docgen-extractor.js';
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

  constructor() {
    this.reactDocgen = new ReactDocgenExtractor();
    this.tsMorph = new TsMorphExtractor();
    this.variantExtractor = new VariantExtractor();
    this.dependencyExtractor = new DependencyExtractor();
  }

  /**
   * Extract component data from source code
   *
   * Flow:
   * 1. Validate input
   * 2. Compute source hash
   * 3. Check for conflicts (if expectedHash provided)
   * 4. Extract props (primary, fallback if needed)
   * 5. Extract variants
   * 6. Extract dependencies
   * 7. Build and return ExtractedData
   */
  async extract(input: ExtractionInput): Promise<ExtractionOutput> {
    const startTime = performance.now();

    // Step 1: Compute source hash for change detection
    const sourceHash = generateSourceHash(input.sourceCode);

    // Step 2: Handle optimistic locking (conflict detection)
    if (input.expectedHash) {
      const conflictResult = this.checkForConflict(
        input.expectedHash,
        sourceHash
      );
      if (conflictResult) {
        return conflictResult;
      }
    }

    try {
      // Step 3: Extract props using primary extractor
      let propsResult = await this.reactDocgen.extractProps(
        input.sourceCode,
        input.name,
        input.filePath
      );

      let extractionMethod: ExtractorMethod = ExtractorMethod.ReactDocgen;
      let fallbackTriggered = false;
      let fallbackReason: FallbackReason | undefined;

      // Step 4: Check explicit fallback triggers
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

      // Step 5: Extract variants (always ts-morph, operates independently)
      const { variants, defaultVariants } = this.variantExtractor.extract(
        input.sourceCode,
        input.filePath
      );

      // Step 6: Extract dependencies (always ts-morph, operates independently)
      const { npmDependencies, internalDependencies, baseLibrary } =
        this.dependencyExtractor.extract(input.sourceCode, input.filePath);

      // Step 7: Build extracted data
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
      });

      // Step 8: Generate identity
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
   * Check for optimistic locking conflict
   *
   * Returns conflict result if hashes don't match, null otherwise.
   */
  private checkForConflict(
    expectedHash: string,
    currentHash: string
  ): ExtractionOutput | null {
    if (!hashesMatch(expectedHash, currentHash)) {
      return {
        type: ExtractionOutputType.Conflict,
        expectedHash,
        currentHash,
        message: 'Source code has changed since last extraction',
      };
    }
    return null;
  }

  /**
   * Build ExtractedData from all extraction results
   */
  private buildExtractedData(params: {
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
  }): ExtractedData {
    const {
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
    } = params;

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
      exportName: this.toPascalCase(name),
      baseLibrary: baseLibrary
        ? {
            name: baseLibrary,
            component: this.detectBaseComponent(baseLibrary, npmDependencies),
          }
        : undefined,
      sourceDescription: propsResult?.description,
      files: [filePath ?? `${name}.tsx`],
      extractionMethod,
    };
  }

  /**
   * Detect export type (default vs named) from source code
   */
  private detectExportType(
    sourceCode: string,
    componentName: string
  ): 'default' | 'named' {
    const pascalName = this.toPascalCase(componentName);

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
          return this.packageNameToComponentName(componentSegment);
        }
      }
    }

    return undefined;
  }

  /**
   * Convert package name segment to PascalCase component name
   *
   * Example: "dialog" -> "Dialog", "dropdown-menu" -> "DropdownMenu"
   */
  private packageNameToComponentName(segment: string): string {
    return segment
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-\s_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join('');
  }
}
