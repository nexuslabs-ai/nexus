/**
 * MCP Router
 *
 * HTTP routing layer for the MCP gateway.
 * Handles JSON-RPC requests over Streamable HTTP (stateless mode).
 *
 * This router is mounted at `/mcp` in the main app and provides:
 * - POST /mcp — Handle MCP JSON-RPC requests
 * - GET /mcp — Method not allowed (405)
 * - DELETE /mcp — Method not allowed (405)
 */

import { Hono } from 'hono';

import { getConfig } from '../config.js';
import type { AppEnv } from '../types.js';

export const mcpRouter = new Hono<AppEnv>();

/**
 * POST /mcp — Handle MCP JSON-RPC requests (stateless mode)
 *
 * Flow:
 * 1. Validate auth (tenant API key only)
 * 2. Build MCP context (orgId + repositories)
 * 3. Create per-request MCP server
 * 4. Create stateless transport
 * 5. Bridge to Node.js request/response
 * 6. Return RESPONSE_ALREADY_SENT
 */
mcpRouter.post('/', async (c) => {
  // Dynamic imports for code-splitting when MCP not used
  const { StreamableHTTPServerTransport } =
    await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const { RESPONSE_ALREADY_SENT } =
    await import('@hono/node-server/utils/response');
  const { createMcpServer } = await import('./server.js');
  const { extractMcpAuth } = await import('./auth.js');

  const config = getConfig();

  // 1. Auth -- validate before MCP processing
  const apiKeyRepo = c.var.apiKeyRepo;
  const authResult = await extractMcpAuth(c.req.raw, config, apiKeyRepo);

  if (!authResult.success) {
    return c.json(
      {
        jsonrpc: '2.0',
        error: { code: -32001, message: authResult.error },
        id: null,
      },
      401
    );
  }

  // 2. Ensure tenant context (platform tokens rejected)
  // extractMcpAuth already rejects platform tokens, but double-check for type safety
  if (authResult.context.kind !== 'tenant') {
    return c.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'MCP requires tenant API key',
        },
        id: null,
      },
      401
    );
  }

  // 3. Build MCP context from auth + repositories
  const ctx = {
    orgId: authResult.context.orgId,
    componentRepo: c.var.componentRepo,
    embeddingRepo: c.var.embeddingRepo,
    apiKeyRepo: c.var.apiKeyRepo,
  };

  // 4. Create per-request MCP server + stateless transport
  const server = createMcpServer(ctx);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true,
  });
  await server.connect(transport);

  // 5. Bridge to Node.js transport
  const nodeReq = c.env.incoming;
  const nodeRes = c.env.outgoing;
  // Body passed explicitly because Hono consumes the request stream
  await transport.handleRequest(nodeReq, nodeRes, await c.req.json());

  // 6. Transport already wrote the response to nodeRes
  return RESPONSE_ALREADY_SENT;
});

/**
 * GET /mcp — Method not allowed
 *
 * Returns 405 with JSON-RPC error.
 * Use POST for stateless MCP requests.
 */
mcpRouter.get('/', (c) => {
  return c.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed. Use POST for stateless MCP.',
      },
      id: null,
    },
    405
  );
});

/**
 * DELETE /mcp — Method not allowed
 *
 * Returns 405 with JSON-RPC error.
 * Sessions not supported in stateless mode.
 */
mcpRouter.delete('/', (c) => {
  return c.json(
    {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message:
          'Method not allowed. Sessions not supported in stateless mode.',
      },
      id: null,
    },
    405
  );
});
