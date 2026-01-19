/**
 * Extracted Data Types
 *
 * Types for data extracted from component source code.
 * This is the "fast" extraction phase using react-docgen-typescript + ts-morph.
 */

import { z } from 'zod';

import { BaseLibrarySchema } from './identity.js';

/**
 * Prop type categories
 */
export const PropTypeCategorySchema = z.enum([
  'primitive', // string, number, boolean
  'literal', // 'primary' | 'secondary'
  'union', // string | number
  'object', // { label: string }
  'array', // string[]
  'function', // () => void
  'ref', // React.Ref<T>
  'element', // React.ReactNode
  'unknown', // Could not determine
]);

export type PropTypeCategory = z.infer<typeof PropTypeCategorySchema>;

/**
 * Extracted prop schema
 */
export const ExtractedPropSchema = z.object({
  /** Prop name */
  name: z.string(),

  /** TypeScript type string */
  type: z.string(),

  /** Simplified type category */
  typeCategory: PropTypeCategorySchema,

  /** Whether prop is required */
  required: z.boolean(),

  /** Default value (if any) */
  defaultValue: z.unknown().optional(),

  /** JSDoc description */
  description: z.string().optional(),

  /** Possible values for literal/union types */
  possibleValues: z.array(z.string()).optional(),

  /** Whether this is a children prop */
  isChildren: z.boolean().default(false),

  /** Whether this is a className prop */
  isClassName: z.boolean().default(false),

  /** Whether this is a style prop */
  isStyle: z.boolean().default(false),

  /** Whether this prop is deprecated */
  deprecated: z.boolean().default(false),

  /** Deprecation message */
  deprecationMessage: z.string().optional(),
});

export type ExtractedProp = z.infer<typeof ExtractedPropSchema>;

/**
 * Hash schema (SHA-256)
 */
export const HashSchema = z
  .string()
  .length(64)
  .regex(/^[a-f0-9]+$/);

export type Hash = z.infer<typeof HashSchema>;

/**
 * Extraction method used
 */
export const ExtractionMethodSchema = z.enum([
  'react-docgen-typescript', // Primary method
  'ts-morph', // Fallback for edge cases
  'hybrid', // Combined approach
]);

export type ExtractionMethod = z.infer<typeof ExtractionMethodSchema>;

/**
 * Complete extracted data from source code
 */
export const ExtractedDataSchema = z.object({
  /** Extracted props */
  props: z.array(ExtractedPropSchema),

  /** Variants from cva() or similar */
  variants: z.record(z.string(), z.array(z.string())),

  /** Default variant values */
  defaultVariants: z.record(z.string(), z.string()),

  /** NPM dependencies used */
  npmDependencies: z.record(z.string(), z.string()),

  /** Internal component dependencies */
  internalDependencies: z.array(z.string()),

  /** Whether component accepts children */
  acceptsChildren: z.boolean(),

  /** Whether component uses forwardRef */
  usesForwardRef: z.boolean(),

  /** Export type (default vs named) */
  exportType: z.enum(['default', 'named']),

  /** Export name (for named exports) */
  exportName: z.string().optional(),

  /** Base UI library detected (Radix, Ark, Base UI, etc.) */
  baseLibrary: BaseLibrarySchema.optional(),

  /** Source code description from JSDoc */
  sourceDescription: z.string().optional(),

  /** Files included in extraction */
  files: z.array(z.string()),

  /** Extraction method used */
  extractionMethod: ExtractionMethodSchema.default('react-docgen-typescript'),
});

export type ExtractedData = z.infer<typeof ExtractedDataSchema>;

/**
 * Extraction result (includes metadata)
 */
export const ExtractionResultSchema = z.object({
  /** Extracted data */
  data: ExtractedDataSchema,

  /** Source hash for change detection */
  sourceHash: HashSchema,

  /** Extraction duration in milliseconds */
  durationMs: z.number().int().min(0),

  /** Any warnings during extraction */
  warnings: z.array(z.string()).default([]),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
