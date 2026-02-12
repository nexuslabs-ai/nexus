/**
 * MCP Server Factory
 *
 * Creates and configures an MCP server instance with all tools and resources.
 * This is the central module that wires up the MCP protocol for Context Engine.
 *
 * Architecture:
 * - Per-request server creation (stateless mode)
 * - Tools and resources bound to McpContext (orgId + repositories)
 * - Zod schemas for type-safe tool input validation
 * - No Hono dependencies (transport-agnostic)
 *
 * The server is created fresh for each request and garbage-collected after response.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { SERVER_VERSION } from '../constants.js';

import {
  COMPONENT_CATALOG_DESCRIPTION,
  COMPONENT_CATALOG_NAME,
  COMPONENT_CATALOG_URI,
  handleComponentCatalog,
  handleIndexStats,
  INDEX_STATS_DESCRIPTION,
  INDEX_STATS_NAME,
  INDEX_STATS_URI,
} from './resources/index.js';
import {
  getComponentSchema,
  getIndexStatsSchema,
  handleGetComponent,
  handleGetIndexStats,
  handleSearchComponents,
  searchComponentsSchema,
} from './tools/index.js';
import type { McpContext } from './types.js';

/**
 * Create a configured MCP server instance.
 *
 * The server is bound to a specific organization via McpContext.
 * All tools and resources are registered with handlers that receive this context.
 *
 * This function is called per-request in stateless mode:
 * - Request arrives → auth validates → McpContext created → server created → response sent → GC
 *
 * @param ctx - MCP context with authenticated orgId and repository instances
 * @returns Configured McpServer instance (not yet connected to transport)
 *
 * @example
 * ```ts
 * const ctx = { orgId, componentRepo, embeddingRepo, apiKeyRepo };
 * const server = createMcpServer(ctx);
 * const transport = new StreamableHTTPServerTransport({ ... });
 * await server.connect(transport);
 * await transport.handleRequest(req, res, body);
 * ```
 */
export function createMcpServer(ctx: McpContext): McpServer {
  // Create MCP server instance
  const server = new McpServer(
    {
      name: 'context-engine',
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // =========================================================================
  // Register Tools (v1.x API)
  // =========================================================================

  /**
   * Tool: search_components
   *
   * Semantic search for components using natural language queries.
   * Requires embedding repository (VOYAGE_API_KEY configured).
   */
  server.registerTool(
    'search_components',
    {
      description:
        'Search for components by natural language query. Use when an AI needs to find relevant components for a task.',
      inputSchema: searchComponentsSchema,
    },
    async (args) => handleSearchComponents(args, ctx)
  );

  /**
   * Tool: get_component
   *
   * Retrieve full component details by identifier (slug, name, or ID).
   */
  server.registerTool(
    'get_component',
    {
      description:
        'Retrieve full component details by identifier (slug, name, or ID). Returns complete manifest with props, examples, and usage guidance.',
      inputSchema: getComponentSchema,
    },
    async (args) => handleGetComponent(args, ctx)
  );

  /**
   * Tool: get_index_stats
   *
   * Get component indexing statistics for the organization.
   */
  server.registerTool(
    'get_index_stats',
    {
      description:
        'Get component indexing statistics for the organization. Shows how many components are indexed, pending, failed, etc.',
      inputSchema: getIndexStatsSchema,
    },
    async (args) => handleGetIndexStats(args, ctx)
  );

  // =========================================================================
  // Register Resources (v1.x API)
  // =========================================================================

  /**
   * Resource: component-catalog
   *
   * URI: context://components
   * Returns summary list of all components in the organization.
   */
  server.registerResource(
    COMPONENT_CATALOG_NAME,
    COMPONENT_CATALOG_URI,
    {
      description: COMPONENT_CATALOG_DESCRIPTION,
      mimeType: 'application/json',
    },
    async () => handleComponentCatalog(ctx)
  );

  /**
   * Resource: index-stats
   *
   * URI: context://stats
   * Returns component indexing statistics.
   */
  server.registerResource(
    INDEX_STATS_NAME,
    INDEX_STATS_URI,
    {
      description: INDEX_STATS_DESCRIPTION,
      mimeType: 'application/json',
    },
    async () => handleIndexStats(ctx)
  );

  return server;
}
