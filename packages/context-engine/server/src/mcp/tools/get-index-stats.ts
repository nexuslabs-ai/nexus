/**
 * MCP Tool: get_index_stats
 *
 * Get component indexing statistics for the organization.
 * Shows how many components are indexed, pending, failed, etc.
 *
 * Includes embedding model information if available.
 *
 * No input arguments required.
 */

import type { ShapeOutput } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import type { McpContext } from '../types.js';

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for get_index_stats tool.
 * No arguments required - stats are scoped to the authenticated org.
 * Plain object (empty) with Zod validators (v1.x SDK pattern).
 */
export const getIndexStatsSchema = {};

/**
 * Validated input type for get_index_stats (empty object).
 * Uses SDK's ShapeOutput helper for correct type inference with v1.x.
 */
export type GetIndexStatsInput = ShapeOutput<typeof getIndexStatsSchema>;

// =============================================================================
// Handler
// =============================================================================

/**
 * Get component indexing statistics.
 *
 * Returns counts by embedding status (indexed, pending, failed, processing)
 * and total component count for the organization.
 *
 * @param _args - No arguments (empty object)
 * @param ctx - MCP context with orgId and repositories
 * @returns CallToolResult with index statistics
 */
export async function handleGetIndexStats(
  _args: GetIndexStatsInput,
  ctx: McpContext
): Promise<CallToolResult> {
  // Get embedding status counts
  const statusCounts = await ctx.componentRepo.countByEmbeddingStatus(
    ctx.orgId
  );

  // Calculate total components
  const totalComponents =
    statusCounts.indexed +
    statusCounts.pending +
    statusCounts.failed +
    statusCounts.processing;

  // Build response
  const stats = {
    totalComponents,
    indexed: statusCounts.indexed,
    pending: statusCounts.pending,
    failed: statusCounts.failed,
    processing: statusCounts.processing,
    // Include embedding model info if available
    ...(ctx.embeddingRepo && {
      embeddingModel: ctx.embeddingRepo.modelInfo,
    }),
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}
