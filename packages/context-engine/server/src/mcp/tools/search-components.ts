/**
 * MCP Tool: search_components
 *
 * Semantic search for components using natural language queries.
 * Returns components ranked by relevance to the search query.
 *
 * Requires:
 * - Embedding repository configured (VOYAGE_API_KEY)
 * - Components indexed (embeddingStatus = 'indexed')
 *
 * Input validation:
 * - Clamps limit to 1-50 (default: 10)
 * - Optional framework filter
 */

import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

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
 * Uses semantic search via vector similarity to find components
 * that match the user's intent, not just keyword matches.
 *
 * @param args - Validated tool arguments
 * @param ctx - MCP context with orgId and repositories
 * @returns CallToolResult with search results or error
 */
export async function handleSearchComponents(
  args: SearchComponentsInput,
  ctx: McpContext
): Promise<CallToolResult> {
  // Check if embedding repository is available
  if (!ctx.embeddingRepo) {
    return mcpError('Semantic search not available', {
      reason: 'Embedding repository not configured (VOYAGE_API_KEY missing)',
      suggestion: 'Configure VOYAGE_API_KEY to enable semantic search',
    });
  }

  // Clamp limit with default
  const limit = args.limit ?? 10;
  const clampedLimit = Math.max(1, Math.min(50, limit));

  // Perform semantic search
  const results = await ctx.embeddingRepo.search(ctx.orgId, args.query, {
    limit: clampedLimit,
    framework: args.framework,
  });

  // Format results for AI consumption
  const formattedResults = results.map((result) => ({
    name: result.name,
    slug: result.slug,
    description: result.description,
    framework: result.framework,
    score: result.score,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            query: args.query,
            total: formattedResults.length,
            results: formattedResults,
          },
          null,
          2
        ),
      },
    ],
  };
}
