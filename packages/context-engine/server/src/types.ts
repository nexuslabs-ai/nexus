/**
 * App Types
 *
 * Shared type definitions for the HTTP server application.
 * Defines context variables for dependency injection via middleware.
 */

import type {
  ComponentRepository,
  EmbeddingRepository,
  OrganizationRepository,
} from '@context-engine/db';

// =============================================================================
// Context Variable Types
// =============================================================================

/**
 * Repository variables injected via middleware.
 *
 * These are available on `c.var` in route handlers after the repositories
 * middleware has run.
 */
export interface RepositoryVariables {
  /**
   * Repository for organization CRUD operations.
   * Always available for `/api/v1/*` routes.
   */
  organizationRepo: OrganizationRepository;

  /**
   * Repository for component CRUD operations.
   * Always available for `/api/v1/*` routes.
   */
  componentRepo: ComponentRepository;

  /**
   * Repository for embedding operations (indexing and search).
   * Only available when VOYAGE_API_KEY is configured.
   * Check availability with `c.var.embeddingRepo !== undefined`.
   */
  embeddingRepo: EmbeddingRepository | undefined;
}

// =============================================================================
// App Environment Types
// =============================================================================

/**
 * Environment type for the app.
 *
 * Extends Hono's Env type to include our custom context variables.
 * Use this when creating middleware or handlers that need access to repositories.
 */
export interface AppEnv {
  Variables: RepositoryVariables;
}
