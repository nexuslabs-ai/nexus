/**
 * Extractor Types
 *
 * Types for the hybrid extraction system that uses react-docgen-typescript
 * as primary extractor and ts-morph as fallback.
 */

import { z } from 'zod';

import type {
  ExtractedData,
  ExtractedProp,
  Framework,
  ManifestIdentity,
} from '../types/index.js';

/**
 * Extractor method used (const enum for internal extractor use)
 *
 * Note: This is named ExtractorMethod to avoid collision with
 * ExtractionMethod schema in types/extracted.ts
 */
export const ExtractorMethod = {
  ReactDocgen: 'react-docgen-typescript',
  TsMorph: 'ts-morph',
  Hybrid: 'hybrid',
} as const;

export type ExtractorMethod =
  (typeof ExtractorMethod)[keyof typeof ExtractorMethod];

/**
 * Input for code extraction
 */
export const ExtractionInputSchema = z.object({
  /** Organization ID (required for multi-org support) */
  orgId: z.uuid(),

  /** Component name (display name, can contain spaces) */
  name: z.string().min(1).max(100),

  /** Source code content */
  sourceCode: z.string().min(1),

  /** File path (for context, e.g., "button/button.tsx") */
  filePath: z.string().optional(),

  /** Framework */
  framework: z
    .enum(['react', 'vue', 'svelte', 'angular'])
    .default('react') as z.ZodType<Framework>,

  /** Existing component ID (for updates) */
  existingId: z.uuid().optional(),

  /** Optional Storybook stories source code */
  storiesCode: z.string().optional(),

  /** Optional stories file path for context (e.g., "button/Button.stories.tsx") */
  storiesFilePath: z.string().optional(),
});

export type ExtractionInput = z.infer<typeof ExtractionInputSchema>;

/**
 * Result from code extraction (fast, no LLM)
 *
 * Note: Named ExtractorResult to avoid collision with
 * ExtractionResult schema in types/extracted.ts
 *
 * On failure, the extractor throws ExtractionError instead of returning
 * a failure result. This simplifies consumer code and follows the
 * "throw on error" pattern used elsewhere in the codebase.
 */
export interface ExtractorResult {
  /** Organization ID */
  orgId: string;

  /** Component identity (generated or passed through) */
  identity: ManifestIdentity;

  /** Extracted data from code */
  data: ExtractedData;

  /** Hash of source code (SHA-256) */
  sourceHash: string;

  /** Which extraction method succeeded */
  extractionMethod: ExtractorMethod;

  /** Whether fallback was triggered */
  fallbackTriggered: boolean;

  /** Reason for fallback (if triggered) */
  fallbackReason?: string;
}

/**
 * Props extraction result (from a single extractor)
 */
export interface PropsExtractionResult {
  props: ExtractedProp[];
  method: ExtractorMethod;
  componentName?: string;
  description?: string;
}

/**
 * Extractor interface for props extraction
 */
export interface IPropsExtractor {
  /**
   * Extract props from source code
   * Returns null if extraction fails or is not applicable
   */
  extractProps(
    sourceCode: string,
    componentName: string,
    filePath?: string
  ): Promise<PropsExtractionResult | null>;
}

/**
 * Full extractor interface (props + variants + dependencies)
 *
 * Throws ExtractionError on failure instead of returning a failure result.
 */
export interface IExtractor {
  extract(input: ExtractionInput): Promise<ExtractorResult>;
}

/**
 * Variant extraction result
 */
export interface VariantExtractionResult {
  /** Extracted variants from cva() or similar */
  variants: Record<string, string[]>;

  /** Default variant values */
  defaultVariants: Record<string, string>;
}

/**
 * Dependency extraction result
 */
export interface DependencyExtractionResult {
  /** NPM package dependencies with versions */
  npmDependencies: Record<string, string>;

  /** Internal component dependencies (relative imports) */
  internalDependencies: string[];

  /** Base UI library detected (Radix, Ark, etc.) */
  baseLibrary?: string;
}
