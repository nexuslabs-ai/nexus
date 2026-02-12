/**
 * CORS Middleware
 *
 * Bridges the transport-agnostic CORS core to Hono's HTTP layer.
 * Provides pre-configured CORS middleware for the REST API.
 */

import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

import { McpCorsMode } from '../config.js';
import {
  buildAllowedHeaders,
  type CorsConfig,
  isOriginAllowed,
  isOriginAllowedForMcp,
} from '../cors/index.js';
import type { AppEnv } from '../types.js';

/**
 * Create CORS middleware configured for REST API and MCP endpoints.
 *
 * Routes:
 * - `/mcp` - Uses MCP-specific validation (respects mcpCorsMode)
 * - Other routes - Uses standard REST API validation
 *
 * Validates origins against the allowlist and sets appropriate headers.
 * No credentials header with dynamic origins (security best practice).
 *
 * @param config - CORS configuration
 * @returns Hono CORS middleware
 */
export function createCorsMiddleware(
  config: CorsConfig
): MiddlewareHandler<AppEnv> {
  return cors({
    origin: (origin, c) => {
      // No origin header = same-origin or non-browser request (allow)
      if (!origin) return null;

      // MCP endpoint uses special validation logic
      if (c.req.path.startsWith('/mcp')) {
        // MCP DISABLED mode = no CORS headers (server-to-server only)
        if (config.mcpMode === McpCorsMode.Disabled) {
          return null;
        }

        // MCP-specific origin validation
        if (isOriginAllowedForMcp(origin, config)) {
          return origin;
        }

        // Reject unknown origins for MCP
        return null;
      }

      // Standard REST API validation for other routes
      if (isOriginAllowed(origin, config.allowedOrigins)) {
        return origin;
      }

      // Reject unknown origins
      return null;
    },
    allowHeaders: buildAllowedHeaders(config.environment).split(', '),
    exposeHeaders: ['mcp-session-id', 'mcp-protocol-version'],
    credentials: false, // CRITICAL: Never true with dynamic origins
  });
}
