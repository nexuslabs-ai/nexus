/**
 * MCP Tool: search_components
 *
 * Search for components using natural language queries.
 * Supports multiple search modes: semantic, keyword, and hybrid.
 *
 * Search modes:
 * - **hybrid** (default): Combines semantic + keyword with RRF fusion
 * - **semantic**: Vector similarity only (requires VOYAGE_API_KEY)
 * - **keyword**: PostgreSQL full-text search only
 *
 * Input validation:
 * - Clamps limit to 1-50 (default: 10)
 * - Optional framework filter
 * - Optional search mode (default: hybrid)
 */

import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { SearchService } from '../../services/search-service.js';
import type { McpContext } from '../types.js';
import { mcpError } from '../utils/error.js';

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for search_components tool.
 * Plain object with Zod validators (v1.x SDK pattern).
 */
export const searchComponentsSchema = {
  query: z
    .string()
    .min(1)
    .describe(
      'Natural language search query (e.g., "button with loading state")'
    ),
  mode: z
    .enum(['semantic', 'keyword', 'hybrid'])
    .optional()
    .describe(
      'Search mode: semantic (vector), keyword (full-text), or hybrid (RRF fusion). Default: hybrid'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Maximum results to return (default 10, max 50)'),
  framework: z
    .string()
    .optional()
    .describe('Filter by framework (e.g., "react", "vue")'),
};

/**
 * Validated input type for search_components.
 * Uses SDK's ShapeOutput helper for correct type inference with v1.x.
 */
export type SearchComponentsInput = ShapeOutput<typeof searchComponentsSchema>;

// =============================================================================
// Handler
// =============================================================================

/**
 * Search for components by natural language query.
 *
 * Delegates to SearchService.search() for unified mode handling.
 * Supports three search modes:
 * - semantic: Vector similarity (requires embedding repository)
 * - keyword: PostgreSQL full-text search
 * - hybrid: RRF fusion of both methods (default)
 *
 * @param args - Validated tool arguments
 * @param ctx - MCP context with orgId and repositories
 * @returns CallToolResult with search results or error
 */
export async function handleSearchComponents(
  args: SearchComponentsInput,
  ctx: McpContext
): Promise<CallToolResult> {
  const mode = args.mode ?? 'hybrid';

  // Check if embedding repository is available for semantic/hybrid modes
  if ((mode === 'semantic' || mode === 'hybrid') && !ctx.embeddingRepo) {
    return mcpError('Semantic search not available', {
      reason: 'Embedding repository not configured (VOYAGE_API_KEY missing)',
      suggestion:
        'Configure VOYAGE_API_KEY to enable semantic/hybrid search, or use mode=keyword',
    });
  }

  // Create search service and delegate to unified search method
  const searchService = new SearchService(
    ctx.componentRepo,
    ctx.embeddingRepo!
  );

  const result = await searchService.search(ctx.orgId, args.query, {
    mode,
    limit: args.limit,
    framework: args.framework,
  });

  // Format for MCP response
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            query: args.query,
            total: result.results.length,
            results: result.results,
            meta: result.meta,
          },
          null,
          2
        ),
      },
    ],
  };
}
