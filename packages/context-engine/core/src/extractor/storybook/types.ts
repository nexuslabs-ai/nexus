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
 *
 * Note: Filtering (interaction-only, showcase) happens during extraction.
 * Only usable examples are included in the output.
 */
export const ExtractedStorySchema = z.object({
  /** Human-readable title derived from name (e.g., "Primary" -> "Primary", "WithIcon" -> "With Icon") */
  title: z.string(),

  /** JSX code for the story - either from render function or generated from args */
  code: z.string(),

  /** Story classification by complexity */
  complexity: StoryComplexitySchema,
});

export type ExtractedStory = z.infer<typeof ExtractedStorySchema>;

/**
 * Storybook extraction result
 *
 * Complete extraction result from a `.stories.tsx` file.
 * Contains all extracted stories and meta configuration title.
 */
export const StorybookExtractionResultSchema = z.object({
  /** All extracted stories */
  stories: z.array(ExtractedStorySchema),

  /** Component title from meta (e.g., "Components/Button") */
  title: z.string().optional(),
});

export type StorybookExtractionResult = z.infer<
  typeof StorybookExtractionResultSchema
>;
