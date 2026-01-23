/**
 * Base Prop Schema
 *
 * Shared base schema for prop definitions across extraction and AI consumption.
 * Both ExtractedPropSchema and PropDefinitionSchema extend this base.
 *
 * This consolidation ensures consistent core fields while allowing each
 * consumer to add context-specific fields.
 */

import { z } from 'zod';

/**
 * Prop type categories
 *
 * Categorizes TypeScript types into semantic groups for filtering and analysis.
 * Used by both extraction and AI consumption layers.
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
 * Base prop schema - shared fields between ExtractedProp and PropDefinition
 *
 * Contains the core identifying and type information that both extraction
 * and AI consumption need.
 *
 * @example
 * ```typescript
 * const ExtractedPropSchema = BasePropSchema.extend({
 *   isChildren: z.boolean().default(false),
 *   // ... extraction-specific fields
 * });
 *
 * const PropDefinitionSchema = BasePropSchema.extend({
 *   isControlled: z.boolean().optional(),
 *   // ... AI-consumption-specific fields
 * });
 * ```
 */
export const BasePropSchema = z.object({
  /** Prop name */
  name: z.string(),

  /** TypeScript type string */
  type: z.string(),

  /** Simplified type category for filtering and analysis */
  typeCategory: PropTypeCategorySchema,

  /** Whether prop is required */
  required: z.boolean(),

  /** Default value (if any) */
  defaultValue: z.unknown().optional(),

  /** Possible values for literal/union types */
  possibleValues: z.array(z.string()).optional(),

  /** JSDoc description */
  description: z.string().optional(),
});

export type BaseProp = z.infer<typeof BasePropSchema>;
