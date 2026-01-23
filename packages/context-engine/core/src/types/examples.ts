/**
 * Examples Types
 *
 * Structured code examples for AI consumption.
 * Provides metadata about each example for AI selection.
 */

import { z } from 'zod';

/**
 * Code example schema
 *
 * A single code example with metadata for AI assistants.
 * Includes information about what props are demonstrated.
 *
 * @example
 * ```json
 * {
 *   "title": "Destructive action",
 *   "code": "<Button variant=\"destructive\">Delete</Button>",
 *   "description": "Use for dangerous actions like delete",
 *   "propsUsed": ["variant"],
 *   "isPrimary": false
 * }
 * ```
 */
export const CodeExampleSchema = z.object({
  /** Human-readable title for the example */
  title: z.string(),

  /** JSX code string */
  code: z.string(),

  /** Optional description explaining the use case */
  description: z.string().optional(),

  /**
   * List of prop names demonstrated in this example
   * Helps AI understand what patterns this example shows
   */
  propsUsed: z.array(z.string()).optional(),

  /**
   * Whether this is the primary/default example
   * AI should show this first when user asks for basic usage
   */
  isPrimary: z.boolean().optional(),
});

export type CodeExample = z.infer<typeof CodeExampleSchema>;

/**
 * Structured examples schema
 *
 * Examples organized by complexity level for progressive disclosure.
 * AI assistants can select appropriate examples based on user needs.
 */
export const StructuredExamplesSchema = z.object({
  /**
   * Minimal example - simplest working code
   * Always show this when user needs basic usage
   */
  minimal: CodeExampleSchema,

  /**
   * Common examples - typical usage patterns
   * Show these for standard use cases
   */
  common: z.array(CodeExampleSchema),

  /**
   * Advanced examples - complex patterns
   * Show these for advanced use cases or when specifically requested
   */
  advanced: z.array(CodeExampleSchema).optional(),
});

export type StructuredExamples = z.infer<typeof StructuredExamplesSchema>;
