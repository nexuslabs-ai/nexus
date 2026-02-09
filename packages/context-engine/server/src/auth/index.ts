/**
 * Auth Module
 *
 * Transport-agnostic authentication and authorization for Context Engine.
 * Zero Hono dependency — consumed by both HTTP API and MCP Streamable HTTP.
 *
 * Exports:
 * - Types: AuthScope, PlatformScope, TokenKind, AuthContext, TenantAuthContext, PlatformAuthContext, AuthResult
 * - Constants: AUTH_SCOPES, DEV_API_KEY_ID, AuthKind
 * - Token detection: detectTokenKind
 * - Key management: generateApiKey, hashApiKey, validateApiKey
 * - Platform validation: validatePlatformToken
 * - Authorization: hasScope, hasAllScopes
 */

export * from './auth-types.js';
export * from './auth-validator.js';
export * from './scope-checker.js';
