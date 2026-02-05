/**
 * Organizations Routes
 *
 * CRUD endpoints for organization management.
 * Organizations are the top-level multi-tenant entity in Context Engine.
 */

import type { Organization as DbOrganization } from '@context-engine/db';
import { createOrganizationRepository } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { NotFound } from '../errors.js';
import {
  CreateOrganizationSchema,
  DeleteOrganizationResponseSchema,
  ErrorSchema,
  OrganizationListSchema,
  OrganizationResponseSchema,
  OrgIdParamSchema,
  UpdateOrganizationSchema,
} from '../schemas/index.js';

// =============================================================================
// Router Setup
// =============================================================================

export const organizationsRouter = new OpenAPIHono();

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format organization for API response.
 * Converts Date objects to ISO strings.
 */
function formatOrganization(org: DbOrganization) {
  return {
    id: org.id,
    name: org.name,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  };
}

// =============================================================================
// Route Definitions
// =============================================================================

const listOrganizationsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Organizations'],
  summary: 'List all organizations',
  description: 'Retrieve a list of all organizations.',
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
  path: '/{id}',
  tags: ['Organizations'],
  summary: 'Get organization by ID',
  description: 'Retrieve a single organization by its UUID.',
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
  path: '/{id}',
  tags: ['Organizations'],
  summary: 'Update organization',
  description: 'Update an existing organization. All fields are optional.',
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
  path: '/{id}',
  tags: ['Organizations'],
  summary: 'Delete organization',
  description:
    'Delete an organization by ID. Will fail if organization has associated components.',
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
  },
});

// =============================================================================
// Route Handlers
// =============================================================================

organizationsRouter.openapi(listOrganizationsRoute, async (c) => {
  const repo = createOrganizationRepository();
  const organizations = await repo.findAll();

  return c.json(
    {
      success: true as const,
      data: {
        organizations: organizations.map(formatOrganization),
        total: organizations.length,
      },
    },
    200
  );
});

organizationsRouter.openapi(getOrganizationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const repo = createOrganizationRepository();
  const org = await repo.findById(id);

  if (!org) {
    throw NotFound('Organization', id);
  }

  return c.json(
    {
      success: true as const,
      data: formatOrganization(org),
    },
    200
  );
});

organizationsRouter.openapi(createOrganizationRoute, async (c) => {
  const body = c.req.valid('json');
  const repo = createOrganizationRepository();
  const org = await repo.create({ name: body.name });

  return c.json(
    {
      success: true as const,
      data: formatOrganization(org),
    },
    201
  );
});

organizationsRouter.openapi(updateOrganizationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const repo = createOrganizationRepository();

  const org = await repo.update(id, body);

  if (!org) {
    throw NotFound('Organization', id);
  }

  return c.json(
    {
      success: true as const,
      data: formatOrganization(org),
    },
    200
  );
});

organizationsRouter.openapi(deleteOrganizationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const repo = createOrganizationRepository();

  const deleted = await repo.delete(id);

  if (!deleted) {
    throw NotFound('Organization', id);
  }

  return c.json(
    {
      success: true as const,
      data: {
        deleted: true,
      },
    },
    200
  );
});
