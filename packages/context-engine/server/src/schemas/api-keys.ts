/**
 * API Key Schemas
 *
 * Request and response schemas for API key management endpoints.
 * API keys are scoped to an organization and grant permission scopes.
 *
 * Security: The raw key is returned ONLY once at creation time.
 * All other responses use `keyPrefix` for identification.
 */

import { z } from '@hono/zod-openapi';

import { AUTH_SCOPES } from '../auth/auth-types.js';

import { OrgIdPathParamSchema } from './organizations.js';

// =============================================================================
// Enums / Constants
// =============================================================================

/**
 * Permission scope enum derived from auth constants.
 * Ensures schema validation stays in sync with runtime scope values.
 */
export const AuthScopeEnum = z.enum([...AUTH_SCOPES]);

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Create API key request body.
 */
export const CreateApiKeySchema = z
  .object({
    name: z
      .string()
      .min(1, 'API key name is required')
      .max(255, 'API key name must be 255 characters or less')
      .openapi({
        example: 'CI/CD Pipeline',
        description: 'Human-readable label for identifying the key',
      }),
    scopes: z
      .array(AuthScopeEnum)
      .min(1, 'At least one scope is required')
      .openapi({
        example: ['component:read', 'component:write'],
        description: 'Permission scopes granted to this key',
      }),
  })
  .openapi('CreateApiKey');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * API key entity schema for list/detail responses.
 * NEVER includes the raw key or keyHash.
 */
export const ApiKeySchema = z
  .object({
    id: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'API key UUID',
    }),
    name: z.string().openapi({
      example: 'CI/CD Pipeline',
      description: 'Human-readable label',
    }),
    keyPrefix: z.string().openapi({
      example: 'a1b2c3d4',
      description: 'First 8 characters of the key for identification',
    }),
    scopes: z.array(AuthScopeEnum).openapi({
      example: ['component:read', 'component:write'],
      description: 'Permission scopes granted to this key',
    }),
    hashVersion: z.number().int().openapi({
      example: 1,
      description: 'Hash algorithm version',
    }),
    isActive: z.boolean().openapi({
      example: true,
      description: 'Whether this key is currently active',
    }),
    lastUsedAt: z.string().datetime().nullable().openapi({
      example: '2025-01-15T10:00:00.000Z',
      description:
        'Timestamp of last API call using this key (null if never used)',
    }),
    expiresAt: z.string().datetime().nullable().openapi({
      example: null,
      description: 'Expiration timestamp (null = never expires)',
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
  .openapi('ApiKey');

/**
 * Create API key response.
 * This is the ONLY time the raw key is returned.
 * The caller must store it securely — it cannot be retrieved again.
 */
export const CreateApiKeyResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      id: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'API key UUID',
      }),
      name: z.string().openapi({
        example: 'CI/CD Pipeline',
        description: 'Human-readable label',
      }),
      key: z.string().openapi({
        example:
          'ce_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        description: 'The raw API key — shown ONCE. Store it securely.',
      }),
      keyPrefix: z.string().openapi({
        example: 'a1b2c3d4',
        description: 'First 8 characters of the key for identification',
      }),
      scopes: z.array(AuthScopeEnum).openapi({
        example: ['component:read', 'component:write'],
        description: 'Permission scopes granted to this key',
      }),
      createdAt: z.string().datetime().openapi({
        example: '2025-01-15T10:00:00.000Z',
        description: 'Creation timestamp (ISO 8601)',
      }),
    }),
  })
  .openapi('CreateApiKeyResponse');

/**
 * API key list response.
 */
export const ApiKeyListSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      apiKeys: z.array(ApiKeySchema).openapi({
        description: 'List of API keys',
      }),
      total: z.number().int().openapi({
        example: 3,
        description: 'Total number of API keys',
      }),
    }),
  })
  .openapi('ApiKeyList');

/**
 * Revoke API key response.
 */
export const RevokeApiKeyResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      revoked: z.literal(true).openapi({
        example: true,
        description: 'Whether the API key was revoked',
      }),
    }),
  })
  .openapi('RevokeApiKeyResponse');

// =============================================================================
// Parameter Schemas
// =============================================================================

/**
 * API key ID path parameter.
 * Used in routes like `/organizations/{orgId}/api-keys/{keyId}`.
 */
export const ApiKeyIdParamSchema = OrgIdPathParamSchema.extend({
  keyId: z
    .string()
    .uuid('Invalid API key ID format')
    .openapi({
      param: { name: 'keyId', in: 'path' },
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'API key UUID',
    }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type CreateApiKey = z.infer<typeof CreateApiKeySchema>;
export type ApiKeyResponse = z.infer<typeof ApiKeySchema>;
export type CreateApiKeyResponse = z.infer<typeof CreateApiKeyResponseSchema>;
export type ApiKeyList = z.infer<typeof ApiKeyListSchema>;
export type RevokeApiKeyResponse = z.infer<typeof RevokeApiKeyResponseSchema>;
