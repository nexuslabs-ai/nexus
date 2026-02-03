/**
 * Base Prop Schema
 *
 * Simplified base schema for prop definitions optimized for AI consumption.
 * Removes redundant boolean flags and focuses on essential information
 * needed for code generation.
 *
 * Core principle: Fix at source, not with patches.
 */

import { z } from 'zod';

/**
 * Base prop schema - minimal fields for AI consumption
 *
 * Contains only the essential information an AI assistant needs
 * to generate correct component code.
 *
 * @example
 * ```json
 * {
 *   "name": "variant",
 *   "type": "string",
 *   "values": ["default", "destructive", "outline"],
 *   "valueDescriptions": {
 *     "default": "Standard styling for general use",
 *     "destructive": "Red color for dangerous actions",
 *     "outline": "Bordered style without background"
 *   },
 *   "defaultValue": "default",
 *   "required": false
 * }
 * ```
 */
export const BasePropSchema = z.object({
  /** Prop name */
  name: z.string(),

  /** Simplified type string (e.g., "string", "boolean", "ReactNode") */
  type: z.string(),

  /** JSDoc description */
  description: z.string().optional(),

  /** Default value (if any) */
  defaultValue: z.unknown().optional(),

  /** Valid values for enum/union types (e.g., ["default", "primary", "secondary"]) */
  values: z.array(z.string()).optional(),

  /** Descriptions for each enum value (LLM-generated for variant props) */
  valueDescriptions: z.record(z.string(), z.string()).optional(),

  /** Whether this prop is required (from TypeScript optional marker) */
  required: z.boolean().default(false),
});

export type BaseProp = z.infer<typeof BasePropSchema>;
