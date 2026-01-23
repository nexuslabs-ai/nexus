/**
 * CVA Variant Types
 *
 * Schema for class-variance-authority (CVA) variant definitions.
 * Provides structured access to component variants for AI assistants.
 */

import { z } from 'zod';

/**
 * CVA variant schema
 *
 * Represents a single variant from class-variance-authority configuration.
 * Used to provide AI assistants with structured variant information.
 *
 * @example
 * ```json
 * {
 *   "values": ["default", "destructive", "outline", "secondary", "ghost", "link"],
 *   "default": "default",
 *   "description": "Visual style of the button"
 * }
 * ```
 */
export const CvaVariantSchema = z.object({
  /** All possible values for this variant */
  values: z.array(z.string()),

  /** Default value (if specified in CVA config) */
  default: z.string().optional(),

  /** AI-generated description of this variant's purpose */
  description: z.string().optional(),
});

export type CvaVariant = z.infer<typeof CvaVariantSchema>;

/**
 * CVA variants record schema
 *
 * Maps variant names to their definitions.
 * @example { variant: CvaVariant, size: CvaVariant }
 */
export const CvaVariantsSchema = z.record(z.string(), CvaVariantSchema);

export type CvaVariants = z.infer<typeof CvaVariantsSchema>;
