/**
 * Auth Module
 *
 * Transport-agnostic authentication and authorization for Context Engine.
 * Zero Hono dependency — consumed by both HTTP API and MCP Streamable HTTP.
 *
 * Exports:
 * - Types: AuthScope, AuthContext, AuthResult
 * - Constants: AUTH_SCOPES
 * - Key management: generateApiKey, hashApiKey, validateApiKey
 * - Authorization: hasScope, hasAllScopes
 */

export * from './auth-types.js';
export * from './auth-validator.js';
export * from './scope-checker.js';
