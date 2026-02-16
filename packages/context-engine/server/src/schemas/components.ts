/**
 * Component Schemas
 *
 * Request and response schemas for component CRUD operations.
 * Components are the core entity storing extracted and generated metadata.
 */

import { z } from '@hono/zod-openapi';

import { OrgIdPathParamSchema } from './organizations.js';

// =============================================================================
// Enums / Constants
// =============================================================================

/**
 * Supported component frameworks.
 */
export const FrameworkEnum = z.enum(['react', 'vue', 'svelte', 'angular']);
export type Framework = z.infer<typeof FrameworkEnum>;

/**
 * Component visibility levels.
 */
export const VisibilityEnum = z.enum(['private', 'org', 'public']);
export type Visibility = z.infer<typeof VisibilityEnum>;

/**
 * Embedding status values.
 */
export const EmbeddingStatusEnum = z.enum([
  'pending',
  'processing',
  'indexed',
  'failed',
]);
export type EmbeddingStatus = z.infer<typeof EmbeddingStatusEnum>;

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Create component request body.
 *
 * Only slug and name are required. All other fields are optional to support
 * incremental creation:
 * 1. POST with minimal data (slug, name)
 * 2. PATCH with extraction
 * 3. PATCH with generation + provider + model
 * 4. PATCH with manifest
 */
export const CreateComponentSchema = z
  .object({
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(255, 'Slug must be 255 characters or less')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase with hyphens only'
      )
      .openapi({
        example: 'button',
        description: 'URL-friendly component identifier (unique per org)',
      }),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name must be 255 characters or less')
      .openapi({
        example: 'Button',
        description: 'Human-readable component name',
      }),
    framework: FrameworkEnum.default('react').openapi({
      example: 'react',
      description: 'Component framework',
    }),
    version: z.string().default('0.0.0').openapi({
      example: '1.0.0',
      description: 'Semantic version',
    }),
    visibility: VisibilityEnum.default('org').openapi({
      example: 'org',
      description: 'Component visibility level',
    }),
    sourceHash: z
      .string()
      .max(64, 'Source hash must be 64 characters or less')
      .optional()
      .openapi({
        example: 'abc123def456789',
        description: 'Hash of source code for change detection',
      }),
    extraction: z
      .record(z.string(), z.any())
      .optional()
      .openapi({
        example: {
          props: [{ name: 'variant', type: 'string', required: false }],
          variants: [],
        },
        description: 'Extracted component data (props, variants, dependencies)',
      }),
    generation: z
      .record(z.string(), z.any())
      .optional()
      .openapi({
        example: {
          description: 'A clickable button component for user interactions',
          patterns: ['form-submit', 'navigation'],
        },
        description:
          'LLM-generated metadata (descriptions, patterns, guidance)',
      }),
    generationProvider: z.string().optional().openapi({
      example: 'anthropic',
      description: 'LLM provider used for generation',
    }),
    generationModel: z.string().optional().openapi({
      example: 'claude-sonnet-4-20250514',
      description: 'LLM model used for generation',
    }),
    manifest: z
      .record(z.string(), z.any())
      .optional()
      .openapi({
        example: {
          name: 'Button',
          description: 'A clickable button component',
          props: [],
        },
        description: 'Complete AI manifest for consumption',
      }),
  })
  .openapi('CreateComponent');

/**
 * Update component request body.
 * All fields are optional for partial updates.
 */
export const UpdateComponentSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(255, 'Name must be 255 characters or less')
      .optional()
      .openapi({
        example: 'Button',
        description: 'Human-readable component name',
      }),
    version: z.string().optional().openapi({
      example: '1.1.0',
      description: 'Semantic version',
    }),
    visibility: VisibilityEnum.optional().openapi({
      example: 'public',
      description: 'Component visibility level',
    }),
    sourceHash: z.string().min(1).max(64).optional().openapi({
      example: 'def456abc789012',
      description: 'Hash of source code for change detection',
    }),
    extraction: z.record(z.string(), z.any()).optional().openapi({
      description: 'Extracted component data (props, variants, dependencies)',
    }),
    generation: z.record(z.string(), z.any()).optional().openapi({
      description: 'LLM-generated metadata',
    }),
    generationProvider: z.string().min(1).optional().openapi({
      example: 'anthropic',
      description: 'LLM provider used for generation',
    }),
    generationModel: z.string().min(1).optional().openapi({
      example: 'claude-sonnet-4-20250514',
      description: 'LLM model used for generation',
    }),
    manifest: z.record(z.string(), z.any()).optional().openapi({
      description: 'Complete AI manifest for consumption',
    }),
  })
  .openapi('UpdateComponent');

/**
 * List components query parameters.
 */
export const ListComponentsQuerySchema = z
  .object({
    framework: FrameworkEnum.optional().openapi({
      description: 'Filter by framework',
    }),
    visibility: VisibilityEnum.optional().openapi({
      description: 'Filter by visibility level',
    }),
    embeddingStatus: EmbeddingStatusEnum.optional().openapi({
      description: 'Filter by embedding status',
    }),
    limit: z.coerce.number().int().min(1).max(100).default(50).openapi({
      example: 50,
      description: 'Maximum number of results (1-100)',
    }),
    offset: z.coerce.number().int().min(0).default(0).openapi({
      example: 0,
      description: 'Number of results to skip',
    }),
    orderBy: z
      .enum(['name', 'createdAt', 'updatedAt'])
      .default('name')
      .openapi({
        example: 'name',
        description: 'Field to sort by',
      }),
    order: z.enum(['asc', 'desc']).default('asc').openapi({
      example: 'asc',
      description: 'Sort direction',
    }),
  })
  .openapi('ListComponentsQuery');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Full component entity schema.
 * Includes all fields for detailed views.
 */
export const ComponentSchema = z
  .object({
    id: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Component UUID',
    }),
    orgId: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174001',
      description: 'Organization UUID',
    }),
    slug: z.string().openapi({
      example: 'button',
      description: 'URL-friendly identifier',
    }),
    name: z.string().openapi({
      example: 'Button',
      description: 'Human-readable name',
    }),
    framework: z.string().openapi({
      example: 'react',
      description: 'Component framework',
    }),
    version: z.string().openapi({
      example: '1.0.0',
      description: 'Semantic version',
    }),
    visibility: z.string().openapi({
      example: 'org',
      description: 'Visibility level',
    }),
    sourceHash: z.string().nullable().openapi({
      example: 'abc123def456789',
      description: 'Source code hash (null if not yet computed)',
    }),
    embeddingStatus: z.string().openapi({
      example: 'indexed',
      description: 'Embedding processing status',
    }),
    embeddingError: z.string().nullable().openapi({
      example: null,
      description: 'Error message if embedding failed',
    }),
    extraction: z.record(z.string(), z.any()).nullable().openapi({
      description: 'Extracted component data (null if not yet extracted)',
    }),
    generation: z.record(z.string(), z.any()).nullable().openapi({
      description: 'LLM-generated metadata (null if not yet generated)',
    }),
    generationProvider: z.string().nullable().openapi({
      example: 'anthropic',
      description: 'LLM provider (null if not yet generated)',
    }),
    generationModel: z.string().nullable().openapi({
      example: 'claude-sonnet-4-20250514',
      description: 'LLM model (null if not yet generated)',
    }),
    manifest: z.record(z.string(), z.any()).nullable().openapi({
      description: 'Complete AI manifest (null if not yet built)',
    }),
    createdAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Creation timestamp',
    }),
    updatedAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Last update timestamp',
    }),
  })
  .openapi('Component');

/**
 * Component summary schema for list views.
 * Excludes large JSONB fields for performance.
 */
export const ComponentSummarySchema = z
  .object({
    id: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Component UUID',
    }),
    slug: z.string().openapi({
      example: 'button',
      description: 'URL-friendly identifier',
    }),
    name: z.string().openapi({
      example: 'Button',
      description: 'Human-readable name',
    }),
    framework: z.string().openapi({
      example: 'react',
      description: 'Component framework',
    }),
    version: z.string().openapi({
      example: '1.0.0',
      description: 'Semantic version',
    }),
    visibility: z.string().openapi({
      example: 'org',
      description: 'Visibility level',
    }),
    embeddingStatus: z.string().openapi({
      example: 'indexed',
      description: 'Embedding status',
    }),
    createdAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Creation timestamp',
    }),
    updatedAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Last update timestamp',
    }),
  })
  .openapi('ComponentSummary');

/**
 * Component list response.
 */
export const ComponentListSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      components: z.array(ComponentSummarySchema).openapi({
        description: 'List of components',
      }),
      total: z.number().int().openapi({
        example: 100,
        description: 'Total number of matching components',
      }),
      limit: z.number().int().openapi({
        example: 50,
        description: 'Number of items per page',
      }),
      offset: z.number().int().openapi({
        example: 0,
        description: 'Current offset',
      }),
    }),
  })
  .openapi('ComponentList');

/**
 * Single component response.
 */
export const ComponentResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: ComponentSchema,
  })
  .openapi('ComponentResponse');

/**
 * Delete component response.
 */
export const DeleteComponentResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      deleted: z.boolean().openapi({
        example: true,
        description: 'Whether the component was deleted',
      }),
    }),
  })
  .openapi('DeleteComponentResponse');

/**
 * Index component response.
 * Returned after triggering embedding generation for a component.
 */
export const IndexComponentResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      componentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Component UUID that was indexed',
      }),
      chunksCreated: z.number().int().openapi({
        example: 5,
        description: 'Number of embedding chunks created',
      }),
      embeddingStatus: z.string().openapi({
        example: 'indexed',
        description: 'Current embedding status after indexing',
      }),
    }),
  })
  .openapi('IndexComponentResponse');

// =============================================================================
// Parameter Schemas
// =============================================================================

/**
 * Component ID path parameter.
 * Used in routes like `/organizations/{orgId}/components/{id}`.
 */
export const ComponentIdParamSchema = OrgIdPathParamSchema.extend({
  id: z
    .string()
    .uuid('Invalid component ID format')
    .openapi({
      param: { name: 'id', in: 'path' },
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Component UUID',
    }),
});

/**
 * Component slug path parameter.
 * Used in routes like `/organizations/{orgId}/components/by-slug/{slug}`.
 */
export const ComponentSlugParamSchema = OrgIdPathParamSchema.extend({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .openapi({
      param: { name: 'slug', in: 'path' },
      example: 'button',
      description: 'Component slug',
    }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type CreateComponent = z.infer<typeof CreateComponentSchema>;
export type UpdateComponent = z.infer<typeof UpdateComponentSchema>;
export type ListComponentsQuery = z.infer<typeof ListComponentsQuerySchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type ComponentSummary = z.infer<typeof ComponentSummarySchema>;
export type ComponentList = z.infer<typeof ComponentListSchema>;
export type ComponentResponse = z.infer<typeof ComponentResponseSchema>;
export type IndexComponentResponse = z.infer<
  typeof IndexComponentResponseSchema
>;
