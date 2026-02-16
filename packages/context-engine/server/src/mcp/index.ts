/**
 * MCP Module
 *
 * Exports all MCP functionality:
 * - Router: HTTP transport layer (Hono router)
 * - Middleware: Shared CORS, auth, session validation
 * - Server factory: Creates configured MCP server
 * - Auth types: Re-exported auth types for MCP
 * - Types: Context and handler signatures
 */

// Router (HTTP transport layer)
export { mcpRouter } from './router.js';

// Middleware
export {
  mcpAuthMiddleware,
  mcpCorsMiddleware,
  mcpSessionMiddleware,
} from './middleware.js';

// Server factory
export { createMcpServer } from './server.js';

// Auth types (re-exported for convenience)
export {
  type AuthResult,
  detectTokenKind,
  hasScope,
  type PlatformAuthContext,
  type TenantAuthContext,
  TokenKind,
  validateApiKey,
} from './auth.js';

// Session store
export { type SessionEntry, SessionStore } from './sessions.js';

// Types
export type { McpContext, ResourceHandler, ToolHandler } from './types.js';
