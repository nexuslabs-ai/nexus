/**
 * Props Types
 *
 * Enhanced prop definitions with AI-helpful fields and
 * categorized props grouped by semantic purpose.
 *
 * @note Naming Convention: PropDefinition vs ExtractedProp
 * - ExtractedProp uses `deprecated: boolean` (raw extraction from JSDoc @deprecated)
 * - PropDefinition uses `isDeprecated: boolean` (semantic flag for AI consumption)
 *
 * This is intentional: PropDefinition is the "AI view" of props with consistent
 * `is*` prefixes for boolean flags. The `toDefinition()` utility in
 * `src/utils/prop-categorization.ts` handles the transformation.
 */

import { z } from 'zod';

import { BasePropSchema } from './base-prop.js';

/**
 * Enhanced prop definition schema with AI-helpful fields
 *
 * Extends BasePropSchema with semantic flags that help
 * AI assistants understand prop purpose and behavior.
 */
export const PropDefinitionSchema = BasePropSchema.extend({
  // === Semantic flags for AI consumption ===

  /**
   * Whether this is a controlled prop (has corresponding onChange)
   * Helps AI know when to add state management
   */
  isControlled: z.boolean().optional(),

  /**
   * Whether this prop accepts React children/nodes
   * Helps AI know when content can be nested
   */
  acceptsChildren: z.boolean().optional(),

  /**
   * Whether this prop is an event handler
   * Helps AI identify callback props
   */
  isEventHandler: z.boolean().optional(),

  /**
   * Whether this prop is deprecated
   * Helps AI avoid suggesting deprecated APIs
   */
  isDeprecated: z.boolean().optional(),
});

export type PropDefinition = z.infer<typeof PropDefinitionSchema>;

/**
 * Categorized props schema
 *
 * Props grouped by semantic purpose for easier AI filtering.
 * Categories follow a precedence order for classification.
 *
 * Precedence (highest to lowest):
 * 1. events - on* functions
 * 2. slots - ReactNode/element types
 * 3. variants - CVA variant matches
 * 4. behaviors - Boolean state props
 * 5. passthrough - DOM attributes
 * 6. other - Fallback
 */
export const CategorizedPropsSchema = z.object({
  /**
   * Variant props that control styling/appearance
   * @example variant, size, color
   */
  variants: z.array(PropDefinitionSchema),

  /**
   * Behavior props that control component state
   * @example disabled, loading, required, readOnly, open
   */
  behaviors: z.array(PropDefinitionSchema),

  /**
   * Event handler props
   * @example onClick, onChange, onBlur, onOpenChange
   */
  events: z.array(PropDefinitionSchema),

  /**
   * Slot props that accept React elements
   * @example children, icon, leftIcon, prefix, suffix
   */
  slots: z.array(PropDefinitionSchema),

  /**
   * Passthrough props forwarded to underlying DOM elements
   * @example className, style, id, aria-*, data-*
   */
  passthrough: z.array(PropDefinitionSchema),

  /**
   * Uncategorized props
   * Props that don't match any known category
   */
  other: z.array(PropDefinitionSchema),
});

export type CategorizedProps = z.infer<typeof CategorizedPropsSchema>;

/**
 * Union type of all category keys in CategorizedProps
 * Useful for iteration and generic functions over categories
 */
export type CategorizedPropsCategory = keyof CategorizedProps;
