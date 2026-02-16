/**
 * CORS Module
 *
 * Transport-agnostic CORS validation for Context Engine.
 * Zero Hono dependency — consumed by both HTTP middleware and MCP router.
 *
 * Exports:
 * - Types: CorsConfig, McpCorsMode, CORS_HEADERS
 * - Config parsing: parseAllowedOrigins
 * - Validation: isOriginAllowed, isOriginAllowedForMcp
 * - Helpers: buildAllowedHeaders
 */

export * from './cors-config.js';
export * from './cors-types.js';
export * from './cors-validator.js';
