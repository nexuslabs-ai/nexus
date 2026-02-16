/**
 * MCP Middleware
 *
 * Shared middleware for MCP router to handle common concerns:
 * - CORS headers (must write to Node.js response)
 * - Auth validation (tenant API keys only)
 * - Session retrieval and ownership validation
 *
 * Middleware Order:
 * 1. mcpCorsMiddleware - Sets CORS headers on nodeRes (transport bypasses Hono)
 * 2. mcpAuthMiddleware - Validates tenant API key
 * 3. mcpSessionMiddleware - Retrieves and validates session (GET/DELETE only)
 */

import type { MiddlewareHandler } from 'hono';

import { TokenKind } from '../auth/auth-types.js';
import { detectTokenKind, validateApiKey } from '../auth/auth-validator.js';
import { hasScope, isTenant } from '../auth/scope-checker.js';
import { getConfig, type ServerConfig } from '../config.js';
import {
  buildAllowedHeaders,
  type CorsConfig,
  isOriginAllowedForMcp,
} from '../cors/index.js';
import type { AppEnv } from '../types.js';

import { jsonRpcError } from './utils.js';

/**
 * Convert ServerConfig to CorsConfig for CORS validation.
 * Used in CORS middleware to validate origins and build headers.
 */
function toCorsConfig(config: ServerConfig): CorsConfig {
  return {
    allowedOrigins: config.corsAllowedOrigins,
    mcpMode: config.mcpCorsMode,
    environment: config.environment,
  };
}

// =============================================================================
// CORS Middleware
// =============================================================================

/**
 * CORS middleware for MCP routes.
 *
 * CRITICAL: Must write headers to c.env.outgoing (Node.js ServerResponse)
 * because StreamableHTTPServerTransport bypasses Hono's Response object
 * and writes directly to the Node.js response stream.
 *
 * If we set headers on Hono's Response, they won't appear in the actual
 * HTTP response sent to the client.
 *
 * Headers set:
 * - Access-Control-Allow-Origin (reflected origin if allowed)
 * - Access-Control-Allow-Headers (configurable per environment)
 * - Access-Control-Expose-Headers (mcp-session-id, mcp-protocol-version)
 *
 * Security:
 * - NO Access-Control-Allow-Credentials with dynamic origin reflection
 * - Origin validation via isOriginAllowedForMcp()
 */
export const mcpCorsMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const origin = c.req.header('origin');
  const config = getConfig();
  const corsConfig = toCorsConfig(config);

  // Only add CORS headers if origin is allowed by configuration
  if (origin && isOriginAllowedForMcp(origin, corsConfig)) {
    const nodeRes = c.env.outgoing;
    nodeRes.setHeader('Access-Control-Allow-Origin', origin);
    // CRITICAL: NO Access-Control-Allow-Credentials with dynamic origin reflection
    nodeRes.setHeader(
      'Access-Control-Allow-Headers',
      buildAllowedHeaders(config.environment)
    );
    nodeRes.setHeader(
      'Access-Control-Expose-Headers',
      'mcp-session-id, mcp-protocol-version'
    );
  }

  await next();
};

// =============================================================================
// Auth Middleware
// =============================================================================

/**
 * Auth middleware for MCP routes.
 *
 * Validates tenant API keys and stores authenticated context in c.var.mcpAuth.
 *
 * Auth flow:
 * 1. Extract Authorization header from request
 * 2. Parse Bearer token (strip "Bearer " prefix)
 * 3. Detect token kind (tenant vs platform)
 * 4. Reject platform tokens (MCP requires tenant API keys)
 * 5. Validate tenant API key via validateApiKey()
 * 6. Check for component:read scope (required for all MCP tools)
 * 7. Store TenantAuthContext in c.var.mcpAuth
 *
 * On success:
 * - Sets c.var.mcpAuth with TenantAuthContext
 * - Calls next()
 *
 * On failure:
 * - Returns 401/403 with JSON-RPC error
 * - Does not call next()
 */
export const mcpAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const config = getConfig();
  const apiKeyRepo = c.var.apiKeyRepo;

  // Step 1: Extract Authorization header
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      jsonRpcError(-32001, 'Missing or invalid Authorization header'),
      401
    );
  }

  // Step 2: Parse Bearer token
  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Step 3: Detect token kind
  const tokenKind = detectTokenKind(token);

  // Step 4: Reject platform tokens (MCP requires tenant API keys)
  if (tokenKind === TokenKind.PlatformToken) {
    return c.json(
      jsonRpcError(-32001, 'MCP requires tenant API key (ce_ prefix)'),
      401
    );
  }

  // Step 5: Validate as tenant API key
  if (tokenKind !== TokenKind.TenantApiKey) {
    return c.json(jsonRpcError(-32001, 'Invalid token format'), 401);
  }

  const validationResult = await validateApiKey(
    token,
    config.apiKeyHashSecret,
    apiKeyRepo
  );

  if (!validationResult.success) {
    return c.json(jsonRpcError(-32001, validationResult.error), 401);
  }

  // Step 6: Type guard - ensure we have tenant context (should always be true at this point)
  if (!isTenant(validationResult.context)) {
    return c.json(
      jsonRpcError(-32001, 'Invalid auth context: expected tenant'),
      401
    );
  }

  // Step 7: Check for component:read scope (required for all MCP tools)
  if (!hasScope(validationResult.context, 'component:read')) {
    return c.json(
      jsonRpcError(-32001, "Missing required scope: 'component:read'"),
      403
    );
  }

  // Step 8: Store tenant auth context
  c.set('mcpAuth', validationResult.context);

  await next();
};

// =============================================================================
// Session Middleware
// =============================================================================

/**
 * Session middleware for MCP routes (GET/DELETE only).
 *
 * Retrieves session from SessionStore and validates ownership.
 * Requires mcp-session-id header.
 *
 * On success:
 * - Sets c.var.mcpSession with { session, sessionId }
 * - Calls next()
 *
 * On failure:
 * - Returns 400/404/403 with JSON-RPC error
 * - Does not call next()
 */
export const mcpSessionMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next
) => {
  // Extract session ID from header
  const sessionId = c.req.header('mcp-session-id');

  if (!sessionId) {
    return c.json(jsonRpcError(-32000, 'Missing mcp-session-id header'), 400);
  }

  // Retrieve session from store
  const sessionStore = c.var.sessionStore;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return c.json(jsonRpcError(-32000, 'Session not found or expired'), 404);
  }

  // Validate session ownership (requires mcpAuthMiddleware to run first)
  const auth = c.var.mcpAuth;
  if (!auth || session.orgId !== auth.orgId) {
    return c.json(
      jsonRpcError(
        -32001,
        'Unauthorized: Session belongs to different organization'
      ),
      403
    );
  }

  // Store session in context for handlers
  c.set('mcpSession', { session, sessionId });

  await next();
};
