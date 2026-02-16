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

import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';

import { SERVER_VERSION } from '../constants.js';

import {
  COMPONENT_CATALOG_DESCRIPTION,
  COMPONENT_CATALOG_NAME,
  COMPONENT_CATALOG_URI,
  COMPONENT_DETAIL_DESCRIPTION,
  COMPONENT_DETAIL_NAME,
  COMPONENT_DETAIL_URI_PATTERN,
  COMPONENT_EXAMPLES_DESCRIPTION,
  COMPONENT_EXAMPLES_NAME,
  COMPONENT_EXAMPLES_URI_PATTERN,
  COMPONENT_GUIDANCE_DESCRIPTION,
  COMPONENT_GUIDANCE_NAME,
  COMPONENT_GUIDANCE_URI_PATTERN,
  COMPONENT_PROPS_DESCRIPTION,
  COMPONENT_PROPS_NAME,
  COMPONENT_PROPS_URI_PATTERN,
  handleComponentCatalog,
  handleComponentDetail,
  handleComponentExamples,
  handleComponentGuidance,
  handleComponentProps,
  handleIndexStats,
  INDEX_STATS_DESCRIPTION,
  INDEX_STATS_NAME,
  INDEX_STATS_URI,
} from './resources/index.js';
import {
  findSimilarSchema,
  getComponentSchema,
  getIndexStatsSchema,
  handleFindSimilar,
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
   * Search for components using natural language queries.
   * Supports three modes: hybrid (default, RRF fusion), semantic (vector), keyword (full-text).
   */
  server.registerTool(
    'search_components',
    {
      description:
        'Search for components by natural language query. Supports semantic (vector similarity), keyword (full-text), and hybrid (RRF fusion) modes. Default is hybrid for best results.',
      inputSchema: searchComponentsSchema,
    },
    async (args) => handleSearchComponents(args, ctx)
  );

  /**
   * Tool: find_similar_components
   *
   * Find components similar to a given component using semantic similarity.
   * Requires embedding repository (VOYAGE_API_KEY configured).
   */
  server.registerTool(
    'find_similar_components',
    {
      description:
        'Find components similar to a given component using semantic vector similarity. Useful for discovering alternatives, related components, or variations. Requires a base component identifier (slug, name, or ID).',
      inputSchema: findSimilarSchema,
    },
    async (args) => handleFindSimilar(args, ctx)
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

  // =========================================================================
  // Register Parameterized Resources (Component Resources)
  // =========================================================================

  /**
   * Resource: component-detail
   *
   * URI: component://detail/{slug}
   * Returns full component manifest with all sections.
   */
  server.registerResource(
    COMPONENT_DETAIL_NAME,
    new ResourceTemplate(COMPONENT_DETAIL_URI_PATTERN, { list: undefined }),
    {
      description: COMPONENT_DETAIL_DESCRIPTION,
      mimeType: 'application/json',
    },
    async (_uri: URL, variables: Variables) =>
      handleComponentDetail(variables.slug as string, ctx)
  );

  /**
   * Resource: component-props
   *
   * URI: component://props/{slug}
   * Returns component props reference only.
   */
  server.registerResource(
    COMPONENT_PROPS_NAME,
    new ResourceTemplate(COMPONENT_PROPS_URI_PATTERN, { list: undefined }),
    {
      description: COMPONENT_PROPS_DESCRIPTION,
      mimeType: 'application/json',
    },
    async (_uri: URL, variables: Variables) =>
      handleComponentProps(variables.slug as string, ctx)
  );

  /**
   * Resource: component-examples
   *
   * URI: component://examples/{slug}
   * Returns component usage examples only.
   */
  server.registerResource(
    COMPONENT_EXAMPLES_NAME,
    new ResourceTemplate(COMPONENT_EXAMPLES_URI_PATTERN, { list: undefined }),
    {
      description: COMPONENT_EXAMPLES_DESCRIPTION,
      mimeType: 'application/json',
    },
    async (_uri: URL, variables: Variables) =>
      handleComponentExamples(variables.slug as string, ctx)
  );

  /**
   * Resource: component-guidance
   *
   * URI: component://guidance/{slug}
   * Returns component best practices and usage guidance only.
   */
  server.registerResource(
    COMPONENT_GUIDANCE_NAME,
    new ResourceTemplate(COMPONENT_GUIDANCE_URI_PATTERN, { list: undefined }),
    {
      description: COMPONENT_GUIDANCE_DESCRIPTION,
      mimeType: 'application/json',
    },
    async (_uri: URL, variables: Variables) =>
      handleComponentGuidance(variables.slug as string, ctx)
  );

  return server;
}
