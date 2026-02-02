/**
 * Extracted Data Types
 *
 * Types for data extracted from component source code.
 * This is the "fast" extraction phase using react-docgen-typescript + ts-morph.
 */

import { z } from 'zod';

import { ExtractedStorySchema } from '../extractor/storybook/types.js';

import { BasePropSchema } from './base-prop.js';
import { BaseLibrarySchema } from './identity.js';

/**
 * Extracted prop schema
 *
 * Extends BasePropSchema with extraction-specific fields for raw
 * code analysis results. Only includes fields actively used downstream.
 */
export const ExtractedPropSchema = BasePropSchema.extend({
  /** Whether this is a children prop */
  isChildren: z.boolean().default(false),
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
 * Compound component detection result schema
 *
 * Used to identify compound components (Dialog, Accordion, Tabs, etc.)
 * that export multiple related sub-components.
 */
export const CompoundComponentInfoSchema = z.object({
  /** Whether this is a compound component */
  isCompound: z.boolean(),

  /** Root component name (e.g., "Dialog", "Accordion") */
  rootComponent: z.string(),

  /** Sub-component names (e.g., ["DialogTrigger", "DialogContent"]) */
  subComponents: z.array(z.string()),
});

export type CompoundComponentInfo = z.infer<typeof CompoundComponentInfoSchema>;

/**
 * Radix primitive info for direct re-exports
 *
 * When a component is a direct re-export of a Radix primitive
 * (e.g., `const Dialog = DialogPrimitive.Root`), this captures
 * the primitive name and generates a documentation URL.
 *
 * URL pattern: https://www.radix-ui.com/primitives/docs/components/{component}#{primitive}
 */
export const RadixPrimitiveInfoSchema = z.object({
  /** The primitive component name (e.g., "Root", "Trigger", "Content") */
  primitive: z.string(),

  /** Documentation URL for the Radix primitive */
  docsUrl: z.string(),
});

export type RadixPrimitiveInfo = z.infer<typeof RadixPrimitiveInfoSchema>;

/**
 * Extracted sub-component data for compound components
 */
export const ExtractedSubComponentSchema = z.object({
  /** Sub-component name (e.g., "DropdownMenuItem") */
  name: z.string(),

  /** Extracted props for this sub-component */
  props: z.array(ExtractedPropSchema),

  /** Description from JSDoc */
  description: z.string().optional(),

  /** Whether this sub-component is required in composition */
  requiredInComposition: z.boolean(),

  /** Radix primitive info for re-exports (e.g., DialogPrimitive.Trigger) */
  radixPrimitive: RadixPrimitiveInfoSchema.optional(),

  /** CVA variants defined for this sub-component */
  variants: z.record(z.string(), z.array(z.string())).optional(),

  /** Default values for CVA variants */
  defaultVariants: z.record(z.string(), z.string()).optional(),
});

export type ExtractedSubComponent = z.infer<typeof ExtractedSubComponentSchema>;

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

  /** Base UI library detected (Radix, Ark, Base UI, etc.) */
  baseLibrary: BaseLibrarySchema.optional(),

  /** Source code description from JSDoc */
  sourceDescription: z.string().optional(),

  /** Files included in extraction */
  files: z.array(z.string()),

  /** Extracted Storybook stories (if stories file was provided) */
  stories: z.array(ExtractedStorySchema).optional(),

  /** Compound component detection result */
  compoundInfo: CompoundComponentInfoSchema.optional(),

  /** Extracted sub-component data for compound components */
  subComponents: z.array(ExtractedSubComponentSchema).optional(),

  /** Radix primitive info for direct re-exports */
  radixPrimitive: RadixPrimitiveInfoSchema.optional(),
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

  /** Any warnings during extraction */
  warnings: z.array(z.string()).default([]),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
