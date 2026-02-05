/**
 * Common Schemas
 *
 * Shared schemas for error responses, health checks, and common patterns.
 * These are reusable across all API endpoints.
 */

import { z } from '@hono/zod-openapi';

// =============================================================================
// Error Schemas
// =============================================================================

/**
 * Standard error response schema.
 * All API errors follow this structure for consistent AI consumption.
 */
export const ErrorSchema = z
  .object({
    success: z.literal(false).openapi({
      example: false,
      description: 'Always false for error responses',
    }),
    error: z.object({
      code: z.string().openapi({
        example: 'NOT_FOUND',
        description: 'Machine-readable error code for programmatic handling',
      }),
      message: z.string().openapi({
        example: 'Resource not found',
        description: 'Human/AI-readable error explanation',
      }),
      details: z.any().optional().openapi({
        description: 'Additional context for error recovery',
      }),
    }),
  })
  .openapi('Error');

/**
 * Validation error detail schema.
 * Used when request validation fails to provide field-level feedback.
 */
export const ValidationErrorDetailSchema = z
  .object({
    field: z.string().openapi({
      example: 'name',
      description: 'The field that failed validation',
    }),
    message: z.string().openapi({
      example: 'Required field is missing',
      description: 'What went wrong with this field',
    }),
  })
  .openapi('ValidationErrorDetail');

// =============================================================================
// Health Check Schemas
// =============================================================================

/**
 * Health check response schema.
 * Basic liveness probe - server is running.
 */
export const HealthSchema = z
  .object({
    status: z.enum(['ok', 'degraded', 'error']).openapi({
      example: 'ok',
      description: 'Current health status',
    }),
    version: z.string().openapi({
      example: '0.1.0',
      description: 'Server version',
    }),
    environment: z.string().openapi({
      example: 'development',
      description: 'Runtime environment',
    }),
  })
  .openapi('Health');

/**
 * Readiness check response schema.
 * Readiness probe - server can handle requests (database connected).
 */
export const ReadySchema = z
  .object({
    ready: z.boolean().openapi({
      example: true,
      description: 'Whether the server is ready to handle requests',
    }),
    database: z.enum(['ok', 'error']).openapi({
      example: 'ok',
      description: 'Database connection status',
    }),
  })
  .openapi('Ready');

// =============================================================================
// Pagination Schemas
// =============================================================================

/**
 * Pagination query parameters.
 * Standard pagination for list endpoints.
 */
export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).openapi({
    example: 50,
    description: 'Maximum number of items to return (1-100)',
  }),
  offset: z.coerce.number().int().min(0).default(0).openapi({
    example: 0,
    description: 'Number of items to skip',
  }),
});

/**
 * Pagination metadata in responses.
 */
export const PaginationMetaSchema = z.object({
  total: z.number().int().openapi({
    example: 100,
    description: 'Total number of items available',
  }),
  limit: z.number().int().openapi({
    example: 50,
    description: 'Number of items per page',
  }),
  offset: z.number().int().openapi({
    example: 0,
    description: 'Current offset',
  }),
});

// =============================================================================
// Success Response Wrapper
// =============================================================================

/**
 * Creates a success response schema wrapping the provided data schema.
 * Enforces the `{ success: true, data: T }` pattern.
 */
export function createSuccessResponse<T extends z.ZodTypeAny>(
  dataSchema: T,
  name: string
) {
  return z
    .object({
      success: z.literal(true).openapi({
        example: true,
        description: 'Always true for successful responses',
      }),
      data: dataSchema,
    })
    .openapi(name);
}
