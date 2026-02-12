/**
 * MCP Module
 *
 * Exports all MCP functionality:
 * - Router: HTTP transport layer (Hono router)
 * - Server factory: Creates configured MCP server
 * - Auth bridge: Validates tenant API keys
 * - Types: Context and handler signatures
 */

// Router (HTTP transport layer)
export { mcpRouter } from './router.js';

// Server factory
export { createMcpServer } from './server.js';

// Auth bridge
export { extractMcpAuth } from './auth.js';

// Session store
export { type SessionEntry, SessionStore } from './sessions.js';

// Types
export type { McpContext, ResourceHandler, ToolHandler } from './types.js';
