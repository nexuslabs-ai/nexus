/**
 * API Keys Routes
 *
 * CRUD endpoints for API key management.
 * All routes are nested under `/api/v1/organizations/:orgId/api-keys`.
 *
 * Security:
 * - All routes require `admin` scope (applied at route level).
 * - The raw key is returned ONLY on creation — it cannot be retrieved again.
 * - The keyHash is NEVER included in any response.
 */

import type { ApiKey } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import type { AuthScope } from '../auth/auth-types.js';
import { generateApiKey, hashApiKey } from '../auth/auth-validator.js';
import { getConfig } from '../config.js';
import { notFound } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import {
  ApiKeyIdParamSchema,
  ApiKeyListSchema,
  CreateApiKeyResponseSchema,
  CreateApiKeySchema,
  RevokeApiKeyResponseSchema,
} from '../schemas/api-keys.js';
import { ErrorSchema } from '../schemas/common.js';
import { OrgIdPathParamSchema } from '../schemas/organizations.js';
import type { AppEnv } from '../types.js';
import { formatDates, omitFields, successResponse } from '../utils/index.js';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format an API key record for API responses.
 *
 * Converts Date fields to ISO strings and strips the keyHash
 * to prevent accidental exposure of sensitive data.
 */
function formatApiKey(apiKey: ApiKey) {
  const formatted = omitFields(formatDates(apiKey), ['keyHash', 'orgId']);
  return { ...formatted, scopes: formatted.scopes as AuthScope[] };
}

// =============================================================================
// Route Definitions
// =============================================================================

/**
 * POST / - Create a new API key
 */
const createApiKeyRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['API Keys'],
  summary: 'Create API key',
  description:
    'Create a new API key for the organization. The raw key is returned ONLY in this response — store it securely.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('admin')],
  request: {
    params: OrgIdPathParamSchema,
    body: {
      content: {
        'application/json': {
          schema: CreateApiKeySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: CreateApiKeyResponseSchema,
        },
      },
      description: 'API key created — raw key included (shown once)',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Organization not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * GET / - List all API keys for an organization
 */
const listApiKeysRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['API Keys'],
  summary: 'List API keys',
  description:
    'List all API keys for the organization. The raw key is never returned in list responses.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('admin')],
  request: {
    params: OrgIdPathParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiKeyListSchema,
        },
      },
      description: 'List of API keys',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * DELETE /:keyId - Revoke an API key
 */
const revokeApiKeyRoute = createRoute({
  method: 'delete',
  path: '/{keyId}',
  tags: ['API Keys'],
  summary: 'Revoke API key',
  description:
    'Revoke an API key by setting it to inactive. Revoked keys can no longer authenticate.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('admin')],
  request: {
    params: ApiKeyIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RevokeApiKeyResponseSchema,
        },
      },
      description: 'API key revoked',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'API key not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// =============================================================================
// Router
// =============================================================================

/**
 * API Keys router.
 * Mount at `/api/v1/organizations/:orgId/api-keys`.
 *
 * Requires repositories middleware to be applied at app level.
 * All routes require `admin` scope (applied in route definitions).
 */
export const apiKeysRouter = new OpenAPIHono<AppEnv>();

// -----------------------------------------------------------------------------
// POST / - Create API key
// -----------------------------------------------------------------------------

apiKeysRouter.openapi(createApiKeyRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const apiKeyRepo = c.var.apiKeyRepo;
  const organizationRepo = c.var.organizationRepo;
  const config = getConfig();

  // Verify organization exists
  const org = await organizationRepo.findById(orgId);
  if (!org) {
    throw notFound('Organization', orgId);
  }

  // Generate key and hash
  const { rawKey, keyPrefix } = generateApiKey();
  const keyHash = hashApiKey(rawKey, config.apiKeyHashSecret);

  // Store the key
  const apiKey = await apiKeyRepo.create({
    orgId,
    name: body.name,
    keyHash,
    keyPrefix,
    scopes: body.scopes,
  });

  // Return raw key — shown ONCE
  return c.json(
    successResponse({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes as AuthScope[],
      createdAt: apiKey.createdAt.toISOString(),
    }),
    201
  );
});

// -----------------------------------------------------------------------------
// GET / - List API keys
// -----------------------------------------------------------------------------

apiKeysRouter.openapi(listApiKeysRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const apiKeyRepo = c.var.apiKeyRepo;

  const keys = await apiKeyRepo.findByOrgId(orgId);

  return c.json(
    successResponse({
      apiKeys: keys.map(formatApiKey),
      total: keys.length,
    }),
    200
  );
});

// -----------------------------------------------------------------------------
// DELETE /:keyId - Revoke API key
// -----------------------------------------------------------------------------

apiKeysRouter.openapi(revokeApiKeyRoute, async (c) => {
  const { orgId, keyId } = c.req.valid('param');
  const apiKeyRepo = c.var.apiKeyRepo;

  const revoked = await apiKeyRepo.revoke(orgId, keyId);

  if (!revoked) {
    throw notFound('API key', keyId);
  }

  return c.json(successResponse({ revoked: true as const }), 200);
});
