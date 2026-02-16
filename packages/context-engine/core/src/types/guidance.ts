/**
 * Guidance Types
 *
 * AI-generated guidance for component usage.
 * Helps AI assistants provide appropriate recommendations.
 */

import { z } from 'zod';

/**
 * Guidance schema
 *
 * Provides structured guidance for AI assistants to make
 * appropriate component recommendations.
 *
 * @example
 * ```json
 * {
 *   "whenToUse": "Use for clickable actions like form submissions, confirmations, and triggering operations",
 *   "whenNotToUse": "Use Link for navigation, Badge for status indicators, IconButton for icon-only actions",
 *   "accessibility": "Supports disabled state via aria-disabled, loading state via aria-busy",
 *   "patterns": ["async-action", "composition", "form-control"],
 *   "relatedComponents": ["IconButton", "ButtonGroup", "Link"]
 * }
 * ```
 */
export const GuidanceSchema = z.object({
  /**
   * When to use this component
   * AI uses this to recommend the component for appropriate use cases
   * @minLength 20 - Should be actionable guidance, not just a few words
   */
  whenToUse: z.string().min(20),

  /**
   * When NOT to use this component
   * AI uses this to suggest alternatives when this component isn't ideal
   * @minLength 10 - Should mention at least one alternative
   */
  whenNotToUse: z.string().min(10),

  /**
   * Accessibility notes
   * AI uses this to ensure generated code is accessible
   */
  accessibility: z.string(),

  /**
   * Component patterns this component implements
   * @example ["async-action", "composition", "form-control"]
   */
  patterns: z.array(z.string()),

  /**
   * Related component names for context bundling
   * AI uses this to suggest related components
   */
  relatedComponents: z.array(z.string()),
});

export type Guidance = z.infer<typeof GuidanceSchema>;
