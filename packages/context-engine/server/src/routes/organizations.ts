/**
 * Organizations Routes
 *
 * CRUD endpoints for organization management.
 * Organizations are the top-level multi-tenant entity in Context Engine.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { isPlatform, isTenant } from '../auth/index.js';
import { ApiError, conflict, forbidden, notFound } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import {
  CreateOrganizationSchema,
  DeleteOrganizationResponseSchema,
  ErrorSchema,
  OrganizationListSchema,
  OrganizationResponseSchema,
  OrgIdParamSchema,
  PaginationQuerySchema,
  UpdateOrganizationSchema,
} from '../schemas/index.js';
import type { AppEnv } from '../types.js';
import { formatDates, successResponse } from '../utils/index.js';

// =============================================================================
// Router Setup
// =============================================================================

/**
 * Organizations router.
 *
 * Requires repositories middleware to be applied at app level.
 * Access organization repository via `c.var.organizationRepo`.
 */
export const organizationsRouter = new OpenAPIHono<AppEnv>();

// =============================================================================
// Route Definitions
// =============================================================================

const listOrganizationsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Organizations'],
  summary: 'List all organizations',
  description: 'Retrieve a paginated list of all organizations.',
  security: [{ Bearer: [] }],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OrganizationListSchema,
        },
      },
      description: 'List of organizations',
    },
  },
});

const getOrganizationRoute = createRoute({
  method: 'get',
  path: '/{orgId}',
  tags: ['Organizations'],
  summary: 'Get organization by ID',
  description: 'Retrieve a single organization by its UUID.',
  security: [{ Bearer: [] }],
  request: {
    params: OrgIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OrganizationResponseSchema,
        },
      },
      description: 'Organization found',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Organization not found',
    },
  },
});

const createOrganizationRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Organizations'],
  summary: 'Create organization',
  description: 'Create a new organization.',
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateOrganizationSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: OrganizationResponseSchema,
        },
      },
      description: 'Organization created',
    },
  },
});

const updateOrganizationRoute = createRoute({
  method: 'patch',
  path: '/{orgId}',
  tags: ['Organizations'],
  summary: 'Update organization',
  description: 'Update an existing organization. All fields are optional.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('admin')],
  request: {
    params: OrgIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateOrganizationSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OrganizationResponseSchema,
        },
      },
      description: 'Organization updated',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Organization not found',
    },
  },
});

const deleteOrganizationRoute = createRoute({
  method: 'delete',
  path: '/{orgId}',
  tags: ['Organizations'],
  summary: 'Delete organization',
  description:
    'Delete an organization by ID. Will fail if organization has associated components.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('admin')],
  request: {
    params: OrgIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DeleteOrganizationResponseSchema,
        },
      },
      description: 'Organization deleted',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Organization not found',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Cannot delete organization with existing components',
    },
  },
});

// =============================================================================
// Route Handlers
// =============================================================================

organizationsRouter.openapi(listOrganizationsRoute, async (c) => {
  const repo = c.var.organizationRepo;
  const query = c.req.valid('query');
  const auth = c.var.auth;

  // Tenant context: only return the key's own org
  if (isTenant(auth)) {
    const org = await repo.findById(auth.orgId);
    const organizations = org ? [formatDates(org)] : [];
    return c.json(
      successResponse({
        organizations,
        total: organizations.length,
        limit: query.limit,
        offset: query.offset,
      }),
      200
    );
  }

  // Platform context: return all orgs
  const result = await repo.findMany({
    limit: query.limit,
    offset: query.offset,
  });

  return c.json(
    successResponse({
      organizations: result.organizations.map(formatDates),
      total: result.total,
      limit: query.limit,
      offset: query.offset,
    }),
    200
  );
});

organizationsRouter.openapi(getOrganizationRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const repo = c.var.organizationRepo;

  const org = await repo.findById(orgId);

  if (!org) {
    throw notFound('Organization', orgId);
  }

  return c.json(successResponse(formatDates(org)), 200);
});

organizationsRouter.openapi(createOrganizationRoute, async (c) => {
  const auth = c.var.auth;

  if (!isPlatform(auth)) {
    throw forbidden('Organization creation requires platform admin');
  }

  const body = c.req.valid('json');
  const repo = c.var.organizationRepo;
  const org = await repo.create({ name: body.name });

  return c.json(successResponse(formatDates(org)), 201);
});

organizationsRouter.openapi(updateOrganizationRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repo = c.var.organizationRepo;

  const org = await repo.update(orgId, body);

  if (!org) {
    throw notFound('Organization', orgId);
  }

  return c.json(successResponse(formatDates(org)), 200);
});

organizationsRouter.openapi(deleteOrganizationRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const repo = c.var.organizationRepo;

  try {
    const deleted = await repo.delete(orgId);

    if (!deleted) {
      throw notFound('Organization', orgId);
    }

    return c.json(successResponse({ deleted: true }), 200);
  } catch (err) {
    // Re-throw our own API errors
    if (err instanceof ApiError) throw err;

    // Handle FK constraint violation (PostgreSQL error code 23503)
    const pgError = err as { code?: string };
    if (pgError.code === '23503') {
      throw conflict(
        'Cannot delete organization with existing components. Delete all components first.'
      );
    }

    throw err;
  }
});
