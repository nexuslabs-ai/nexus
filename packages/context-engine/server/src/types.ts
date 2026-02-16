/**
 * App Types
 *
 * Shared type definitions for the HTTP server application.
 * Defines context variables for dependency injection via middleware.
 */

import type {
  ApiKeyRepository,
  ComponentRepository,
  EmbeddingRepository,
  OrganizationRepository,
} from '@context-engine/db';
import type { HttpBindings } from '@hono/node-server';
import type { PinoLogger } from 'hono-pino';

import type { AuthContext, TenantAuthContext } from './auth/index.js';
import type { SessionEntry, SessionStore } from './mcp/sessions.js';

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

  /**
   * Repository for API key CRUD and lookup operations.
   * Always available for `/api/v1/*` routes.
   */
  apiKeyRepo: ApiKeyRepository;

  /**
   * MCP session store for stateful session management.
   * Always available (always-on architecture).
   * Manages session lifecycle, TTL cleanup, and per-org limits.
   */
  sessionStore: SessionStore;
}

// =============================================================================
// Auth Variable Types
// =============================================================================

/**
 * Auth variables injected via auth middleware.
 *
 * Available on `c.var` in route handlers after the auth middleware has run.
 */
export interface AuthVariables {
  /**
   * Authenticated context for the current request.
   *
   * Discriminated union — narrow on `auth.kind`:
   * - `'tenant'`   — contains `orgId`, `apiKeyId`, and tenant scopes
   * - `'platform'` — contains platform-level scopes, no `orgId`
   */
  auth: AuthContext;
}

// =============================================================================
// Logger Variable Types
// =============================================================================

/**
 * Logger variables injected via hono-pino middleware.
 */
export interface LoggerVariables {
  /**
   * Request-scoped structured logger.
   * Available on all routes after the pinoLogger middleware.
   */
  logger: PinoLogger;
}

// =============================================================================
// MCP Variable Types
// =============================================================================

/**
 * MCP-specific variables injected via MCP middleware.
 *
 * Available on `c.var` in MCP route handlers after the MCP middleware has run.
 */
export interface McpVariables {
  /**
   * Authenticated MCP context (tenant only).
   * Set by mcpAuthMiddleware after validating tenant API key.
   */
  mcpAuth?: TenantAuthContext;

  /**
   * Retrieved MCP session with validated ownership.
   * Set by mcpSessionMiddleware after validating session ID and ownership.
   */
  mcpSession?: {
    session: SessionEntry;
    sessionId: string;
  };
}

// =============================================================================
// App Environment Types
// =============================================================================

/**
 * Environment type for the app.
 *
 * Extends Hono's Env type to include our custom context variables.
 * Use this when creating middleware or handlers that need access to repositories
 * and authenticated context.
 *
 * HttpBindings from @hono/node-server provides access to Node.js IncomingMessage
 * and ServerResponse objects via `c.env.incoming` and `c.env.outgoing`.
 * This is required for MCP integration (v1.x SDK uses Node.js types).
 */
export interface AppEnv {
  Variables: RepositoryVariables &
    AuthVariables &
    LoggerVariables &
    McpVariables;
  Bindings: HttpBindings;
}
