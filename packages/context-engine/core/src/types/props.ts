/**
 * Props Types
 *
 * Simplified prop definitions optimized for AI consumption.
 * Props are grouped by semantic purpose for easier filtering.
 *
 * Core principle: Fix at source, not with patches.
 * All boolean metadata flags have been removed as they add noise
 * without helping AI generate correct code.
 */

import { z } from 'zod';

import { BasePropSchema } from './base-prop.js';

/**
 * Prop definition schema for AI consumption
 *
 * Same as BasePropSchema - no additional flags needed.
 * The simplified structure contains only what AI assistants
 * need to generate correct component code.
 */
export const PropDefinitionSchema = BasePropSchema;

export type PropDefinition = z.infer<typeof PropDefinitionSchema>;

/**
 * Categorized props schema
 *
 * Props grouped by semantic purpose for easier AI filtering.
 * Categories follow a precedence order for classification.
 *
 * Precedence (highest to lowest):
 * 1. events - on* functions (only explicitly coded, not standard HTML events)
 * 2. slots - ReactNode/element types
 * 3. variants - CVA variant matches
 * 4. behaviors - Boolean state props
 * 5. other - Fallback
 *
 * Note: passthrough props (className, style, aria-*, data-*) are rejected
 * at extraction time, not categorized. Every component has the same
 * passthrough props, so there's no need to list them.
 */
export const CategorizedPropsSchema = z.object({
  /**
   * Variant props that control styling/appearance
   * @example variant, size, color
   */
  variants: z.array(PropDefinitionSchema).optional(),

  /**
   * Behavior props that control component state
   * @example disabled, loading, required, readOnly, open
   */
  behaviors: z.array(PropDefinitionSchema).optional(),

  /**
   * Event handler props (only explicitly coded events)
   * @example onValueChange, onOpenChange (NOT onClick, onChange, onBlur)
   */
  events: z.array(PropDefinitionSchema).optional(),

  /**
   * Slot props that accept React elements
   * @example children, icon, leftIcon, prefix, suffix
   */
  slots: z.array(PropDefinitionSchema).optional(),

  /**
   * Uncategorized props
   * Props that don't match any known category
   */
  other: z.array(PropDefinitionSchema).optional(),
});

export type CategorizedProps = z.infer<typeof CategorizedPropsSchema>;

/**
 * Union type of all category keys in CategorizedProps
 * Useful for iteration and generic functions over categories
 */
export type CategorizedPropsCategory = keyof CategorizedProps;
