/**
 * MCP Auth Types and Re-exports
 *
 * Re-exports auth types and functions from the shared auth module for use in MCP.
 * MCP auth logic is now directly in mcpAuthMiddleware (see mcp/middleware.ts).
 *
 * This module exists to provide a convenient import path for MCP-related auth types.
 */

// Re-export auth types
export type {
  PlatformAuthContext,
  TenantAuthContext,
} from '../auth/auth-types.js';
export { type AuthResult, TokenKind } from '../auth/auth-types.js';
export { detectTokenKind, validateApiKey } from '../auth/auth-validator.js';
export { hasScope } from '../auth/scope-checker.js';
