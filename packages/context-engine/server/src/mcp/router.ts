/**
 * MCP Router
 *
 * HTTP routing layer for the MCP gateway.
 * Handles JSON-RPC requests over Streamable HTTP with stateful session support.
 *
 * This router is mounted at `/mcp` in the main app and provides:
 * - POST /mcp — Handle MCP JSON-RPC requests (stateful sessions via SSE)
 * - GET /mcp — Open SSE stream for server-to-client notifications
 * - DELETE /mcp — Terminate session and clean up
 *
 * Middleware Order (CRITICAL):
 * 1. mcpCorsMiddleware - Sets CORS headers on nodeRes (transport bypasses Hono)
 * 2. mcpAuthMiddleware - Validates tenant API key
 * 3. mcpSessionMiddleware - Retrieves and validates session (GET/DELETE only)
 *
 * Session Architecture (Always-On):
 * - POST handler creates/reuses sessions with optional session ID
 * - GET handler opens SSE stream for existing session
 * - DELETE handler terminates session and cleans up resources
 */

import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';

import type { AppEnv } from '../types.js';

import {
  mcpAuthMiddleware,
  mcpCorsMiddleware,
  mcpSessionMiddleware,
} from './middleware.js';
import { jsonRpcError } from './utils.js';

export const mcpRouter = new Hono<AppEnv>();

/**
 * NOTE: OPTIONS /mcp is handled by global CORS middleware
 *
 * The middleware at src/middleware/cors.ts handles all OPTIONS requests,
 * including MCP-specific validation via isOriginAllowedForMcp().
 * No need for a separate OPTIONS handler here.
 */

// =============================================================================
// Apply Middleware (CRITICAL ORDER)
// =============================================================================

/**
 * CRITICAL MIDDLEWARE ORDER:
 *
 * 1. mcpCorsMiddleware - MUST run first to set CORS headers on nodeRes
 *    before transport writes response
 *
 * 2. mcpAuthMiddleware - Validates tenant API key and stores mcpAuth in context
 *    Required for all MCP routes
 */
mcpRouter.use('*', mcpCorsMiddleware);
mcpRouter.use('*', mcpAuthMiddleware);

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * POST /mcp — Handle MCP JSON-RPC requests (stateful sessions via SSE)
 *
 * Flow:
 * 1. Check for existing session (via mcp-session-id header)
 * 2. Reuse existing or create new session
 * 3. Bridge to Node.js transport
 * 4. Store new session AFTER handleRequest (transport generates ID)
 * 5. Return RESPONSE_ALREADY_SENT
 *
 * Middleware applied: CORS, Auth
 */
mcpRouter.post('/', async (c) => {
  // Dynamic imports for code-splitting when MCP not used
  const { StreamableHTTPServerTransport } =
    await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const { RESPONSE_ALREADY_SENT } =
    await import('@hono/node-server/utils/response');
  const { createMcpServer } = await import('./server.js');

  // Get auth context from middleware
  const auth = c.var.mcpAuth;

  // Defensive check: mcpAuthMiddleware should guarantee this exists
  if (!auth) {
    return c.json(
      jsonRpcError(-32001, 'Internal error: Missing auth context'),
      500
    );
  }

  // Build MCP context from auth + repositories
  const ctx = {
    orgId: auth.orgId,
    componentRepo: c.var.componentRepo,
    embeddingRepo: c.var.embeddingRepo,
    apiKeyRepo: c.var.apiKeyRepo,
    scopes: auth.scopes,
  };

  // Check for existing session (via mcp-session-id header)
  const sessionStore = c.var.sessionStore;
  const sessionId = c.req.header('mcp-session-id');
  const session = sessionId ? sessionStore.get(sessionId) : undefined;

  // Create server + transport (reuse existing or create new)
  let server;
  let transport;
  let isNewSession = false;

  if (session) {
    // Reuse existing session
    server = session.server;
    transport = session.transport;
  } else {
    // Create new session
    server = createMcpServer(ctx);
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(), // Enable stateful sessions
      enableJsonResponse: false, // Use SSE streaming instead of JSON response mode
    });
    await server.connect(transport);
    isNewSession = true;
  }

  // Bridge to Node.js transport
  const nodeReq = c.env.incoming;
  const nodeRes = c.env.outgoing;

  // Parse request body with error handling for invalid JSON
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    // Return JSON-RPC parse error (RFC 2.0 spec)
    return c.json(jsonRpcError(-32700, 'Parse error: Invalid JSON'), 400);
  }

  // Body passed explicitly because Hono consumes the request stream
  await transport.handleRequest(nodeReq, nodeRes, body);

  // Store new session AFTER handleRequest (transport has generated session ID)
  if (isNewSession && transport.sessionId) {
    sessionStore.set(transport.sessionId, {
      transport,
      server,
      orgId: auth.orgId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
  }

  // Transport already wrote the response to nodeRes
  return RESPONSE_ALREADY_SENT;
});

/**
 * GET /mcp — Open SSE stream for server-to-client notifications
 *
 * Flow:
 * 1. Get session from middleware (mcpSessionMiddleware)
 * 2. Open SSE stream via transport
 * 3. Return RESPONSE_ALREADY_SENT
 *
 * Middleware applied: CORS, Auth, Session
 */
mcpRouter.get('/', mcpSessionMiddleware, async (c) => {
  const { RESPONSE_ALREADY_SENT } =
    await import('@hono/node-server/utils/response');

  // Get session from middleware (validated ownership)
  const { session } = c.var.mcpSession!;

  // Open SSE stream
  const nodeReq = c.env.incoming;
  const nodeRes = c.env.outgoing;

  await session.transport.handleRequest(nodeReq, nodeRes, undefined);

  return RESPONSE_ALREADY_SENT;
});

/**
 * DELETE /mcp — Terminate session and clean up
 *
 * Flow:
 * 1. Get session from middleware (mcpSessionMiddleware)
 * 2. Delete session from SessionStore (calls transport.close())
 * 3. Return success response
 *
 * Middleware applied: CORS, Auth, Session
 */
mcpRouter.delete('/', mcpSessionMiddleware, async (c) => {
  // Get session from middleware
  const { sessionId } = c.var.mcpSession!;

  // Delete session (calls transport.close())
  const sessionStore = c.var.sessionStore;
  sessionStore.delete(sessionId);

  return c.json(
    {
      jsonrpc: '2.0',
      result: { deleted: true },
      id: null,
    },
    200
  );
});
