/**
 * Component Manifest Types
 *
 * The complete component knowledge, combining identity, extracted data,
 * and AI-generated metadata. Optimized for AI consumption.
 */

import { z } from 'zod';

import { StructuredExamplesSchema } from './examples.js';
import { HashSchema, RadixPrimitiveInfoSchema } from './extracted.js';
import { GuidanceSchema } from './guidance.js';
import {
  BaseLibrarySchema,
  FrameworkSchema,
  ManifestIdentitySchema,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';
import { ImportStatementSchema } from './import-statement.js';
import { CategorizedPropsSchema } from './props.js';

/**
 * Dependencies schema
 */
export const DependenciesSchema = z.object({
  npm: z.record(z.string(), z.string()),
  internal: z.array(z.string()),
});

export type Dependencies = z.infer<typeof DependenciesSchema>;

/**
 * Sub-component schema for compound components
 *
 * Compound components like Dialog, Accordion, Tabs have multiple
 * related sub-components (DialogTrigger, DialogContent, etc.).
 * This schema captures metadata for each sub-component.
 */
export const SubComponentSchema = z.object({
  /** Sub-component name (e.g., "DialogTrigger", "AccordionItem") */
  name: z.string(),

  /** Sub-component description */
  description: z.string().optional(),

  /**
   * Props specific to this sub-component (categorized and normalized).
   * CVA variants are included in props.variants with values and defaultValue.
   */
  props: CategorizedPropsSchema,

  /** Data slot attribute value (e.g., "dialog-trigger") */
  dataSlot: z.string().optional(),

  /** Whether this sub-component is required in composition */
  requiredInComposition: z.boolean(),

  /** Radix primitive info for direct re-exports */
  radixPrimitive: RadixPrimitiveInfoSchema.optional(),
});

export type SubComponent = z.infer<typeof SubComponentSchema>;

/**
 * Children prop information (only present when component accepts children)
 */
export const ChildrenInfoSchema = z.object({
  accepts: z.literal(true),
  type: z.string().optional(),
  required: z.boolean().optional(),
});

export type ChildrenInfo = z.infer<typeof ChildrenInfoSchema>;

/**
 * AI-focused manifest (optimized for token efficiency)
 *
 * This is what AI agents consume. System metadata is separate.
 * Uses CategorizedPropsSchema directly - no separate "slim" variant needed
 * since props are already cleaned at extraction time.
 *
 * Note: Top-level `variants` field removed - variant info is now available
 * in `props.variants` with `values` and `valueDescriptions` for each prop.
 */
export const AIManifestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  importStatement: ImportStatementSchema,
  children: ChildrenInfoSchema.optional(),
  props: CategorizedPropsSchema.optional(),
  examples: StructuredExamplesSchema.optional(),
  guidance: GuidanceSchema.optional(),
  dependencies: DependenciesSchema.optional(),
  baseLibrary: BaseLibrarySchema.optional(),
  subComponents: z.array(SubComponentSchema).optional(),
  radixPrimitive: RadixPrimitiveInfoSchema.optional(),
});

export type AIManifest = z.infer<typeof AIManifestSchema>;

/**
 * Complete manifest output (flat structure)
 *
 * Core produces this output directly. DB layer adds its own fields
 * (timestamps, versioning, embedding status) separately.
 */
export const ManifestOutputSchema = z.object({
  componentName: z.string(),
  identity: ManifestIdentitySchema,
  manifest: AIManifestSchema,
  sourceHash: HashSchema,
  files: z.array(z.string()),
});

export type ManifestOutput = z.infer<typeof ManifestOutputSchema>;

/**
 * Version history entry
 */
export const VersionHistoryEntrySchema = z.object({
  version: VersionSchema,
  generatedAt: z.iso.datetime(),
  sourceHash: HashSchema,
});

export type VersionHistoryEntry = z.infer<typeof VersionHistoryEntrySchema>;

/**
 * Manifest creation input (what the API receives)
 */
export const CreateManifestInputSchema = z.object({
  name: z.string(),
  version: VersionSchema,
  framework: FrameworkSchema,
  sourceCode: z.string(),
  files: z.array(z.string()),
  visibility: VisibilitySchema.optional(),
});

export type CreateManifestInput = z.infer<typeof CreateManifestInputSchema>;

/**
 * Manifest update input
 */
export const UpdateManifestInputSchema = z.object({
  version: VersionSchema.optional(),
  sourceCode: z.string().optional(),
  visibility: VisibilitySchema.optional(),
});

export type UpdateManifestInput = z.infer<typeof UpdateManifestInputSchema>;
