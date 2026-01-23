/**
 * AI-Generated Meta Types
 *
 * Types for LLM-generated component metadata.
 * This is the "slow" phase that requires LLM calls.
 */

import { z } from 'zod';

import { BaseLibrarySchema, TierSchema } from './identity.js';

/**
 * Pattern definitions
 * These patterns help categorize components for filtering and context
 */
export const COMPONENT_PATTERNS = [
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
] as const;

export type ComponentPattern = (typeof COMPONENT_PATTERNS)[number];

export const ComponentPatternSchema = z.enum(COMPONENT_PATTERNS);

/**
 * AI-generated component context
 *
 * NOTE: This schema is used internally by the generator module during
 * metadata generation. The final manifest uses GuidanceSchema instead.
 * This is NOT part of the final ComponentManifest schema.
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

  /** Design tokens used by this component */
  tokens: z.array(z.string()),

  /** Curated usage examples (JSX strings) */
  examples: z.array(z.string()),

  /** Related component names for context bundling */
  relatedComponents: z.array(z.string()),

  /** Accessibility notes */
  a11yNotes: z.string().optional(),

  /** Base UI library used (Radix, Ark, Base UI, Headless UI, React Aria, etc.) */
  baseLibrary: BaseLibrarySchema.optional(),
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

  /** Component tier for licensing */
  tier: TierSchema,

  /** AI-generated context */
  ai: AIContextSchema,

  /** Design-level variants (copied from extraction for meta file) */
  variants: z.record(z.string(), z.array(z.string())),

  /** Default variant values */
  defaults: z.record(z.string(), z.string()),
});

export type ComponentMeta = z.infer<typeof ComponentMetaSchema>;
