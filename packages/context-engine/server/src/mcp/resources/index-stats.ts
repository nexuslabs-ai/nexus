/**
 * MCP Resource: index-stats
 *
 * URI: context://stats
 * Returns component indexing statistics for the organization.
 *
 * Provides the same information as the get_index_stats tool,
 * but exposed as a resource for AI assistants to check
 * indexing status without making a tool call.
 *
 * Shows embedding status counts and model information.
 */

import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import type { McpContext } from '../types.js';

/**
 * Resource URI for index stats.
 */
export const INDEX_STATS_URI = 'context://stats';

/**
 * Resource name for index stats.
 */
export const INDEX_STATS_NAME = 'Index Statistics';

/**
 * Resource description for index stats.
 */
export const INDEX_STATS_DESCRIPTION =
  'Component indexing statistics and embedding status';

/**
 * Get index statistics resource.
 *
 * Returns counts by embedding status (indexed, pending, failed, processing)
 * and embedding model information if available.
 *
 * Same logic as get_index_stats tool, exposed as a resource.
 *
 * @param ctx - MCP context with orgId and repositories
 * @returns ReadResourceResult with index statistics
 */
export async function handleIndexStats(
  ctx: McpContext
): Promise<ReadResourceResult> {
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

  // Build stats object
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
    contents: [
      {
        uri: INDEX_STATS_URI,
        mimeType: 'application/json',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}
