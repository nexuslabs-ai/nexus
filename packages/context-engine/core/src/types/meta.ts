/**
 * AI-Generated Meta Types
 *
 * Types for LLM-generated component metadata.
 * This is the "slow" phase that requires LLM calls.
 */

import { z } from 'zod';

import { StructuredExamplesSchema } from './examples.js';

/**
 * Pattern definitions
 * These patterns help categorize components for filtering and context
 */
export const COMPONENT_PATTERNS: string[] = [
  'form-control', // Has value/onChange props
  'async-action', // Has loading states
  'composition', // Has asChild or similar composition pattern
  'disclosure', // Has open/close states (dialogs, dropdowns)
  'container', // Wraps children
  'primitive-based', // Built on headless UI primitives (Radix, Ark, Base UI, etc.)
  'compound', // Has multiple sub-components
  'navigation', // Navigation-related (links, tabs)
  'data-display', // Displays data (tables, lists, cards)
  'feedback', // User feedback (alerts, toasts, progress)
  'layout', // Layout components (grid, flex, stack)
  'overlay', // Overlays (modals, drawers, popovers)
  'selection', // Selection controls (checkbox, radio, select)
  'input', // Text/number inputs
  'button', // Button variants
  'icon', // Icon components
];

export type ComponentPattern = (typeof COMPONENT_PATTERNS)[number];

export const ComponentPatternSchema = z.enum(COMPONENT_PATTERNS);

/**
 * AI-generated component context
 *
 * NOTE: This schema is used internally by the generator module during
 * metadata generation. The final manifest uses GuidanceSchema instead.
 * This is NOT part of the final manifest schema (use AIManifest instead).
 */
export const AIContextSchema = z.object({
  /** Rich semantic description for embeddings (2-5 sentences) */
  semanticDescription: z.string().min(50).max(2000),

  /** When to use this component */
  whenToUse: z.string().optional(),

  /** When NOT to use this component */
  whenNotToUse: z.string().optional(),

  /** Semantic patterns this component represents */
  patterns: z.array(z.string()),

  /** Structured usage examples (from LLM when Storybook not available) */
  examples: StructuredExamplesSchema.optional(),

  /** Related component names for context bundling */
  relatedComponents: z.array(z.string()),

  /** Accessibility notes */
  a11yNotes: z.string().optional(),

  /**
   * LLM-generated descriptions for variant values
   * Outer key: variant name (e.g., "variant", "size")
   * Inner key: value (e.g., "destructive", "lg")
   * Value: description of what this variant value does
   */
  variantDescriptions: z
    .record(z.string(), z.record(z.string(), z.string()))
    .optional(),

  /**
   * LLM-generated descriptions for sub-component variant values
   * Used for compound components (Dialog, Accordion, etc.)
   * Structure: { subComponentName: { variantName: { value: description } } }
   */
  subComponentVariantDescriptions: z
    .record(z.string(), z.record(z.string(), z.record(z.string(), z.string())))
    .optional(),
});

export type AIContext = z.infer<typeof AIContextSchema>;

/**
 * Component meta schema (LLM-generated)
 */
export const ComponentMetaSchema = z.object({
  /** Component name (kebab-case) */
  name: z.string(),

  /** Human-readable one-line description */
  description: z.string().min(10).max(500),

  /** AI-generated context */
  ai: AIContextSchema,
});

export type ComponentMeta = z.infer<typeof ComponentMetaSchema>;
