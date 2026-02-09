/**
 * Components Routes
 *
 * CRUD endpoints for component management.
 * All routes are nested under `/api/v1/organizations/:orgId/components`.
 */

import type { Component, NewComponent } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { notFound, serviceUnavailable, validationError } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import { ErrorSchema } from '../schemas/common.js';
import {
  ComponentIdParamSchema,
  ComponentListSchema,
  ComponentResponseSchema,
  ComponentSlugParamSchema,
  type CreateComponent,
  CreateComponentSchema,
  DeleteComponentResponseSchema,
  IndexComponentResponseSchema,
  ListComponentsQuerySchema,
  type UpdateComponent,
  UpdateComponentSchema,
} from '../schemas/components.js';
import { OrgIdPathParamSchema } from '../schemas/organizations.js';
import type { AppEnv } from '../types.js';
import { formatDates, successResponse } from '../utils/index.js';

// =============================================================================
// Body → Repository Mappers
// =============================================================================

/**
 * Map validated create body to repository input.
 *
 * Explicit field mapping ensures compile-time safety: if the Zod schema
 * or DB types diverge, TypeScript will error on the specific field.
 * JSONB fields use `as` casts because the API intentionally accepts
 * arbitrary JSON that the pipeline will later validate.
 */
function toCreateData(body: CreateComponent): Omit<NewComponent, 'orgId'> {
  return {
    slug: body.slug,
    name: body.name,
    framework: body.framework,
    version: body.version,
    visibility: body.visibility,
    sourceHash: body.sourceHash,
    extraction: body.extraction as NewComponent['extraction'],
    generation: body.generation as NewComponent['generation'],
    generationProvider: body.generationProvider,
    generationModel: body.generationModel,
    manifest: body.manifest as NewComponent['manifest'],
  };
}

/**
 * Map validated update body to repository input.
 *
 * Drizzle ignores `undefined` values in `.set()`, so we can map all
 * fields directly — only fields present in the request body will be
 * included in the SQL UPDATE.
 */
function toUpdateData(
  body: UpdateComponent
): Partial<Omit<NewComponent, 'id' | 'orgId'>> {
  return {
    name: body.name,
    version: body.version,
    visibility: body.visibility,
    sourceHash: body.sourceHash,
    extraction: body.extraction as NewComponent['extraction'],
    generation: body.generation as NewComponent['generation'],
    generationProvider: body.generationProvider,
    generationModel: body.generationModel,
    manifest: body.manifest as NewComponent['manifest'],
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format a component summary for list responses.
 * Excludes large JSONB fields for performance.
 * Uses formatDates for date conversion to avoid duplicating .toISOString() logic.
 */
function formatComponentSummary(component: Component) {
  const { createdAt, updatedAt } = formatDates(component);
  return {
    id: component.id,
    slug: component.slug,
    name: component.name,
    framework: component.framework,
    version: component.version,
    visibility: component.visibility,
    embeddingStatus: component.embeddingStatus,
    createdAt,
    updatedAt,
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:read')],
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:read')],
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:read')],
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:write')],
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:write')],
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
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:delete')],
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

/**
 * POST /:id/index - Index component for search
 */
const indexComponentRoute = createRoute({
  method: 'post',
  path: '/{id}/index',
  tags: ['Components'],
  summary: 'Index component for search',
  description:
    'Generate embeddings for a component to enable semantic search. Requires VOYAGE_API_KEY to be configured.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: ComponentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: IndexComponentResponseSchema,
        },
      },
      description: 'Component indexed successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component has no manifest to index',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
    },
    503: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description:
        'Embedding service unavailable (VOYAGE_API_KEY not configured)',
    },
  },
});

// =============================================================================
// Router
// =============================================================================

/**
 * Components router.
 * Mount at `/api/v1/organizations/:orgId/components`.
 *
 * Requires repositories middleware to be applied at app level.
 * Access component repository via `c.var.componentRepo`.
 */
export const componentsRouter = new OpenAPIHono<AppEnv>();

// -----------------------------------------------------------------------------
// GET / - List components
// -----------------------------------------------------------------------------

componentsRouter.openapi(listComponentsRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const query = c.req.valid('query');
  const repository = c.var.componentRepo;

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
    successResponse({
      components: result.components.map(formatComponentSummary),
      total: result.total,
      limit: query.limit,
      offset: query.offset,
    }),
    200
  );
});

// -----------------------------------------------------------------------------
// GET /:id - Get component by ID
// -----------------------------------------------------------------------------

componentsRouter.openapi(getComponentByIdRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const repository = c.var.componentRepo;
  const component = await repository.findById(orgId, id);

  if (!component) {
    throw notFound('Component', id);
  }

  return c.json(successResponse(formatDates(component)), 200);
});

// -----------------------------------------------------------------------------
// GET /slug/:slug - Get component by slug
// -----------------------------------------------------------------------------

componentsRouter.openapi(getComponentBySlugRoute, async (c) => {
  const { orgId, slug } = c.req.valid('param');
  const repository = c.var.componentRepo;
  const component = await repository.findBySlug(orgId, slug);

  if (!component) {
    throw notFound('Component', slug);
  }

  return c.json(successResponse(formatDates(component)), 200);
});

// -----------------------------------------------------------------------------
// POST / - Create or upsert component
// -----------------------------------------------------------------------------

componentsRouter.openapi(createComponentRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepo;

  // Check if component already exists by slug
  const existing = await repository.findBySlug(orgId, body.slug);
  const isCreate = !existing;

  // Upsert the component
  const component = await repository.upsert(orgId, toCreateData(body));

  // Return 201 if created, 200 if updated
  const status = isCreate ? 201 : 200;

  return c.json(successResponse(formatDates(component)), status);
});

// -----------------------------------------------------------------------------
// PATCH /:id - Update component
// -----------------------------------------------------------------------------

componentsRouter.openapi(updateComponentRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepo;

  const component = await repository.update(orgId, id, toUpdateData(body));

  if (!component) {
    throw notFound('Component', id);
  }

  return c.json(successResponse(formatDates(component)), 200);
});

// -----------------------------------------------------------------------------
// DELETE /:id - Delete component
// -----------------------------------------------------------------------------

componentsRouter.openapi(deleteComponentRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const repository = c.var.componentRepo;
  const deleted = await repository.delete(orgId, id);

  if (!deleted) {
    throw notFound('Component', id);
  }

  return c.json(successResponse({ deleted: true }), 200);
});

// -----------------------------------------------------------------------------
// POST /:id/index - Index component for search
// -----------------------------------------------------------------------------

componentsRouter.openapi(indexComponentRoute, async (c) => {
  const { orgId, id } = c.req.valid('param');
  const componentRepo = c.var.componentRepo;
  const embeddingRepo = c.var.embeddingRepo;

  // Check if embedding service is available
  if (!embeddingRepo) {
    throw serviceUnavailable(
      'Embedding service unavailable',
      'VOYAGE_API_KEY not configured'
    );
  }

  // Get component
  const component = await componentRepo.findById(orgId, id);
  if (!component) {
    throw notFound('Component', id);
  }

  // Check if component has manifest
  if (!component.manifest) {
    throw validationError(
      'Component has no manifest',
      'Generate manifest before indexing'
    );
  }

  // Index the component
  const result = await embeddingRepo.index(orgId, id, component.manifest);

  if (!result.success) {
    throw serviceUnavailable('Embedding generation failed', result.error);
  }

  return c.json(
    successResponse({
      componentId: id,
      chunksCreated: result.chunksCreated,
      embeddingStatus: 'indexed',
    }),
    200
  );
});
