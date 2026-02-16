/**
 * Tool Schema for LLM Tool Calling
 *
 * Defines the Zod schema for what the LLM should generate via tool calling.
 * This schema is a subset of the full manifest - only the AI-generated fields.
 */

import { z } from 'zod';

import { COMPONENT_PATTERNS } from '../types/meta.js';

// =============================================================================
// Tool Response Schema
// =============================================================================

/**
 * Code example schema for structured examples
 */
export const ToolCodeExampleSchema = z.object({
  title: z.string().describe('Short descriptive title for the example'),
  code: z.string().describe('Complete JSX code example'),
  description: z
    .string()
    .optional()
    .describe('Brief explanation of what this example demonstrates'),
});

/**
 * Structured examples schema
 */
export const ToolExamplesSchema = z.object({
  minimal: ToolCodeExampleSchema.describe('The simplest working example'),
  common: z
    .array(ToolCodeExampleSchema)
    .describe('2-4 examples showing typical usage patterns'),
  advanced: z
    .array(ToolCodeExampleSchema)
    .optional()
    .describe('Complex examples for advanced use cases'),
});

/**
 * Guidance schema for when to use / when not to use
 */
export const ToolGuidanceSchema = z.object({
  whenToUse: z
    .string()
    .min(20)
    .describe('When to use this component (min 20 chars)'),
  whenNotToUse: z
    .string()
    .min(10)
    .describe('When NOT to use, with alternatives (min 10 chars)'),
  accessibility: z
    .string()
    .describe('Accessibility considerations and ARIA attributes'),
  patterns: z
    .array(z.enum(COMPONENT_PATTERNS))
    .describe('Component patterns from the standard list'),
  relatedComponents: z
    .array(z.string())
    .describe('Related component names that work well with this one'),
});

/**
 * Schema for what the LLM should generate via tool calling.
 *
 * This is a subset of the full manifest - only the AI-generated fields.
 * The extractor provides the rest (props, variants, dependencies, etc.)
 */
export const ComponentMetaToolSchema = z.object({
  description: z
    .string()
    .min(50)
    .max(2000)
    .describe(
      'Detailed description for AI search and semantic understanding (50-2000 chars). ' +
        'Describe the component purpose, key features, supported variants, and common use cases. ' +
        'Make it comprehensive enough for AI coding assistants to understand when to use this component.'
    ),

  guidance: ToolGuidanceSchema.describe(
    'Usage guidance including when to use, when not to use, accessibility considerations, ' +
      'applicable patterns from the pattern list, and related components that work well together.'
  ),

  examples: ToolExamplesSchema.optional().describe(
    'Practical code examples showing component usage. ' +
      'Include a minimal example, 2-4 common usage patterns, and optionally advanced examples. ' +
      'Only provide if Storybook examples are not available.'
  ),

  variantDescriptions: z
    .record(z.string(), z.record(z.string(), z.string()))
    .optional()
    .describe(
      'Descriptions for each variant value. Outer key is variant name (e.g., "variant"), ' +
        'inner key is value (e.g., "destructive"), value is description (e.g., "Red color for dangerous actions")'
    ),

  subComponentVariantDescriptions: z
    .record(z.string(), z.record(z.string(), z.record(z.string(), z.string())))
    .optional()
    .describe(
      'Variant descriptions for sub-components of compound components. ' +
        'Structure: { subComponentName: { variantName: { value: description } } }. ' +
        'Example: { "DialogTrigger": { "variant": { "outline": "Border-only style for less emphasis" } } }'
    ),
});

export type ComponentMetaTool = z.infer<typeof ComponentMetaToolSchema>;

// =============================================================================
// JSON Schema Generation
// =============================================================================

/**
 * Generate JSON Schema from Zod schema for LLM tool calling
 *
 * Uses Zod 4's native z.toJSONSchema() for proper schema generation.
 */
export const COMPONENT_META_TOOL_JSON_SCHEMA = z.toJSONSchema(
  ComponentMetaToolSchema
);

// =============================================================================
// Tool Definition
// =============================================================================

/**
 * Tool definition for Anthropic API
 *
 * This is the tool object passed to the Anthropic messages.create() call.
 * The input_schema is the JSON Schema generated from our Zod schema.
 */
export const COMPONENT_META_TOOL = {
  name: 'generate_component_metadata',
  description:
    'Generate semantic metadata for a UI component to make it AI-accessible. ' +
    'Analyzes component props, variants, and dependencies to produce descriptions, ' +
    'usage examples, and guidance for AI coding assistants.',
  input_schema: COMPONENT_META_TOOL_JSON_SCHEMA,
} as const;

export type ComponentMetaToolDefinition = typeof COMPONENT_META_TOOL;
