/**
 * Processing Schemas
 *
 * Request and response schemas for the processing API endpoints.
 * These define shapes for the atomic extract, generate, and build
 * operations that transform component source code into AI-ready manifests.
 */

import { z } from '@hono/zod-openapi';

import { FrameworkEnum } from './components.js';
import { OrgIdPathParamSchema } from './organizations.js';

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Extract-only request body.
 *
 * Runs only the extraction phase: parses component source code to
 * extract props, variants, dependencies, and other structural metadata.
 */
export const ExtractRequestSchema = z
  .object({
    sourceCode: z.string().min(1, 'Source code is required').openapi({
      example:
        'export function Button({ variant = "default" }: ButtonProps) { ... }',
      description: 'Component source code to extract metadata from',
    }),
    name: z
      .string()
      .min(1, 'Component name is required')
      .max(255, 'Component name must be 255 characters or less')
      .openapi({
        example: 'Button',
        description: 'Human-readable component name (PascalCase recommended)',
      }),
    framework: FrameworkEnum.default('react').openapi({
      example: 'react',
      description: 'Component framework for extraction strategy selection',
    }),
    filePath: z.string().optional().openapi({
      example: 'src/components/ui/button.tsx',
      description:
        'Original file path for context in error messages and dependency resolution',
    }),
    version: z.string().optional().openapi({
      example: '1.0.0',
      description: 'Component version (semver)',
    }),
    existingId: z
      .string()
      .uuid('Invalid component ID format')
      .optional()
      .openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description:
          'Existing component ID for updates instead of creating a new component',
      }),
    storiesCode: z.string().optional().openapi({
      example:
        'export const Primary: Story = { args: { variant: "primary" } };',
      description:
        'Storybook stories source code for extracting real usage examples',
    }),
    storiesFilePath: z.string().optional().openapi({
      example: 'src/components/ui/Button.stories.tsx',
      description: 'Path to the stories file for context in extraction',
    }),
  })
  .openapi('ExtractRequest');

/**
 * Generate-only request body.
 *
 * Runs only the generation phase: uses LLM to produce semantic metadata
 * (descriptions, usage patterns, guidance) from a prior extraction.
 * The component must already have extraction data stored in the database.
 */
export const GenerateRequestSchema = z
  .object({
    componentId: z.string().uuid('Invalid component ID format').openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description:
        'Component UUID with existing extraction data in the database',
    }),
    hints: z
      .string()
      .max(2000, 'Hints must be 2000 characters or less')
      .optional()
      .openapi({
        example:
          'This is the primary action button used across all forms in the application',
        description:
          'Optional hints to guide LLM generation with additional context beyond extracted code',
      }),
  })
  .openapi('GenerateRequest');

/**
 * Build-only request body.
 *
 * Runs only the build phase: combines existing extraction and generation
 * data into a complete AI manifest. The component must already have both
 * extraction and generation data stored in the database.
 */
export const BuildRequestSchema = z
  .object({
    componentId: z.string().uuid('Invalid component ID format').openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description:
        'Component UUID with existing extraction and generation data in the database',
    }),
  })
  .openapi('BuildRequest');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Extraction metadata included in processing responses.
 */
export const ExtractionMetadataSchema = z
  .object({
    fallbackTriggered: z.boolean().openapi({
      example: false,
      description: 'Whether the fallback extractor was used',
    }),
    fallbackReason: z.string().optional().openapi({
      example: 'react-docgen failed to parse component',
      description:
        'Reason for fallback (only present when fallback was triggered)',
    }),
    extractionMethod: z.string().openapi({
      example: 'react-docgen',
      description: 'Extraction method used (react-docgen, ts-morph, or hybrid)',
    }),
  })
  .openapi('ExtractionMetadata');

/**
 * Extract response.
 * Returns extraction results with component identity and metadata.
 */
export const ExtractResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      componentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Component UUID (generated or existing)',
      }),
      slug: z.string().openapi({
        example: 'button',
        description: 'URL-friendly component identifier',
      }),
      name: z.string().openapi({
        example: 'Button',
        description: 'Human-readable component name',
      }),
      framework: z.string().openapi({
        example: 'react',
        description: 'Component framework',
      }),
      sourceHash: z.string().openapi({
        example: 'a1b2c3d4e5f6',
        description: 'Hash of source code for change detection',
      }),
      extraction: z.record(z.string(), z.any()).openapi({
        description: 'Extracted component data (props, variants, dependencies)',
      }),
      metadata: ExtractionMetadataSchema.openapi({
        description: 'Information about the extraction process',
      }),
    }),
  })
  .openapi('ExtractResponse');

/**
 * Generate response.
 * Returns LLM-generated metadata for the component.
 */
export const GenerateResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      componentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Component UUID that was processed',
      }),
      generation: z.record(z.string(), z.any()).openapi({
        description:
          'LLM-generated metadata (descriptions, patterns, guidance)',
      }),
      provider: z.string().openapi({
        example: 'anthropic',
        description: 'LLM provider used for generation',
      }),
      model: z.string().openapi({
        example: 'claude-sonnet-4-20250514',
        description: 'LLM model used for generation',
      }),
    }),
  })
  .openapi('GenerateResponse');

/**
 * Build response.
 * Returns the complete AI manifest built from extraction and generation.
 */
export const BuildResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      componentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Component UUID',
      }),
      name: z.string().openapi({
        example: 'Button',
        description: 'Component name',
      }),
      manifest: z.record(z.string(), z.any()).openapi({
        description:
          'Complete AI manifest optimized for AI assistant consumption',
      }),
      sourceHash: z.string().openapi({
        example: 'a1b2c3d4e5f6',
        description: 'Hash of source code for change detection',
      }),
      builtAt: z.string().datetime().openapi({
        example: '2025-01-15T10:00:00.000Z',
        description: 'Timestamp when the manifest was built',
      }),
    }),
  })
  .openapi('BuildResponse');

// =============================================================================
// Parameter Schemas
// =============================================================================

/**
 * Processing endpoint path parameters.
 * All processing operations are scoped to an organization.
 */
export const ProcessingParamsSchema = OrgIdPathParamSchema;

// =============================================================================
// Type Exports
// =============================================================================

export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type BuildRequest = z.infer<typeof BuildRequestSchema>;
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
export type BuildResponse = z.infer<typeof BuildResponseSchema>;
