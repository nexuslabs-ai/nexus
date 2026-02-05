/**
 * Components Routes
 *
 * CRUD endpoints for component management.
 * All routes are nested under `/api/v1/organizations/:orgId/components`.
 */

import type { Component } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { NotFound } from '../errors.js';
import { ErrorSchema } from '../schemas/common.js';
import {
  ComponentIdParamSchema,
  ComponentListSchema,
  ComponentResponseSchema,
  ComponentSlugParamSchema,
  CreateComponentSchema,
  DeleteComponentResponseSchema,
  ListComponentsQuerySchema,
  UpdateComponentSchema,
} from '../schemas/components.js';
import { OrgIdPathParamSchema } from '../schemas/organizations.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Context type expected by the router.
 * Parent router must provide database and repositories.
 */
interface ComponentsRouterContext {
  Variables: {
    db: unknown;
    componentRepository: {
      findById: (orgId: string, id: string) => Promise<Component | null>;
      findBySlug: (orgId: string, slug: string) => Promise<Component | null>;
      findMany: (
        orgId: string,
        options: {
          where?: {
            framework?: string;
            visibility?: string;
            embeddingStatus?: string;
          };
          limit?: number;
          offset?: number;
          orderBy?: 'name' | 'createdAt' | 'updatedAt';
          orderDir?: 'asc' | 'desc';
        }
      ) => Promise<{ components: Component[]; total: number }>;
      create: (
        orgId: string,
        data: Record<string, unknown>
      ) => Promise<Component>;
      upsert: (
        orgId: string,
        data: Record<string, unknown>
      ) => Promise<Component>;
      update: (
        orgId: string,
        id: string,
        data: Record<string, unknown>
      ) => Promise<Component | null>;
      delete: (orgId: string, id: string) => Promise<Component | null>;
    };
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format a component for API response.
 * Converts Date objects to ISO strings.
 */
function formatComponent(component: Component) {
  return {
    ...component,
    createdAt: component.createdAt.toISOString(),
    updatedAt: component.updatedAt.toISOString(),
  };
}

/**
 * Format a component summary for list responses.
 * Excludes large JSONB fields for performance.
 */
function formatComponentSummary(component: Component) {
  return {
    id: component.id,
    slug: component.slug,
    name: component.name,
    framework: component.framework,
    version: component.version,
    visibility: component.visibility,
    embeddingStatus: component.embeddingStatus,
    createdAt: component.createdAt.toISOString(),
    updatedAt: component.updatedAt.toISOString(),
  };
}

// =============================================================================
// Route Definitions
// =============================================================================

/**
 * GET / - List components with optional filters
 */
const listComponentsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Components'],
  summary: 'List components',
  description:
    'List components for an organization with optional filtering, pagination, and sorting.',
  request: {
    params: OrgIdPathParamSchema,
    query: ListComponentsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ComponentListSchema,
        },
      },
      description: 'List of components',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request parameters',
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
 * GET /:id - Get component by ID
 */
const getComponentByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Components'],
  summary: 'Get component by ID',
  description: 'Retrieve a single component by its UUID.',
  request: {
    params: ComponentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ComponentResponseSchema,
        },
      },
      description: 'Component details',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
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
 * GET /slug/:slug - Get component by slug
 */
const getComponentBySlugRoute = createRoute({
  method: 'get',
  path: '/slug/{slug}',
  tags: ['Components'],
  summary: 'Get component by slug',
  description: 'Retrieve a single component by its URL-friendly slug.',
  request: {
    params: ComponentSlugParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ComponentResponseSchema,
        },
      },
      description: 'Component details',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
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
 * POST / - Create or upsert component
 */
const createComponentRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Components'],
  summary: 'Create or update component',
  description:
    'Create a new component or update an existing one by slug. Returns 201 if created, 200 if updated.',
  request: {
    params: OrgIdPathParamSchema,
    body: {
      content: {
        'application/json': {
          schema: CreateComponentSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ComponentResponseSchema,
        },
      },
      description: 'Component updated',
    },
    201: {
      content: {
        'application/json': {
          schema: ComponentResponseSchema,
        },
      },
      description: 'Component created',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request body',
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
 * PATCH /:id - Update component
 */
const updateComponentRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Components'],
  summary: 'Update component',
  description: 'Partially update an existing component by ID.',
  request: {
    params: ComponentIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateComponentSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ComponentResponseSchema,
        },
      },
      description: 'Component updated',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request body',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
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
 * DELETE /:id - Delete component
 */
const deleteComponentRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Components'],
  summary: 'Delete component',
  description:
    'Delete a component by ID. This also deletes associated embedding chunks.',
  request: {
    params: ComponentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DeleteComponentResponseSchema,
        },
      },
      description: 'Component deleted',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
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
 * Components router.
 * Mount at `/api/v1/organizations/:orgId/components`.
 */
export const componentsRouter = new OpenAPIHono<ComponentsRouterContext>();

// -----------------------------------------------------------------------------
// GET / - List components
// -----------------------------------------------------------------------------

componentsRouter.openapi(listComponentsRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const query = c.req.valid('query');
  const repository = c.var.componentRepository;

  const result = await repository.findMany(orgId, {
    where: {
      framework: query.framework,
      visibility: query.visibility,
      embeddingStatus: query.embeddingStatus,
    },
    limit: query.limit,
    offset: query.offset,
    orderBy: query.orderBy,
    orderDir: query.order,
  });

  return c.json(
    {
      success: true as const,
      data: {
        components: result.components.map(formatComponentSummary),
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    },
    200
  );
});

// -----------------------------------------------------------------------------
// GET /:id - Get component by ID
// -----------------------------------------------------------------------------

componentsRouter.openapi(getComponentByIdRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const repository = c.var.componentRepository;
  const component = await repository.findById(orgId, id);

  if (!component) {
    throw NotFound('Component', id);
  }

  return c.json(
    {
      success: true as const,
      data: formatComponent(component),
    },
    200
  );
});

// -----------------------------------------------------------------------------
// GET /slug/:slug - Get component by slug
// -----------------------------------------------------------------------------

componentsRouter.openapi(getComponentBySlugRoute, async (c) => {
  const { orgId, slug } = c.req.valid('param');
  const repository = c.var.componentRepository;
  const component = await repository.findBySlug(orgId, slug);

  if (!component) {
    throw NotFound('Component', slug);
  }

  return c.json(
    {
      success: true as const,
      data: formatComponent(component),
    },
    200
  );
});

// -----------------------------------------------------------------------------
// POST / - Create or upsert component
// -----------------------------------------------------------------------------

componentsRouter.openapi(createComponentRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepository;

  // Check if component already exists by slug
  const existing = await repository.findBySlug(orgId, body.slug);
  const isCreate = !existing;

  // Upsert the component
  const component = await repository.upsert(orgId, body);

  // Return 201 if created, 200 if updated
  const status = isCreate ? 201 : 200;

  return c.json(
    {
      success: true as const,
      data: formatComponent(component),
    },
    status
  );
});

// -----------------------------------------------------------------------------
// PATCH /:id - Update component
// -----------------------------------------------------------------------------

componentsRouter.openapi(updateComponentRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepository;
  const component = await repository.update(orgId, id, body);

  if (!component) {
    throw NotFound('Component', id);
  }

  return c.json(
    {
      success: true as const,
      data: formatComponent(component),
    },
    200
  );
});

// -----------------------------------------------------------------------------
// DELETE /:id - Delete component
// -----------------------------------------------------------------------------

componentsRouter.openapi(deleteComponentRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const repository = c.var.componentRepository;
  const deleted = await repository.delete(orgId, id);

  if (!deleted) {
    throw NotFound('Component', id);
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
