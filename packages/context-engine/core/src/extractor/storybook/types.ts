/**
 * Storybook Extraction Types
 *
 * Types for extracting component metadata from Storybook stories files.
 * Supports CSF3 format (Storybook 10) with TypeScript.
 */

import { z } from 'zod';

/**
 * Story complexity classification
 *
 * Used to organize examples by complexity level:
 * - minimal: Default/basic stories (shown first)
 * - common: Typical usage patterns (variant, size, state stories)
 * - advanced: Complex patterns with custom render functions
 */
export const StoryComplexitySchema = z.enum(['minimal', 'common', 'advanced']);

export type StoryComplexity = z.infer<typeof StoryComplexitySchema>;

/**
 * Extracted story from Storybook file
 *
 * Represents a single story export from a `.stories.tsx` file.
 * Stories are parsed from CSF3 format exports.
 */
export const ExtractedStorySchema = z.object({
  /** Story export name (e.g., "Primary", "WithIcon") */
  name: z.string(),

  /** Human-readable title derived from name (e.g., "Primary" -> "Primary", "WithIcon" -> "With Icon") */
  title: z.string(),

  /** Story args (props passed to component) */
  args: z.record(z.string(), z.unknown()).optional(),

  /** Whether story has custom render function */
  hasRender: z.boolean(),

  /** Raw render function JSX code (if hasRender is true) */
  renderCode: z.string().optional(),

  /** Generated code from args (for args-only stories) */
  code: z.string().optional(),

  /** Props demonstrated in this story (extracted from args keys and JSX) */
  propsUsed: z.array(z.string()),

  /** Story classification by complexity */
  complexity: StoryComplexitySchema,

  /** Whether this is interaction-only (skip for examples, e.g., play function only) */
  isInteractionOnly: z.boolean(),

  /** Whether this is a showcase grid (skip for examples, e.g., AllVariants) */
  isShowcase: z.boolean(),
});

export type ExtractedStory = z.infer<typeof ExtractedStorySchema>;

/**
 * ArgType metadata from Storybook meta
 *
 * Extracted from the `argTypes` property in Storybook meta configuration.
 * Provides additional prop documentation from Storybook.
 */
export const ArgTypeInfoSchema = z.object({
  /** Control type (e.g., "select", "boolean", "text") */
  control: z.string().optional(),

  /** Available options for select/radio controls */
  options: z.array(z.string()).optional(),

  /** Prop description from Storybook */
  description: z.string().optional(),

  /** Default value for the prop */
  defaultValue: z.unknown().optional(),
});

export type ArgTypeInfo = z.infer<typeof ArgTypeInfoSchema>;

/**
 * Storybook extraction result
 *
 * Complete extraction result from a `.stories.tsx` file.
 * Contains all stories, meta configuration, and argTypes.
 */
export const StorybookExtractionResultSchema = z.object({
  /** All extracted stories */
  stories: z.array(ExtractedStorySchema),

  /** Component title from meta (e.g., "Components/Button") */
  title: z.string().optional(),

  /** ArgTypes from meta (prop metadata) */
  argTypes: z.record(z.string(), ArgTypeInfoSchema),

  /** Default args from meta (applied to all stories) */
  defaultArgs: z.record(z.string(), z.unknown()),
});

export type StorybookExtractionResult = z.infer<
  typeof StorybookExtractionResultSchema
>;
