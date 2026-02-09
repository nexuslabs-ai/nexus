/**
 * Organization Schemas
 *
 * Request and response schemas for organization CRUD operations.
 * Organizations are the top-level multi-tenant entity.
 */

import { z } from '@hono/zod-openapi';

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Create organization request body.
 */
export const CreateOrganizationSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Organization name is required')
      .max(255, 'Organization name must be 255 characters or less')
      .openapi({
        example: 'Acme Corp',
        description: 'Organization name',
      }),
  })
  .openapi('CreateOrganization');

/**
 * Update organization request body.
 * All fields are optional for partial updates.
 */
export const UpdateOrganizationSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Organization name cannot be empty')
      .max(255, 'Organization name must be 255 characters or less')
      .optional()
      .openapi({
        example: 'Acme Corporation',
        description: 'Updated organization name',
      }),
  })
  .openapi('UpdateOrganization');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Organization entity schema.
 * Represents a full organization record.
 */
export const OrganizationSchema = z
  .object({
    id: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Organization UUID',
    }),
    name: z.string().openapi({
      example: 'Acme Corp',
      description: 'Organization name',
    }),
    createdAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Creation timestamp (ISO 8601)',
    }),
    updatedAt: z.string().datetime().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description: 'Last update timestamp (ISO 8601)',
    }),
  })
  .openapi('Organization');

/**
 * Organization list response.
 */
export const OrganizationListSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      organizations: z.array(OrganizationSchema).openapi({
        description: 'List of organizations',
      }),
      total: z.number().int().openapi({
        example: 10,
        description: 'Total number of organizations',
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
  .openapi('OrganizationList');

/**
 * Single organization response.
 */
export const OrganizationResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: OrganizationSchema,
  })
  .openapi('OrganizationResponse');

/**
 * Delete organization response.
 */
export const DeleteOrganizationResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      deleted: z.boolean().openapi({
        example: true,
        description: 'Whether the organization was deleted',
      }),
    }),
  })
  .openapi('DeleteOrganizationResponse');

// =============================================================================
// Parameter Schemas
// =============================================================================

/**
 * Organization ID path parameter.
 * Used in routes like `/organizations/{orgId}`.
 */
export const OrgIdParamSchema = z.object({
  orgId: z
    .string()
    .uuid('Invalid organization ID format')
    .openapi({
      param: { name: 'orgId', in: 'path' },
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Organization UUID',
    }),
});

/**
 * Organization ID path parameter for nested resources.
 * Used in routes like `/organizations/{orgId}/components`.
 */
export const OrgIdPathParamSchema = z.object({
  orgId: z
    .string()
    .uuid('Invalid organization ID format')
    .openapi({
      param: { name: 'orgId', in: 'path' },
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Organization UUID',
    }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationList = z.infer<typeof OrganizationListSchema>;
export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>;
